import React from 'react';
import { Map, Layers, Volume2, Trophy, User } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { UI_TEXT } from '../data/i18n';

export default function DuoNavBar({ activeTab, setActiveTab, lang = 'ru' }) {
  const t = UI_TEXT[lang]?.nav || UI_TEXT.ru.nav;

  const tabs = [
    { id: 'path', label: t.path, subLabel: t.pathSub, icon: Map },
    { id: 'cards', label: t.cards, subLabel: t.cardsSub, icon: Layers },
    { id: 'dictionary', label: t.dictionary, subLabel: t.dictionarySub, icon: Volume2 },
    { id: 'leaderboard', label: t.leaderboard, subLabel: t.leaderboardSub, icon: Trophy },
    { id: 'profile', label: t.profile, subLabel: t.profileSub, icon: User },
  ];

  return (
    <>
      {/* 1. Bottom bar on Mobile & Telegram Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-800 pb-safe px-2 pt-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  telegramService.hapticSelection();
                  setActiveTab(tab.id);
                }}
                className={`flex-1 py-1 px-1 rounded-2xl flex flex-col items-center justify-center transition cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-400'
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-duo font-bold mt-1 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. Sidebar on Laptop / Desktop */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r-2 border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 select-none">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              🐘
            </div>
            <div>
              <span className="font-duo font-black text-2xl tracking-tight text-slate-800 dark:text-white">
                Lao<span className="text-emerald-500">Lingo</span>
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-semibold">
                {t.brandSub}
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    telegramService.hapticSelection();
                    setActiveTab(tab.id);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3.5 font-duo font-bold text-sm transition cursor-pointer btn-3d ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  <span className="text-[11px] opacity-60 ml-auto">{tab.subLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-600 dark:text-slate-300">
            {t.footerTitle}
          </p>
          <p>{t.footerSub}</p>
        </div>
      </aside>
    </>
  );
}
