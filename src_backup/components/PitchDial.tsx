import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText, Path } from 'react-native-svg';
import { NOTE_NAMES } from '../lib/music-theory';

interface PitchDialProps {
  frequency: number | null;
  noteName: string | null;
  cents: number;
  isActive: boolean;
  confidence?: number;
}

const DIAL_SIZE = 300;
const DIAL_RADIUS = DIAL_SIZE / 2 - 20;
const CENTER = DIAL_SIZE / 2;
const TICK_INNER_RADIUS = DIAL_RADIUS - 25;
const TICK_OUTER_RADIUS = DIAL_RADIUS - 5;
const NOTE_RADIUS = DIAL_RADIUS - 45;

export function PitchDial({ frequency, noteName, cents, isActive, confidence = 0 }: PitchDialProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [rotation, setRotation] = useState(0);

  // Calculate rotation based on note and cents
  useEffect(() => {
    if (isActive && noteName) {
      const noteIndex = NOTE_NAMES.indexOf(noteName as typeof NOTE_NAMES[number]);
      if (noteIndex !== -1) {
        const noteRotation = noteIndex * 30;
        const centsOffset = (cents / 50) * 15;
        setRotation(noteRotation + centsOffset);
      }
    }
  }, [noteName, cents, isActive]);

  // Pulse animation when active
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  // Determine color based on how in-tune the note is
  const getInTuneColor = () => {
    if (!isActive || !noteName) return '#444';
    const absCents = Math.abs(cents);
    if (absCents < 5) return '#00ff88'; // Very in tune - green
    if (absCents < 10) return '#88ff00'; // Close - yellow-green
    if (absCents < 20) return '#ffff00'; // Slightly off - yellow
    if (absCents < 35) return '#ff8800'; // Off - orange
    return '#ff4444'; // Way off - red
  };

  const renderNoteMarks = () => {
    return NOTE_NAMES.map((note, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x1 = CENTER + TICK_INNER_RADIUS * Math.cos(angle);
      const y1 = CENTER + TICK_INNER_RADIUS * Math.sin(angle);
      const x2 = CENTER + TICK_OUTER_RADIUS * Math.cos(angle);
      const y2 = CENTER + TICK_OUTER_RADIUS * Math.sin(angle);
      const textX = CENTER + NOTE_RADIUS * Math.cos(angle);
      const textY = CENTER + NOTE_RADIUS * Math.sin(angle);

      const isCurrentNote = note === noteName;
      const noteColor = isCurrentNote ? getInTuneColor() : '#666';

      return (
        <G key={note}>
          <Line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={noteColor}
            strokeWidth={isCurrentNote ? 3 : 2}
          />
          <SvgText
            x={textX}
            y={textY}
            fill={noteColor}
            fontSize={isCurrentNote ? 18 : 14}
            fontWeight={isCurrentNote ? 'bold' : 'normal'}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {note}
          </SvgText>
        </G>
      );
    });
  };

  // Render the needle pointing at current pitch
  const renderNeedle = () => {
    const angleRad = (rotation - 90) * (Math.PI / 180);
    const needleLength = DIAL_RADIUS - 35;
    const needleX = CENTER + needleLength * Math.cos(angleRad);
    const needleY = CENTER + needleLength * Math.sin(angleRad);

    // Calculate arrow head points
    const arrowSize = 12;
    const arrowAngle1 = angleRad + Math.PI + 0.4;
    const arrowAngle2 = angleRad + Math.PI - 0.4;
    const ax1 = needleX + arrowSize * Math.cos(arrowAngle1);
    const ay1 = needleY + arrowSize * Math.sin(arrowAngle1);
    const ax2 = needleX + arrowSize * Math.cos(arrowAngle2);
    const ay2 = needleY + arrowSize * Math.sin(arrowAngle2);

    return (
      <G>
        <Line
          x1={CENTER}
          y1={CENTER}
          x2={needleX}
          y2={needleY}
          stroke={getInTuneColor()}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Path
          d={`M ${needleX} ${needleY} L ${ax1} ${ay1} L ${ax2} ${ay2} Z`}
          fill={getInTuneColor()}
        />
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dialContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}>
          {/* Outer ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={DIAL_RADIUS}
            stroke={isActive ? '#333' : '#222'}
            strokeWidth={4}
            fill="transparent"
          />

          {/* Inner decorative ring */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={DIAL_RADIUS - 30}
            stroke="#222"
            strokeWidth={1}
            fill="transparent"
          />

          {/* Note marks around the dial */}
          {renderNoteMarks()}

          {/* Center display area */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={60}
            fill="#1a1a2e"
            stroke={getInTuneColor()}
            strokeWidth={3}
          />

          {/* Needle */}
          {isActive && renderNeedle()}

          {/* Center dot */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={8}
            fill={getInTuneColor()}
          />
        </Svg>

        {/* Center text overlay */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.noteText, { color: getInTuneColor() }]}>
            {isActive && noteName ? noteName : '—'}
          </Text>
          <Text style={styles.frequencyText}>
            {isActive && frequency ? `${frequency.toFixed(1)} Hz` : '— Hz'}
          </Text>
          <Text style={[styles.centsText, { color: getInTuneColor() }]}>
            {isActive && noteName ? (cents >= 0 ? `+${cents.toFixed(0)}` : cents.toFixed(0)) + '¢' : '—'}
          </Text>
        </View>
      </Animated.View>

      {/* Tuning indicator bar */}
      <View style={styles.tuningBar}>
        <View style={styles.tuningBarBackground}>
          <View style={styles.tuningBarCenter} />
          <View
            style={[
              styles.tuningBarIndicator,
              {
                left: `${50 + (isActive ? (cents / 50) * 50 : 0)}%`,
                backgroundColor: getInTuneColor(),
              },
            ]}
          />
        </View>
        <View style={styles.tuningLabels}>
          <Text style={styles.tuningLabel}>♭</Text>
          <Text style={styles.tuningLabelCenter}>●</Text>
          <Text style={styles.tuningLabel}>♯</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialContainer: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  frequencyText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  centsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  tuningBar: {
    width: 250,
    marginTop: 20,
  },
  tuningBarBackground: {
    height: 8,
    backgroundColor: '#222',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tuningBarCenter: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: '#00ff88',
    marginLeft: -1,
  },
  tuningBarIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -2,
    marginLeft: -6,
  },
  tuningLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tuningLabel: {
    color: '#666',
    fontSize: 18,
  },
  tuningLabelCenter: {
    color: '#00ff88',
    fontSize: 10,
  },
});
