import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fretboard } from '../src/components/Fretboard';
import { NOTE_NAMES, CHORD_PATTERNS, ChordType, getChordNotes } from '../src/lib/music-theory';
import { colors } from '../src/theme/colors';

// Common chord voicings (string: fret, -1 = muted, 0 = open)
const CHORD_VOICINGS: Record<string, Record<string, number[]>> = {
  C: {
    major: [-1, 3, 2, 0, 1, 0],
    minor: [-1, 3, 1, 0, 1, 3],
    '7': [-1, 3, 2, 3, 1, 0],
    major7: [-1, 3, 2, 0, 0, 0],
    minor7: [-1, 3, 1, 3, 1, 3],
  },
  D: {
    major: [-1, -1, 0, 2, 3, 2],
    minor: [-1, -1, 0, 2, 3, 1],
    '7': [-1, -1, 0, 2, 1, 2],
    major7: [-1, -1, 0, 2, 2, 2],
    minor7: [-1, -1, 0, 2, 1, 1],
  },
  E: {
    major: [0, 2, 2, 1, 0, 0],
    minor: [0, 2, 2, 0, 0, 0],
    '7': [0, 2, 0, 1, 0, 0],
    major7: [0, 2, 1, 1, 0, 0],
    minor7: [0, 2, 0, 0, 0, 0],
  },
  F: {
    major: [1, 3, 3, 2, 1, 1],
    minor: [1, 3, 3, 1, 1, 1],
    '7': [1, 3, 1, 2, 1, 1],
    major7: [1, 3, 2, 2, 1, 1],
    minor7: [1, 3, 1, 1, 1, 1],
  },
  G: {
    major: [3, 2, 0, 0, 0, 3],
    minor: [3, 1, 0, 0, 3, 3],
    '7': [3, 2, 0, 0, 0, 1],
    major7: [3, 2, 0, 0, 0, 2],
    minor7: [3, 1, 0, 0, 3, 1],
  },
  A: {
    major: [-1, 0, 2, 2, 2, 0],
    minor: [-1, 0, 2, 2, 1, 0],
    '7': [-1, 0, 2, 0, 2, 0],
    major7: [-1, 0, 2, 1, 2, 0],
    minor7: [-1, 0, 2, 0, 1, 0],
  },
  B: {
    major: [-1, 2, 4, 4, 4, 2],
    minor: [-1, 2, 4, 4, 3, 2],
    '7': [-1, 2, 1, 2, 0, 2],
    major7: [-1, 2, 4, 3, 4, 2],
    minor7: [-1, 2, 0, 2, 0, 2],
  },
};

const CHORD_TYPE_DISPLAY: Record<string, string> = {
  major: '',
  minor: 'm',
  '7': '7',
  major7: 'maj7',
  minor7: 'm7',
  dominant7: '7',
  diminished: 'dim',
  augmented: 'aug',
  sus2: 'sus2',
  sus4: 'sus4',
};

export default function ChordsScreen() {
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedType, setSelectedType] = useState<string>('major');

  const chordNotes = useMemo(() => {
    return getChordNotes(selectedRoot as any, selectedType as ChordType);
  }, [selectedRoot, selectedType]);

  const voicing = CHORD_VOICINGS[selectedRoot]?.[selectedType];

  const markedPositions = useMemo(() => {
    if (!voicing) return [];

    return voicing
      .map((fret, stringIndex) => {
        if (fret === -1) return null;
        return {
          string: stringIndex,
          fret,
          color: fret === 0 ? colors.secondary : colors.primary,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [voicing]);

  const chordName = `${selectedRoot}${CHORD_TYPE_DISPLAY[selectedType] || selectedType}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Root Note Selector */}
        <Text style={styles.sectionTitle}>Root Note</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {NOTE_NAMES.map(note => (
            <TouchableOpacity
              key={note}
              style={[
                styles.selectorButton,
                selectedRoot === note && styles.selectorButtonActive,
              ]}
              onPress={() => setSelectedRoot(note)}
            >
              <Text style={[
                styles.selectorButtonText,
                selectedRoot === note && styles.selectorButtonTextActive,
              ]}>
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chord Type Selector */}
        <Text style={styles.sectionTitle}>Chord Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {Object.keys(CHORD_VOICINGS.C).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectorButton,
                styles.selectorButtonWide,
                selectedType === type && styles.selectorButtonActive,
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[
                styles.selectorButtonText,
                selectedType === type && styles.selectorButtonTextActive,
              ]}>
                {CHORD_TYPE_DISPLAY[type] || type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chord Display */}
        <View style={styles.chordDisplay}>
          <Text style={styles.chordName}>{chordName}</Text>
          <Text style={styles.chordFormula}>
            Notes: {chordNotes.join(' - ')}
          </Text>
        </View>

        {/* Fretboard */}
        <View style={styles.fretboardContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Fretboard
              startFret={0}
              endFret={5}
              highlightedNotes={chordNotes}
              markedPositions={markedPositions}
              showNoteNames={true}
              showFretNumbers={true}
            />
          </ScrollView>
        </View>

        {/* String indicators */}
        {voicing && (
          <View style={styles.stringIndicators}>
            <Text style={styles.stringIndicatorLabel}>Fingering:</Text>
            <View style={styles.stringFrets}>
              {voicing.map((fret, index) => (
                <View key={index} style={styles.stringFret}>
                  <Text style={styles.stringNumber}>{6 - index}</Text>
                  <Text style={styles.fretNumber}>
                    {fret === -1 ? 'X' : fret === 0 ? 'O' : fret}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chord info */}
        <View style={styles.chordInfo}>
          <Text style={styles.infoTitle}>About {selectedType} chords</Text>
          <Text style={styles.infoText}>
            {selectedType === 'major' && 'Major chords have a bright, happy sound. Built from root, major 3rd, and perfect 5th.'}
            {selectedType === 'minor' && 'Minor chords have a darker, sad sound. Built from root, minor 3rd, and perfect 5th.'}
            {selectedType === '7' && 'Dominant 7th chords add tension and are used to lead back to the tonic. Root, major 3rd, 5th, minor 7th.'}
            {selectedType === 'major7' && 'Major 7th chords have a jazzy, dreamy quality. Root, major 3rd, 5th, major 7th.'}
            {selectedType === 'minor7' && 'Minor 7th chords are commonly used in jazz and R&B. Root, minor 3rd, 5th, minor 7th.'}
          </Text>
        </View>
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
    padding: 16,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  selectorButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  selectorButtonWide: {
    minWidth: 60,
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
  },
  selectorButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectorButtonTextActive: {
    color: colors.background,
  },
  chordDisplay: {
    alignItems: 'center',
    marginVertical: 24,
  },
  chordName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  chordFormula: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  fretboardContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  stringIndicators: {
    marginTop: 20,
    alignItems: 'center',
  },
  stringIndicatorLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stringFrets: {
    flexDirection: 'row',
    gap: 12,
  },
  stringFret: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
  },
  stringNumber: {
    color: colors.textMuted,
    fontSize: 10,
  },
  fretNumber: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chordInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
