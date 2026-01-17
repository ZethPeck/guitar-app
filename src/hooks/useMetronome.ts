import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface UseMetronomeOptions {
  initialBpm?: number;
  onTick?: (beat: number, totalBeats: number) => void;
}

export function useMetronome(options: UseMetronomeOptions = {}) {
  const { initialBpm = 120, onTick } = options;

  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const accentSoundRef = useRef<Audio.Sound | null>(null);
  const beatRef = useRef(0);

  // Load sounds
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // We'll generate simple click sounds using oscillator-like approach
        // For now, we'll use a visual-only metronome
        // In production, you'd load actual audio files
      } catch (error) {
        console.error('Failed to load metronome sounds:', error);
      }
    };

    loadSounds();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (accentSoundRef.current) {
        accentSoundRef.current.unloadAsync();
      }
    };
  }, []);

  const playClick = useCallback(async (isAccent: boolean) => {
    // Simple vibration feedback could be added here
    // For actual clicks, you'd play the loaded sounds
  }, []);

  const start = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    beatRef.current = 0;
    setCurrentBeat(0);

    const intervalMs = 60000 / bpm;

    intervalRef.current = setInterval(() => {
      beatRef.current = (beatRef.current % beatsPerMeasure) + 1;
      setCurrentBeat(beatRef.current);

      const isAccent = beatRef.current === 1;
      playClick(isAccent);

      onTick?.(beatRef.current, beatsPerMeasure);
    }, intervalMs);
  }, [bpm, beatsPerMeasure, isPlaying, onTick, playClick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(0);
    beatRef.current = 0;
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    // Keep only last 4 taps
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    // Calculate average interval
    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);

      // Clamp to reasonable range
      if (newBpm >= 30 && newBpm <= 300) {
        setBpm(newBpm);

        // Restart metronome with new tempo if playing
        if (isPlaying) {
          stop();
          setTimeout(() => start(), 50);
        }
      }
    }

    // Reset taps after 2 seconds of inactivity
    setTimeout(() => {
      if (Date.now() - tapTimesRef.current[tapTimesRef.current.length - 1] > 2000) {
        tapTimesRef.current = [];
      }
    }, 2100);
  }, [isPlaying, start, stop]);

  // Restart metronome when BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      stop();
      start();
    }
  }, [bpm]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    bpm,
    setBpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    setBeatsPerMeasure,
    start,
    stop,
    toggle,
    tapTempo,
  };
}
