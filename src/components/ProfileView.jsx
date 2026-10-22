import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Trophy,
  Sparkles,
  Heart,
  Gem,
  Snowflake,
  Check,
  RefreshCw,
  Copy,
  Link2,
  Globe,
  Laptop,
  Smartphone,
  ShieldCheck,
  LogOut,
  Trash2,
} from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { syncService } from '../services/syncService';
import { UI_TEXT } from '../data/i18n';
import confetti from 'canvas-confetti';

export default function ProfileView({
  xp,
  streak,
  hearts,
  setHearts,
  gems,
  setGems,
  streakFreezeActive,
  setStreakFreezeActive,
  completedLessonsCount,
  lang = 'ru',
  setLang,
  syncId,
  sessions = [],
  onSyncWithCode,
  onTerminateSession,
  onTerminateAllOtherSessions,
  onLogoutLaptop,
  currentStateForLink,
}) {
  const t = UI_TEXT[lang]?.profile || UI_TEXT.ru.profile;
  const isRu = lang === 'ru';
  const tgUser = telegramService.getUser();
  const isMasterTelegram = telegramService.isInsideTelegram();
  const currentSessionId = syncService.getSessionId();
  const currentDevice = telegramService.getDeviceInfo();

  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const otherSessions = (sessions || []).filter((s) => s && s.id !== currentSessionId);

  const formatLastActive = (ts) => {
    if (!ts) return isRu ? 'только что' : 'just now';
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) return isRu ? 'онлайн • только что' : 'online • just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return isRu ? `${diffMin} мин. назад` : `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return isRu ? `${diffHr} ч. назад` : `${diffHr}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleBuyHearts = () => {
    if (gems < 50 || hearts >= 5) return;
    telegramService.hapticNotification('success');
    confetti({ particleCount: 50, spread: 50 });
    setGems((prev) => prev - 50);
    setHearts(5);
  };

  const handleBuyStreakFreeze = () => {
    if (gems < 100 || streakFreezeActive) return;
    telegramService.hapticNotification('success');
    confetti({ particleCount: 50, spread: 50 });
    setGems((prev) => prev - 100);
    setStreakFreezeActive(true);
  };

  const handleCopyCode = async () => {
    telegramService.hapticImpact('light');
    try {
      await navigator.clipboard.writeText(syncId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {}
  };

  const handleCopyMagicLink = async () => {
    telegramService.hapticNotification('success');
    try {
      const magicUrl = syncService.createMagicSyncLink(currentStateForLink);
      await navigator.clipboard.writeText(magicUrl);
      setCopiedLink(true);
      setSyncStatusMsg(t.syncLinkCopied);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {}
  };

  const handleRefreshSessions = async () => {
    telegramService.hapticImpact('medium');
    setIsSyncing(true);
    setSyncStatusMsg('');
    try {
      await onSyncWithCode(syncId);
      setSyncStatusMsg(
        isRu ? 'Список сеансов и прогресс обновлены!' : 'Sessions and progress updated!'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const achievements = [
    {
      id: 'a1',
      title: t.ach1Title,
      desc: t.ach1Desc,
      unlocked: completedLessonsCount > 0,
      icon: '🇱🇦',
    },
    {
      id: 'a2',
      title: t.ach2Title,
      desc: t.ach2Desc,
      unlocked: streak >= 2,
      icon: '🔥',
    },
    {
      id: 'a3',
      title: t.ach3Title,
      desc: t.ach3Desc,
      unlocked: completedLessonsCount >= 3,
      icon: '🍚',
    },
    {
      id: 'a4',
      title: t.ach4Title,
      desc: t.ach4Desc,
      unlocked: completedLessonsCount >= 5,
      icon: '🛍️',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-3">
        {tgUser.photoUrl ? (
          <img
            src={tgUser.photoUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-green-600 flex items-center justify-center text-3xl shadow-md">
            🐘
          </div>
        )}

        <div>
          <h2 className="text-xl font-black font-duo text-slate-900 dark:text-white">
            {tgUser.firstName === 'Lao Learner'
              ? t.defaultName
              : `${tgUser.firstName} ${tgUser.lastName || ''}`.trim()}
          </h2>
          <span className="text-xs font-semibold text-slate-400 block">
            {tgUser.username || `@${syncId}`}
          </span>

          <span
            className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
              isMasterTelegram
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isMasterTelegram
              ? isRu
                ? 'Главный аккаунт (Telegram)'
                : 'Master Account (Telegram)'
              : isRu
              ? `Сеанс ноутбука (${syncId})`
              : `Laptop Session (${syncId})`}
          </span>
        </div>

        {/* Real Statistics */}
        <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto fill-amber-500 mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {streak}
            </span>
            <span className="text-[10px] text-slate-400">{t.streakLabel}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-center">
            <Zap className="w-5 h-5 text-indigo-500 mx-auto fill-indigo-500 mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {xp}
            </span>
            <span className="text-[10px] text-slate-400">{t.xpLabel}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
            <Trophy className="w-5 h-5 text-emerald-500 mx-auto mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {completedLessonsCount}
            </span>
            <span className="text-[10px] text-slate-400">{t.lessonsLabel}</span>
          </div>
        </div>
      </div>

      {/* ACTIVE SESSIONS & DEVICES PAGE (СЕАНСЫ И УСТРОЙСТВА) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-900/60 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-duo font-black text-base text-slate-900 dark:text-white">
                {isRu ? 'Сеансы и устройства' : 'Active Sessions & Devices'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRu
                  ? 'Управление входами с ноутбука через Telegram'
                  : 'Manage laptop logins via your Telegram account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshSessions}
            disabled={isSyncing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer transition"
            title={isRu ? 'Обновить сеансы' : 'Refresh sessions'}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>

        {/* Telegram Login Code to enter on Laptop */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {isRu
                  ? 'Код для входа с ноутбука (Telegram ID):'
                  : 'Login Code for Laptop (Telegram ID):'}
              </span>
              <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                {syncId}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition cursor-pointer"
            >
              {copiedCode ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedCode ? t.copied : isRu ? 'Код' : 'Copy'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMagicLink}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-duo font-bold text-xs flex items-center justify-center gap-2 btn-3d border-sky-700 cursor-pointer transition"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            <span>
              {copiedLink
                ? t.copied
                : isRu
                ? 'Скопировать ссылку быстрого входа для ноутбука'
                : 'Copy 1-Click Login Link for Laptop'}
            </span>
          </button>
        </div>

        {/* 1. THIS DEVICE */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {isRu ? 'Текущий сеанс' : 'This Device'}
          </span>
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                {isMasterTelegram ? (
                  <Smartphone className="w-5 h-5" />
                ) : (
                  <Laptop className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {currentDevice.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    {isMasterTelegram
                      ? isRu
                        ? 'Главный (Telegram)'
                        : 'Master (Telegram)'
                      : isRu
                      ? 'Это устройство'
                      : 'This device'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  🟢 {isRu ? 'В сети • Сейчас' : 'Online • Now'}
                </span>
              </div>
            </div>

            {!isMasterTelegram && onLogoutLaptop && (
              <button
                type="button"
                onClick={onLogoutLaptop}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition"
                title={isRu ? 'Выйти из сеанса на ноутбуке' : 'Log out on this laptop'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isRu ? 'Выйти' : 'Log out'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. OTHER ACTIVE SESSIONS (CONNECTED LAPTOPS / BROWSERS) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isRu
                ? `Другие подключённые сеансы (${otherSessions.length})`
                : `Other Active Sessions (${otherSessions.length})`}
            </span>

            {isMasterTelegram && otherSessions.length > 0 && onTerminateAllOtherSessions && (
              <button
                type="button"
                onClick={() => {
                  telegramService.hapticNotification('warning');
                  onTerminateAllOtherSessions();
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                {isRu ? 'Завершить все' : 'Terminate all'}
              </button>
            )}
          </div>

          {otherSessions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {isRu
                  ? 'Нет других активных сеансов'
                  : 'No other active device sessions'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isRu
                  ? `Когда вы войдёте на ноутбуке по коду ${syncId}, ноутбук отобразится здесь.`
                  : `When you sign in on your laptop with code ${syncId}, it will appear here.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {otherSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      {sess.isMaster ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Laptop className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                          {sess.deviceName || 'Laptop Browser'}
                        </span>
                        {sess.isMaster && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200">
                            Telegram
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        🟢 {formatLastActive(sess.lastActive)}
                      </span>
                    </div>
                  </div>

                  {isMasterTelegram && onTerminateSession && (
                    <button
                      type="button"
                      onClick={() => {
                        telegramService.hapticImpact('medium');
                        onTerminateSession(sess.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition"
                      title={isRu ? 'Завершить этот сеанс' : 'Terminate this session'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isRu ? 'Завершить' : 'End'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {syncStatusMsg && (
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center pt-1">
            {syncStatusMsg}
          </p>
        )}
      </div>

      {/* Language Selector (RU / EN) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <span className="font-duo font-bold text-sm text-slate-800 dark:text-white">
            {t.langSectionTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              telegramService.hapticSelection();
              if (setLang) setLang('ru');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-duo font-black transition cursor-pointer ${
              lang === 'ru'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🇷🇺 Русский
          </button>
          <button
            type="button"
            onClick={() => {
              telegramService.hapticSelection();
              if (setLang) setLang('en');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-duo font-black transition cursor-pointer ${
              lang === 'en'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Bonus Shop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
            {t.shopTitle}
          </h3>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <Gem className="w-4 h-4 fill-current" /> {t.balanceLabel}: {gems} 💎
          </span>
        </div>

        {/* Refill Hearts */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 shrink-0">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-sm text-slate-800 dark:text-white">
                {t.fullHeartsTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hearts >= 5 ? t.fullHeartsMax : t.fullHeartsSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={gems < 50 || hearts >= 5}
            onClick={handleBuyHearts}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-duo font-bold text-xs flex items-center gap-1 btn-3d border-emerald-700 cursor-pointer shrink-0"
          >
            <Gem className="w-3.5 h-3.5 fill-current" /> 50
          </button>
        </div>

        {/* Streak Freeze */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500 shrink-0">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-sm text-slate-800 dark:text-white">
                {t.freezeTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakFreezeActive ? t.freezeActive : t.freezeSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={gems < 100 || streakFreezeActive}
            onClick={handleBuyStreakFreeze}
            className={`px-3.5 py-2 rounded-xl font-duo font-bold text-xs flex items-center gap-1 btn-3d cursor-pointer shrink-0 ${
              streakFreezeActive
                ? 'bg-sky-100 text-sky-700 border-sky-300'
                : 'bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white border-emerald-700'
            }`}
          >
            {streakFreezeActive ? (
              <>
                <Check className="w-3.5 h-3.5" /> {t.purchased}
              </>
            ) : (
              <>
                <Gem className="w-3.5 h-3.5 fill-current" /> 100
              </>
            )}
          </button>
        </div>
      </div>

      {/* Daily Quests */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
          <span>{t.dailyGoalsTitle}</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{t.goalXp}</span>
              <span>{Math.min(50, xp)} / 50 XP</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (xp / 50) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>{t.goalLessons}</span>
              <span>{Math.min(2, completedLessonsCount)} / 2</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (completedLessonsCount / 2) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-3">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
          {t.achievementsTitle}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border-2 transition ${
                ach.unlocked
                  ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50'
              }`}
            >
              <span className="text-2xl mb-1 block">{ach.icon}</span>
              <h4 className="font-duo font-bold text-xs text-slate-800 dark:text-white">
                {ach.title}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
