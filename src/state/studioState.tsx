import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { VOICES, MODELS, DEMO_SCRIPTS, synthesizeSpeech, getActiveApiKey, saveApiKey } from '../services/elevenlabs';
import { connectAudioElement, sampleAudioFrequencies, AudioFrequencyData } from '../services/audioContext';
import { voicePlayer } from '../services/voicePlayer';
import { translateText } from '../services/translation';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface StudioContextType {
  // TTS State
  text: string;
  setText: (val: string) => void;
  voiceId: string;
  setVoiceId: (val: string) => void;
  modelId: string;
  setModelId: (val: string) => void;
  stability: number;
  setStability: (val: number) => void;
  similarity: number;
  setSimilarity: (val: number) => void;
  style: number;
  setStyle: (val: number) => void;
  isGenerating: boolean;
  loadDemoScript: (key: string) => void;

  // Audio Playback
  audioUrl: string | null;
  audioBlob: Blob | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (val: number) => void;
  seekAudio: (percent: number) => void;
  playAudio: () => void;
  pauseAudio: () => void;
  togglePlayPause: () => void;
  stopAudio: () => void;
  downloadAudio: () => void;
  handleGenerate: () => Promise<void>;

  // Real-time audio frequencies for 3D world
  getFrequencyData: () => AudioFrequencyData;

  // Translation
  transSource: string;
  setTransSource: (val: string) => void;
  transTarget: string;
  setTransTarget: (val: string) => void;
  transSourceLang: string;
  setTransSourceLang: (val: string) => void;
  transTargetLang: string;
  setTransTargetLang: (val: string) => void;
  isTranslating: boolean;
  handleTranslate: () => Promise<void>;
  sendToStudio: () => void;

  // Toast notifications
  toast: Toast | null;
  showToast: (message: string, type?: Toast['type']) => void;

  // Camera & Scroll Navigation
  scrollProgress: number;
  setScrollProgress: (val: number) => void;
  activeScene: number;
  setActiveScene: (scene: number) => void;
  scrollToScene: (scene: number) => void;
  pointer: { x: number; y: number };
  setPointer: (p: { x: number; y: number }) => void;
}

const StudioContext = createContext<StudioContextType | null>(null);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // TTS State
  const [text, setText] = useState<string>(
    "In a world fractured by silence, one voice will cut through the digital storm. When the artificial minds awaken, humanity's greatest triumph may become its final countdown."
  );
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].id);
  const [modelId, setModelId] = useState<string>(MODELS[0].id);
  const [stability, setStability] = useState<number>(0.50);
  const [similarity, setSimilarity] = useState<number>(0.75);
  const [style, setStyle] = useState<number>(0.00);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Audio Playback State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.9);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Translation State
  const [transSource, setTransSource] = useState<string>(
    "Experience the power of neural speech synthesis across every continent and language."
  );
  const [transTarget, setTransTarget] = useState<string>('');
  const [transSourceLang, setTransSourceLang] = useState<string>('en');
  const [transTargetLang, setTransTargetLang] = useState<string>('es');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Navigation / Spatial tracking
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeScene, setActiveScene] = useState<number>(1);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toasts
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ id: Date.now(), message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // VoicePlayer Engine integration
  useEffect(() => {
    voicePlayer.setVolume(volume);
    const unsub = voicePlayer.subscribe((st) => {
      setIsPlaying(st.isPlaying);
      setCurrentTime(st.currentTime);
      setDuration(st.duration);
    });
    return unsub;
  }, []);

  // Global user gesture unlock
  useEffect(() => {
    const unlock = () => {
      voicePlayer.unlockContext();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const setVolume = (val: number) => {
    setVolumeState(val);
    voicePlayer.setVolume(val);
  };

  const playAudio = () => {
    voicePlayer.resume();
  };

  const pauseAudio = () => {
    voicePlayer.pause();
  };

  const togglePlayPause = () => {
    voicePlayer.togglePlayPause();
  };

  const stopAudio = () => {
    voicePlayer.stop();
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const seekAudio = (percent: number) => {
    voicePlayer.seek(percent);
  };

  const downloadAudio = () => {
    if (!audioBlob && !audioUrl) {
      showToast('No audio available to download.', 'warning');
      return;
    }
    const currentVoice = VOICES.find(v => v.id === voiceId)?.name || 'aura_voice';
    const filename = `aura_synthesis_${currentVoice.toLowerCase()}_${Date.now()}.mp3`;
    const link = document.createElement('a');
    link.href = audioUrl || '';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}!`, 'success');
  };

  const loadDemoScript = (key: string) => {
    if (DEMO_SCRIPTS[key]) {
      setText(DEMO_SCRIPTS[key].text);
      setVoiceId(DEMO_SCRIPTS[key].recommendedVoice);
      showToast(`Loaded ${key.toUpperCase()} demo script with recommended voice!`, 'info');
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    const clean = text.trim();
    if (!clean) {
      showToast('Please enter text to synthesize.', 'warning');
      return;
    }

    const key = getActiveApiKey();
    if (!key) {
      showToast('API Key required. Click key icon to configure.', 'error');
      return;
    }

    voicePlayer.unlockContext();
    stopAudio();
    setIsGenerating(true);

    try {
      const blob = await synthesizeSpeech({
        text: clean,
        voiceId,
        modelId,
        stability,
        similarity,
        style,
      });

      setAudioBlob(blob);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      const newUrl = URL.createObjectURL(blob);
      setAudioUrl(newUrl);

      await voicePlayer.loadAndPlayBlob(blob);
      showToast('Neural audio synthesized successfully!', 'success');
    } catch (err: any) {
      console.error('Synthesis error:', err);
      showToast(err.message || 'Synthesis failed.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFrequencyData = (): AudioFrequencyData => {
    return sampleAudioFrequencies(isPlaying);
  };

  const handleTranslate = async () => {
    if (isTranslating) return;
    const clean = transSource.trim();
    if (!clean) {
      showToast('Please enter text to translate.', 'warning');
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateText(clean, transSourceLang, transTargetLang);
      setTransTarget(translated);
      showToast('Translation completed!', 'success');
    } catch (e: any) {
      showToast('Translation error: ' + (e.message || e), 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const scrollToScene = (sceneNum: number) => {
    const sceneIds: Record<number, string> = {
      1: 'intro',
      2: 'studio',
      3: 'visualizer',
      4: 'translation',
      5: 'ending',
    };
    const targetId = sceneIds[sceneNum] || 'intro';
    const elem = document.getElementById(targetId);

    if (elem) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(elem, { offset: -20, duration: 1.2 });
      } else {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const sceneRatios: Record<number, number> = {
      1: 0.0,
      2: 0.25,
      3: 0.50,
      4: 0.75,
      5: 1.0,
    };
    const ratio = sceneRatios[sceneNum] ?? 0.0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const target = ratio * maxScroll;

    if ((window as any).lenis) {
      (window as any).lenis.scrollTo(target, { duration: 1.2 });
    } else {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  const sendToStudio = () => {
    const content = transTarget || transSource;
    if (!content.trim()) {
      showToast('No text available to send to studio.', 'warning');
      return;
    }
    setText(content);
    setModelId('eleven_multilingual_v2'); // Ensure multilingual model is chosen
    showToast('Sent translated text to Voice Studio! Flying to console...', 'success');
    setTimeout(() => {
      scrollToScene(2);
    }, 300);
  };

  activeStudioInstance = {
    text,
    setText,
    voiceId,
    setVoiceId,
    modelId,
    setModelId,
    stability,
    setStability,
    similarity,
    setSimilarity,
    style,
    setStyle,
    isGenerating,
    loadDemoScript,
    audioUrl,
    audioBlob,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    seekAudio,
    playAudio,
    pauseAudio,
    togglePlayPause,
    stopAudio,
    downloadAudio,
    handleGenerate,
    getFrequencyData,
    transSource,
    setTransSource,
    transTarget,
    setTransTarget,
    transSourceLang,
    setTransSourceLang,
    transTargetLang,
    setTransTargetLang,
    isTranslating,
    handleTranslate,
    sendToStudio,
    toast,
    showToast,
    scrollProgress,
    setScrollProgress,
    activeScene,
    setActiveScene,
    scrollToScene,
    pointer,
    setPointer,
  };

  return (
    <StudioContext.Provider value={activeStudioInstance}>
      <audio
        ref={(el) => {
          audioRef.current = el;
          voicePlayer.setDomAudioElement(el);
        }}
        id="aura-dom-audio-player"
        preload="auto"
        style={{ display: 'none' }}
      />
      {children}
    </StudioContext.Provider>
  );
};

let activeStudioInstance: StudioContextType | null = null;

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  return ctx || activeStudioInstance;
};
