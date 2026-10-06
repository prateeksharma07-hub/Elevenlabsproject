export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
  glyph: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', glyph: 'Aa' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', glyph: 'Ñ' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', glyph: 'Ç' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', glyph: 'ß' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹', glyph: 'È' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', glyph: 'Ã' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', glyph: '語' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', glyph: 'ॐ' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', glyph: '音' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺', glyph: 'Я' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', glyph: 'ص' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', glyph: '한' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', flag: '🇳🇱', glyph: 'Ij' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', glyph: 'Ğ' },
  { code: 'pl', name: 'Polish', native: 'Polski', flag: '🇵🇱', glyph: 'Ł' },
  { code: 'sv', name: 'Swedish', native: 'Svenska', flag: '🇸🇪', glyph: 'Å' },
];

export async function translateText(text: string, fromLang: string, toLang: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';
  if (fromLang === toLang) return clean;

  try {
    const encoded = encodeURIComponent(clean);
    const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${fromLang}|${toLang}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation HTTP error ${response.status}`);
    }
    const data = await response.json();
    if (data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    throw new Error('No translated text in response');
  } catch (err) {
    console.warn('[AURA Translator] MyMemory API notice, using clean fallback:', err);
    return clean;
  }
}
