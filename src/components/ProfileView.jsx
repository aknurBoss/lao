import React from 'react';
import {
  Flame,
  Zap,
  Trophy,
  Sparkles,
  Heart,
  Gem,
  Snowflake,
  Check,
} from 'lucide-react';
import { telegramService } from '../services/telegramService';
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
}) {
  const tgUser = telegramService.getUser();
  const isInsideTelegram = telegramService.isInsideTelegram();

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

  const achievements = [
    {
      id: 'a1',
      title: 'Первые слова',
      desc: 'Начать учить лаосские слова по транскрипции',
      unlocked: completedLessonsCount > 0,
      icon: '🇱🇦',
    },
    {
      id: 'a2',
      title: 'Огонь ударного режима',
      desc: 'Заниматься 2+ дня подряд',
      unlocked: streak >= 2,
      icon: '🔥',
    },
    {
      id: 'a3',
      title: 'Мастер заказа еды',
      desc: 'Освоить фразы для кафе и ресторанов',
      unlocked: completedLessonsCount >= 3,
      icon: '🍚',
    },
    {
      id: 'a4',
      title: 'Король рынка',
      desc: 'Научиться считать тысячи кип и торговаться',
      unlocked: completedLessonsCount >= 5,
      icon: '🛍️',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Карточка пользователя */}
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
            {tgUser.firstName === 'Lao Learner' ? 'Ученик Лаосского' : `${tgUser.firstName} ${tgUser.lastName}`}
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {tgUser.username || '@laolingo'}
          </span>
          {isInsideTelegram && (
            <span className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 text-[10px] font-bold">
              ✈️ Открыто в Telegram
            </span>
          )}
        </div>

        {/* Статистика */}
        <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto fill-amber-500 mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {streak}
            </span>
            <span className="text-[10px] text-slate-400">Дней подряд</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-center">
            <Zap className="w-5 h-5 text-indigo-500 mx-auto fill-indigo-500 mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {xp}
            </span>
            <span className="text-[10px] text-slate-400">Опыт (XP)</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
            <Trophy className="w-5 h-5 text-emerald-500 mx-auto mb-0.5" />
            <span className="font-duo font-black text-sm text-slate-800 dark:text-white block">
              {completedLessonsCount}
            </span>
            <span className="text-[10px] text-slate-400">Уроков</span>
          </div>
        </div>
      </div>

      {/* Магазин бонусов и жизней */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
            Магазин бонусов
          </h3>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <Gem className="w-4 h-4 fill-current" /> Баланс: {gems} 💎
          </span>
        </div>

        {/* Восстановить жизни */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-500 shrink-0">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-sm text-slate-800 dark:text-white">
                Полные жизни (5 ❤️)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hearts >= 5 ? 'У вас максимум жизней' : 'Восстановить все 5 сердец'}
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

        {/* Заморозка ударного режима */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500 shrink-0">
              <Snowflake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-duo font-bold text-sm text-slate-800 dark:text-white">
                Заморозка серии 🧊
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {streakFreezeActive ? 'Активна! Серия защищена' : 'Сохранит серию при пропуске дня'}
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
                <Check className="w-3.5 h-3.5" /> Куплено
              </>
            ) : (
              <>
                <Gem className="w-3.5 h-3.5 fill-current" /> 100
              </>
            )}
          </button>
        </div>
      </div>

      {/* Цели дня */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
          <span>Задания на сегодня</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Набрать 50 XP</span>
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
              <span>Пройти 2 урока</span>
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

      {/* Достижения */}
      <div className="space-y-3">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
          Достижения
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
