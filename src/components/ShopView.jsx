import React from 'react';
import { Gem, Heart, Snowflake, Zap, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import confetti from 'canvas-confetti';

export default function ShopView({
  gems,
  setGems,
  hearts,
  setHearts,
  streakFreezeActive,
  setStreakFreezeActive,
}) {
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

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Gem Balance Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80 font-duo">
            Your Balance
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Gem className="w-8 h-8 fill-sky-200 text-sky-100" />
            <span className="text-3xl font-black font-duo">{gems}</span>
            <span className="text-sm font-bold text-sky-200">Gems</span>
          </div>
        </div>
        <p className="text-xs text-sky-100 max-w-[140px] text-right">
          Earn gems by finishing lessons and unlocking unit chests!
        </p>
      </div>

      {/* Shop Items List */}
      <div className="space-y-4">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
          Power-Ups & Restores
        </h3>

        {/* 1. Refill Hearts */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-base text-slate-800 dark:text-white">
                Refill Hearts (5 ❤️)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hearts >= 5 ? 'Hearts are currently full!' : 'Instantly restore all 5 hearts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={gems < 50 || hearts >= 5}
            onClick={handleBuyHearts}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-duo font-bold text-xs flex items-center gap-1.5 btn-3d border-emerald-700 cursor-pointer"
          >
            <Gem className="w-4 h-4 fill-current" /> 50
          </button>
        </div>

        {/* 2. Streak Freeze */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500">
              <Snowflake className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-base text-slate-800 dark:text-white">
                Streak Freeze
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakFreezeActive ? 'Active! Your streak is protected.' : 'Protect your streak if you miss a day'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={gems < 100 || streakFreezeActive}
            onClick={handleBuyStreakFreeze}
            className={`px-4 py-2.5 rounded-xl font-duo font-bold text-xs flex items-center gap-1.5 btn-3d cursor-pointer ${
              streakFreezeActive
                ? 'bg-sky-100 text-sky-700 border-sky-300'
                : 'bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white border-emerald-700'
            }`}
          >
            {streakFreezeActive ? (
              <>
                <Check className="w-4 h-4" /> Equipped
              </>
            ) : (
              <>
                <Gem className="w-4 h-4 fill-current" /> 100
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
