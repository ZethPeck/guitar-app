// Core Music Theory Module for FretLogic

// Note names in chromatic order
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];
export type NoteNameFlat = typeof NOTE_NAMES_FLAT[number];

// A4 = 440Hz reference
export const A4_FREQUENCY = 440;
export const A4_MIDI = 69;

// Standard tuning frequencies (E2, A2, D3, G3, B3, E4)
export const STANDARD_TUNING = {
  name: 'Standard',
  notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  frequencies: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63],
};

// Common alternate tunings
export const TUNINGS = {
  standard: STANDARD_TUNING,
  dropD: {
    name: 'Drop D',
    notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    frequencies: [73.42, 110.00, 146.83, 196.00, 246.94, 329.63],
  },
  openG: {
    name: 'Open G',
    notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
    frequencies: [73.42, 98.00, 146.83, 196.00, 246.94, 293.66],
  },
  openD: {
    name: 'Open D',
    notes: ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'],
    frequencies: [73.42, 110.00, 146.83, 185.00, 220.00, 293.66],
  },
  dadgad: {
    name: 'DADGAD',
    notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
    frequencies: [73.42, 110.00, 146.83, 196.00, 220.00, 293.66],
  },
  halfStepDown: {
    name: 'Half Step Down',
    notes: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'],
    frequencies: [77.78, 103.83, 138.59, 185.00, 233.08, 311.13],
  },
  fullStepDown: {
    name: 'Full Step Down',
    notes: ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'],
    frequencies: [73.42, 98.00, 130.81, 174.61, 220.00, 293.66],
  },
} as const;

export type TuningName = keyof typeof TUNINGS;

// Convert frequency to MIDI note number
export function frequencyToMidi(frequency: number): number {
  return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI;
}

// Convert MIDI note number to frequency
export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12);
}

// Get note name from MIDI number
export function midiToNoteName(midi: number, useFlats = false): string {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  const notes = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;
  return `${notes[noteIndex]}${octave}`;
}

// Get note name without octave
export function midiToNoteNameOnly(midi: number, useFlats = false): string {
  const noteIndex = Math.round(midi) % 12;
  const notes = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;
  return notes[noteIndex];
}

// Get cents deviation from nearest note
export function getCentsDeviation(frequency: number): number {
  const midi = frequencyToMidi(frequency);
  const nearestMidi = Math.round(midi);
  return (midi - nearestMidi) * 100;
}

// Parse note string to MIDI (e.g., "A4" -> 69)
export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${noteName}`);

  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  let noteIndex = NOTE_NAMES.indexOf(note as NoteName);
  if (noteIndex === -1) {
    noteIndex = NOTE_NAMES_FLAT.indexOf(note as NoteNameFlat);
  }
  if (noteIndex === -1) throw new Error(`Invalid note: ${note}`);

  return (octave + 1) * 12 + noteIndex;
}

// Get frequency from note name
export function noteNameToFrequency(noteName: string): number {
  return midiToFrequency(noteNameToMidi(noteName));
}

// Interval definitions (in semitones)
export const INTERVALS = {
  unison: 0,
  minorSecond: 1,
  majorSecond: 2,
  minorThird: 3,
  majorThird: 4,
  perfectFourth: 5,
  tritone: 6,
  perfectFifth: 7,
  minorSixth: 8,
  majorSixth: 9,
  minorSeventh: 10,
  majorSeventh: 11,
  octave: 12,
} as const;

// Scale patterns (intervals from root)
export const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  diminished: [0, 2, 3, 5, 6, 8, 9, 11],
} as const;

export type ScaleName = keyof typeof SCALE_PATTERNS;

// Chord patterns (intervals from root)
export const CHORD_PATTERNS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  minorMajor7: [0, 3, 7, 11],
  augmented7: [0, 4, 8, 10],
  add9: [0, 4, 7, 14],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],
  '6': [0, 4, 7, 9],
  minor6: [0, 3, 7, 9],
  '5': [0, 7], // Power chord
} as const;

export type ChordType = keyof typeof CHORD_PATTERNS;

// Get scale notes for a given root
export function getScaleNotes(root: NoteName | NoteNameFlat, scaleName: ScaleName, useFlats = false): string[] {
  const rootIndex = NOTE_NAMES.indexOf(root as NoteName) !== -1
    ? NOTE_NAMES.indexOf(root as NoteName)
    : NOTE_NAMES_FLAT.indexOf(root as NoteNameFlat);

  const pattern = SCALE_PATTERNS[scaleName];
  const notes = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;

  return pattern.map(interval => notes[(rootIndex + interval) % 12]);
}

// Get chord notes for a given root
export function getChordNotes(root: NoteName | NoteNameFlat, chordType: ChordType, useFlats = false): string[] {
  const rootIndex = NOTE_NAMES.indexOf(root as NoteName) !== -1
    ? NOTE_NAMES.indexOf(root as NoteName)
    : NOTE_NAMES_FLAT.indexOf(root as NoteNameFlat);

  const pattern = CHORD_PATTERNS[chordType];
  const notes = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;

  return pattern.map(interval => notes[(rootIndex + interval) % 12]);
}

// Identify chord from a set of notes
export function identifyChord(notes: string[]): { root: string; type: ChordType; inversion: number }[] {
  // Normalize notes to pitch classes (0-11)
  const pitchClasses = [...new Set(notes.map(note => {
    const cleanNote = note.replace(/\d+$/, '');
    const index = NOTE_NAMES.indexOf(cleanNote as NoteName);
    return index !== -1 ? index : NOTE_NAMES_FLAT.indexOf(cleanNote as NoteNameFlat);
  }))].filter(pc => pc !== -1).sort((a, b) => a - b);

  if (pitchClasses.length < 2) return [];

  const matches: { root: string; type: ChordType; inversion: number }[] = [];

  // Try each note as potential root
  for (let i = 0; i < pitchClasses.length; i++) {
    const potentialRoot = pitchClasses[i];
    const intervals = pitchClasses.map(pc => (pc - potentialRoot + 12) % 12).sort((a, b) => a - b);

    // Check against all chord patterns
    for (const [chordType, pattern] of Object.entries(CHORD_PATTERNS)) {
      if (arraysEqual(intervals, [...pattern].sort((a, b) => a - b))) {
        matches.push({
          root: NOTE_NAMES[potentialRoot],
          type: chordType as ChordType,
          inversion: i,
        });
      }
    }
  }

  return matches;
}

// Helper function to compare arrays
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Circle of fifths order
export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'] as const;

// Get relative minor for a major key
export function getRelativeMinor(majorKey: string): string {
  const index = NOTE_NAMES.indexOf(majorKey as NoteName) !== -1
    ? NOTE_NAMES.indexOf(majorKey as NoteName)
    : NOTE_NAMES_FLAT.indexOf(majorKey as NoteNameFlat);
  return NOTE_NAMES[(index + 9) % 12]; // Down a minor 3rd (or up 9 semitones)
}

// Get relative major for a minor key
export function getRelativeMajor(minorKey: string): string {
  const index = NOTE_NAMES.indexOf(minorKey as NoteName) !== -1
    ? NOTE_NAMES.indexOf(minorKey as NoteName)
    : NOTE_NAMES_FLAT.indexOf(minorKey as NoteNameFlat);
  return NOTE_NAMES[(index + 3) % 12]; // Up a minor 3rd
}

// Guitar fretboard representation
export const GUITAR_STRINGS = 6;
export const GUITAR_FRETS = 24;

// Get note at a specific fret on a string (given open string note)
export function getNoteAtFret(openStringNote: string, fret: number): string {
  const midi = noteNameToMidi(openStringNote) + fret;
  return midiToNoteName(midi);
}

// Get all fret positions for a note on the fretboard
export function getFretPositions(
  note: string,
  tuning = STANDARD_TUNING.notes,
  maxFret = 12
): { string: number; fret: number }[] {
  const targetNote = note.replace(/\d+$/, '');
  const positions: { string: number; fret: number }[] = [];

  for (let stringNum = 0; stringNum < tuning.length; stringNum++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const noteAtFret = getNoteAtFret(tuning[stringNum], fret);
      if (noteAtFret.replace(/\d+$/, '') === targetNote) {
        positions.push({ string: stringNum, fret });
      }
    }
  }

  return positions;
}

// Pentatonic box shape patterns (fret offsets relative to root)
// Each shape represents a different starting position in the pentatonic scale
export const PENTATONIC_BOX_SHAPES = {
  shape1: { // Minor pentatonic root position (A minor pentatonic at 5th fret)
    name: 'Shape 1 (Minor Root)',
    mode: 'Aeolian',
    pattern: [
      [0, 3], // String 6 (low E)
      [0, 3], // String 5 (A)
      [0, 2], // String 4 (D)
      [0, 2], // String 3 (G)
      [0, 2], // String 2 (B)
      [0, 3], // String 1 (high E)
    ],
  },
  shape2: {
    name: 'Shape 2',
    mode: 'Locrian',
    pattern: [
      [0, 3],
      [0, 2],
      [0, 2],
      [0, 2],
      [0, 3],
      [0, 3],
    ],
  },
  shape3: {
    name: 'Shape 3 (Major Root)',
    mode: 'Ionian',
    pattern: [
      [0, 2],
      [0, 2],
      [0, 2],
      [0, 3],
      [0, 3],
      [0, 2],
    ],
  },
  shape4: {
    name: 'Shape 4',
    mode: 'Dorian',
    pattern: [
      [0, 2],
      [0, 2],
      [0, 3],
      [0, 2],
      [0, 2],
      [0, 2],
    ],
  },
  shape5: {
    name: 'Shape 5',
    mode: 'Phrygian',
    pattern: [
      [0, 2],
      [0, 3],
      [0, 2],
      [0, 2],
      [0, 2],
      [0, 2],
    ],
  },
} as const;

export type PentatonicShape = keyof typeof PENTATONIC_BOX_SHAPES;
