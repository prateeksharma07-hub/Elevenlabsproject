let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let freqDataArray: Uint8Array | null = null;

export interface AudioFrequencyData {
  bass: number;     // 0.0 - 1.0 (normalized)
  mid: number;      // 0.0 - 1.0
  treble: number;   // 0.0 - 1.0
  energy: number;   // 0.0 - 1.0 overall power
  raw: Uint8Array;  // raw 128 frequency bins
}

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function connectAudioElement(audioEl: HTMLAudioElement): AnalyserNode {
  const ctx = getAudioContext();

  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.82;
    freqDataArray = new Uint8Array(analyserNode.frequencyBinCount);
  }

  try {
    if (!sourceNode || (sourceNode as any).mediaElement !== audioEl) {
      sourceNode = ctx.createMediaElementSource(audioEl);
      sourceNode.connect(analyserNode);
      analyserNode.connect(ctx.destination);
    }
  } catch (e) {
    console.warn('[AURA AudioEngine] MediaElementSource reconnect note:', e);
  }

  return analyserNode;
}

const emptyRaw = new Uint8Array(128);

export function sampleAudioFrequencies(isPlaying: boolean): AudioFrequencyData {
  if (!isPlaying || !analyserNode || !freqDataArray) {
    return { bass: 0, mid: 0, treble: 0, energy: 0, raw: emptyRaw };
  }

  analyserNode.getByteFrequencyData(freqDataArray);

  const binCount = analyserNode.frequencyBinCount; // 128
  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;
  let totalSum = 0;

  // Bins 0-8: Bass / Sub-bass
  for (let i = 0; i < 9; i++) {
    bassSum += freqDataArray[i];
  }
  // Bins 9-32: Vocal fundamentals & Mid frequencies
  for (let i = 9; i < 33; i++) {
    midSum += freqDataArray[i];
  }
  // Bins 33-64: Highs / Sibilance
  for (let i = 33; i < 65; i++) {
    trebleSum += freqDataArray[i];
  }
  for (let i = 0; i < binCount; i++) {
    totalSum += freqDataArray[i];
  }

  const bass = bassSum / (9 * 255);
  const mid = midSum / (24 * 255);
  const treble = trebleSum / (32 * 255);
  const energy = totalSum / (binCount * 255);

  return { bass, mid, treble, energy, raw: freqDataArray };
}
