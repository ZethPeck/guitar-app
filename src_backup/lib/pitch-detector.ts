// Pitch Detection using Autocorrelation (YIN-inspired algorithm)
// Optimized for guitar frequency range (80Hz - 1200Hz)

const MIN_FREQUENCY = 60; // Below low E on bass
const MAX_FREQUENCY = 1400; // Above high E on guitar
const SAMPLE_RATE = 44100;
const MIN_PERIOD = Math.floor(SAMPLE_RATE / MAX_FREQUENCY);
const MAX_PERIOD = Math.floor(SAMPLE_RATE / MIN_FREQUENCY);

export interface PitchResult {
  frequency: number;
  confidence: number;
  timestamp: number;
}

// Autocorrelation-based pitch detection
export function detectPitch(audioBuffer: Float32Array, sampleRate: number = SAMPLE_RATE): PitchResult | null {
  const bufferSize = audioBuffer.length;

  // Check if signal is loud enough
  const rms = calculateRMS(audioBuffer);
  if (rms < 0.01) {
    return null; // Signal too quiet
  }

  // Normalize the buffer
  const normalizedBuffer = normalizeBuffer(audioBuffer);

  // Calculate autocorrelation
  const minPeriod = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxPeriod = Math.min(Math.floor(sampleRate / MIN_FREQUENCY), Math.floor(bufferSize / 2));

  let bestPeriod = 0;
  let bestCorrelation = -1;

  // YIN-style difference function
  const yinBuffer = new Float32Array(maxPeriod);

  // Step 1: Difference function
  for (let tau = minPeriod; tau < maxPeriod; tau++) {
    let sum = 0;
    for (let i = 0; i < maxPeriod; i++) {
      const delta = normalizedBuffer[i] - normalizedBuffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  // Step 2: Cumulative mean normalized difference
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < maxPeriod; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] = yinBuffer[tau] * tau / runningSum;
  }

  // Step 3: Absolute threshold
  const threshold = 0.1;
  let foundPeriod = -1;

  for (let tau = minPeriod; tau < maxPeriod; tau++) {
    if (yinBuffer[tau] < threshold) {
      // Found a dip below threshold, now find the minimum
      while (tau + 1 < maxPeriod && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      foundPeriod = tau;
      break;
    }
  }

  // If no period found with threshold, find global minimum
  if (foundPeriod === -1) {
    let minVal = yinBuffer[minPeriod];
    foundPeriod = minPeriod;
    for (let tau = minPeriod; tau < maxPeriod; tau++) {
      if (yinBuffer[tau] < minVal) {
        minVal = yinBuffer[tau];
        foundPeriod = tau;
      }
    }
    if (minVal > 0.5) {
      return null; // Not confident enough
    }
  }

  // Step 4: Parabolic interpolation for better precision
  const betterPeriod = parabolicInterpolation(yinBuffer, foundPeriod);

  if (betterPeriod === 0) {
    return null;
  }

  const frequency = sampleRate / betterPeriod;
  const confidence = 1 - yinBuffer[foundPeriod];

  // Validate frequency range
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    return null;
  }

  return {
    frequency,
    confidence: Math.max(0, Math.min(1, confidence)),
    timestamp: Date.now(),
  };
}

// Calculate RMS (Root Mean Square) of the signal
function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

// Normalize buffer to -1 to 1 range
function normalizeBuffer(buffer: Float32Array): Float32Array {
  let max = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > max) max = abs;
  }
  if (max === 0) return buffer;

  const normalized = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    normalized[i] = buffer[i] / max;
  }
  return normalized;
}

// Parabolic interpolation for sub-sample accuracy
function parabolicInterpolation(buffer: Float32Array, index: number): number {
  if (index <= 0 || index >= buffer.length - 1) {
    return index;
  }

  const s0 = buffer[index - 1];
  const s1 = buffer[index];
  const s2 = buffer[index + 1];

  const a = (s0 + s2 - 2 * s1) / 2;
  const b = (s2 - s0) / 2;

  if (a === 0) {
    return index;
  }

  const adjustment = -b / (2 * a);
  return index + adjustment;
}

// Moving average filter for smoothing pitch values
export class PitchSmoother {
  private values: number[] = [];
  private readonly windowSize: number;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  add(value: number): number {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }

    // Use median for robustness against outliers
    const sorted = [...this.values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  reset(): void {
    this.values = [];
  }
}

// Convert audio data from various formats to Float32Array
export function convertToFloat32(data: ArrayBuffer | number[], bytesPerSample: number = 2): Float32Array {
  if (data instanceof ArrayBuffer) {
    const view = new DataView(data);
    const samples = data.byteLength / bytesPerSample;
    const float32 = new Float32Array(samples);

    if (bytesPerSample === 2) {
      // 16-bit PCM
      for (let i = 0; i < samples; i++) {
        const int16 = view.getInt16(i * 2, true);
        float32[i] = int16 / 32768;
      }
    } else if (bytesPerSample === 4) {
      // 32-bit float
      for (let i = 0; i < samples; i++) {
        float32[i] = view.getFloat32(i * 4, true);
      }
    }

    return float32;
  } else {
    // Array of numbers (metering data from expo-av)
    return new Float32Array(data);
  }
}

// Frequency stability checker - helps determine when pitch is "locked"
export class StabilityChecker {
  private frequencies: number[] = [];
  private readonly windowSize: number;
  private readonly stabilityThreshold: number; // cents

  constructor(windowSize: number = 10, stabilityThresholdCents: number = 5) {
    this.windowSize = windowSize;
    this.stabilityThreshold = stabilityThresholdCents;
  }

  addFrequency(frequency: number): boolean {
    this.frequencies.push(frequency);
    if (this.frequencies.length > this.windowSize) {
      this.frequencies.shift();
    }

    if (this.frequencies.length < this.windowSize / 2) {
      return false;
    }

    // Calculate variance in cents
    const avg = this.frequencies.reduce((a, b) => a + b, 0) / this.frequencies.length;
    const maxDeviation = Math.max(
      ...this.frequencies.map(f => Math.abs(1200 * Math.log2(f / avg)))
    );

    return maxDeviation < this.stabilityThreshold;
  }

  reset(): void {
    this.frequencies = [];
  }
}
