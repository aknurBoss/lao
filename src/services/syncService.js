// Cross-Device Synchronization Service (Telegram <-> Laptop Browser)
// Uses CORS-enabled https://ntfy.sh pub/sub + cached state store (Access-Control-Allow-Origin: *)
// + Live Server-Sent Events (SSE) real-time sync + Telegram CloudStorage + Magic Sync Link (?sync=CODE&data=...)

import { telegramService } from './telegramService.js';

const STORAGE_SYNC_ID_KEY = 'laolingo_sync_id';
const CLOUD_STORAGE_STATE_KEY = 'laolingo_state_v2';
const NTFY_BASE = 'https://ntfy.sh';
const TOPIC_PREFIX = 'laolingo_v2_sync_';

function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = 'LAO-';
  for (let i = 0; i < 5; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function encodeStateBase64(stateObj) {
  try {
    const compact = {
      x: stateObj.xp || 0,
      s: stateObj.streak || 0,
      h: stateObj.hearts ?? 5,
      g: stateObj.gems ?? 100,
      f: stateObj.streakFreezeActive ? 1 : 0,
      c: stateObj.completedLessons || [],
      u: stateObj.unlockedChests || [],
      w: stateObj.learnedWords || [],
      p: stateObj.savedPhrases || [],
      l: stateObj.lang || 'ru',
      t: stateObj.updatedAt || Date.now(),
    };
    const json = JSON.stringify(compact);
    return btoa(encodeURIComponent(json));
  } catch (e) {
    return '';
  }
}

export function decodeStateBase64(encoded) {
  try {
    const json = decodeURIComponent(atob(encoded));
    const compact = JSON.parse(json);
    return {
      xp: Number(compact.x) || 0,
      streak: Number(compact.s) || 0,
      hearts: compact.h !== undefined ? Number(compact.h) : 5,
      gems: compact.g !== undefined ? Number(compact.g) : 100,
      streakFreezeActive: Boolean(compact.f),
      completedLessons: Array.isArray(compact.c) ? compact.c : [],
      unlockedChests: Array.isArray(compact.u) ? compact.u : [],
      learnedWords: Array.isArray(compact.w) ? compact.w : [],
      savedPhrases: Array.isArray(compact.p) ? compact.p : [],
      lang: compact.l === 'en' ? 'en' : 'ru',
      updatedAt: Number(compact.t) || Date.now(),
    };
  } catch (e) {
    return null;
  }
}

// Merge two states intelligently so progress is never lost
export function mergeStates(localState, remoteState) {
  if (!remoteState) return localState;
  if (!localState) return remoteState;

  const unionArray = (a = [], b = []) => Array.from(new Set([...a, ...b]));

  const completedLessons = unionArray(localState.completedLessons, remoteState.completedLessons);
  const unlockedChests = unionArray(localState.unlockedChests, remoteState.unlockedChests);
  const learnedWords = unionArray(localState.learnedWords, remoteState.learnedWords);
  const savedPhrases = unionArray(localState.savedPhrases, remoteState.savedPhrases);

  const remoteNewer = (remoteState.updatedAt || 0) > (localState.updatedAt || 0);

  return {
    xp: Math.max(localState.xp || 0, remoteState.xp || 0),
    streak: Math.max(localState.streak || 0, remoteState.streak || 0),
    hearts: remoteNewer ? (remoteState.hearts ?? 5) : (localState.hearts ?? 5),
    gems: Math.max(localState.gems ?? 100, remoteState.gems ?? 100),
    streakFreezeActive: Boolean(localState.streakFreezeActive || remoteState.streakFreezeActive),
    completedLessons,
    unlockedChests,
    learnedWords,
    savedPhrases,
    lang: remoteNewer ? (remoteState.lang || localState.lang) : (localState.lang || remoteState.lang),
    updatedAt: Math.max(localState.updatedAt || 0, remoteState.updatedAt || 0),
  };
}

class SyncService {
  constructor() {
    this.syncId = this.initSyncId();
    this.eventSource = null;
  }

  initSyncId() {
    if (typeof window === 'undefined') return 'LAO-LOCAL';

    // 1. Check URL query params (?sync=CODE)
    const params = new URLSearchParams(window.location.search);
    const urlSyncCode = params.get('sync');
    if (urlSyncCode && urlSyncCode.trim().length >= 4) {
      const clean = urlSyncCode.trim().toUpperCase();
      localStorage.setItem(STORAGE_SYNC_ID_KEY, clean);
      return clean;
    }

    // 2. Check existing saved syncId
    const saved = localStorage.getItem(STORAGE_SYNC_ID_KEY);
    if (saved) return saved;

    // 3. If inside Telegram with a real user ID, use TG-<id>
    const tgUser = telegramService.getUser();
    if (tgUser.isTelegramUser && tgUser.id && tgUser.id !== 'local_user') {
      const tgCode = `TG-${tgUser.id}`;
      localStorage.setItem(STORAGE_SYNC_ID_KEY, tgCode);
      return tgCode;
    }

    // 4. Otherwise generate a fresh code for browser
    const newCode = generateRandomCode();
    localStorage.setItem(STORAGE_SYNC_ID_KEY, newCode);
    return newCode;
  }

  getSyncId() {
    return this.syncId;
  }

  setSyncId(newCode) {
    if (!newCode || !newCode.trim()) return this.syncId;
    const clean = newCode.trim().toUpperCase();
    this.syncId = clean;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SYNC_ID_KEY, clean);
    }
    return clean;
  }

  getTopicName(code = this.syncId) {
    const safe = String(code || this.syncId)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '');
    return `${TOPIC_PREFIX}${safe}`;
  }

  // Check if URL has ?data=... state payload and consume it once
  consumeUrlSyncData() {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    const syncParam = params.get('sync');

    if (syncParam) {
      this.setSyncId(syncParam);
    }

    if (dataParam) {
      const decoded = decodeStateBase64(dataParam);
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {}
      return decoded;
    }
    return null;
  }

  // Generate Magic Link for opening on Laptop or sending to Telegram Saved Messages
  createMagicSyncLink(currentState) {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const encoded = encodeStateBase64(currentState);
    return `${baseUrl}?sync=${encodeURIComponent(this.syncId)}&data=${encodeURIComponent(encoded)}`;
  }

  // Save to Telegram CloudStorage (if inside Telegram v6.9+)
  saveToTelegramCloud(stateObj) {
    return new Promise((resolve) => {
      if (
        telegramService.supportsVersion('6.9') &&
        window.Telegram?.WebApp?.CloudStorage
      ) {
        try {
          const encoded = encodeStateBase64(stateObj);
          window.Telegram.WebApp.CloudStorage.setItem(
            CLOUD_STORAGE_STATE_KEY,
            encoded,
            (err) => {
              resolve(!err);
            }
          );
          return;
        } catch (e) {}
      }
      resolve(false);
    });
  }

  // Load from Telegram CloudStorage
  loadFromTelegramCloud() {
    return new Promise((resolve) => {
      if (
        telegramService.supportsVersion('6.9') &&
        window.Telegram?.WebApp?.CloudStorage
      ) {
        try {
          window.Telegram.WebApp.CloudStorage.getItem(
            CLOUD_STORAGE_STATE_KEY,
            (err, val) => {
              if (!err && val) {
                resolve(decodeStateBase64(val));
              } else {
                resolve(null);
              }
            }
          );
          return;
        } catch (e) {}
      }
      resolve(null);
    });
  }

  // Push state to CORS-enabled ntfy.sh cloud channel by syncId
  async pushToCloudKV(stateObj) {
    try {
      const encoded = encodeStateBase64(stateObj);
      if (!encoded) return false;
      const topic = this.getTopicName(this.syncId);
      const res = await fetch(`${NTFY_BASE}/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: encoded,
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Pull state history from ntfy.sh cloud channel and merge all snapshots
  async pullFromCloudKV(customSyncId) {
    try {
      const targetId = customSyncId ? this.setSyncId(customSyncId) : this.syncId;
      const topic = this.getTopicName(targetId);
      const res = await fetch(`${NTFY_BASE}/${topic}/json?poll=1&since=0`);
      if (!res.ok) return null;
      const text = await res.text();
      if (!text || !text.trim()) return null;

      const lines = text.trim().split('\n');
      let combined = null;
      for (const line of lines) {
        try {
          const item = JSON.parse(line);
          if (item && item.event === 'message' && typeof item.message === 'string') {
            const decoded = decodeStateBase64(item.message);
            if (decoded) {
              combined = combined ? mergeStates(combined, decoded) : decoded;
            }
          }
        } catch (e) {}
      }
      return combined;
    } catch (e) {
      return null;
    }
  }

  // Subscribe to real-time live updates across devices (Telegram <-> Laptop)
  subscribeLiveUpdates(onRemoteStateReceived) {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return () => {};

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
    }

    const topic = this.getTopicName(this.syncId);
    try {
      const es = new EventSource(`${NTFY_BASE}/${topic}/sse`);
      this.eventSource = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.event === 'message' && typeof data.message === 'string') {
            const decoded = decodeStateBase64(data.message);
            if (decoded && onRemoteStateReceived) {
              onRemoteStateReceived(decoded);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (this.eventSource) {
        try {
          this.eventSource.close();
        } catch (e) {}
        this.eventSource = null;
      }
    };
  }

  // Full bidirectional sync (Telegram Cloud + ntfy Cloud)
  async syncAll(localState, customSyncId, directEncodedData = null) {
    if (customSyncId) {
      this.setSyncId(customSyncId);
    }

    let merged = localState;

    if (directEncodedData) {
      const directDecoded = decodeStateBase64(directEncodedData);
      if (directDecoded) {
        merged = mergeStates(merged, directDecoded);
      }
    }

    const [tgState, kvState] = await Promise.all([
      this.loadFromTelegramCloud(),
      this.pullFromCloudKV(),
    ]);

    merged = mergeStates(merged, tgState);
    merged = mergeStates(merged, kvState);
    merged.updatedAt = Date.now();

    await Promise.all([
      this.saveToTelegramCloud(merged),
      this.pushToCloudKV(merged),
    ]);

    return merged;
  }
}

export const syncService = new SyncService();
