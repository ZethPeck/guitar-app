import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fretboard } from '../src/components/Fretboard';
import { NOTE_NAMES, SCALE_PATTERNS, ScaleName, getScaleNotes, PENTATONIC_BOX_SHAPES, PentatonicShape } from '../src/lib/music-theory';
import { colors } from '../src/theme/colors';

const SCALE_DISPLAY_NAMES: Record<ScaleName, string> = {
  major: 'Major (Ionian)',
  naturalMinor: 'Natural Minor (Aeolian)',
  harmonicMinor: 'Harmonic Minor',
  melodicMinor: 'Melodic Minor',
  pentatonicMajor: 'Pentatonic Major',
  pentatonicMinor: 'Pentatonic Minor',
  blues: 'Blues',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  locrian: 'Locrian',
  wholeTone: 'Whole Tone',
  diminished: 'Diminished',
};

const SCALE_DESCRIPTIONS: Record<ScaleName, string> = {
  major: 'The foundation of Western music. Bright, happy sound.',
  naturalMinor: 'Also called Aeolian mode. Dark, sad character.',
  harmonicMinor: 'Minor scale with raised 7th. Exotic, Middle Eastern feel.',
  melodicMinor: 'Jazz minor scale. Different ascending/descending in classical.',
  pentatonicMajor: '5-note scale. Very versatile, hard to play wrong notes.',
  pentatonicMinor: 'The essential blues/rock scale. Learn this first!',
  blues: 'Pentatonic minor with added "blue note" (b5).',
  dorian: 'Minor scale with raised 6th. Jazz and funk favorite.',
  phrygian: 'Spanish/flamenco sound. Minor with flat 2.',
  lydian: 'Major with raised 4th. Dreamy, floating quality.',
  mixolydian: 'Major with flat 7th. Classic rock and blues.',
  locrian: 'Diminished sound. Rarely used as home base.',
  wholeTone: 'All whole steps. Dreamy, ambiguous sound.',
  diminished: 'Alternating whole and half steps. Jazz and metal.',
};

type TabType = 'scales' | 'pentatonic';

export default function ScalesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('scales');
  const [selectedRoot, setSelectedRoot] = useState<string>('A');
  const [selectedScale, setSelectedScale] = useState<ScaleName>('pentatonicMinor');
  const [selectedShape, setSelectedShape] = useState<PentatonicShape>('shape1');
  const [startFret, setStartFret] = useState(5);

  const scaleNotes = useMemo(() => {
    return getScaleNotes(selectedRoot as any, selectedScale);
  }, [selectedRoot, selectedScale]);

  const renderScalesTab = () => (
    <>
      {/* Scale Selector */}
      <Text style={styles.sectionTitle}>Scale Type</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
      >
        {(Object.keys(SCALE_PATTERNS) as ScaleName[]).map(scale => (
          <TouchableOpacity
            key={scale}
            style={[
              styles.scaleButton,
              selectedScale === scale && styles.scaleButtonActive,
            ]}
            onPress={() => setSelectedScale(scale)}
          >
            <Text style={[
              styles.scaleButtonText,
              selectedScale === scale && styles.scaleButtonTextActive,
            ]}>
              {SCALE_DISPLAY_NAMES[scale]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scale Info */}
      <View style={styles.scaleInfo}>
        <Text style={styles.scaleName}>
          {selectedRoot} {SCALE_DISPLAY_NAMES[selectedScale]}
        </Text>
        <Text style={styles.scaleDescription}>
          {SCALE_DESCRIPTIONS[selectedScale]}
        </Text>
        <Text style={styles.scaleNotes}>
          Notes: {scaleNotes.join(' - ')}
        </Text>
      </View>

      {/* Fretboard */}
      <View style={styles.fretboardContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Fretboard
            startFret={0}
            endFret={12}
            highlightedNotes={scaleNotes}
            showNoteNames={true}
            showFretNumbers={true}
          />
        </ScrollView>
      </View>

      {/* Scale degrees */}
      <View style={styles.degreeContainer}>
        <Text style={styles.degreesTitle}>Scale Degrees</Text>
        <View style={styles.degrees}>
          {scaleNotes.map((note, index) => (
            <View key={index} style={styles.degree}>
              <Text style={styles.degreeNote}>{note}</Text>
              <Text style={styles.degreeNumber}>{index + 1}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderPentatonicTab = () => {
    const shape = PENTATONIC_BOX_SHAPES[selectedShape];

    return (
      <>
        {/* Shape Selector */}
        <Text style={styles.sectionTitle}>Box Shape</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {(Object.keys(PENTATONIC_BOX_SHAPES) as PentatonicShape[]).map(shapeKey => (
            <TouchableOpacity
              key={shapeKey}
              style={[
                styles.shapeButton,
                selectedShape === shapeKey && styles.shapeButtonActive,
              ]}
              onPress={() => setSelectedShape(shapeKey)}
            >
              <Text style={[
                styles.shapeButtonText,
                selectedShape === shapeKey && styles.shapeButtonTextActive,
              ]}>
                {PENTATONIC_BOX_SHAPES[shapeKey].name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Start Fret Selector */}
        <Text style={styles.sectionTitle}>Start Fret (Root Position)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {[1, 3, 5, 7, 9, 12].map(fret => (
            <TouchableOpacity
              key={fret}
              style={[
                styles.fretButton,
                startFret === fret && styles.fretButtonActive,
              ]}
              onPress={() => setStartFret(fret)}
            >
              <Text style={[
                styles.fretButtonText,
                startFret === fret && styles.fretButtonTextActive,
              ]}>
                {fret}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shape Info */}
        <View style={styles.shapeInfo}>
          <Text style={styles.shapeName}>{shape.name}</Text>
          <Text style={styles.shapeMode}>Related Mode: {shape.mode}</Text>
          <Text style={styles.shapeDescription}>
            This is one of the 5 positions of the pentatonic scale.
            Starting on different scale degrees gives you different modes.
          </Text>
        </View>

        {/* Box Pattern Visual */}
        <View style={styles.boxPattern}>
          <Text style={styles.boxPatternTitle}>Finger Pattern</Text>
          <View style={styles.patternGrid}>
            {shape.pattern.map((stringFrets, stringIndex) => (
              <View key={stringIndex} style={styles.patternRow}>
                <Text style={styles.patternString}>{6 - stringIndex}</Text>
                <View style={styles.patternFrets}>
                  {[0, 1, 2, 3].map(fretOffset => {
                    const isNote = (stringFrets as readonly number[]).includes(fretOffset);
                    return (
                      <View
                        key={fretOffset}
                        style={[
                          styles.patternFret,
                          isNote && styles.patternFretActive,
                        ]}
                      >
                        {isNote && (
                          <Text style={styles.patternFretText}>
                            {fretOffset === 0 ? 'R' : fretOffset}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Mode relationships */}
        <View style={styles.modeInfo}>
          <Text style={styles.modeInfoTitle}>Mode Relationships</Text>
          <Text style={styles.modeInfoText}>
            The pentatonic scale contains 5 notes. Starting on each note gives
            you a different "mode" feeling:{'\n\n'}
            • Shape 1: Minor feel (Aeolian){'\n'}
            • Shape 2: Locrian feel{'\n'}
            • Shape 3: Major feel (Ionian){'\n'}
            • Shape 4: Dorian feel{'\n'}
            • Shape 5: Phrygian feel
          </Text>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scales' && styles.tabActive]}
          onPress={() => setActiveTab('scales')}
        >
          <Text style={[styles.tabText, activeTab === 'scales' && styles.tabTextActive]}>
            Scales & Modes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pentatonic' && styles.tabActive]}
          onPress={() => setActiveTab('pentatonic')}
        >
          <Text style={[styles.tabText, activeTab === 'pentatonic' && styles.tabTextActive]}>
            Pentatonic Boxes
          </Text>
        </TouchableOpacity>
      </View>

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
                styles.rootButton,
                selectedRoot === note && styles.rootButtonActive,
              ]}
              onPress={() => setSelectedRoot(note)}
            >
              <Text style={[
                styles.rootButtonText,
                selectedRoot === note && styles.rootButtonTextActive,
              ]}>
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'scales' ? renderScalesTab() : renderPentatonicTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
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
  rootButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  rootButtonActive: {
    backgroundColor: colors.primary,
  },
  rootButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  rootButtonTextActive: {
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
    fontSize: 12,
  },
  scaleButtonTextActive: {
    color: colors.background,
  },
  scaleInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  scaleName: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  scaleDescription: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  scaleNotes: {
    color: colors.textPrimary,
    marginTop: 12,
    fontWeight: '600',
  },
  fretboardContainer: {
    marginVertical: 20,
  },
  degreeContainer: {
    marginTop: 10,
  },
  degreesTitle: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  degrees: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  degree: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    minWidth: 36,
  },
  degreeNote: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  degreeNumber: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  shapeButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shapeButtonActive: {
    backgroundColor: colors.primary,
  },
  shapeButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  shapeButtonTextActive: {
    color: colors.background,
  },
  fretButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  fretButtonActive: {
    backgroundColor: colors.secondary,
  },
  fretButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  fretButtonTextActive: {
    color: colors.background,
  },
  shapeInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  shapeName: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  shapeMode: {
    color: colors.secondary,
    marginTop: 4,
  },
  shapeDescription: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  boxPattern: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  boxPatternTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  patternGrid: {
    gap: 8,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patternString: {
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  patternFrets: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  patternFret: {
    flex: 1,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternFretActive: {
    backgroundColor: colors.primary,
  },
  patternFretText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  modeInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  modeInfoTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modeInfoText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
