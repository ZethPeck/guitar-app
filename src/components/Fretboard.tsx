import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { STANDARD_TUNING, getNoteAtFret } from '../lib/music-theory';
import { colors } from '../theme/colors';

interface FretboardProps {
  tuning?: string[];
  startFret?: number;
  endFret?: number;
  highlightedNotes?: string[];
  highlightColor?: string;
  markedPositions?: { string: number; fret: number; label?: string; color?: string }[];
  onPositionPress?: (string: number, fret: number, note: string) => void;
  showNoteNames?: boolean;
  showFretNumbers?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];
const DOUBLE_DOT_FRETS = [12];

export function Fretboard({
  tuning = STANDARD_TUNING.notes,
  startFret = 0,
  endFret = 12,
  highlightedNotes = [],
  highlightColor = colors.primary,
  markedPositions = [],
  onPositionPress,
  showNoteNames = true,
  showFretNumbers = true,
  orientation = 'horizontal',
}: FretboardProps) {
  const numStrings = tuning.length;
  const numFrets = endFret - startFret;

  // Dimensions
  const stringSpacing = 25;
  const fretSpacing = 50;
  const padding = 30;
  const nutWidth = startFret === 0 ? 8 : 0;

  const boardWidth = fretSpacing * numFrets + padding * 2 + nutWidth;
  const boardHeight = stringSpacing * (numStrings - 1) + padding * 2;

  const getNote = (stringIndex: number, fret: number): string => {
    return getNoteAtFret(tuning[stringIndex], fret);
  };

  const getNoteWithoutOctave = (note: string): string => {
    return note.replace(/\d+$/, '');
  };

  const isNoteHighlighted = (note: string): boolean => {
    const noteWithoutOctave = getNoteWithoutOctave(note);
    return highlightedNotes.some(n =>
      n.replace(/\d+$/, '') === noteWithoutOctave
    );
  };

  const getMarkedPosition = (stringIndex: number, fret: number) => {
    return markedPositions.find(
      p => p.string === stringIndex && p.fret === fret
    );
  };

  const renderFrets = () => {
    const frets = [];
    for (let f = 0; f <= numFrets; f++) {
      const actualFret = startFret + f;
      const x = padding + nutWidth + f * fretSpacing;

      // Fret wire
      frets.push(
        <Line
          key={`fret-${f}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={boardHeight - padding}
          stroke={actualFret === 0 ? colors.nut : colors.fret}
          strokeWidth={actualFret === 0 ? nutWidth : 2}
        />
      );

      // Fret number
      if (showFretNumbers && actualFret > 0) {
        frets.push(
          <SvgText
            key={`fret-num-${f}`}
            x={x - fretSpacing / 2}
            y={boardHeight - 8}
            fill={colors.textMuted}
            fontSize={10}
            textAnchor="middle"
          >
            {actualFret}
          </SvgText>
        );
      }
    }
    return frets;
  };

  const renderFretMarkers = () => {
    const markers = [];
    for (let f = 1; f <= numFrets; f++) {
      const actualFret = startFret + f;
      if (FRET_MARKERS.includes(actualFret)) {
        const x = padding + nutWidth + (f - 0.5) * fretSpacing;
        const centerY = boardHeight / 2;

        if (DOUBLE_DOT_FRETS.includes(actualFret)) {
          // Double dot at 12th fret
          markers.push(
            <Circle key={`marker-${f}-1`} cx={x} cy={centerY - stringSpacing} r={5} fill={colors.inlay} opacity={0.5} />,
            <Circle key={`marker-${f}-2`} cx={x} cy={centerY + stringSpacing} r={5} fill={colors.inlay} opacity={0.5} />
          );
        } else {
          // Single dot
          markers.push(
            <Circle key={`marker-${f}`} cx={x} cy={centerY} r={5} fill={colors.inlay} opacity={0.5} />
          );
        }
      }
    }
    return markers;
  };

  const renderStrings = () => {
    return tuning.map((_, index) => {
      const y = padding + index * stringSpacing;
      // String thickness varies (thicker for bass strings)
      const thickness = 1 + (numStrings - 1 - index) * 0.3;

      return (
        <Line
          key={`string-${index}`}
          x1={padding}
          y1={y}
          x2={boardWidth - padding}
          y2={y}
          stroke={colors.textMuted}
          strokeWidth={thickness}
        />
      );
    });
  };

  const renderNotes = () => {
    const notes = [];

    for (let stringIndex = 0; stringIndex < numStrings; stringIndex++) {
      for (let f = 0; f <= numFrets; f++) {
        const actualFret = startFret + f;
        const note = getNote(stringIndex, actualFret);
        const isHighlighted = isNoteHighlighted(note);
        const markedPos = getMarkedPosition(stringIndex, actualFret);

        if (!isHighlighted && !markedPos && !showNoteNames) continue;

        const x = f === 0
          ? padding + nutWidth / 2
          : padding + nutWidth + (f - 0.5) * fretSpacing;
        const y = padding + stringIndex * stringSpacing;

        const circleColor = markedPos?.color ?? (isHighlighted ? highlightColor : colors.surface);
        const showNote = isHighlighted || markedPos;

        if (showNote) {
          notes.push(
            <G key={`note-${stringIndex}-${f}`}>
              <Circle
                cx={x}
                cy={y}
                r={10}
                fill={circleColor}
                onPress={() => onPositionPress?.(stringIndex, actualFret, note)}
              />
              {showNoteNames && (
                <SvgText
                  x={x}
                  y={y + 4}
                  fill={colors.background}
                  fontSize={9}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {markedPos?.label ?? getNoteWithoutOctave(note)}
                </SvgText>
              )}
            </G>
          );
        }
      }
    }

    return notes;
  };

  return (
    <View style={styles.container}>
      <Svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
      >
        {/* Fretboard background */}
        <Rect
          x={padding}
          y={padding - 10}
          width={boardWidth - padding * 2}
          height={boardHeight - padding * 2 + 20}
          fill={colors.fretboard}
          rx={4}
        />

        {/* Fret markers */}
        {renderFretMarkers()}

        {/* Frets */}
        {renderFrets()}

        {/* Strings */}
        {renderStrings()}

        {/* Notes */}
        {renderNotes()}
      </Svg>

      {/* String labels on left */}
      <View style={[styles.stringLabels, { top: padding - 8 }]}>
        {tuning.map((note, index) => (
          <Text
            key={`label-${index}`}
            style={[styles.stringLabel, { top: index * stringSpacing }]}
          >
            {note.replace(/\d+$/, '')}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  stringLabels: {
    position: 'absolute',
    left: 5,
  },
  stringLabel: {
    position: 'absolute',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
