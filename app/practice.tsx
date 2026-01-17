import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMetronome } from '../src/hooks/useMetronome';
import { usePracticeStore, getSessionStats, formatDuration } from '../src/store/practiceStore';
import { colors } from '../src/theme/colors';

type TabType = 'metronome' | 'chord-switch' | 'history';

const CHORD_OPTIONS = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
  'C7', 'D7', 'E7', 'G7', 'A7',
];

export default function PracticeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('metronome');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metronome' && styles.tabActive]}
          onPress={() => setActiveTab('metronome')}
        >
          <Text style={[styles.tabText, activeTab === 'metronome' && styles.tabTextActive]}>
            Metronome
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chord-switch' && styles.tabActive]}
          onPress={() => setActiveTab('chord-switch')}
        >
          <Text style={[styles.tabText, activeTab === 'chord-switch' && styles.tabTextActive]}>
            Chord Switch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'metronome' && <MetronomeTab />}
        {activeTab === 'chord-switch' && <ChordSwitchTab />}
        {activeTab === 'history' && <HistoryTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetronomeTab() {
  const {
    bpm,
    setBpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    setBeatsPerMeasure,
    toggle,
    tapTempo,
  } = useMetronome();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentBeat > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 50,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentBeat]);

  return (
    <View style={styles.metronomeContainer}>
      {/* BPM Display */}
      <Animated.View style={[styles.bpmDisplay, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.bpmValue}>{bpm}</Text>
        <Text style={styles.bpmLabel}>BPM</Text>
      </Animated.View>

      {/* Beat Indicators */}
      <View style={styles.beatIndicators}>
        {Array.from({ length: beatsPerMeasure }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.beatDot,
              currentBeat === index + 1 && styles.beatDotActive,
              index === 0 && currentBeat === 1 && styles.beatDotAccent,
            ]}
          />
        ))}
      </View>

      {/* BPM Slider */}
      <View style={styles.bpmControls}>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.max(30, bpm - 5))}
        >
          <Text style={styles.bpmButtonText}>-5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.max(30, bpm - 1))}
        >
          <Text style={styles.bpmButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.min(300, bpm + 1))}
        >
          <Text style={styles.bpmButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bpmButton}
          onPress={() => setBpm(Math.min(300, bpm + 5))}
        >
          <Text style={styles.bpmButtonText}>+5</Text>
        </TouchableOpacity>
      </View>

      {/* Beats Per Measure */}
      <View style={styles.beatsControl}>
        <Text style={styles.beatsLabel}>Beats per measure:</Text>
        <View style={styles.beatsButtons}>
          {[2, 3, 4, 6, 8].map((beats) => (
            <TouchableOpacity
              key={beats}
              style={[
                styles.beatsButton,
                beatsPerMeasure === beats && styles.beatsButtonActive,
              ]}
              onPress={() => setBeatsPerMeasure(beats)}
            >
              <Text style={[
                styles.beatsButtonText,
                beatsPerMeasure === beats && styles.beatsButtonTextActive,
              ]}>
                {beats}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Play/Stop Button */}
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={toggle}
      >
        <Text style={styles.playButtonText}>
          {isPlaying ? '■ Stop' : '▶ Start'}
        </Text>
      </TouchableOpacity>

      {/* Tap Tempo */}
      <TouchableOpacity style={styles.tapButton} onPress={tapTempo}>
        <Text style={styles.tapButtonText}>Tap Tempo</Text>
      </TouchableOpacity>

      {/* Quick Presets */}
      <View style={styles.presets}>
        <Text style={styles.presetsLabel}>Quick Presets:</Text>
        <View style={styles.presetButtons}>
          {[60, 80, 100, 120, 140, 160].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={styles.presetButton}
              onPress={() => setBpm(preset)}
            >
              <Text style={styles.presetButtonText}>{preset}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function ChordSwitchTab() {
  const [selectedChords, setSelectedChords] = useState<string[]>(['C', 'G', 'Am', 'F']);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [switchCount, setSwitchCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { addSession, setLastBpm, setLastBeatsPerChord, lastBpm, lastBeatsPerChord } = usePracticeStore();
  const [bpm, setBpm] = useState(lastBpm);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const chordIndexRef = useRef(0);

  useEffect(() => {
    setBeatsPerChord(lastBeatsPerChord);
    setBpm(lastBpm);
  }, []);

  const start = useCallback(() => {
    if (selectedChords.length < 2) return;

    setIsRunning(true);
    setCurrentChordIndex(0);
    setCurrentBeat(0);
    setSwitchCount(0);
    setStartTime(Date.now());
    beatRef.current = 0;
    chordIndexRef.current = 0;

    const intervalMs = 60000 / bpm;

    intervalRef.current = setInterval(() => {
      beatRef.current++;
      setCurrentBeat(beatRef.current);

      if (beatRef.current >= beatsPerChord) {
        beatRef.current = 0;
        chordIndexRef.current = (chordIndexRef.current + 1) % selectedChords.length;
        setCurrentChordIndex(chordIndexRef.current);
        setSwitchCount((prev) => prev + 1);
      }
    }, intervalMs);
  }, [selectedChords, bpm, beatsPerChord]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save session
    if (startTime && switchCount > 0) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      addSession({
        exercise: 'chord-switch',
        duration,
        bpm,
        chords: selectedChords,
        beatsPerChord,
        switchCount,
      });
      setLastBpm(bpm);
      setLastBeatsPerChord(beatsPerChord);
    }

    setIsRunning(false);
    setCurrentBeat(0);
    setStartTime(null);
  }, [startTime, switchCount, bpm, selectedChords, beatsPerChord, addSession, setLastBpm, setLastBeatsPerChord]);

  const toggleChord = (chord: string) => {
    if (isRunning) return;
    setSelectedChords((prev) =>
      prev.includes(chord) ? prev.filter((c) => c !== chord) : [...prev, chord]
    );
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.chordSwitchContainer}>
      {/* Current Chord Display */}
      <View style={styles.currentChordDisplay}>
        <Text style={styles.currentChordLabel}>
          {isRunning ? 'Play:' : 'Ready'}
        </Text>
        <Text style={styles.currentChord}>
          {isRunning ? selectedChords[currentChordIndex] : '—'}
        </Text>
        {isRunning && (
          <View style={styles.beatProgress}>
            {Array.from({ length: beatsPerChord }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.beatProgressDot,
                  i < currentBeat && styles.beatProgressDotFilled,
                ]}
              />
            ))}
          </View>
        )}
        {isRunning && (
          <Text style={styles.nextChord}>
            Next: {selectedChords[(currentChordIndex + 1) % selectedChords.length]}
          </Text>
        )}
      </View>

      {/* Stats */}
      {isRunning && (
        <View style={styles.sessionStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{switchCount}</Text>
            <Text style={styles.statLabel}>Switches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{bpm}</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
        </View>
      )}

      {/* Controls */}
      {!isRunning && (
        <>
          {/* BPM Control */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Tempo: {bpm} BPM</Text>
            <View style={styles.bpmControls}>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.max(30, bpm - 5))}
              >
                <Text style={styles.bpmButtonText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.max(30, bpm - 1))}
              >
                <Text style={styles.bpmButtonText}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.min(200, bpm + 1))}
              >
                <Text style={styles.bpmButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bpmButton}
                onPress={() => setBpm(Math.min(200, bpm + 5))}
              >
                <Text style={styles.bpmButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Beats Per Chord */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Beats per chord:</Text>
            <View style={styles.beatsButtons}>
              {[2, 4, 8, 16].map((beats) => (
                <TouchableOpacity
                  key={beats}
                  style={[
                    styles.beatsButton,
                    beatsPerChord === beats && styles.beatsButtonActive,
                  ]}
                  onPress={() => setBeatsPerChord(beats)}
                >
                  <Text style={[
                    styles.beatsButtonText,
                    beatsPerChord === beats && styles.beatsButtonTextActive,
                  ]}>
                    {beats}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chord Selection */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>
              Select chords ({selectedChords.length} selected):
            </Text>
            <View style={styles.chordGrid}>
              {CHORD_OPTIONS.map((chord) => (
                <TouchableOpacity
                  key={chord}
                  style={[
                    styles.chordOption,
                    selectedChords.includes(chord) && styles.chordOptionActive,
                  ]}
                  onPress={() => toggleChord(chord)}
                >
                  <Text style={[
                    styles.chordOptionText,
                    selectedChords.includes(chord) && styles.chordOptionTextActive,
                  ]}>
                    {chord}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Selected Order */}
          {selectedChords.length > 0 && (
            <View style={styles.selectedOrder}>
              <Text style={styles.selectedOrderLabel}>Order:</Text>
              <Text style={styles.selectedOrderText}>
                {selectedChords.join(' → ')}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Start/Stop Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          isRunning && styles.startButtonStop,
          selectedChords.length < 2 && !isRunning && styles.startButtonDisabled,
        ]}
        onPress={isRunning ? stop : start}
        disabled={selectedChords.length < 2 && !isRunning}
      >
        <Text style={styles.startButtonText}>
          {isRunning ? '■ Stop' : selectedChords.length < 2 ? 'Select 2+ chords' : '▶ Start Practice'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryTab() {
  const { sessions, clearSessions } = usePracticeStore();
  const stats = getSessionStats(sessions);

  return (
    <View style={styles.historyContainer}>
      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{stats.totalSessions}</Text>
            <Text style={styles.statBoxLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{formatDuration(stats.totalTime)}</Text>
            <Text style={styles.statBoxLabel}>Total Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{stats.streakDays}</Text>
            <Text style={styles.statBoxLabel}>Day Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{stats.averageBpm}</Text>
            <Text style={styles.statBoxLabel}>Avg BPM</Text>
          </View>
        </View>
      </View>

      {/* Most Practiced */}
      {stats.mostPracticedChords.length > 0 && (
        <View style={styles.mostPracticed}>
          <Text style={styles.mostPracticedTitle}>Most Practiced Chords</Text>
          <View style={styles.mostPracticedChords}>
            {stats.mostPracticedChords.map((chord, index) => (
              <View key={chord} style={styles.mostPracticedChord}>
                <Text style={styles.mostPracticedRank}>#{index + 1}</Text>
                <Text style={styles.mostPracticedName}>{chord}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Sessions */}
      <View style={styles.recentSessions}>
        <Text style={styles.recentTitle}>Recent Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.noSessions}>No practice sessions yet. Start practicing!</Text>
        ) : (
          sessions.slice(0, 10).map((session) => (
            <View key={session.id} style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionType}>
                  {session.exercise === 'chord-switch' ? 'Chord Switch' : 'Metronome'}
                </Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionDetail}>
                  {formatDuration(session.duration)} • {session.bpm} BPM
                </Text>
                {session.chords && (
                  <Text style={styles.sessionChords}>
                    {session.chords.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {sessions.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearSessions}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      )}
    </View>
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
    paddingVertical: 10,
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
    fontSize: 12,
  },
  tabTextActive: {
    color: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },

  // Metronome styles
  metronomeContainer: {
    alignItems: 'center',
  },
  bpmDisplay: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bpmLabel: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  beatIndicators: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  beatDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  beatDotActive: {
    backgroundColor: colors.primary,
  },
  beatDotAccent: {
    backgroundColor: colors.accent,
  },
  bpmControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  bpmButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bpmButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  beatsControl: {
    alignItems: 'center',
    marginBottom: 30,
  },
  beatsLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  beatsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  beatsButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  beatsButtonActive: {
    backgroundColor: colors.secondary,
  },
  beatsButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  beatsButtonTextActive: {
    color: colors.background,
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  playButtonActive: {
    backgroundColor: colors.error,
  },
  playButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tapButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 30,
  },
  tapButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  presets: {
    alignItems: 'center',
  },
  presetsLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  presetButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  presetButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Chord Switch styles
  chordSwitchContainer: {
    alignItems: 'center',
  },
  currentChordDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 30,
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '100%',
  },
  currentChordLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  currentChord: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.primary,
  },
  beatProgress: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  beatProgressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  beatProgressDotFilled: {
    backgroundColor: colors.accent,
  },
  nextChord: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 30,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  controlSection: {
    width: '100%',
    marginBottom: 20,
  },
  controlLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  chordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chordOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  chordOptionActive: {
    backgroundColor: colors.primary,
  },
  chordOptionText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chordOptionTextActive: {
    color: colors.background,
  },
  selectedOrder: {
    width: '100%',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedOrderLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  selectedOrderText: {
    color: colors.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  startButtonStop: {
    backgroundColor: colors.error,
  },
  startButtonDisabled: {
    backgroundColor: colors.surface,
  },
  startButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // History styles
  historyContainer: {},
  statsOverview: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statBoxValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statBoxLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  mostPracticed: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mostPracticedTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mostPracticedChords: {
    flexDirection: 'row',
    gap: 12,
  },
  mostPracticedChord: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    minWidth: 50,
  },
  mostPracticedRank: {
    color: colors.textMuted,
    fontSize: 10,
  },
  mostPracticedName: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  recentSessions: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  recentTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noSessions: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  sessionItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionType: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sessionDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  sessionDetails: {},
  sessionDetail: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sessionChords: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
  clearButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.error,
  },
});
