import React from 'react';
import { Trophy, Sparkles, Flame, BookOpen, Layers } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { UI_TEXT } from '../data/i18n';

export default function LeaderboardView({
  userXp = 0,
  streak = 0,
  completedLessonsCount = 0,
  learnedWordsCount = 0,
  lang = 'ru',
}) {
  const t = UI_TEXT[lang]?.leaderboard || UI_TEXT.ru.leaderboard;
  const tgUser = telegramService.getUser();

  const displayName =
    tgUser.firstName === 'Lao Learner' ? t.you : `${tgUser.firstName} ${tgUser.lastName || ''}`.trim();

  // Only real user entry (no fake demo bots)
  const realParticipants = [
    {
      rank: 1,
      name: displayName,
      xp: userXp,
      isCurrentUser: true,
      avatar: tgUser.photoUrl || '⭐',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-duo text-slate-900 dark:text-white">
          {t.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      {/* Real User League Row */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {realParticipants.map((learner) => (
          <div
            key={learner.name}
            className="p-4 flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/30 font-bold border-l-4 border-l-emerald-500"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-duo font-black text-base text-amber-500">
                {learner.rank}
              </span>

              {learner.avatar.startsWith('http') ? (
                <img
                  src={learner.avatar}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg shadow-xs">
                  {learner.avatar}
                </div>
              )}

              <div>
                <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                  {learner.name} ({t.you})
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {learner.xp > 0 ? t.promotionZone : t.activeLearner}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-duo font-black text-base text-slate-800 dark:text-slate-100">
              <span>{learner.xp} XP</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Real Personal Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
            <span className="font-duo font-black text-base text-slate-800 dark:text-white block">
              {streak}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'en' ? 'Streak' : 'Дней подряд'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
            <BookOpen className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <span className="font-duo font-black text-base text-slate-800 dark:text-white block">
              {completedLessonsCount}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'en' ? 'Lessons' : 'Уроков'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40">
            <Layers className="w-5 h-5 text-sky-500 mx-auto mb-1" />
            <span className="font-duo font-black text-base text-slate-800 dark:text-white block">
              {learnedWordsCount}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'en' ? 'Words' : 'Слов'}
            </span>
          </div>
        </div>

        {userXp === 0 && (
          <div className="text-center py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {t.noFakeUsersTitle}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t.noFakeUsersDesc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
