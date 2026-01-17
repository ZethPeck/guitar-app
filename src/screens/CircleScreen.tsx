import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CIRCLE_OF_FIFTHS, getRelativeMinor, getScaleNotes } from '../lib/music-theory';
import { colors } from '../theme/colors';

export function CircleScreen() {
  const [selectedKey, setSelectedKey] = useState('C');

  const majorScale = getScaleNotes(selectedKey as any, 'major');
  const relativeMinor = getRelativeMinor(selectedKey);
  const sharps = majorScale.filter(n => n.includes('#')).length;
  const flats = majorScale.filter(n => n.includes('b')).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Circle of Fifths</Text>

      {/* Circle representation */}
      <View style={styles.circleContainer}>
        <View style={styles.circleOuter}>
          {CIRCLE_OF_FIFTHS.map((key, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const radius = 120;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keyButton,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                  selectedKey === key && styles.keyButtonActive,
                ]}
                onPress={() => setSelectedKey(key)}
              >
                <Text style={[styles.keyText, selectedKey === key && styles.keyTextActive]}>
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.circleCenter}>
          <Text style={styles.circleCenterText}>5ths</Text>
        </View>
      </View>

      {/* Selected Key Info */}
      <View style={styles.keyInfo}>
        <Text style={styles.selectedKeyName}>{selectedKey} Major</Text>
        <Text style={styles.keySignature}>
          {sharps > 0 ? `${sharps} sharp${sharps > 1 ? 's' : ''}` : flats > 0 ? `${flats} flat${flats > 1 ? 's' : ''}` : 'No sharps or flats'}
        </Text>
      </View>

      {/* Scale Notes */}
      <View style={styles.scaleBox}>
        <Text style={styles.scaleLabel}>Scale Notes:</Text>
        <View style={styles.scaleNotes}>
          {majorScale.map((note, index) => (
            <View key={index} style={styles.scaleNote}>
              <Text style={styles.scaleNoteText}>{note}</Text>
              <Text style={styles.scaleDegree}>{['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Relative Minor */}
      <View style={styles.relativeBox}>
        <Text style={styles.relativeLabel}>Relative Minor:</Text>
        <Text style={styles.relativeValue}>{relativeMinor}m</Text>
      </View>

      {/* Common Progressions */}
      <View style={styles.progressionsBox}>
        <Text style={styles.progressionsTitle}>Common Progressions in {selectedKey}</Text>
        <View style={styles.progression}>
          <Text style={styles.progressionName}>I - IV - V - I</Text>
          <Text style={styles.progressionChords}>
            {selectedKey} - {majorScale[3]} - {majorScale[4]} - {selectedKey}
          </Text>
        </View>
        <View style={styles.progression}>
          <Text style={styles.progressionName}>I - V - vi - IV</Text>
          <Text style={styles.progressionChords}>
            {selectedKey} - {majorScale[4]} - {relativeMinor}m - {majorScale[3]}
          </Text>
        </View>
        <View style={styles.progression}>
          <Text style={styles.progressionName}>ii - V - I (Jazz)</Text>
          <Text style={styles.progressionChords}>
            {majorScale[1]}m - {majorScale[4]} - {selectedKey}
          </Text>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>How to Use</Text>
        <Text style={styles.tipsText}>
          • Clockwise = add one sharp{'\n'}
          • Counter-clockwise = add one flat{'\n'}
          • Adjacent keys are closely related{'\n'}
          • Great for finding key changes
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  circleContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  circleOuter: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonActive: {
    backgroundColor: colors.primary,
  },
  keyText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  keyTextActive: {
    color: colors.background,
  },
  circleCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  circleCenterText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  keyInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedKeyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  keySignature: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  scaleBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  scaleLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  scaleNotes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scaleNote: {
    alignItems: 'center',
  },
  scaleNoteText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scaleDegree: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  relativeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  relativeLabel: {
    color: colors.textSecondary,
    flex: 1,
  },
  relativeValue: {
    color: colors.secondary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressionsBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  progressionsTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progression: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  progressionName: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  progressionChords: {
    color: colors.textSecondary,
  },
  tipsBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  tipsTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
