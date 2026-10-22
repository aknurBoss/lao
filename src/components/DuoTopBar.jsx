import React from 'react';
import { Flame, Gem, Heart, Smartphone, Monitor } from 'lucide-react';
import { telegramService } from '../services/telegramService';

export default function DuoTopBar({
  hearts,
  gems,
  streak,
  streakFreezeActive,
  onOpenShop,
  isPhoneMockup,
  setIsPhoneMockup,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 pt-safe px-4 py-2 sm:py-2.5">
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

        {/* Gamified Top Badges: Streak, Gems, Hearts */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-duo font-bold">
          {/* Streak Flame */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
            title="Daily Learning Streak"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}</span>
            {streakFreezeActive && <span title="Streak Freeze Active">🧊</span>}
          </div>

          {/* Gems */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 cursor-pointer hover:bg-sky-100 transition"
            title="Gems Balance (Click to open Shop)"
          >
            <Gem className="w-4 h-4 fill-sky-500 text-sky-500" />
            <span>{gems}</span>
          </button>

          {/* Hearts */}
          <button
            type="button"
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-pointer hover:bg-rose-100 transition"
            title="Remaining Hearts (Click to refill)"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </button>

          {/* Laptop view switch */}
          <button
            type="button"
            onClick={() => setIsPhoneMockup(!isPhoneMockup)}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isPhoneMockup ? 'Expand to Desktop Layout' : 'Simulate Phone Frame'}
          >
            {isPhoneMockup ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
