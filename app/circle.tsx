import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Text as SvgText, G, Path } from 'react-native-svg';
import { CIRCLE_OF_FIFTHS, getRelativeMinor, getScaleNotes } from '../src/lib/music-theory';
import { colors } from '../src/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_WIDTH - 40, 350);
const CENTER = CIRCLE_SIZE / 2;
const OUTER_RADIUS = CENTER - 20;
const INNER_RADIUS = OUTER_RADIUS * 0.65;
const MAJOR_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2 + 15;
const MINOR_RADIUS = INNER_RADIUS - 25;

export default function CircleScreen() {
  const [selectedKey, setSelectedKey] = useState<string | null>('C');
  const [showMinor, setShowMinor] = useState(false);

  const getKeyInfo = (key: string) => {
    const majorScale = getScaleNotes(key as any, 'major');
    const relativeMinor = getRelativeMinor(key);
    const minorScale = getScaleNotes(relativeMinor as any, 'naturalMinor');

    // Count sharps/flats
    const sharps = majorScale.filter(n => n.includes('#')).length;
    const flats = majorScale.filter(n => n.includes('b')).length;

    return {
      majorScale,
      relativeMinor,
      minorScale,
      sharps,
      flats,
      keySignature: sharps > 0 ? `${sharps}#` : flats > 0 ? `${flats}b` : 'No accidentals',
    };
  };

  const renderCircle = () => {
    const elements = [];

    // Outer ring (major keys)
    elements.push(
      <Circle
        key="outer-ring"
        cx={CENTER}
        cy={CENTER}
        r={OUTER_RADIUS}
        stroke={colors.surface}
        strokeWidth={2}
        fill="transparent"
      />
    );

    // Inner ring (minor keys)
    elements.push(
      <Circle
        key="inner-ring"
        cx={CENTER}
        cy={CENTER}
        r={INNER_RADIUS}
        stroke={colors.surface}
        strokeWidth={2}
        fill="transparent"
      />
    );

    // Dividing lines and keys
    CIRCLE_OF_FIFTHS.forEach((key, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const nextAngle = ((index + 1) * 30 - 90) * (Math.PI / 180);

      // Dividing line
      const lineX = CENTER + OUTER_RADIUS * Math.cos(angle);
      const lineY = CENTER + OUTER_RADIUS * Math.sin(angle);
      elements.push(
        <Line
          key={`line-${index}`}
          x1={CENTER}
          y1={CENTER}
          x2={lineX}
          y2={lineY}
          stroke={colors.surface}
          strokeWidth={1}
        />
      );

      // Major key text position (middle of segment)
      const midAngle = ((index * 30 + 15) - 90) * (Math.PI / 180);
      const majorX = CENTER + MAJOR_RADIUS * Math.cos(midAngle);
      const majorY = CENTER + MAJOR_RADIUS * Math.sin(midAngle);

      // Minor key
      const relMinor = getRelativeMinor(key);
      const minorX = CENTER + MINOR_RADIUS * Math.cos(midAngle);
      const minorY = CENTER + MINOR_RADIUS * Math.sin(midAngle);

      const isSelected = selectedKey === key || (showMinor && selectedKey === relMinor);

      // Highlight arc for selected key
      if (isSelected) {
        const startAngle = index * 30 - 90;
        const endAngle = startAngle + 30;
        const startRad = startAngle * (Math.PI / 180);
        const endRad = endAngle * (Math.PI / 180);

        const x1 = CENTER + INNER_RADIUS * Math.cos(startRad);
        const y1 = CENTER + INNER_RADIUS * Math.sin(startRad);
        const x2 = CENTER + OUTER_RADIUS * Math.cos(startRad);
        const y2 = CENTER + OUTER_RADIUS * Math.sin(startRad);
        const x3 = CENTER + OUTER_RADIUS * Math.cos(endRad);
        const y3 = CENTER + OUTER_RADIUS * Math.sin(endRad);
        const x4 = CENTER + INNER_RADIUS * Math.cos(endRad);
        const y4 = CENTER + INNER_RADIUS * Math.sin(endRad);

        elements.push(
          <Path
            key={`highlight-${index}`}
            d={`M ${x1} ${y1} L ${x2} ${y2} A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${x1} ${y1}`}
            fill={colors.primary + '33'}
          />
        );
      }

      // Major key text
      elements.push(
        <G key={`major-${index}`} onPress={() => { setSelectedKey(key); setShowMinor(false); }}>
          <Circle cx={majorX} cy={majorY} r={18} fill="transparent" />
          <SvgText
            x={majorX}
            y={majorY + 5}
            fill={selectedKey === key && !showMinor ? colors.primary : colors.textPrimary}
            fontSize={16}
            fontWeight={selectedKey === key && !showMinor ? 'bold' : 'normal'}
            textAnchor="middle"
          >
            {key}
          </SvgText>
        </G>
      );

      // Minor key text
      elements.push(
        <G key={`minor-${index}`} onPress={() => { setSelectedKey(relMinor); setShowMinor(true); }}>
          <Circle cx={minorX} cy={minorY} r={16} fill="transparent" />
          <SvgText
            x={minorX}
            y={minorY + 4}
            fill={selectedKey === relMinor && showMinor ? colors.secondary : colors.textMuted}
            fontSize={12}
            fontWeight={selectedKey === relMinor && showMinor ? 'bold' : 'normal'}
            textAnchor="middle"
          >
            {relMinor}m
          </SvgText>
        </G>
      );
    });

    // Center circle
    elements.push(
      <Circle
        key="center"
        cx={CENTER}
        cy={CENTER}
        r={30}
        fill={colors.background}
        stroke={colors.primary}
        strokeWidth={2}
      />
    );

    elements.push(
      <SvgText
        key="center-text"
        x={CENTER}
        y={CENTER + 4}
        fill={colors.primary}
        fontSize={10}
        textAnchor="middle"
        fontWeight="bold"
      >
        5ths
      </SvgText>
    );

    return elements;
  };

  const keyInfo = selectedKey ? getKeyInfo(showMinor ? getRelativeMinor(selectedKey) === selectedKey ? selectedKey : selectedKey : selectedKey) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Circle of Fifths */}
        <View style={styles.circleContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
            {renderCircle()}
          </Svg>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textPrimary }]} />
            <Text style={styles.legendText}>Major keys (outer)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textMuted }]} />
            <Text style={styles.legendText}>Minor keys (inner)</Text>
          </View>
        </View>

        {/* Selected Key Info */}
        {selectedKey && keyInfo && (
          <View style={styles.keyInfo}>
            <Text style={styles.keyName}>
              {selectedKey} {showMinor ? 'Minor' : 'Major'}
            </Text>
            <Text style={styles.keySignature}>{keyInfo.keySignature}</Text>

            <View style={styles.scaleContainer}>
              <Text style={styles.scaleLabel}>Scale Notes:</Text>
              <View style={styles.scaleNotes}>
                {(showMinor ? keyInfo.minorScale : keyInfo.majorScale).map((note, index) => (
                  <View key={index} style={styles.scaleNote}>
                    <Text style={styles.scaleNoteText}>{note}</Text>
                    <Text style={styles.scaleDegree}>{index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.relativeKey}>
              <Text style={styles.relativeLabel}>
                Relative {showMinor ? 'Major' : 'Minor'}:
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (showMinor) {
                    // Find the major key that has this as relative minor
                    const majorKey = CIRCLE_OF_FIFTHS.find(k => getRelativeMinor(k) === selectedKey);
                    if (majorKey) {
                      setSelectedKey(majorKey);
                      setShowMinor(false);
                    }
                  } else {
                    setSelectedKey(keyInfo.relativeMinor);
                    setShowMinor(true);
                  }
                }}
              >
                <Text style={styles.relativeValue}>
                  {showMinor
                    ? CIRCLE_OF_FIFTHS.find(k => getRelativeMinor(k) === selectedKey) || ''
                    : keyInfo.relativeMinor + 'm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* How to use */}
        <View style={styles.howToUse}>
          <Text style={styles.howToUseTitle}>How to Use the Circle of Fifths</Text>
          <Text style={styles.howToUseText}>
            • Moving clockwise adds one sharp{'\n'}
            • Moving counter-clockwise adds one flat{'\n'}
            • Adjacent keys are closely related{'\n'}
            • Inner ring shows relative minor keys{'\n'}
            • Use for key signatures, modulations, and chord progressions
          </Text>
        </View>

        {/* Common Progressions */}
        <View style={styles.progressions}>
          <Text style={styles.progressionsTitle}>Common Progressions</Text>
          {selectedKey && !showMinor && (
            <View style={styles.progressionList}>
              <View style={styles.progression}>
                <Text style={styles.progressionName}>I - IV - V - I</Text>
                <Text style={styles.progressionChords}>
                  {selectedKey} - {getScaleNotes(selectedKey as any, 'major')[3]} - {getScaleNotes(selectedKey as any, 'major')[4]} - {selectedKey}
                </Text>
              </View>
              <View style={styles.progression}>
                <Text style={styles.progressionName}>I - V - vi - IV</Text>
                <Text style={styles.progressionChords}>
                  {selectedKey} - {getScaleNotes(selectedKey as any, 'major')[4]} - {getRelativeMinor(selectedKey)}m - {getScaleNotes(selectedKey as any, 'major')[3]}
                </Text>
              </View>
              <View style={styles.progression}>
                <Text style={styles.progressionName}>ii - V - I</Text>
                <Text style={styles.progressionChords}>
                  {getScaleNotes(selectedKey as any, 'major')[1]}m - {getScaleNotes(selectedKey as any, 'major')[4]} - {selectedKey}
                </Text>
              </View>
            </View>
          )}
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
    alignItems: 'center',
  },
  circleContainer: {
    marginVertical: 20,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  keyInfo: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  keyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  keySignature: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  scaleContainer: {
    marginTop: 16,
  },
  scaleLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
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
  relativeKey: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  relativeLabel: {
    color: colors.textSecondary,
  },
  relativeValue: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  howToUse: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  howToUseTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  howToUseText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  progressions: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  progressionsTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressionList: {
    gap: 12,
  },
  progression: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  progressionName: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressionChords: {
    color: colors.textSecondary,
  },
});
