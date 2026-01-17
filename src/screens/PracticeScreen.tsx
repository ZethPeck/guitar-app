import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';

export function PracticeScreen() {
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);

  const start = () => {
    setIsPlaying(true);
    beatRef.current = 0;
    setCurrentBeat(0);

    const intervalMs = 60000 / bpm;

    intervalRef.current = setInterval(() => {
      beatRef.current = (beatRef.current % beatsPerMeasure) + 1;
      setCurrentBeat(beatRef.current);

      // Pulse animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, intervalMs);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    beatRef.current = 0;
  };

  const toggle = () => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  };

  const tapTempo = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);

      if (newBpm >= 30 && newBpm <= 300) {
        setBpm(newBpm);
      }
    }

    // Reset after 2 seconds
    setTimeout(() => {
      if (tapTimesRef.current.length > 0) {
        const last = tapTimesRef.current[tapTimesRef.current.length - 1];
        if (Date.now() - last > 2000) {
          tapTimesRef.current = [];
        }
      }
    }, 2100);
  };

  // Restart when BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      stop();
      start();
    }
  }, [bpm, beatsPerMeasure]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Metronome</Text>

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

      {/* BPM Controls */}
      <View style={styles.bpmControls}>
        <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.max(30, bpm - 5))}>
          <Text style={styles.bpmButtonText}>-5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.max(30, bpm - 1))}>
          <Text style={styles.bpmButtonText}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.min(300, bpm + 1))}>
          <Text style={styles.bpmButtonText}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bpmButton} onPress={() => setBpm(Math.min(300, bpm + 5))}>
          <Text style={styles.bpmButtonText}>+5</Text>
        </TouchableOpacity>
      </View>

      {/* Beats Per Measure */}
      <Text style={styles.sectionLabel}>Beats per measure</Text>
      <View style={styles.beatsRow}>
        {[2, 3, 4, 6, 8].map((beats) => (
          <TouchableOpacity
            key={beats}
            style={[styles.beatsButton, beatsPerMeasure === beats && styles.beatsButtonActive]}
            onPress={() => setBeatsPerMeasure(beats)}
          >
            <Text style={[styles.beatsButtonText, beatsPerMeasure === beats && styles.beatsButtonTextActive]}>
              {beats}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Play/Stop Button */}
      <TouchableOpacity
        style={[styles.playButton, isPlaying && styles.playButtonActive]}
        onPress={toggle}
      >
        <Text style={styles.playButtonText}>
          {isPlaying ? '■  Stop' : '▶  Start'}
        </Text>
      </TouchableOpacity>

      {/* Tap Tempo */}
      <TouchableOpacity style={styles.tapButton} onPress={tapTempo}>
        <Text style={styles.tapButtonText}>Tap Tempo</Text>
      </TouchableOpacity>

      {/* Presets */}
      <Text style={styles.sectionLabel}>Quick Presets</Text>
      <View style={styles.presetsRow}>
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

      {/* Tempo Guide */}
      <View style={styles.guideBox}>
        <Text style={styles.guideTitle}>Tempo Guide</Text>
        <Text style={styles.guideText}>
          60-70: Slow ballads{'\n'}
          80-100: Easy practice tempo{'\n'}
          100-120: Pop, rock songs{'\n'}
          120-140: Upbeat rock{'\n'}
          140+: Fast punk, metal
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  bpmDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bpmValue: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bpmLabel: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  beatIndicators: {
    flexDirection: 'row',
    gap: 16,
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
    marginBottom: 24,
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
    fontSize: 16,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 10,
  },
  beatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  beatsButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
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
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  playButtonActive: {
    backgroundColor: colors.error,
  },
  playButtonText: {
    color: colors.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tapButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  tapButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 24,
  },
  presetButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  presetButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  guideBox: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  guideTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  guideText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
