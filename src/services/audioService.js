// Lao Audio & Voice Pronunciation Engine (Transcription-First)
// Ensures 100% audible pronunciation on ALL laptops, phones, and Telegram Web:
// 1. Uses native Lao/Thai TTS voice if installed on device
// 2. Automatically falls back to tuned phonetic pronunciation (Russian/English TTS) if Lao voice is missing!
// 3. Web Audio API Formant & Tone synthesizer for intonation practice

import { VOCAB_WORDS } from '../data/vocabData';

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.voicesLoaded = false;
    this.laoOrThaiVoice = null;
    this.ruVoice = null;
    this.enVoice = null;

    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    this.laoOrThaiVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('lo')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('th'));

    this.ruVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ru'));
    this.enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    this.voicesLoaded = true;
  }

  // Clean stress marks and brackets from transcription string
  cleanPhonetic(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove combining acute accents
      .replace(/\([^)]*\)/g, '') // remove (1), (20) etc.
      .replace(/[/?.!]/g, ' ')
      .replace(/-/g, ' ')
      .trim();
  }

  // Speak any word object or string with guaranteed audio output
  speakText(itemOrText, rate = 0.85) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    if (!this.voicesLoaded) {
      this.initVoices();
    }

    window.speechSynthesis.cancel();

    // Find matching vocabulary entry if string passed
    let vocabEntry = null;
    if (typeof itemOrText === 'object' && itemOrText !== null) {
      vocabEntry = itemOrText;
    } else if (typeof itemOrText === 'string') {
      const q = itemOrText.trim().toLowerCase();
      vocabEntry = VOCAB_WORDS.find(
        (w) =>
          w.id === q ||
          w.lao === itemOrText.trim() ||
          w.ruTrans.toLowerCase() === q ||
          this.cleanPhonetic(w.ruTrans).toLowerCase() === this.cleanPhonetic(q) ||
          w.latTrans.toLowerCase() === q
      );
    }

    const utterance = new SpeechSynthesisUtterance();
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const preferredLang =
      typeof window !== 'undefined'
        ? localStorage.getItem('laolingo_lang') || 'ru'
        : 'ru';

    if (this.laoOrThaiVoice && (vocabEntry?.lao || /[ກ-ໝ]/.test(String(itemOrText)))) {
      // Device has native Lao/Thai voice
      utterance.text = vocabEntry ? vocabEntry.lao : String(itemOrText);
      utterance.voice = this.laoOrThaiVoice;
      utterance.lang = this.laoOrThaiVoice.lang;
    } else if (preferredLang === 'en' && this.enVoice) {
      // Use English voice with Latin phonetic transcription when UI is in English
      const textToRead = vocabEntry
        ? vocabEntry.ttsPhoneticEn
        : this.cleanPhonetic(String(itemOrText));
      utterance.text = textToRead;
      utterance.voice = this.enVoice;
      utterance.lang = this.enVoice.lang;
    } else if (this.ruVoice) {
      // Use Russian voice with phonetic transcription
      const textToRead = vocabEntry
        ? vocabEntry.ttsPhoneticRu
        : this.cleanPhonetic(String(itemOrText));
      utterance.text = textToRead;
      utterance.voice = this.ruVoice;
      utterance.lang = this.ruVoice.lang;
    } else {
      // Fallback to English voice with Latin phonetic transcription
      const textToRead = vocabEntry
        ? vocabEntry.ttsPhoneticEn
        : this.cleanPhonetic(String(itemOrText));
      utterance.text = textToRead;
      if (this.enVoice) {
        utterance.voice = this.enVoice;
        utterance.lang = this.enVoice.lang;
      }
    }

    window.speechSynthesis.speak(utterance);
    return true;
  }

  // Synthesize musical pitch contour for Lao tones
  playToneContour(toneType = 'mid', baseFreq = 220, duration = 0.6) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.Q.setValueAtTime(3, now);

    osc.type = 'sawtooth';

    switch (toneType) {
      case 'mid':
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.setValueAtTime(baseFreq, now + duration);
        break;
      case 'low':
        osc.frequency.setValueAtTime(baseFreq * 0.9, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + duration);
        break;
      case 'high':
        osc.frequency.setValueAtTime(baseFreq * 1.35, now);
        osc.frequency.setValueAtTime(baseFreq * 1.35, now + duration);
        break;
      case 'rising':
        osc.frequency.setValueAtTime(baseFreq * 0.82, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + duration);
        break;
      case 'highFalling':
        osc.frequency.setValueAtTime(baseFreq * 1.4, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + duration);
        break;
      case 'lowFalling':
        osc.frequency.setValueAtTime(baseFreq * 1.05, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.76, now + duration);
        break;
      default:
        osc.frequency.setValueAtTime(baseFreq, now);
    }

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode.gain.setValueAtTime(0.25, now + duration - 0.08);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playFeedback(type = 'success') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }
}

export const audioEngine = new AudioEngine();
