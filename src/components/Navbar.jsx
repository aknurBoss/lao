import React, { useState } from 'react';
import {
  BookOpen,
  Music,
  MessageSquare,
  BookMarked,
  Brain,
  Flame,
  Zap,
  Menu,
  X,
  Languages,
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView, xp, streak }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'alphabet', label: 'Script & Alphabet', laoLabel: 'ອັກສອນ', icon: BookOpen },
    { id: 'tones', label: 'Tone Master', laoLabel: 'ສຽງວັນນະຍຸດ', icon: Music },
    { id: 'speaking', label: 'Speaking & Voice', laoLabel: 'ການເວົ້າ', icon: MessageSquare },
    { id: 'reading', label: 'Reading Practice', laoLabel: 'ການອ່ານ', icon: BookOpen },
    { id: 'practice', label: 'Practice & Quizzes', laoLabel: 'ຝຶກຊ້ອມ', icon: Brain },
    { id: 'phrasebook', label: 'Phrasebook', laoLabel: 'ຄັງສັບ', icon: BookMarked },
  ];

  const handleSelectView = (id) => {
    setActiveView(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => setActiveView('alphabet')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center font-lao text-2xl font-black shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
              ລ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  Lao<span className="text-rose-600">Learn</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  ລາວ
                </span>
              </div>
              <span className="font-lao text-[11px] font-medium text-slate-500 dark:text-slate-400 block -mt-1">
                ຮຽນພາສາລາວ
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectView(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right gamification stats & Mobile menu button */}
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold"
              title="Daily Learning Streak"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streak} Days</span>
            </div>

            {/* XP Score */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
              title="Total Experience Points"
            >
              <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
              <span>{xp} XP</span>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectView(item.id)}
                className={`w-full px-4 py-3 rounded-2xl text-left font-semibold text-sm transition cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className="font-lao text-xs opacity-70">{item.laoLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
