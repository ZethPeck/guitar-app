import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { detectPitch, PitchResult, PitchSmoother, StabilityChecker } from '../lib/pitch-detector';
import { frequencyToMidi, midiToNoteName, getCentsDeviation, midiToNoteNameOnly } from '../lib/music-theory';

export interface PitchData {
  frequency: number;
  noteName: string;
  noteNameWithOctave: string;
  cents: number;
  confidence: number;
  isStable: boolean;
  midi: number;
}

interface UseAudioRecorderOptions {
  onPitchDetected?: (pitch: PitchData | null) => void;
  smoothingWindowSize?: number;
  stabilityWindowSize?: number;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const {
    onPitchDetected,
    smoothingWindowSize = 5,
    stabilityWindowSize = 8,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const smootherRef = useRef(new PitchSmoother(smoothingWindowSize));
  const stabilityRef = useRef(new StabilityChecker(stabilityWindowSize));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (!granted) {
        setError('Microphone permission denied');
      }
      return granted;
    } catch (e) {
      setError('Failed to request permission');
      return false;
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.getPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // Check permission
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create and prepare recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      // Set up metering callback for real-time analysis
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // We'll use the metering level as a proxy for audio activity
          // Real pitch detection happens in a separate analysis loop
        }
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      // Reset smoothers
      smootherRef.current.reset();
      stabilityRef.current.reset();

      // Start analysis loop - we'll periodically stop, analyze, and restart
      startAnalysisLoop();
    } catch (e) {
      setError(`Failed to start recording: ${e}`);
      console.error('Recording error:', e);
    }
  }, [hasPermission, requestPermission]);

  // Analysis loop - periodically capture and analyze audio
  const startAnalysisLoop = useCallback(() => {
    // For expo-av, we need to use a different approach
    // Since we can't get raw audio data during recording,
    // we'll use the metering data and frequency estimation
    // For production, consider using react-native-audio-api or similar

    // For now, we'll simulate with metering-based detection
    // This is a placeholder - real implementation would need native module
    intervalRef.current = setInterval(async () => {
      if (!recordingRef.current) return;

      try {
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording && status.metering !== undefined) {
          // Metering is in dB, typically -160 to 0
          const level = status.metering;

          // If level is high enough, we have audio
          if (level > -40) {
            // In a real implementation, we would analyze the actual audio buffer
            // For now, this is a placeholder that shows the UI working
            // The actual pitch detection will work when we add native audio access
          }
        }
      } catch (e) {
        console.error('Analysis error:', e);
      }
    }, 50); // 20 times per second
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      setIsRecording(false);
      setCurrentPitch(null);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });
    } catch (e) {
      setError(`Failed to stop recording: ${e}`);
    }
  }, []);

  // Process detected pitch and convert to useful data
  const processPitchResult = useCallback((result: PitchResult): PitchData => {
    const smoothedFrequency = smootherRef.current.add(result.frequency);
    const isStable = stabilityRef.current.addFrequency(smoothedFrequency);
    const midi = frequencyToMidi(smoothedFrequency);
    const cents = getCentsDeviation(smoothedFrequency);

    const pitchData: PitchData = {
      frequency: smoothedFrequency,
      noteName: midiToNoteNameOnly(midi),
      noteNameWithOctave: midiToNoteName(midi),
      cents,
      confidence: result.confidence,
      isStable,
      midi,
    };

    setCurrentPitch(pitchData);
    onPitchDetected?.(pitchData);

    return pitchData;
  }, [onPitchDetected]);

  // Manual pitch analysis from audio data (for when we get raw audio)
  const analyzeAudioData = useCallback((audioData: Float32Array, sampleRate: number = 44100): PitchData | null => {
    const result = detectPitch(audioData, sampleRate);

    if (result && result.confidence > 0.8) {
      return processPitchResult(result);
    }

    setCurrentPitch(null);
    onPitchDetected?.(null);
    return null;
  }, [processPitchResult, onPitchDetected]);

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  return {
    isRecording,
    hasPermission,
    currentPitch,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
    requestPermission,
    analyzeAudioData,
  };
}
