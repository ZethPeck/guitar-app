import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PracticeSession {
  id: string;
  date: string;
  duration: number; // seconds
  exercise: 'chord-switch' | 'metronome' | 'scales';
  bpm: number;
  chords?: string[];
  beatsPerChord?: number;
  switchCount?: number;
  notes?: string;
}

interface PracticeState {
  sessions: PracticeSession[];
  favoriteChords: string[];
  lastBpm: number;
  lastBeatsPerChord: number;

  // Actions
  addSession: (session: Omit<PracticeSession, 'id' | 'date'>) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
  setFavoriteChords: (chords: string[]) => void;
  addFavoriteChord: (chord: string) => void;
  removeFavoriteChord: (chord: string) => void;
  setLastBpm: (bpm: number) => void;
  setLastBeatsPerChord: (beats: number) => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      sessions: [],
      favoriteChords: ['C', 'G', 'Am', 'F', 'D', 'Em'],
      lastBpm: 60,
      lastBeatsPerChord: 4,

      addSession: (sessionData) => {
        const session: PracticeSession = {
          ...sessionData,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100), // Keep last 100 sessions
        }));
      },

      removeSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      clearSessions: () => {
        set({ sessions: [] });
      },

      setFavoriteChords: (chords) => {
        set({ favoriteChords: chords });
      },

      addFavoriteChord: (chord) => {
        set((state) => ({
          favoriteChords: [...new Set([...state.favoriteChords, chord])],
        }));
      },

      removeFavoriteChord: (chord) => {
        set((state) => ({
          favoriteChords: state.favoriteChords.filter((c) => c !== chord),
        }));
      },

      setLastBpm: (bpm) => {
        set({ lastBpm: bpm });
      },

      setLastBeatsPerChord: (beats) => {
        set({ lastBeatsPerChord: beats });
      },
    }),
    {
      name: 'fretlogic-practice',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Utility functions for analytics
export function getSessionStats(sessions: PracticeSession[]) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalTime: 0,
      averageBpm: 0,
      mostPracticedChords: [] as string[],
      streakDays: 0,
    };
  }

  const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);
  const avgBpm = sessions.reduce((acc, s) => acc + s.bpm, 0) / sessions.length;

  // Count chord occurrences
  const chordCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    s.chords?.forEach((chord) => {
      chordCounts[chord] = (chordCounts[chord] || 0) + 1;
    });
  });

  const mostPracticedChords = Object.entries(chordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([chord]) => chord);

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streakDays = 0;
  let checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasSession = sessions.some((s) => s.date.startsWith(dateStr));

    if (hasSession) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    totalSessions: sessions.length,
    totalTime,
    averageBpm: Math.round(avgBpm),
    mostPracticedChords,
    streakDays,
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
