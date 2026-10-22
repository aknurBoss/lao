// Telegram Web App (TWA) Integration & Device Detection Service

class TelegramService {
  constructor() {
    this.tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    this.init();
  }

  init() {
    if (this.tg && this.isNativeTelegramWebView()) {
      try {
        this.tg.ready();
        this.tg.expand();
        if (this.tg.isVersionAtLeast && this.tg.isVersionAtLeast('6.2')) {
          this.tg.enableClosingConfirmation();
        }
      } catch (err) {
        // ignore
      }
    }
  }

  // True when opened inside Telegram Mini App or Telegram In-App Browser
  isNativeTelegramWebView() {
    if (typeof window === 'undefined') return false;
    const hasInitData = Boolean(this.tg && this.tg.initData && this.tg.initData.length > 0);
    const hasTgPlatform = Boolean(
      this.tg && this.tg.platform && this.tg.platform !== 'unknown'
    );
    const hasTgProxy = Boolean(
      window.TelegramWebviewProxy || window.TelegramWebview || /Telegram/i.test(navigator.userAgent || '')
    );
    return hasInitData || hasTgPlatform || hasTgProxy;
  }

  // True if opened in Telegram OR explicitly activated as Master Telegram device
  isInsideTelegram() {
    if (this.isNativeTelegramWebView()) return true;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('laolingo_is_master_tg') === 'true';
    }
    return false;
  }

  setAsMasterTelegram(tgUsername = '') {
    if (typeof window === 'undefined') return;
    localStorage.setItem('laolingo_is_master_tg', 'true');
    if (tgUsername) {
      localStorage.setItem('laolingo_master_username', tgUsername);
    }
  }

  supportsVersion(minVer = '6.1') {
    return Boolean(
      this.isNativeTelegramWebView() &&
        this.tg?.isVersionAtLeast &&
        this.tg.isVersionAtLeast(minVer)
    );
  }

  getDeviceInfo() {
    if (typeof window === 'undefined') {
      return { name: 'Unknown Device', type: 'desktop' };
    }

    const ua = navigator.userAgent || '';
    let os = 'Desktop';
    let type = 'desktop';

    if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iPhone / iOS';
      type = 'mobile';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      type = 'mobile';
    } else if (/Mac OS X|Macintosh/i.test(ua)) {
      os = 'MacBook / macOS';
      type = 'laptop';
    } else if (/Windows/i.test(ua)) {
      os = 'Windows (Ноутбук / ПК)';
      type = 'laptop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux PC';
      type = 'laptop';
    }

    let browser = 'Browser';
    if (this.isNativeTelegramWebView()) {
      const p = this.tg?.platform || '';
      browser = p && p !== 'unknown' ? `Telegram (${p})` : 'Telegram App';
    } else if (/Edg\//i.test(ua)) {
      browser = 'Microsoft Edge';
    } else if (/Chrome\//i.test(ua)) {
      browser = 'Google Chrome';
    } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
      browser = 'Apple Safari';
    } else if (/Firefox\//i.test(ua)) {
      browser = 'Mozilla Firefox';
    }

    return {
      name: `${os} • ${browser}`,
      os,
      browser,
      type,
    };
  }

  getUser() {
    if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      const u = this.tg.initDataUnsafe.user;
      return {
        id: u.id,
        firstName: u.first_name || 'Telegram User',
        lastName: u.last_name || '',
        username: u.username ? `@${u.username}` : '',
        photoUrl: u.photo_url || null,
        languageCode: u.language_code || 'ru',
        isTelegramUser: true,
      };
    }

    if (typeof window !== 'undefined') {
      const syncedProfile = localStorage.getItem('laolingo_tg_profile');
      if (syncedProfile) {
        try {
          return JSON.parse(syncedProfile);
        } catch (e) {}
      }

      const savedMasterUsername = localStorage.getItem('laolingo_master_username');
      if (this.isInsideTelegram()) {
        return {
          id: localStorage.getItem('laolingo_sync_id') || 'tg_master',
          firstName: savedMasterUsername || 'Telegram',
          lastName: '',
          username: savedMasterUsername
            ? savedMasterUsername.startsWith('@')
              ? savedMasterUsername
              : `@${savedMasterUsername}`
            : '@telegram',
          photoUrl: null,
          languageCode: 'ru',
          isTelegramUser: true,
        };
      }
    }

    return {
      id: 'local_user',
      firstName: 'Lao Learner',
      lastName: '',
      username: '@laolingo',
      photoUrl: null,
      languageCode: 'ru',
      isTelegramUser: false,
    };
  }

  saveSyncedProfile(profile) {
    if (typeof window !== 'undefined' && profile) {
      localStorage.setItem('laolingo_tg_profile', JSON.stringify(profile));
    }
  }

  hapticImpact(style = 'medium') {
    if (this.supportsVersion('6.1') && this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.impactOccurred(style);
      } catch (e) {}
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(style === 'light' ? 10 : 25);
    }
  }

  hapticNotification(type = 'success') {
    if (this.supportsVersion('6.1') && this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.notificationOccurred(type);
      } catch (e) {}
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'success') navigator.vibrate([15, 40, 30]);
      if (type === 'error') navigator.vibrate([50, 30, 50]);
    }
  }

  hapticSelection() {
    if (this.supportsVersion('6.1') && this.tg?.HapticFeedback) {
      try {
        this.tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }

  setupBackButton(onBack) {
    if (this.supportsVersion('6.1') && this.tg?.BackButton) {
      try {
        this.tg.BackButton.show();
        this.tg.BackButton.onClick(onBack);
      } catch (e) {}
    }
  }

  hideBackButton(onBack) {
    if (this.supportsVersion('6.1') && this.tg?.BackButton) {
      try {
        if (onBack) this.tg.BackButton.offClick(onBack);
        this.tg.BackButton.hide();
      } catch (e) {}
    }
  }
}

export const telegramService = new TelegramService();
