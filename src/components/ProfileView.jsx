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
  onSyncWithCode,
  currentStateForLink,
}) {
  const t = UI_TEXT[lang]?.profile || UI_TEXT.ru.profile;
  const tgUser = telegramService.getUser();
  const isInsideTelegram = telegramService.isInsideTelegram();

  const [inputCode, setInputCode] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const handleManualSync = async () => {
    telegramService.hapticImpact('medium');
    setIsSyncing(true);
    setSyncStatusMsg('');
    try {
      let cleanInput = inputCode.trim();
      let directData = null;

      // If user pasted a full magic URL into the input box, extract both ?sync= and ?data=
      if (cleanInput.includes('sync=') || cleanInput.includes('data=')) {
        try {
          const url = new URL(cleanInput);
          const codeFromUrl = url.searchParams.get('sync');
          const dataFromUrl = url.searchParams.get('data');
          if (codeFromUrl) cleanInput = codeFromUrl;
          if (dataFromUrl) directData = dataFromUrl;
        } catch (e) {}
      }

      await onSyncWithCode(cleanInput || syncId, directData);
      setInputCode('');
      setSyncStatusMsg(t.syncSuccess);
      telegramService.hapticNotification('success');
    } catch (e) {
      setSyncStatusMsg('Error');
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
          <span className="text-xs font-semibold text-slate-400">
            {tgUser.username || '@laolingo'}
          </span>
          {isInsideTelegram && (
            <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-[10px] font-bold">
              {t.openedInTelegram}
            </span>
          )}
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

      {/* Telegram <-> Laptop Cloud Sync Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-duo font-black text-base text-slate-900 dark:text-white">
              {t.syncTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {t.syncDesc}
            </p>
          </div>
        </div>

        {/* Current Sync Code */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t.yourSyncCode}
            </span>
            <span className="font-mono font-black text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
              {syncId}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? t.copied : 'Copy'}</span>
          </button>
        </div>

        {/* 1-Click Magic Link for Laptop */}
        <button
          type="button"
          onClick={handleCopyMagicLink}
          className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-duo font-bold text-xs sm:text-sm flex items-center justify-center gap-2 btn-3d border-sky-700 cursor-pointer transition"
        >
          {copiedLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          <span>{copiedLink ? t.copied : t.copySyncLink}</span>
        </button>

        {/* Link another device code or manual sync */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            {t.enterOtherCode}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={t.codePlaceholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-duo font-bold text-xs flex items-center gap-1.5 btn-3d border-emerald-700 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{t.linkBtn}</span>
            </button>
          </div>
          {syncStatusMsg && (
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {syncStatusMsg}
            </p>
          )}
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
