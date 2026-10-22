import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Volume2,
  Turtle,
  Sparkles,
  Check,
  Trophy,
  Gem,
} from 'lucide-react';
import DuoMascot from './DuoMascot';
import { audioEngine } from '../services/audioService';
import { telegramService } from '../services/telegramService';
import confetti from 'canvas-confetti';

export default function LessonModal({
  lesson,
  hearts,
  setHearts,
  onFinishLesson,
  onClose,
  gems,
  setGems,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedWordBank, setSelectedWordBank] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [firstMatchSelection, setFirstMatchSelection] = useState(null);
  const [matchShaking, setMatchShaking] = useState(false);

  const [evaluationState, setEvaluationState] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const exercise = lesson.exercises[currentIndex];
  const progressPercent = Math.round((currentIndex / lesson.exercises.length) * 100);

  useEffect(() => {
    if (!exercise) return;
    setSelectedAnswer(null);
    setEvaluationState('idle');
    setFirstMatchSelection(null);
    setMatchedPairs([]);

    if (exercise.type === 'word_bank') {
      const allWords = [...exercise.targetWords, ...exercise.distractors].sort(
        () => Math.random() - 0.5
      );
      setAvailableWords(allWords);
      setSelectedWordBank([]);
    }

    // Автоматическая озвучка при открытии задания
    const wordToSpeak = exercise.audioWord || exercise.laoPrompt || exercise.targetLao;
    if (wordToSpeak) {
      setTimeout(() => audioEngine.speakText(wordToSpeak, 0.85), 250);
    }
  }, [currentIndex, lesson]);

  const handlePickWord = (word, index) => {
    telegramService.hapticImpact('light');
    if (word !== '?') {
      audioEngine.speakText(word, 0.85);
    }
    setSelectedWordBank((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReturnWord = (word, index) => {
    telegramService.hapticImpact('light');
    setSelectedWordBank((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  };

  const handleMatchSelect = (item, type) => {
    telegramService.hapticImpact('light');
    if (type === 'lao') {
      audioEngine.speakText(item.split('(')[0], 0.85);
    }

    if (!firstMatchSelection) {
      setFirstMatchSelection({ text: item, type });
      return;
    }

    if (firstMatchSelection.type === type) {
      setFirstMatchSelection({ text: item, type });
      return;
    }

    const laoItem = type === 'lao' ? item : firstMatchSelection.text;
    const engItem = type === 'english' ? item : firstMatchSelection.text;

    const pairFound = exercise.pairs.find(
      (p) => p.lao === laoItem && p.english === engItem
    );

    if (pairFound) {
      telegramService.hapticNotification('success');
      audioEngine.playFeedback('success');
      setMatchedPairs((prev) => [...prev, laoItem]);
      setFirstMatchSelection(null);

      if (matchedPairs.length + 1 >= exercise.pairs.length) {
        setTimeout(() => {
          setEvaluationState('correct');
        }, 350);
      }
    } else {
      telegramService.hapticNotification('error');
      audioEngine.playFeedback('error');
      setMatchShaking(true);
      setTimeout(() => {
        setFirstMatchSelection(null);
        setMatchShaking(false);
      }, 500);
    }
  };

  const handleCheck = () => {
    if (evaluationState !== 'idle') {
      if (currentIndex + 1 < lesson.exercises.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        telegramService.hapticNotification('success');
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
        });
        if (onFinishLesson) {
          onFinishLesson(lesson, mistakesCount === 0);
        }
      }
      return;
    }

    let isCorrect = false;

    if (
      exercise.type === 'multiple_choice' ||
      exercise.type === 'listen_pick' ||
      exercise.type === 'tone_listen'
    ) {
      isCorrect = Boolean(selectedAnswer?.isCorrect);
    } else if (exercise.type === 'word_bank') {
      const built = selectedWordBank.join(' ').trim();
      const target = exercise.targetSentence.trim();
      isCorrect = built === target;
    } else if (exercise.type === 'speaking_repeat') {
      isCorrect = true;
    }

    if (isCorrect) {
      telegramService.hapticNotification('success');
      audioEngine.playFeedback('success');
      setEvaluationState('correct');
    } else {
      telegramService.hapticNotification('error');
      audioEngine.playFeedback('error');
      setEvaluationState('wrong');
      setMistakesCount((prev) => prev + 1);

      setHearts((prev) => {
        const next = Math.max(0, prev - 1);
        localStorage.setItem('lao_user_hearts', next.toString());
        return next;
      });
    }
  };

  if (hearts <= 0 && evaluationState === 'wrong') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 animate-in zoom-in-95">
          <DuoMascot
            mood="sad"
            size="lg"
            message="Не беда! На ошибках мы запоминаем слова быстрее!"
            className="justify-center"
          />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-duo">
            Закончились жизни! (0 ❤️)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Восстановите жизни за алмазы или бесплатно на вкладке «Карточки / Практика».
          </p>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={gems < 50}
              onClick={() => {
                setGems((prev) => prev - 50);
                setHearts(5);
                setEvaluationState('idle');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold font-duo text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer btn-3d border-rose-700"
            >
              <Heart className="w-5 h-5 fill-current" /> Восстановить 5 жизней (50 💎)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm cursor-pointer"
            >
              Выйти на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 shadow-2xl">
          <DuoMascot
            mood="celebrate"
            size="lg"
            message="Супер! Слова урока освоены! Кхоп-тьа́й!"
            className="justify-center"
          />

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-duo">
              Урок пройден!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-duo mt-1">
              {lesson.laoTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {lesson.title}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800 text-center">
              <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block font-duo">
                +{lesson.xpReward} XP
              </span>
              <span className="text-[10px] text-slate-400">Опыт</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-200 dark:border-sky-800 text-center">
              <Gem className="w-6 h-6 text-sky-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block font-duo">
                +{lesson.gemReward} 💎
              </span>
              <span className="text-[10px] text-slate-400">Алмазы</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 text-center">
              <Sparkles className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block font-duo">
                {Math.round(
                  ((lesson.exercises.length - mistakesCount) / lesson.exercises.length) * 100
                )}
                %
              </span>
              <span className="text-[10px] text-slate-400">Точность</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base font-duo shadow-lg shadow-emerald-500/30 btn-3d border-emerald-700 cursor-pointer active:scale-95 transition"
          >
            ПРОДОЛЖИТЬ
          </button>
        </div>
      </div>
    );
  }

  const isCheckEnabled =
    evaluationState !== 'idle' ||
    (exercise.type === 'word_bank' && selectedWordBank.length > 0) ||
    ((exercise.type === 'multiple_choice' ||
      exercise.type === 'listen_pick' ||
      exercise.type === 'tone_listen') &&
      selectedAnswer !== null) ||
    exercise.type === 'speaking_repeat';

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* Top Bar */}
      <div className="max-w-3xl w-full mx-auto px-4 pt-safe py-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowQuitConfirm(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-rose-500 font-bold font-duo text-sm sm:text-base">
          <Heart className="w-6 h-6 fill-rose-500 animate-pulse" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 sm:py-6 overflow-y-auto flex flex-col justify-center">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-duo">
            {exercise.prompt}
          </h2>

          {(exercise.laoPrompt || exercise.audioWord) && (
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  audioEngine.speakText(exercise.audioWord || exercise.laoPrompt, 0.85)
                }
                className="px-3.5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-2 shadow-md shadow-sky-500/20 active:scale-95 transition cursor-pointer btn-3d border-sky-700 font-bold text-xs"
              >
                <Volume2 className="w-5 h-5" /> Слушать
              </button>

              <button
                type="button"
                onClick={() =>
                  audioEngine.speakText(exercise.audioWord || exercise.laoPrompt, 0.55)
                }
                className="px-3 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1.5 active:scale-95 transition cursor-pointer btn-3d border-amber-300 font-bold text-xs"
                title="Медленно по слогам"
              >
                <Turtle className="w-4 h-4" /> Медленно
              </button>

              {exercise.laoPrompt && (
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 ml-1">
                  {exercise.laoPrompt}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 1. WORD BANK */}
        {exercise.type === 'word_bank' && (
          <div className="space-y-6">
            <div className="min-h-16 p-3 rounded-2xl border-b-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-wrap gap-2 items-center">
              {selectedWordBank.map((word, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleReturnWord(word, i)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 font-bold text-base sm:text-lg text-slate-800 dark:text-white shadow-xs cursor-pointer btn-3d"
                >
                  {word}
                </button>
              ))}
              {selectedWordBank.length === 0 && (
                <span className="text-xs text-slate-400 italic">
                  Нажимайте на слова ниже по порядку...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center pt-2">
              {availableWords.map((word, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickWord(word, i)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-base sm:text-lg text-slate-800 dark:text-white shadow-xs hover:border-emerald-400 cursor-pointer btn-3d"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. MULTIPLE CHOICE OR LISTEN PICK */}
        {(exercise.type === 'multiple_choice' ||
          exercise.type === 'listen_pick' ||
          exercise.type === 'tone_listen') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {exercise.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={evaluationState !== 'idle'}
                    onClick={() => {
                      telegramService.hapticImpact('light');
                      setSelectedAnswer(opt);
                      if (opt.audio || opt.text) {
                        audioEngine.speakText(opt.audio || opt.text.split('(')[0], 0.85);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between btn-3d ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-lg font-extrabold block">{opt.text}</span>
                      {opt.meaning && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {opt.meaning}
                        </span>
                      )}
                    </div>
                    <Volume2 className="w-5 h-5 text-sky-500 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MATCH PAIRS */}
        {exercise.type === 'match_pairs' && (
          <div className={`grid grid-cols-2 gap-3 ${matchShaking ? 'animate-shake' : ''}`}>
            <div className="space-y-2.5">
              {exercise.pairs.map((p, i) => {
                const isMatched = matchedPairs.includes(p.lao);
                const isSelected = firstMatchSelection?.text === p.lao;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleMatchSelect(p.lao, 'lao')}
                    className={`w-full p-3.5 rounded-2xl border-2 font-extrabold text-sm sm:text-base text-center transition cursor-pointer btn-3d ${
                      isMatched
                        ? 'opacity-30 border-slate-300 dark:border-slate-800 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
                        : isSelected
                        ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-50'
                    }`}
                  >
                    🔊 {p.lao}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              {exercise.pairs
                .slice()
                .reverse()
                .map((p, i) => {
                  const isMatched = matchedPairs.includes(p.lao);
                  const isSelected = firstMatchSelection?.text === p.english;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isMatched}
                      onClick={() => handleMatchSelect(p.english, 'english')}
                      className={`w-full p-3.5 rounded-2xl border-2 font-bold text-sm sm:text-base text-center transition cursor-pointer btn-3d ${
                        isMatched
                          ? 'opacity-30 border-slate-300 dark:border-slate-800 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
                          : isSelected
                          ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:bg-slate-50'
                      }`}
                    >
                      {p.english}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* 4. SPEAKING REPEAT */}
        {exercise.type === 'speaking_repeat' && (
          <div className="text-center py-6 space-y-4 bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  audioEngine.speakText(exercise.audioWord || exercise.targetLao, 0.85)
                }
                className="w-16 h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white inline-flex items-center justify-center shadow-lg shadow-emerald-500/30 btn-3d border-emerald-700 active:scale-95 transition cursor-pointer"
                title="Обычная скорость"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <button
                type="button"
                onClick={() =>
                  audioEngine.speakText(exercise.audioWord || exercise.targetLao, 0.55)
                }
                className="w-16 h-16 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 inline-flex items-center justify-center shadow-md btn-3d border-amber-600 active:scale-95 transition cursor-pointer"
                title="Медленно по слогам"
              >
                <Turtle className="w-8 h-8" />
              </button>
            </div>

            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
                {exercise.targetLao}
              </span>
              <span className="text-sm font-mono font-semibold text-slate-500 dark:text-slate-400 block mt-1">
                [{exercise.targetRom}]
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-white block mt-2">
                «{exercise.english}»
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Прослушайте и повторите фразу вслух 2–3 раза для запоминания!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Evaluation Banner */}
      <div
        className={`w-full border-t-2 transition-all duration-200 pb-safe ${
          evaluationState === 'correct'
            ? 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/80 dark:border-emerald-800'
            : evaluationState === 'wrong'
            ? 'bg-rose-100 border-rose-300 dark:bg-rose-950/80 dark:border-rose-800'
            : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            {evaluationState === 'correct' && (
              <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-lg font-duo">Отлично! (Ди ла́й!)</h4>
                  {exercise.tip && <p className="text-xs opacity-90 max-w-md">{exercise.tip}</p>}
                </div>
              </div>
            )}

            {evaluationState === 'wrong' && (
              <div className="flex items-center gap-3 text-rose-800 dark:text-rose-200 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
                  <X className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-base font-duo">Правильный ответ:</h4>
                  <p className="text-sm font-bold max-w-md">
                    {exercise.type === 'word_bank'
                      ? exercise.targetSentence
                      : exercise.options?.find((o) => o.isCorrect)?.text}
                  </p>
                  {exercise.tip && <p className="text-xs opacity-80 mt-0.5">{exercise.tip}</p>}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!isCheckEnabled}
            onClick={handleCheck}
            className={`w-full sm:w-48 py-3.5 px-6 rounded-2xl font-black text-sm font-duo shadow-md transition cursor-pointer btn-3d active:scale-95 ${
              evaluationState === 'correct'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700'
                : evaluationState === 'wrong'
                ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700'
                : isCheckEnabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-300 dark:border-slate-700 cursor-not-allowed'
            }`}
          >
            {evaluationState !== 'idle' ? 'ДАЛЬШЕ' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </div>

      {/* Quit Confirmation */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-duo">
              Выйти из урока?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Прогресс текущего урока не сохранится.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-duo text-sm cursor-pointer btn-3d border-emerald-700"
              >
                ПРОДОЛЖИТЬ УРОК
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl text-rose-500 font-bold font-duo text-sm cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                ВЫЙТИ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
