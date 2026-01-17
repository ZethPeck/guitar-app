import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NOTE_NAMES, SCALE_PATTERNS, ScaleName, getScaleNotes } from '../lib/music-theory';
import { colors } from '../theme/colors';

const SCALE_NAMES: { key: ScaleName; label: string }[] = [
  { key: 'major', label: 'Major' },
  { key: 'naturalMinor', label: 'Minor' },
  { key: 'pentatonicMajor', label: 'Pent. Major' },
  { key: 'pentatonicMinor', label: 'Pent. Minor' },
  { key: 'blues', label: 'Blues' },
  { key: 'dorian', label: 'Dorian' },
  { key: 'mixolydian', label: 'Mixolydian' },
  { key: 'phrygian', label: 'Phrygian' },
];

export function ScalesScreen() {
  const [selectedRoot, setSelectedRoot] = useState('A');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('pentatonicMinor');

  const scaleNotes = getScaleNotes(selectedRoot as any, selectedScale);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Root Selector */}
      <Text style={styles.sectionTitle}>Root Note</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectorRow}>
          {NOTE_NAMES.map((note) => (
            <TouchableOpacity
              key={note}
              style={[styles.noteButton, selectedRoot === note && styles.noteButtonActive]}
              onPress={() => setSelectedRoot(note)}
            >
              <Text style={[styles.noteButtonText, selectedRoot === note && styles.noteButtonTextActive]}>
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Scale Selector */}
      <Text style={styles.sectionTitle}>Scale Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectorRow}>
          {SCALE_NAMES.map((scale) => (
            <TouchableOpacity
              key={scale.key}
              style={[styles.scaleButton, selectedScale === scale.key && styles.scaleButtonActive]}
              onPress={() => setSelectedScale(scale.key)}
            >
              <Text style={[styles.scaleButtonText, selectedScale === scale.key && styles.scaleButtonTextActive]}>
                {scale.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Scale Display */}
      <View style={styles.scaleDisplay}>
        <Text style={styles.scaleName}>{selectedRoot} {SCALE_NAMES.find(s => s.key === selectedScale)?.label}</Text>
      </View>

      {/* Notes Display */}
      <View style={styles.notesContainer}>
        {scaleNotes.map((note, index) => (
          <View key={index} style={[styles.noteCard, index === 0 && styles.noteCardRoot]}>
            <Text style={[styles.noteCardText, index === 0 && styles.noteCardTextRoot]}>{note}</Text>
            <Text style={styles.noteCardDegree}>{index + 1}</Text>
          </View>
        ))}
      </View>

      {/* Pattern */}
      <View style={styles.patternBox}>
        <Text style={styles.patternTitle}>Intervals (semitones)</Text>
        <Text style={styles.patternText}>
          {SCALE_PATTERNS[selectedScale].join(' - ')}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About this scale</Text>
        <Text style={styles.infoText}>
          {selectedScale === 'pentatonicMinor' && 'The most essential scale for rock and blues guitar. 5 notes, no wrong notes!'}
          {selectedScale === 'pentatonicMajor' && 'Bright, happy sounding 5-note scale. Great for country and pop.'}
          {selectedScale === 'blues' && 'Pentatonic minor with an added "blue note" (b5). The soul of blues music.'}
          {selectedScale === 'major' && 'The foundation of Western music. Learn this scale thoroughly.'}
          {selectedScale === 'naturalMinor' && 'Also called Aeolian mode. Dark, melancholic sound.'}
          {selectedScale === 'dorian' && 'Minor scale with a raised 6th. Used in jazz, funk, and rock.'}
          {selectedScale === 'mixolydian' && 'Major scale with a flat 7th. Classic rock sound.'}
          {selectedScale === 'phrygian' && 'Minor scale with a flat 2nd. Spanish/flamenco flavor.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
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
  },
  noteButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  noteButtonActive: {
    backgroundColor: colors.primary,
  },
  noteButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  noteButtonTextActive: {
    color: colors.background,
  },
  scaleButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  scaleButtonActive: {
    backgroundColor: colors.primary,
  },
  scaleButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  scaleButtonTextActive: {
    color: colors.background,
  },
  scaleDisplay: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scaleName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  noteCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 44,
  },
  noteCardRoot: {
    backgroundColor: colors.primary,
  },
  noteCardText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteCardTextRoot: {
    color: colors.background,
  },
  noteCardDegree: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  patternBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  patternTitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  patternText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
