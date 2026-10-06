import { getAudioContext } from './audioContext';

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

type StateChangeCallback = (state: VoicePlaybackState) => void;

class VoicePlayerEngine {
  private currentBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private isPlaying = false;
  private isPaused = false;
  private volume = 1.0;
  private animFrameId: number | null = null;
  private listeners: Set<StateChangeCallback> = new Set();
  private domAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockContext();
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  public unlockContext(): void {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  public setDomAudioElement(el: HTMLAudioElement | null) {
    this.domAudio = el;
  }

  public subscribe(cb: StateChangeCallback): () => void {
    this.listeners.add(cb);
    cb(this.getState());
    return () => this.listeners.delete(cb);
  }

  public getState(): VoicePlaybackState {
    const duration = this.currentBuffer ? this.currentBuffer.duration : 0;
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentTime: this.getCurrentTime(),
      duration,
      volume: this.volume,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.currentBuffer) {
      return this.pauseOffset;
    }
    const ctx = getAudioContext();
    const elapsed = ctx.currentTime - this.startTime;
    const duration = this.currentBuffer.duration;
    return Math.min(duration, Math.max(0, elapsed));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, getAudioContext().currentTime);
    }
    if (this.domAudio) {
      this.domAudio.volume = this.volume;
    }
    this.notify();
  }

  public async loadAndPlayBlob(blob: Blob): Promise<void> {
    this.unlockContext();
    this.stop();

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const arrayBuf = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuf.slice(0));

    this.currentBuffer = audioBuffer;
    this.pauseOffset = 0;

    if (this.domAudio) {
      try {
        const url = URL.createObjectURL(blob);
        this.domAudio.src = url;
      } catch (e) {}
    }

    this.startBufferPlayback(0);
  }

  private startBufferPlayback(offset: number) {
    if (!this.currentBuffer) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.currentBuffer;

    if (!this.gainNode) {
      this.gainNode = ctx.createGain();
    }
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);

    if (!this.analyserNode) {
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;
    }

    source.connect(this.analyserNode);
    this.analyserNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.startTime = ctx.currentTime - offset;
    this.pauseOffset = offset;
    this.isPlaying = true;
    this.isPaused = false;

    source.onended = () => {
      if (this.isPlaying && this.getCurrentTime() >= (this.currentBuffer?.duration || 0) - 0.1) {
        this.stop();
      }
    };

    source.start(0, offset);
    this.currentSource = source;
    this.startTracking();
    this.notify();
  }

  private startTracking() {
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);

    const step = () => {
      if (this.isPlaying) {
        this.notify();
        this.animFrameId = requestAnimationFrame(step);
      }
    };
    this.animFrameId = requestAnimationFrame(step);
  }

  public pause(): void {
    if (!this.isPlaying || this.isPaused) return;

    this.pauseOffset = this.getCurrentTime();
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }

    this.isPlaying = false;
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.notify();
  }

  public resume(): void {
    if (!this.isPaused || !this.currentBuffer) return;
    this.startBufferPlayback(this.pauseOffset);
  }

  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else if (this.isPaused) {
      this.resume();
    }
  }

  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }

    this.isPlaying = false;
    this.isPaused = false;
    this.pauseOffset = 0;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.notify();
  }

  public seek(percent: number): void {
    if (!this.currentBuffer) return;
    const targetOffset = (percent / 100) * this.currentBuffer.duration;
    const wasPlaying = this.isPlaying;
    this.stop();
    this.pauseOffset = targetOffset;
    if (wasPlaying) {
      this.startBufferPlayback(targetOffset);
    } else {
      this.isPaused = true;
      this.notify();
    }
  }
}

export const voicePlayer = new VoicePlayerEngine();
