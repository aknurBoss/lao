import React from 'react';
import { Flame, Gem, Heart, Globe } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { UI_TEXT } from '../data/i18n';

export default function DuoTopBar({
  hearts,
  gems,
  streak,
  streakFreezeActive,
  onOpenShop,
  lang = 'ru',
  setLang,
}) {
  const t = UI_TEXT[lang] || UI_TEXT.ru;

  const toggleLanguage = () => {
    telegramService.hapticSelection();
    if (setLang) {
      setLang(lang === 'ru' ? 'en' : 'ru');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 pt-safe pb-2.5 px-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Flag & Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center font-lao font-bold text-lg shadow-sm">
            ລ
          </div>
          <span className="font-duo font-black text-lg tracking-tight text-slate-800 dark:text-white hidden xs:inline">
            Lao<span className="text-emerald-500">Lingo</span>
          </span>
        </div>

        {/* Gamified Top Badges: Language, Streak, Gems, Hearts */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-duo font-bold">
          {/* Language Switcher RU / EN */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 transition"
            title={lang === 'ru' ? 'Switch to English' : 'Переключить на Русский'}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span className="uppercase font-black">{lang === 'ru' ? 'RU' : 'EN'}</span>
          </button>

          {/* Streak Flame */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
            title={t.topBar.streakTitle}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}</span>
            {streakFreezeActive && <span title={t.topBar.freezeActive}>🧊</span>}
          </div>

          {/* Gems */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 cursor-pointer hover:bg-sky-100 transition"
            title={t.topBar.gemsTitle}
          >
            <Gem className="w-4 h-4 fill-sky-500 text-sky-500" />
            <span>{gems}</span>
          </button>

          {/* Hearts */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-pointer hover:bg-rose-100 transition"
            title={t.topBar.heartsTitle}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
