import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { telegramService } from '../services/telegramService';

export default function LeaderboardView({ userXp }) {
  const tgUser = telegramService.getUser();

  const mockUsers = [
    { rank: 1, name: 'Сомсай (Вьентьян)', xp: 480, avatar: '🇱🇦' },
    { rank: 2, name: 'Алина К.', xp: 420, avatar: '🌸' },
    { rank: 3, name: 'Анусон (Луангпхабанг)', xp: 390, avatar: '🐘' },
    {
      rank: 4,
      name: tgUser.firstName === 'Lao Learner' ? 'Вы' : tgUser.firstName,
      xp: userXp,
      isCurrentUser: true,
      avatar: tgUser.photoUrl || '⭐',
    },
    { rank: 5, name: 'Дмитрий В.', xp: 260, avatar: '☕' },
    { rank: 6, name: 'Бунми', xp: 210, avatar: '🌴' },
    { rank: 7, name: 'Максим П.', xp: 140, avatar: '🎒' },
  ];

  const sortedUsers = [...mockUsers]
    .sort((a, b) => b.xp - a.xp)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-amber-950 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-duo text-slate-900 dark:text-white">
          Золотая лига
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Топ-3 переходят в Алмазную лигу по итогам недели!
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {sortedUsers.map((learner) => (
          <div
            key={learner.name}
            className={`p-3.5 sm:p-4 flex items-center justify-between transition ${
              learner.isCurrentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold border-l-4 border-l-emerald-500'
                : 'hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 text-center font-duo font-bold text-sm ${
                  learner.rank === 1
                    ? 'text-amber-500 font-black text-base'
                    : learner.rank === 2
                    ? 'text-slate-400 font-black'
                    : learner.rank === 3
                    ? 'text-amber-700 font-black'
                    : 'text-slate-400'
                }`}
              >
                {learner.rank}
              </span>

              {learner.avatar.startsWith('http') ? (
                <img
                  src={learner.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                  {learner.avatar}
                </div>
              )}

              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 block">
                  {learner.name} {learner.isCurrentUser && '(Вы)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {learner.rank <= 3 ? '🏆 Зона повышения' : 'Активный участник'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-duo font-bold text-sm text-slate-700 dark:text-slate-300">
              <span>{learner.xp} XP</span>
              {learner.rank <= 3 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
