// Telegram Web App (TWA) Integration Service

class TelegramService {
  constructor() {
    this.tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    this.init();
  }

  init() {
    if (this.tg && this.isInsideTelegram()) {
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

  isInsideTelegram() {
    return Boolean(this.tg && this.tg.initData && this.tg.initData.length > 0);
  }

  supportsVersion(minVer = '6.1') {
    return Boolean(
      this.isInsideTelegram() &&
        this.tg?.isVersionAtLeast &&
        this.tg.isVersionAtLeast(minVer)
    );
  }

  getPlatform() {
    if (!this.isInsideTelegram()) return 'Браузер (Ноутбук / Телефон)';
    return `Telegram (${this.tg.platform || 'WebApp'})`;
  }

  getUser() {
    if (this.tg && this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
      const u = this.tg.initDataUnsafe.user;
      return {
        id: u.id,
        firstName: u.first_name || 'Ученик',
        lastName: u.last_name || '',
        username: u.username ? `@${u.username}` : '',
        photoUrl: u.photo_url || null,
        languageCode: u.language_code || 'ru',
        isTelegramUser: true,
      };
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

  shareApp(text = 'Учу лаосские слова и произношение по транскрипции в LaoLingo! 🇱🇦🐘') {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(text)}`;
    if (this.isInsideTelegram() && this.tg?.openTelegramLink) {
      this.tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  }
}

export const telegramService = new TelegramService();
