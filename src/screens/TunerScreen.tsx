import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { TUNINGS, TuningName } from '../lib/music-theory';
import { colors } from '../theme/colors';

export function TunerScreen() {
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

  // Find closest string to current pitch
  const getClosestString = () => {
    if (!currentPitch) return null;

    let closestIndex = 0;
    let closestDiff = Infinity;

    tuning.frequencies.forEach((freq, index) => {
      const diff = Math.abs(currentPitch.frequency - freq);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    return {
      stringNumber: 6 - closestIndex,
      note: tuning.notes[closestIndex],
      targetFrequency: tuning.frequencies[closestIndex],
    };
  };

  const closestString = getClosestString();

  // Get color based on how in-tune
  const getInTuneColor = () => {
    if (!currentPitch) return colors.textMuted;
    const absCents = Math.abs(currentPitch.cents);
    if (absCents < 5) return '#00ff88';
    if (absCents < 10) return '#88ff00';
    if (absCents < 20) return '#ffff00';
    if (absCents < 35) return '#ff8800';
    return '#ff4444';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          {(Object.keys(TUNINGS) as TuningName[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tuningOption,
                key === selectedTuning && styles.tuningOptionSelected,
              ]}
              onPress={() => {
                setSelectedTuning(key);
                setShowTuningSelector(false);
              }}
            >
              <Text style={[
                styles.tuningOptionText,
                key === selectedTuning && styles.tuningOptionTextSelected,
              ]}>
                {TUNINGS[key].name}
              </Text>
              <Text style={styles.tuningOptionNotes}>{TUNINGS[key].notes.join(' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* String Reference */}
      <View style={styles.stringReference}>
        {tuning.notes.map((note, index) => {
          const isActive = closestString?.stringNumber === 6 - index && isRecording;
          return (
            <View
              key={index}
              style={[styles.stringNote, isActive && styles.stringNoteActive]}
            >
              <Text style={[styles.stringNumber, isActive && styles.stringTextActive]}>
                {6 - index}
              </Text>
              <Text style={[styles.stringNoteName, isActive && styles.stringTextActive]}>
                {note.replace(/\d+$/, '')}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Main Display */}
      <View style={styles.pitchDisplay}>
        <Text style={[styles.noteName, { color: getInTuneColor() }]}>
          {isRecording && currentPitch ? currentPitch.noteName : '—'}
        </Text>
        <Text style={styles.frequency}>
          {isRecording && currentPitch ? `${currentPitch.frequency.toFixed(1)} Hz` : '— Hz'}
        </Text>
        <Text style={[styles.cents, { color: getInTuneColor() }]}>
          {isRecording && currentPitch
            ? `${currentPitch.cents >= 0 ? '+' : ''}${currentPitch.cents.toFixed(0)}¢`
            : '—'}
        </Text>
      </View>

      {/* Tuning Bar */}
      <View style={styles.tuningBar}>
        <Text style={styles.tuningBarLabel}>♭</Text>
        <View style={styles.tuningBarTrack}>
          <View style={styles.tuningBarCenter} />
          <View
            style={[
              styles.tuningBarIndicator,
              {
                left: `${50 + (currentPitch ? (currentPitch.cents / 50) * 50 : 0)}%`,
                backgroundColor: getInTuneColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.tuningBarLabel}>♯</Text>
      </View>

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
        <Text style={styles.recordButtonText}>
          {isRecording ? '■  Stop' : '●  Start Tuner'}
        </Text>
      </TouchableOpacity>

      {/* Instructions */}
      {!isRecording && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            1. Tap "Start Tuner" to begin{'\n'}
            2. Play a string on your guitar{'\n'}
            3. Green = in tune!{'\n'}
            4. Flat (♭) = tune up, Sharp (♯) = tune down
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
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
    width: '100%',
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
    marginTop: 8,
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
    marginVertical: 20,
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
  },
  stringNoteName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stringTextActive: {
    color: colors.background,
  },
  pitchDisplay: {
    alignItems: 'center',
    marginVertical: 30,
  },
  noteName: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  frequency: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  cents: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
  },
  tuningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  tuningBarLabel: {
    color: colors.textMuted,
    fontSize: 24,
    width: 30,
    textAlign: 'center',
  },
  tuningBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginHorizontal: 10,
    position: 'relative',
  },
  tuningBarCenter: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: colors.primary,
    marginLeft: -1,
  },
  tuningBarIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
  },
  errorContainer: {
    backgroundColor: colors.error + '33',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
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
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
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
