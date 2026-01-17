import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NOTE_NAMES, getChordNotes, ChordType } from '../lib/music-theory';
import { colors } from '../theme/colors';

const CHORD_TYPES: { key: ChordType; label: string }[] = [
  { key: 'major', label: 'Major' },
  { key: 'minor', label: 'Minor' },
  { key: 'dominant7', label: '7' },
  { key: 'major7', label: 'Maj7' },
  { key: 'minor7', label: 'm7' },
  { key: 'sus2', label: 'sus2' },
  { key: 'sus4', label: 'sus4' },
  { key: 'diminished', label: 'dim' },
  { key: 'augmented', label: 'aug' },
];

export function ChordsScreen() {
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedType, setSelectedType] = useState<ChordType>('major');

  const chordNotes = getChordNotes(selectedRoot as any, selectedType);
  const chordName = `${selectedRoot}${selectedType === 'major' ? '' : selectedType === 'minor' ? 'm' : CHORD_TYPES.find(t => t.key === selectedType)?.label || selectedType}`;

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

      {/* Type Selector */}
      <Text style={styles.sectionTitle}>Chord Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.selectorRow}>
          {CHORD_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.typeButton, selectedType === type.key && styles.typeButtonActive]}
              onPress={() => setSelectedType(type.key)}
            >
              <Text style={[styles.typeButtonText, selectedType === type.key && styles.typeButtonTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Chord Display */}
      <View style={styles.chordDisplay}>
        <Text style={styles.chordName}>{chordName}</Text>
        <Text style={styles.chordNotes}>Notes: {chordNotes.join(' - ')}</Text>
      </View>

      {/* Notes Grid */}
      <View style={styles.notesGrid}>
        {chordNotes.map((note, index) => (
          <View key={index} style={styles.noteCard}>
            <Text style={styles.noteCardText}>{note}</Text>
            <Text style={styles.noteCardDegree}>
              {index === 0 ? 'Root' : index === 1 ? '3rd' : index === 2 ? '5th' : `${index + 1}th`}
            </Text>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About {CHORD_TYPES.find(t => t.key === selectedType)?.label} Chords</Text>
        <Text style={styles.infoText}>
          {selectedType === 'major' && 'Major chords sound bright and happy. Built from root, major 3rd, and perfect 5th.'}
          {selectedType === 'minor' && 'Minor chords sound dark and sad. Built from root, minor 3rd, and perfect 5th.'}
          {selectedType === 'dominant7' && 'Dominant 7th chords create tension. Used in blues and jazz.'}
          {selectedType === 'major7' && 'Major 7th chords sound jazzy and dreamy.'}
          {selectedType === 'minor7' && 'Minor 7th chords are smooth and commonly used in R&B and jazz.'}
          {selectedType === 'sus2' && 'Suspended 2nd chords replace the 3rd with a 2nd for an open sound.'}
          {selectedType === 'sus4' && 'Suspended 4th chords replace the 3rd with a 4th for tension.'}
          {selectedType === 'diminished' && 'Diminished chords sound tense and unstable.'}
          {selectedType === 'augmented' && 'Augmented chords sound bright and unresolved.'}
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
  typeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.background,
  },
  chordDisplay: {
    alignItems: 'center',
    marginVertical: 30,
  },
  chordName: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.primary,
  },
  chordNotes: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 16,
  },
  notesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  noteCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  noteCardText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  noteCardDegree: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
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
