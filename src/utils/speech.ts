// Helper for speech synthesis (Text to Speech) & Web Speech API recognition

let activeUtterance: SpeechSynthesisUtterance | null = null;

// Helper to detect language script from text content
export function detectLanguageFromText(text: string, defaultLang = 'en-US'): string {
  if (!text) return defaultLang;
  
  // Telugu script: \u0C00 - \u0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  // Devanagari (Hindi/Marathi/Nepali): \u0900 - \u097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
  // Tamil: \u0B80 - \u0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  // Kannada: \u0C80 - \u0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  // Malayalam: \u0D00 - \u0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  // Bengali: \u0980 - \u09FF
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  // Arabic: \u0600 - \u06FF
  if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
  // Chinese: \u4E00 - \u9FFF
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
  // Japanese: \u3040 - \u30FF
  if (/[\u3040-\u30FF]/.test(text)) return 'ja-JP';

  return defaultLang;
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  rate = 0.92, // Slightly slower for elderly clarity
  pitch = 1.0,
  langCode = 'en-US'
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  try {
    window.speechSynthesis.cancel();
  } catch (err) {
    console.warn('Speech synthesis cancel error:', err);
  }

  // Auto-detect language if text contains specific scripts (e.g., Telugu, Hindi)
  const targetLang = detectLanguageFromText(text, langCode);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.lang = targetLang;

  // Retain global reference so browser garbage collector does not silence mid-speech
  activeUtterance = utterance;

  const setBestVoice = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const langPrefix = targetLang.split('-')[0].toLowerCase();

      // Priority 1: Match voice whose lang or name contains the specific language (e.g. te / telugu)
      const exactMatch = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLang.toLowerCase());
      const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      const nameMatch = voices.find((v) => {
        const name = v.name.toLowerCase();
        if (langPrefix === 'te' && (name.includes('telugu') || name.includes('mohan') || name.includes('shruti'))) return true;
        if (langPrefix === 'hi' && (name.includes('hindi') || name.includes('swara') || name.includes('madhur') || name.includes('kalpana'))) return true;
        if (langPrefix === 'ta' && (name.includes('tamil') || name.includes('valluvar'))) return true;
        if (langPrefix === 'kn' && name.includes('kannada')) return true;
        if (langPrefix === 'ml' && name.includes('malayalam')) return true;
        if (langPrefix === 'bn' && name.includes('bengali')) return true;
        return false;
      });

      const preferredVoice = exactMatch || prefixMatch || nameMatch || (langPrefix === 'en' ? voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Samantha') ||
            v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('Zira') ||
            v.name.includes('Female') ||
            v.name.includes('Serena'))
      ) : null) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    } catch (e) {
      console.warn('Error setting voice:', e);
    }
  };

  setBestVoice();

  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = () => {
      setBestVoice();
    };
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    console.warn('Speech synthesis utterance error:', event);
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Failed to trigger speechSynthesis.speak:', err);
    activeUtterance = null;
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    activeUtterance = null;
  }
}

// Browser Speech Recognition setup
export function getSpeechRecognition(langCode = 'en-US'): any {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = langCode;
  return recognition;
}

