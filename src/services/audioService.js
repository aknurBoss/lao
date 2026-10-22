// Lao Audio & Voice Pronunciation Engine (Mobile & Telegram WebView Ready)
// Uses pre-bundled native MP3 audio files (/audio/*.mp3) + synchronous HTML5 Audio + Web Audio API
// so pronunciation works 100% reliably on iPhone (iOS Telegram), Android Telegram, and Desktop!

import { VOCAB_WORDS } from '../data/vocabData.js';

// Map extra curriculum sentences & word-bank tokens to pre-bundled /audio/*.mp3 files
const EXTRA_AUDIO_MAP = {
  // Lesson sentences & combinations
  'ສະບາຍດີ ຂອບໃຈ': 'c1',
  'са-бай-ди, кхоп-тьай': 'c1',
  'sa-baai-dii, khop-jai': 'c1',
  'ໄດ້': 'c2',
  'ບໍ່ມີ': 'c3',
  'бо ми': 'c3',
  'bo mii': 'c3',
  'бо дай': 'c4',
  'bo dai': 'c4',
  'ດີຫຼາຍ': 'c5',
  'ди лай': 'c5',
  'dii lai': 'c5',
  'ບໍ່ເຜັດເດີ': 'c6',
  'бо пхет дэ': 'c6',
  'bo phet der': 'c6',
  'лап кай': 'c7',
  'laap kai': 'c7',
  'ка-фе йен': 'c8',
  'ka-fe yen': 'c8',
  'ບໍ່ເຜັດ ແຊບຫຼາຍ': 'c9',
  'бо пхет, сэп лай': 'c9',
  'bo phet, saep lai': 'c9',
  'ໜຶ່ງ ສອງ ສາມ': 'c10',
  'нынг, сонг, сам': 'c10',
  'neung, song, saam': 'c10',
  'си, ха': 'c11',
  'sii, haa': 'c11',
  'пхан, сэн': 'c12',
  'phan, saen': 'c12',
  'ແພງຫຼາຍ ຫຼຸດໄດ້ບໍ່': 'c13',
  'пхэнг лай, лут дай бо': 'c13',
  'phaeng lai, lut dai bo': 'c13',
  'ляо сай': 'c14',
  'liao sai': 'c14',
  'ляо кхва': 'c15',
  'liao khwaa': 'c15',
  'ຢຸດຢູ່ນີ້ແດ່ ຂອບໃຈ': 'c16',
  'ют ю ни дэ, кхоп-тьай': 'c16',
  'yut yuu nii dae, khop-jai': 'c16',

  // Single Word-Bank tokens
  'бо': 'wb1',
  'bo': 'wb1',
  'мэн': 'wb2',
  'maen': 'wb2',
  'сы': 'wb3',
  'seu': 'wb3',
  'ньянг': 'wb4',
  'nyang': 'wb4',
  'ми': 'wb5',
  'mii': 'wb5',
  'кхо': 'wb6',
  'kho': 'wb6',
  'нам': 'wb7',
  'nam': 'wb7',
  'нам-дым': 'f3',
  'nam-duem': 'f3',
  'дэ': 'wb8',
  'dae': 'wb8',
  'der': 'wb8',
  'сэп': 'wb9',
  'saep': 'wb9',
  'сэп лай': 'f4',
  'saep lai': 'f4',
  'пхет': 'wb10',
  'phet': 'wb10',
  'чек-бин': 'wb11',
  'chek-bin': 'wb11',
  'сип': 'wb12',
  'sip': 'wb12',
  'пхан': 'wb13',
  'phan': 'wb13',
  'ха-сип': 'wb14',
  'haa-sip': 'wb14',
  'кип': 'wb15',
  'kip': 'wb15',
  'ан-ни': 'wb16',
  'an-nii': 'wb16',
  'лут': 'wb17',
  'lut': 'wb17',
  'дай': 'wb18',
  'dai': 'wb18',
  'пхэнг': 'wb19',
  'phaeng': 'wb19',
  'пхэнг лай': 's3',
  'phaeng lai': 's3',
  'ао': 'wb20',
  'ao': 'wb20',
  'ао ан-ни / бо ао': 's5',
  'ao an-nii / bo ao': 's5',
  'мэн лэо': 'b3',
  'maen laeo': 'b3',
  'бо мэн': 'b4',
  'bo maen': 'b4',
  'мэн / бо мэн': 'b3',
  'maen / bo maen': 'b3',
  'хонг-нам': 'wb21',
  'hong-nam': 'wb21',
  'ю': 'wb22',
  'yuu': 'wb22',
  'сай': 'wb23',
  'sai': 'wb23',
  'пай': 'wb24',
  'pai': 'wb24',
  'лай-лай': 'wb25',
  'lai-lai': 'wb25',
};

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.bufferCache = new Map();
    this.currentSource = null;
    this.htmlAudio = null;
    this.unlocked = false;

    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock();
      };
      window.addEventListener('touchstart', unlockHandler, { passive: true });
      window.addEventListener('pointerdown', unlockHandler, { passive: true });
      window.addEventListener('click', unlockHandler, { passive: true });
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
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  unlock() {
    // Enable iOS 17+ playback session so hardware silent switch does not mute pronunciation
    if (typeof navigator !== 'undefined' && navigator.audioSession) {
      try {
        navigator.audioSession.type = 'playback';
      } catch (e) {}
    }

    const ctx = this.getAudioContext();
    if (ctx && !this.unlocked) {
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.unlocked = true;
      } catch (e) {}
    }
    if (!this.htmlAudio && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        this.htmlAudio = new Audio();
        this.htmlAudio.preload = 'auto';
        this.htmlAudio.playsInline = true;
      } catch (e) {}
    }
  }

  // Normalize transcription strings for lookup
  cleanKey(str) {
    if (!str) return '';
    return String(str)
      .replace(/\u0301/g, '') // strip acute stress marks without altering Cyrillic 'й' or 'ё'
      .replace(/\([^)]*\)/g, '') // strip (1), (bo mii) etc.
      .replace(/[?!.]/g, '')
      .trim()
      .toLowerCase();
  }

  // Resolve any word object or string to its bundled /audio/<id>.mp3 file
  resolveAudioId(itemOrText) {
    if (!itemOrText) return null;

    if (typeof itemOrText === 'object' && itemOrText.id) {
      return itemOrText.id;
    }

    const raw = String(itemOrText).trim();
    const cleaned = this.cleanKey(raw);

    // 1. Check direct EXTRA_AUDIO_MAP
    if (EXTRA_AUDIO_MAP[raw]) return EXTRA_AUDIO_MAP[raw];
    if (EXTRA_AUDIO_MAP[cleaned]) return EXTRA_AUDIO_MAP[cleaned];

    // 2. Check VOCAB_WORDS exact match
    const exactVocab = VOCAB_WORDS.find(
      (w) =>
        w.id === cleaned ||
        w.lao === raw ||
        this.cleanKey(w.ruTrans) === cleaned ||
        this.cleanKey(w.latTrans) === cleaned
    );
    if (exactVocab) return exactVocab.id;

    // 3. Check if raw string starts with or contains a vocab word
    const partialVocab = VOCAB_WORDS.find(
      (w) =>
        cleaned.startsWith(this.cleanKey(w.ruTrans)) ||
        cleaned.startsWith(this.cleanKey(w.latTrans)) ||
        this.cleanKey(w.ruTrans).startsWith(cleaned) ||
        this.cleanKey(w.latTrans).startsWith(cleaned)
    );
    if (partialVocab) return partialVocab.id;

    return null;
  }

  stopCurrentAudio() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }
    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
      } catch (e) {}
    }
  }

  // Play via Web Audio API Buffer (used as fallback when HTML5 Audio is blocked in setTimeout)
  async playViaWebAudioBuffer(url, playbackSpeed = 1.0) {
    const ctx = this.getAudioContext();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      let audioBuffer = this.bufferCache.get(url);
      if (!audioBuffer) {
        const response = await fetch(url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          this.bufferCache.set(url, audioBuffer);
        }
      }
      if (audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = playbackSpeed;
        source.connect(ctx.destination);
        this.currentSource = source;
        source.start(0);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Play MP3 URL synchronously via HTML5 <audio> first (preserves mobile user gesture & iOS mute switch bypass),
  // with instant fallback to Web Audio API buffer!
  playMp3Url(url, playbackSpeed = 1.0) {
    this.unlock();
    this.stopCurrentAudio();

    if (typeof Audio !== 'undefined') {
      try {
        if (!this.htmlAudio) {
          this.htmlAudio = new Audio();
          this.htmlAudio.playsInline = true;
        }
        this.htmlAudio.src = url;
        this.htmlAudio.playbackRate = playbackSpeed;
        this.htmlAudio.defaultPlaybackRate = playbackSpeed;

        const playPromise = this.htmlAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            this.playViaWebAudioBuffer(url, playbackSpeed);
          });
        }
        return true;
      } catch (err) {
        this.playViaWebAudioBuffer(url, playbackSpeed);
        return true;
      }
    }

    this.playViaWebAudioBuffer(url, playbackSpeed);
    return true;
  }

  // Main method called across all lessons, flashcards, and dictionary
  speakText(itemOrText, rate = 0.85) {
    if (typeof window === 'undefined') return false;

    const audioId = this.resolveAudioId(itemOrText);
    // Map rate: 0.85 (normal button) -> 1.0x natural MP3 speed; 0.55 (slow turtle button) -> 0.68x slow MP3 speed
    const playbackSpeed = rate < 0.7 ? 0.68 : 1.0;

    if (audioId) {
      const mp3Url = `/audio/${audioId}.mp3`;
      return this.playMp3Url(mp3Url, playbackSpeed);
    }

    // Dynamic fallback via Cloudflare Pages Function /api/tts if not in static bundle
    const textStr =
      typeof itemOrText === 'object'
        ? itemOrText.lao || itemOrText.ttsPhoneticRu || ''
        : String(itemOrText);

    if (textStr) {
      const dynamicUrl = `/api/tts?tl=th&q=${encodeURIComponent(textStr)}`;
      return this.playMp3Url(dynamicUrl, playbackSpeed);
    }

    return false;
  }

  playFeedback(type = 'success') {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
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
    } catch (e) {}
  }
}

export const audioEngine = new AudioEngine();
