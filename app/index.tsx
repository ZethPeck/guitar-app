import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PitchDial } from '../src/components/PitchDial';
import { useAudioRecorder, PitchData } from '../src/hooks/useAudioRecorder';
import { TUNINGS, TuningName } from '../src/lib/music-theory';
import { colors } from '../src/theme/colors';

export default function TunerScreen() {
  const [selectedTuning, setSelectedTuning] = useState<TuningName>('standard');
  const [showTuningSelector, setShowTuningSelector] = useState(false);

  const {
    isRecording,
    hasPermission,
    currentPitch,
    error,
    toggleRecording,
    requestPermission,
  } = useAudioRecorder();

  const tuning = TUNINGS[selectedTuning];

  const handleTuningSelect = useCallback((tuningName: TuningName) => {
    setSelectedTuning(tuningName);
    setShowTuningSelector(false);
  }, []);

  // Find closest string to current pitch
  const getClosestString = (pitch: PitchData | null) => {
    if (!pitch) return null;

    let closestIndex = 0;
    let closestDiff = Infinity;

    tuning.frequencies.forEach((freq, index) => {
      const diff = Math.abs(pitch.frequency - freq);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    return {
      stringNumber: 6 - closestIndex, // Strings numbered 1-6 from high to low
      note: tuning.notes[closestIndex],
      targetFrequency: tuning.frequencies[closestIndex],
    };
  };

  const closestString = getClosestString(currentPitch);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tuning Selector */}
        <TouchableOpacity
          style={styles.tuningSelector}
          onPress={() => setShowTuningSelector(!showTuningSelector)}
        >
          <Text style={styles.tuningSelectorLabel}>Tuning:</Text>
          <Text style={styles.tuningSelectorValue}>{tuning.name}</Text>
          <Text style={styles.tuningSelectorArrow}>{showTuningSelector ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showTuningSelector && (
          <View style={styles.tuningOptions}>
            {Object.entries(TUNINGS).map(([key, t]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.tuningOption,
                  key === selectedTuning && styles.tuningOptionSelected,
                ]}
                onPress={() => handleTuningSelect(key as TuningName)}
              >
                <Text style={[
                  styles.tuningOptionText,
                  key === selectedTuning && styles.tuningOptionTextSelected,
                ]}>
                  {t.name}
                </Text>
                <Text style={styles.tuningOptionNotes}>{t.notes.join(' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* String Reference */}
        <View style={styles.stringReference}>
          {tuning.notes.map((note, index) => {
            const isActive = closestString?.stringNumber === 6 - index;
            return (
              <View
                key={index}
                style={[
                  styles.stringNote,
                  isActive && styles.stringNoteActive,
                ]}
              >
                <Text style={[
                  styles.stringNumber,
                  isActive && styles.stringNumberActive,
                ]}>
                  {6 - index}
                </Text>
                <Text style={[
                  styles.stringNoteName,
                  isActive && styles.stringNoteNameActive,
                ]}>
                  {note}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Pitch Dial */}
        <View style={styles.dialContainer}>
          <PitchDial
            frequency={currentPitch?.frequency ?? null}
            noteName={currentPitch?.noteName ?? null}
            cents={currentPitch?.cents ?? 0}
            isActive={isRecording && !!currentPitch}
            confidence={currentPitch?.confidence ?? 0}
          />
        </View>

        {/* Target String Info */}
        {closestString && isRecording && (
          <View style={styles.targetInfo}>
            <Text style={styles.targetLabel}>Tuning String {closestString.stringNumber}</Text>
            <Text style={styles.targetNote}>{closestString.note}</Text>
            <Text style={styles.targetFrequency}>
              Target: {closestString.targetFrequency.toFixed(2)} Hz
            </Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Permission Request */}
        {hasPermission === false && (
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Microphone Permission</Text>
          </TouchableOpacity>
        )}

        {/* Start/Stop Button */}
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={toggleRecording}
        >
          <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]}>
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.micIcon}>
                <Text style={styles.micIconText}>🎤</Text>
              </View>
            )}
          </View>
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Stop Listening' : 'Start Tuner'}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        {!isRecording && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to use:</Text>
            <Text style={styles.instructionsText}>
              1. Tap "Start Tuner" to begin listening{'\n'}
              2. Play a string on your guitar{'\n'}
              3. Watch the dial - green means in tune!{'\n'}
              4. Flat (♭) = tune up, Sharp (♯) = tune down
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  tuningSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  tuningSelectorLabel: {
    color: colors.textSecondary,
    marginRight: 8,
  },
  tuningSelectorValue: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    flex: 1,
  },
  tuningSelectorArrow: {
    color: colors.primary,
  },
  tuningOptions: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  tuningOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  tuningOptionSelected: {
    backgroundColor: colors.surfaceLight,
  },
  tuningOptionText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  tuningOptionTextSelected: {
    color: colors.primary,
  },
  tuningOptionNotes: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  stringReference: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stringNote: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    minWidth: 45,
  },
  stringNoteActive: {
    backgroundColor: colors.primary,
  },
  stringNumber: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  stringNumberActive: {
    color: colors.background,
  },
  stringNoteName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stringNoteNameActive: {
    color: colors.background,
  },
  dialContainer: {
    marginVertical: 20,
  },
  targetInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  targetNote: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  targetFrequency: {
    color: colors.textMuted,
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: colors.error + '33',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  permissionButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  recordButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  recordButtonActive: {},
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  recordButtonInnerActive: {
    backgroundColor: colors.error,
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIconText: {
    fontSize: 32,
  },
  recordButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 30,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
  },
  instructionsTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    color: colors.textSecondary,
    lineHeight: 24,
  },
});
