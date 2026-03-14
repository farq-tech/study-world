/**
 * Text-to-Speech abstraction layer using Web Speech API
 * Optimized for Arabic language with Saudi/Arabic voices
 */

class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private _isSupported = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this._isSupported = true;
    }
  }

  get isSupported(): boolean {
    return this._isSupported;
  }

  get isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  get isPaused(): boolean {
    return this.synth?.paused || false;
  }

  getArabicVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices().filter(v => v.lang.startsWith('ar'));
  }

  getBestArabicVoice(): SpeechSynthesisVoice | null {
    const voices = this.getArabicVoices();
    // Prefer Saudi Arabic, then any Arabic voice
    return voices.find(v => v.lang === 'ar-SA') || voices.find(v => v.lang.startsWith('ar')) || null;
  }

  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void; onError?: (err: any) => void }): void {
    if (!this.synth || !this._isSupported) {
      options?.onError?.('TTS not supported');
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = options?.rate ?? 0.9; // Slightly slower for children
    utterance.pitch = options?.pitch ?? 1.1; // Slightly higher for friendlier tone
    utterance.volume = options?.volume ?? 1;

    const voice = this.getBestArabicVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options?.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause(): void {
    this.synth?.pause();
  }

  resume(): void {
    this.synth?.resume();
  }

  stop(): void {
    this.synth?.cancel();
    this.currentUtterance = null;
  }
}

// Singleton instance
let ttsInstance: TTSEngine | null = null;

export function getTTS(): TTSEngine {
  if (!ttsInstance) {
    ttsInstance = new TTSEngine();
  }
  return ttsInstance;
}

export default TTSEngine;
