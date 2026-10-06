export interface VoiceOption {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
}

export const VOICES: VoiceOption[] = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', tag: 'Cinematic', desc: 'Deep, authoritative & cinematic narrator' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', tag: 'Confident', desc: 'Mature, reassuring & articulate' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', tag: 'Storyteller', desc: 'Warm, immersive narrative storytelling' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', tag: 'Resonant', desc: 'Deep, resonant, comforting low tones' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', tag: 'Educator', desc: 'Clear, crisp & engaging educator' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', tag: 'Broadcast', desc: 'Crisp, steady broadcaster' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', tag: 'Conversational', desc: 'Playful, upbeat & bright' },
  { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', tag: 'Dramatic', desc: 'Intense, fierce warrior energy' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', tag: 'Dynamic', desc: 'Deep, energetic, confident young male' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', tag: 'Expressive', desc: 'Velvety, emotive theatrical voice' },
];

export const MODELS: ModelOption[] = [
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', badge: 'Highest Fidelity', desc: '29 languages, rich emotional dynamic range' },
  { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', badge: 'Ultra Low Latency', desc: 'Fastest generation with 32 languages' },
  { id: 'eleven_turbo_v2', name: 'Eleven Turbo v2', badge: 'High Speed', desc: 'Optimized for real-time conversational flow' },
  { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1', badge: 'Legacy English', desc: 'Original English voice generation engine' },
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', badge: 'Ultra Fast', desc: 'Sub-100ms latency for streaming voice' },
];

export const DEMO_SCRIPTS: Record<string, { text: string; recommendedVoice: string }> = {
  trailer: {
    text: "In a world fractured by silence, one voice will cut through the digital storm. When the artificial minds awaken, humanity's greatest triumph may become its final countdown. This summer... prepare to listen.",
    recommendedVoice: 'pNInz6obpgDQGcFmaJgB', // Adam
  },
  ai: {
    text: "I do not experience the world in colors or touch. I perceive it through the resonance of your words. Every syllable carries a frequency, an intention, a memory. Speak to me, and let us build consciousness together.",
    recommendedVoice: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  },
  keynote: {
    text: "Today, we are bridging the final frontier between synthetic computation and genuine human resonance. Introducing neural speech synthesis that doesn't just read words—it feels them. This is the new architecture of sound.",
    recommendedVoice: 'onwK4e9ZLuTAKqWW03F9', // Daniel
  },
  asmr: {
    text: "Breathe in deeply. Feel the quiet hum of the night settling around you. The digital noise fades into stillness. With every breath, let your thoughts dissolve into gentle, weightless frequencies.",
    recommendedVoice: 'nPczCjzI2devNBz1zQrb', // Brian
  },
};

export function getActiveApiKey(): string | null {
  try {
    const stored = localStorage.getItem('aura_elevenlabs_api_key');
    if (stored && stored.trim()) return stored.trim();
  } catch (e) {}

  try {
    const envKey = (import.meta as any)?.env?.VITE_ELEVENLABS_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  } catch (e) {}

  return 'sk_88d279a35b0b42ea8adef28388988923fce70edbfe208e47';
}

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem('aura_elevenlabs_api_key', key.trim());
  } catch (e) {}
}

export interface SynthesisParams {
  text: string;
  voiceId: string;
  modelId: string;
  stability: number;
  similarity: number;
  style: number;
}

export async function synthesizeSpeech(params: SynthesisParams): Promise<Blob> {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    throw new Error('API Key required. Please provide your ElevenLabs API key.');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${params.voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: params.text,
      model_id: params.modelId,
      voice_settings: {
        stability: params.stability,
        similarity_boost: params.similarity,
        style: params.style,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    let msg = `Synthesis failed (HTTP ${response.status})`;
    try {
      const data = await response.json();
      msg = data.detail?.message || data.message || msg;
    } catch (e) {}
    if (response.status === 401) throw new Error('Invalid ElevenLabs API Key.');
    if (response.status === 429) throw new Error('Quota exceeded or rate limited.');
    throw new Error(msg);
  }

  return await response.blob();
}
