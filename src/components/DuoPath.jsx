import React, { useState } from 'react';
import { getDuoUnits, buildMistakesReviewLesson } from '../data/duoCurriculum';
import { UI_TEXT } from '../data/i18n';
import DuoMascot from './DuoMascot';
import {
  Star,
  Lock,
  Check,
  Gift,
  BookOpen,
  Volume2,
  Turtle,
  X,
  Brain,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { audioEngine } from '../services/audioService';
import confetti from 'canvas-confetti';

export default function DuoPath({
  completedLessons,
  onStartLesson,
  unlockedChests,
  onUnlockChest,
  mistakeWords = [],
  learnedWords = [],
  lang = 'ru',
}) {
  const [selectedGuidebookUnit, setSelectedGuidebookUnit] = useState(null);
  const t = UI_TEXT[lang]?.path || UI_TEXT.ru.path;
  const isRu = lang === 'ru';
  const units = getDuoUnits(lang);

  const stepOffsets = [0, -38, 38, -25, 25, 0];

  const handleStartMistakesReview = () => {
    telegramService.hapticImpact('medium');
    const reviewLesson = buildMistakesReviewLesson(mistakeWords, lang, false);
    onStartLesson(reviewLesson);
  };

  const handleStartSrsReview = () => {
    telegramService.hapticImpact('medium');
    const pool = learnedWords.length > 0 ? learnedWords : ['w1', 'w2', 'w3', 'w4', 'b1', 'f2'];
    const reviewLesson = buildMistakesReviewLesson(pool, lang, true);
    onStartLesson(reviewLesson);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-10">
      {/* Smart SRS & Mistakes Review Hub */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-duo font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {isRu
                ? 'Умное повторение (SRS) и Ошибки'
                : 'Smart SRS & Mistakes Review'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {isRu ? '150 слов в базе' : '150 words total'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Mistakes Review Button */}
          <button
            type="button"
            onClick={handleStartMistakesReview}
            className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition cursor-pointer btn-3d ${
              mistakeWords.length > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  mistakeWords.length > 0
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="font-duo font-black text-xs sm:text-sm block">
                  {isRu ? 'Работа над ошибками' : 'Mistakes Review'}
                </span>
                <span className="text-[11px] opacity-75 block">
                  {mistakeWords.length > 0
                    ? isRu
                      ? `${mistakeWords.length} сл. для разбора (+1 ❤️)`
                      : `${mistakeWords.length} words to fix (+1 ❤️)`
                    : isRu
                    ? 'Ошибок нет! Быстрый повтор'
                    : '0 mistakes! Quick practice'}
                </span>
              </div>
            </div>
            {mistakeWords.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-duo font-black text-xs">
                {mistakeWords.length}
              </span>
            )}
          </button>

          {/* Smart Spaced Repetition (SRS) Button */}
          <button
            type="button"
            onClick={handleStartSrsReview}
            className="p-3.5 rounded-2xl border-2 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100 text-left flex items-center justify-between gap-3 transition cursor-pointer btn-3d"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="font-duo font-black text-xs sm:text-sm block">
                  {isRu ? 'Интервальный повтор' : 'Smart SRS Review'}
                </span>
                <span className="text-[11px] opacity-75 block">
                  {isRu
                    ? `Закрепить слова (+20 XP)`
                    : `Reinforce memory (+20 XP)`}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
      {units.map((unit, unitIdx) => {
        const isChestClaimed = unlockedChests.includes(unit.id);
        const allUnitLessonsDone = unit.lessons.every((l) =>
          completedLessons.includes(l.id)
        );

        return (
          <div key={unit.id} className="space-y-6">
            {/* Unit Header Banner */}
            <div
              className={`rounded-3xl p-5 sm:p-6 text-white shadow-lg bg-gradient-to-r ${unit.gradient} relative overflow-hidden`}
            >
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-white/80 font-duo">
                    {t.unit} {unit.number}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-duo mt-0.5">
                    {unit.title}
                  </h2>
                  <p className="text-sm font-bold text-white/95 mt-0.5">{unit.laoTitle}</p>
                  <p className="text-xs text-white/85 mt-2 max-w-sm leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGuidebookUnit(unit)}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-duo font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <BookOpen className="w-4 h-4" /> {t.unitWords}
                </button>
              </div>

              <div className="absolute -right-4 -bottom-6 opacity-15 text-8xl font-bold pointer-events-none select-none">
                {unit.number}
              </div>
            </div>

            {/* Stepping Stones Path */}
            <div className="relative flex flex-col items-center py-4 space-y-9">
              {unit.lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isPrevCompleted =
                  unitIdx === 0 && idx === 0
                    ? true
                    : idx === 0
                    ? completedLessons.includes(
                        units[unitIdx - 1]?.lessons.slice(-1)[0]?.id
                      )
                    : completedLessons.includes(unit.lessons[idx - 1].id);

                const isLocked = !isCompleted && !isPrevCompleted;
                const isActive = !isCompleted && isPrevCompleted;
                const offset = stepOffsets[idx % stepOffsets.length];

                return (
                  <div
                    key={lesson.id}
                    className="relative flex items-center justify-center"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isActive && (
                      <span className="absolute w-24 h-24 rounded-full bg-emerald-400/30 dark:bg-emerald-500/20 animate-ping pointer-events-none" />
                    )}

                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => {
                        telegramService.hapticImpact('medium');
                        onStartLesson(lesson);
                      }}
                      className={`relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-md transition-all duration-150 cursor-pointer active:scale-95 btn-3d ${
                        isCompleted
                          ? 'bg-amber-400 border-amber-600 text-amber-950'
                          : isActive
                          ? 'bg-emerald-500 border-emerald-700 text-white ring-4 ring-emerald-300 dark:ring-emerald-700'
                          : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-8 h-8 stroke-[3]" />
                      ) : isActive ? (
                        <Star className="w-8 h-8 fill-current animate-pulse" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </button>

                    <div className="absolute -bottom-6 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-xs pointer-events-none">
                      {lesson.title}
                    </div>

                    {isActive && idx === 0 && (
                      <div className="hidden sm:block absolute left-28 top-0 pointer-events-none">
                        <DuoMascot
                          mood="happy"
                          size="sm"
                          message={t.mascotPrompt}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Milestone Treasure Chest at Unit End */}
              <div className="pt-4 flex flex-col items-center">
                <button
                  type="button"
                  disabled={!allUnitLessonsDone || isChestClaimed}
                  onClick={() => {
                    telegramService.hapticNotification('success');
                    confetti({ particleCount: 70, spread: 60 });
                    onUnlockChest(unit);
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition btn-3d cursor-pointer ${
                    isChestClaimed
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400 cursor-default'
                      : allUnitLessonsDone
                      ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 border-amber-600 text-amber-950 animate-bounce'
                      : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                  title={
                    isChestClaimed
                      ? t.chestOpened
                      : allUnitLessonsDone
                      ? t.chestClaim
                      : t.chestLocked
                  }
                >
                  <Gift className="w-8 h-8" />
                </button>
                <span className="text-[11px] font-bold text-slate-400 mt-2 font-duo">
                  {isChestClaimed
                    ? t.chestOpenedLabel
                    : `${t.chestReward}: +${unit.chestRewardGems} 💎`}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Guidebook Modal */}
      {selectedGuidebookUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setSelectedGuidebookUnit(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-duo">
                  {t.guideTitle} • {t.unit} {selectedGuidebookUnit.number}
                </span>
                <h3 className="text-xl font-black font-duo text-slate-900 dark:text-white">
                  {selectedGuidebookUnit.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.guideSubtitle}
            </p>

            <div className="space-y-2.5 pt-1">
              {(selectedGuidebookUnit.guideWords || []).map((gw, i) => (
                <div
                  key={i}
                  onClick={() => audioEngine.speakText(gw.trans.split('(')[0], 0.85)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition"
                >
                  <div>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                      {gw.trans}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white block">
                      {gw.mean}
                    </span>
                    {gw.hint && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        💡 {gw.hint}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => audioEngine.speakText(gw.trans.split('(')[0], 0.55)}
                      className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 cursor-pointer"
                      title={t.slow}
                    >
                      <Turtle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => audioEngine.speakText(gw.trans.split('(')[0], 0.85)}
                      className="p-2 rounded-xl bg-sky-500 text-white cursor-pointer"
                      title={t.listen}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
