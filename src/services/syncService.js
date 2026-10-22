// Telegram-First Authentication, Active Sessions & Cloud Sync Service
// - Telegram is the Master Account (TG-XXXXXX)
// - Laptop / Browser devices must log in via Telegram Code or Magic Link
// - Tracks all active device sessions and supports real-time remote session termination from Telegram

import { telegramService } from './telegramService.js';

const STORAGE_SYNC_ID_KEY = 'laolingo_sync_id';
const STORAGE_SESSION_ID_KEY = 'laolingo_session_id';
const STORAGE_LINKED_KEY = 'laolingo_linked_to_tg';
const CLOUD_STORAGE_STATE_KEY = 'laolingo_state_v3';
const NTFY_BASE = 'https://ntfy.sh';
const TOPIC_PREFIX = 'laolingo_v3_tg_';

function generateMasterTgCode() {
  const digits = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let res = 'TG-';
  for (let i = 0; i < 6; i++) {
    res += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return res;
}

function generateSessionId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let res = 'sess_';
  for (let i = 0; i < 8; i++) {
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
      m: stateObj.mistakeWords || [],
      l: stateObj.lang || 'ru',
      t: stateObj.updatedAt || Date.now(),
      uProf: stateObj.tgProfile || null,
      sess: stateObj.sessions || [],
      rev: stateObj.revokedSessionIds || [],
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
      mistakeWords: Array.isArray(compact.m) ? compact.m : [],
      lang: compact.l === 'en' ? 'en' : 'ru',
      updatedAt: Number(compact.t) || Date.now(),
      tgProfile: compact.uProf || null,
      sessions: Array.isArray(compact.sess) ? compact.sess : [],
      revokedSessionIds: Array.isArray(compact.rev) ? compact.rev : [],
    };
  } catch (e) {
    return null;
  }
}

// Merge two states intelligently, including active sessions and revoked sessions
export function mergeStates(localState, remoteState) {
  if (!remoteState) return localState;
  if (!localState) return remoteState;

  const unionArray = (a = [], b = []) => Array.from(new Set([...a, ...b]));

  const completedLessons = unionArray(localState.completedLessons, remoteState.completedLessons);
  const unlockedChests = unionArray(localState.unlockedChests, remoteState.unlockedChests);
  const learnedWords = unionArray(localState.learnedWords, remoteState.learnedWords);
  const savedPhrases = unionArray(localState.savedPhrases, remoteState.savedPhrases);
  const mistakeWords = remoteState.updatedAt > (localState.updatedAt || 0)
    ? (remoteState.mistakeWords || [])
    : unionArray(localState.mistakeWords, remoteState.mistakeWords);
  const revokedSessionIds = unionArray(
    localState.revokedSessionIds,
    remoteState.revokedSessionIds
  );

  // Merge srsData by wordId, keeping entry with newer lastReviewed
  const srsData = { ...(localState.srsData || {}) };
  if (remoteState.srsData && typeof remoteState.srsData === 'object') {
    for (const [wordId, remoteEntry] of Object.entries(remoteState.srsData)) {
      const localEntry = srsData[wordId];
      if (!localEntry || (remoteEntry?.lastReviewed || 0) >= (localEntry?.lastReviewed || 0)) {
        srsData[wordId] = remoteEntry;
      }
    }
  }

  // Merge sessions by session id, keeping newest lastActive and filtering out revoked ones
  const sessionMap = new Map();
  for (const s of [...(localState.sessions || []), ...(remoteState.sessions || [])]) {
    if (!s || !s.id || revokedSessionIds.includes(s.id)) continue;
    const existing = sessionMap.get(s.id);
    if (!existing || (s.lastActive || 0) >= (existing.lastActive || 0)) {
      sessionMap.set(s.id, s);
    }
  }
  const sessions = Array.from(sessionMap.values()).sort(
    (a, b) => (b.isMaster ? 1 : 0) - (a.isMaster ? 1 : 0) || (b.lastActive || 0) - (a.lastActive || 0)
  );

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
    mistakeWords,
    srsData,
    lang: remoteNewer ? (remoteState.lang || localState.lang) : (localState.lang || remoteState.lang),
    updatedAt: Math.max(localState.updatedAt || 0, remoteState.updatedAt || 0),
    tgProfile: remoteState.tgProfile || localState.tgProfile || null,
    sessions,
    revokedSessionIds,
  };
}

class SyncService {
  constructor() {
    this.sessionId = this.initSessionId();
    this.syncId = this.initSyncId();
    this.eventSource = null;
  }

  initSessionId() {
    if (typeof window === 'undefined') return 'sess_server';
    let sid = localStorage.getItem(STORAGE_SESSION_ID_KEY);
    if (!sid) {
      sid = generateSessionId();
      localStorage.setItem(STORAGE_SESSION_ID_KEY, sid);
    }
    return sid;
  }

  getSessionId() {
    return this.sessionId;
  }

  initSyncId() {
    if (typeof window === 'undefined') return 'TG-LOCAL';

    // 1. Check URL query params (?sync=TG-...)
    const params = new URLSearchParams(window.location.search);
    const urlSyncCode = params.get('sync');
    if (urlSyncCode && urlSyncCode.trim().length >= 4) {
      const clean = this.normalizeCode(urlSyncCode);
      localStorage.setItem(STORAGE_SYNC_ID_KEY, clean);
      localStorage.setItem(STORAGE_LINKED_KEY, 'true');
      return clean;
    }

    // 2. If inside Telegram with a real Telegram User ID, always use TG-<id>
    const tgUser = telegramService.getUser();
    if (
      telegramService.isNativeTelegramWebView() &&
      tgUser.isTelegramUser &&
      tgUser.id &&
      tgUser.id !== 'local_user' &&
      !String(tgUser.id).startsWith('TG-')
    ) {
      const tgCode = `TG-${tgUser.id}`;
      localStorage.setItem(STORAGE_SYNC_ID_KEY, tgCode);
      localStorage.setItem(STORAGE_LINKED_KEY, 'true');
      return tgCode;
    }

    // 3. Check existing saved syncId
    const saved = localStorage.getItem(STORAGE_SYNC_ID_KEY);
    if (saved && saved.startsWith('TG-')) {
      return saved;
    }

    // 4. If inside Telegram (even without initDataUnsafe.user.id), create a Master TG- code
    if (telegramService.isInsideTelegram()) {
      const newMasterCode = generateMasterTgCode();
      localStorage.setItem(STORAGE_SYNC_ID_KEY, newMasterCode);
      localStorage.setItem(STORAGE_LINKED_KEY, 'true');
      return newMasterCode;
    }

    return '';
  }

  normalizeCode(rawCode) {
    const clean = String(rawCode || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '');
    if (!clean) return '';
    return clean.startsWith('TG-') ? clean : `TG-${clean.replace(/^LAO-/, '')}`;
  }

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    if (telegramService.isInsideTelegram()) return true;
    return (
      localStorage.getItem(STORAGE_LINKED_KEY) === 'true' &&
      Boolean(this.syncId && this.syncId.startsWith('TG-'))
    );
  }

  getSyncId() {
    return this.syncId;
  }

  setSyncId(newCode) {
    const clean = this.normalizeCode(newCode);
    if (!clean) return this.syncId;
    this.syncId = clean;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SYNC_ID_KEY, clean);
      localStorage.setItem(STORAGE_LINKED_KEY, 'true');
    }
    return clean;
  }

  logoutLocalSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_LINKED_KEY);
    localStorage.removeItem(STORAGE_SYNC_ID_KEY);
    // Generate a fresh sessionId for future login
    const newSid = generateSessionId();
    this.sessionId = newSid;
    localStorage.setItem(STORAGE_SESSION_ID_KEY, newSid);
    this.syncId = '';
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }
  }

  getCurrentDeviceSessionEntry() {
    const info = telegramService.getDeviceInfo();
    const isMaster = telegramService.isInsideTelegram();
    return {
      id: this.sessionId,
      deviceName: info.name,
      os: info.os,
      browser: info.browser,
      type: isMaster ? 'telegram' : info.type,
      isMaster,
      lastActive: Date.now(),
    };
  }

  ensureSessionInState(stateObj) {
    const currentEntry = this.getCurrentDeviceSessionEntry();
    const revoked = stateObj.revokedSessionIds || [];
    const existing = (stateObj.sessions || []).filter(
      (s) => s && s.id && s.id !== this.sessionId && !revoked.includes(s.id)
    );
    const tgUser = telegramService.getUser();
    const tgProfile =
      telegramService.isInsideTelegram() && tgUser.isTelegramUser
        ? {
            id: tgUser.id,
            firstName: tgUser.firstName,
            lastName: tgUser.lastName,
            username: tgUser.username,
            photoUrl: tgUser.photoUrl,
            isTelegramUser: true,
          }
        : stateObj.tgProfile || null;

    if (tgProfile) {
      telegramService.saveSyncedProfile(tgProfile);
    }

    return {
      ...stateObj,
      tgProfile,
      sessions: [currentEntry, ...existing],
      revokedSessionIds: revoked,
    };
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

  // Generate Magic Link for opening on Laptop
  createMagicSyncLink(currentState) {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const stateWithSession = this.ensureSessionInState(currentState);
    const encoded = encodeStateBase64(stateWithSession);
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
    if (!this.syncId) return false;
    try {
      const stateWithSession = this.ensureSessionInState(stateObj);
      const encoded = encodeStateBase64(stateWithSession);
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
      const targetId = customSyncId ? this.normalizeCode(customSyncId) : this.syncId;
      if (!targetId) return null;
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

  // Terminate a specific connected session (or all non-master sessions) from Telegram
  async terminateSession(targetSessionId, currentState) {
    const revoked = Array.from(
      new Set([...(currentState.revokedSessionIds || []), targetSessionId])
    );
    const remainingSessions = (currentState.sessions || []).filter(
      (s) => s.id !== targetSessionId
    );
    const updatedState = {
      ...currentState,
      sessions: remainingSessions,
      revokedSessionIds: revoked,
      updatedAt: Date.now(),
    };
    await Promise.all([
      this.saveToTelegramCloud(updatedState),
      this.pushToCloudKV(updatedState),
    ]);
    return updatedState;
  }

  async terminateAllOtherSessions(currentState) {
    const otherIds = (currentState.sessions || [])
      .filter((s) => s.id !== this.sessionId)
      .map((s) => s.id);
    const revoked = Array.from(
      new Set([...(currentState.revokedSessionIds || []), ...otherIds])
    );
    const remainingSessions = (currentState.sessions || []).filter(
      (s) => s.id === this.sessionId
    );
    const updatedState = {
      ...currentState,
      sessions: remainingSessions,
      revokedSessionIds: revoked,
      updatedAt: Date.now(),
    };
    await Promise.all([
      this.saveToTelegramCloud(updatedState),
      this.pushToCloudKV(updatedState),
    ]);
    return updatedState;
  }

  // Subscribe to real-time live updates across devices (Telegram <-> Laptop)
  subscribeLiveUpdates(onRemoteStateReceived) {
    if (
      typeof window === 'undefined' ||
      typeof EventSource === 'undefined' ||
      !this.syncId
    ) {
      return () => {};
    }

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
    if (!this.syncId) return localState;

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

    // Check if our current session was revoked by the master Telegram device
    if (
      !telegramService.isInsideTelegram() &&
      merged.revokedSessionIds &&
      merged.revokedSessionIds.includes(this.sessionId)
    ) {
      return { __sessionRevoked: true };
    }

    merged = this.ensureSessionInState(merged);
    merged.updatedAt = Date.now();

    await Promise.all([
      this.saveToTelegramCloud(merged),
      this.pushToCloudKV(merged),
    ]);

    return merged;
  }

  // Approve a Laptop QR Code Login from Telegram
  async approveLaptopQrChallenge(qrTextOrChallengeId, currentState) {
    let challengeId = String(qrTextOrChallengeId || '').trim();
    if (challengeId.includes('approveQr=')) {
      try {
        const u = new URL(challengeId);
        challengeId = u.searchParams.get('approveQr') || challengeId;
      } catch (e) {}
    }
    challengeId = challengeId.replace(/[^A-Z0-9_-]/gi, '');
    if (!challengeId || !this.syncId) return false;

    const stateWithSession = this.ensureSessionInState(currentState);
    const encoded = encodeStateBase64(stateWithSession);
    const payload = JSON.stringify({
      syncId: this.syncId,
      data: encoded,
    });

    try {
      const res = await fetch(`${NTFY_BASE}/laolingo_qr_${challengeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: payload,
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // Listen on Laptop for QR Code approval from Telegram phone
  listenForQrChallengeApproval(challengeId, onApproved) {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return () => {};
    const safeId = String(challengeId).replace(/[^A-Z0-9_-]/gi, '');
    let es = null;
    try {
      es = new EventSource(`${NTFY_BASE}/laolingo_qr_${safeId}/sse`);
      es.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          if (item && item.event === 'message' && item.message) {
            const parsed = JSON.parse(item.message);
            if (parsed && parsed.syncId && onApproved) {
              onApproved(parsed.syncId, parsed.data);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (es) {
        try {
          es.close();
        } catch (e) {}
      }
    };
  }
}

export const syncService = new SyncService();
