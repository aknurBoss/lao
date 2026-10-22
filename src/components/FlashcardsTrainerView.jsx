import React, { useState, useMemo } from 'react';
import { VOCAB_WORDS, VOCAB_CATEGORIES, getWordDisplay } from '../data/vocabData';
import { buildMistakesReviewLesson } from '../data/duoCurriculum';
import { UI_TEXT } from '../data/i18n';
import { audioEngine } from '../services/audioService';
import { telegramService } from '../services/telegramService';
import VoiceRecorder from './VoiceRecorder';
import {
  Volume2,
  Turtle,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Mic,
  ArrowLeftRight,
  Brain,
  Flame,
  Zap,
  Clock,
  Wrench,
} from 'lucide-react';

// Intervals in milliseconds for each SRS Box (1..4)
const SRS_INTERVALS_MS = {
  0: 60 * 1000, // 1 min (Again / Mistake)
  1: 10 * 60 * 1000, // 10 mins (Hard / Box 1)
  2: 24 * 60 * 60 * 1000, // 1 day (Good / Box 2)
  3: 3 * 24 * 60 * 60 * 1000, // 3 days (Confident / Box 3)
  4: 7 * 24 * 60 * 60 * 1000, // 7 days (Master / Box 4)
};

export default function FlashcardsTrainerView({
  onAwardXP,
  lang = 'ru',
  learnedIds = [],
  onUpdateLearnedIds,
  mistakeWords = [],
  onUpdateMistakeWords,
  srsData = {},
  onUpdateSrsData,
  onStartLesson,
}) {
  const t = UI_TEXT[lang]?.cards || UI_TEXT.ru.cards;
  const isRu = lang === 'ru';
  const [selectedCategory, setSelectedCategory] = useState('srs'); // default or 'all' | 'srs' | 'mistakes' | 'unlearned' | category
  const [reverseMode, setReverseMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);

  const now = Date.now();

  // Compute SRS statistics across all words
  const srsStats = useMemo(() => {
    let boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let dueWords = [];

    for (const w of VOCAB_WORDS) {
      const entry = srsData[w.id];
      const isMistake = mistakeWords.includes(w.id);

      if (entry && entry.box >= 1 && entry.box <= 4) {
        boxCounts[entry.box] = (boxCounts[entry.box] || 0) + 1;
      }

      const isDueByTime = entry && entry.nextReview && entry.nextReview <= now;
      if (isMistake || isDueByTime) {
        dueWords.push(w);
      }
    }

    // If user hasn't reviewed enough words yet, include learned words or first 12 words in Smart SRS queue
    if (dueWords.length === 0) {
      const reviewedOrLearned = VOCAB_WORDS.filter(
        (w) => srsData[w.id] || learnedIds.includes(w.id)
      );
      dueWords =
        reviewedOrLearned.length > 0
          ? reviewedOrLearned
          : VOCAB_WORDS.slice(0, 15);
    }

    // Sort SRS queue: mistakes first, then lowest box, then earliest nextReview
    dueWords.sort((a, b) => {
      const aMistake = mistakeWords.includes(a.id) ? 0 : 1;
      const bMistake = mistakeWords.includes(b.id) ? 0 : 1;
      if (aMistake !== bMistake) return aMistake - bMistake;
      const aBox = srsData[a.id]?.box ?? 0;
      const bBox = srsData[b.id]?.box ?? 0;
      if (aBox !== bBox) return aBox - bBox;
      return (srsData[a.id]?.nextReview || 0) - (srsData[b.id]?.nextReview || 0);
    });

    const dueNowCount = VOCAB_WORDS.filter(
      (w) =>
        mistakeWords.includes(w.id) ||
        (srsData[w.id]?.nextReview && srsData[w.id].nextReview <= now)
    ).length;

    return {
      boxCounts,
      dueWords,
      dueNowCount,
    };
  }, [srsData, mistakeWords, learnedIds, now]);

  const filteredWords = useMemo(() => {
    if (selectedCategory === 'srs') {
      return srsStats.dueWords.length > 0 ? srsStats.dueWords : VOCAB_WORDS;
    }
    if (selectedCategory === 'all') return VOCAB_WORDS;
    if (selectedCategory === 'mistakes') {
      const list = VOCAB_WORDS.filter((w) => mistakeWords.includes(w.id));
      return list.length > 0 ? list : srsStats.dueWords;
    }
    if (selectedCategory === 'unlearned') {
      const list = VOCAB_WORDS.filter((w) => !learnedIds.includes(w.id));
      return list.length > 0 ? list : VOCAB_WORDS;
    }
    return VOCAB_WORDS.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, learnedIds, mistakeWords, srsStats]);

  const rawWord = filteredWords[currentIndex % filteredWords.length] || VOCAB_WORDS[0];
  const currentWord = getWordDisplay(rawWord, lang);
  const isWordLearned = learnedIds.includes(currentWord.id);
  const isMistakeWord = mistakeWords.includes(currentWord.id);
  const currentSrsEntry = srsData[currentWord.id] || {
    box: isWordLearned ? 2 : 0,
    nextReview: 0,
    lastReviewed: 0,
  };

  const formatNextReviewLabel = (entry) => {
    if (!entry || !entry.nextReview) {
      return isRu ? 'Новое слово' : 'New word';
    }
    const diff = entry.nextReview - Date.now();
    if (diff <= 0) {
      return isRu ? '⏰ Пора повторить!' : '⏰ Due now!';
    }
    const mins = Math.ceil(diff / 60000);
    if (mins < 60) {
      return isRu ? `Через ${mins} мин.` : `In ${mins}m`;
    }
    const hours = Math.ceil(mins / 60);
    if (hours < 24) {
      return isRu ? `Через ${hours} ч.` : `In ${hours}h`;
    }
    const days = Math.ceil(hours / 24);
    return isRu ? `Через ${days} дн.` : `In ${days}d`;
  };

  const handlePlayAudio = (e, rate = 0.85) => {
    if (e) e.stopPropagation();
    telegramService.hapticImpact('light');
    audioEngine.speakText(rawWord, rate);
  };

  // Smart SRS Rating Handler: 'again' | 'hard' | 'good' | 'easy'
  const handleSrsRate = (rating) => {
    telegramService.hapticImpact('medium');
    const prevBox = currentSrsEntry.box || 0;
    let nextBox = 1;
    let xpGain = 0;

    if (rating === 'again') {
      nextBox = 1;
      // Add to mistake words for targeted practice
      if (!mistakeWords.includes(currentWord.id) && onUpdateMistakeWords) {
        onUpdateMistakeWords([...mistakeWords, currentWord.id]);
      }
    } else if (rating === 'hard') {
      audioEngine.playFeedback('success');
      nextBox = Math.max(1, prevBox);
      xpGain = 3;
    } else if (rating === 'good') {
      audioEngine.playFeedback('success');
      nextBox = Math.min(4, Math.max(2, prevBox + 1));
      xpGain = 5;
      if (isMistakeWord && onUpdateMistakeWords) {
        onUpdateMistakeWords(mistakeWords.filter((id) => id !== currentWord.id));
      }
      if (!learnedIds.includes(currentWord.id) && onUpdateLearnedIds) {
        onUpdateLearnedIds([...learnedIds, currentWord.id]);
      }
    } else if (rating === 'easy') {
      audioEngine.playFeedback('success');
      nextBox = Math.min(4, Math.max(3, prevBox + 2));
      xpGain = 8;
      if (isMistakeWord && onUpdateMistakeWords) {
        onUpdateMistakeWords(mistakeWords.filter((id) => id !== currentWord.id));
      }
      if (!learnedIds.includes(currentWord.id) && onUpdateLearnedIds) {
        onUpdateLearnedIds([...learnedIds, currentWord.id]);
      }
    }

    const intervalMs =
      rating === 'again'
        ? SRS_INTERVALS_MS[0]
        : SRS_INTERVALS_MS[nextBox] || SRS_INTERVALS_MS[2];

    const updatedSrs = {
      ...srsData,
      [currentWord.id]: {
        box: nextBox,
        lastReviewed: Date.now(),
        nextReview: Date.now() + intervalMs,
      },
    };

    if (onUpdateSrsData) {
      onUpdateSrsData(updatedSrs);
    }

    if (xpGain > 0 && onAwardXP) {
      onAwardXP(xpGain);
    }

    setIsFlipped(false);
    setShowVoiceStudio(false);
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handleLaunchSrsMiniLesson = () => {
    if (!onStartLesson) return;
    telegramService.hapticImpact('medium');
    const targetIds = srsStats.dueWords.slice(0, 8).map((w) => w.id);
    const hasMistakes = mistakeWords.length > 0;
    const reviewLesson = buildMistakesReviewLesson(targetIds, lang, !hasMistakes);
    if (reviewLesson) {
      onStartLesson(reviewLesson);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
      {/* SMART SPACED REPETITION (SRS) DASHBOARD */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-duo font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {isRu ? 'Умное повторение (SRS)' : 'Smart Repetition (SRS)'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  {srsStats.dueNowCount > 0
                    ? isRu
                      ? `К повтору: ${srsStats.dueNowCount}`
                      : `Due now: ${srsStats.dueNowCount}`
                    : isRu
                    ? `${learnedIds.length}/${VOCAB_WORDS.length} выучено`
                    : `${learnedIds.length}/${VOCAB_WORDS.length} learned`}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRu
                  ? 'Интервальный алгоритм подбирает слова, которые пора освежить в памяти'
                  : 'Spaced repetition schedules words right before you forget them'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black font-duo text-emerald-600 dark:text-emerald-400">
              {Math.round((learnedIds.length / VOCAB_WORDS.length) * 100)}%
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              {isRu ? 'База 150 слов' : '150 words'}
            </span>
          </div>
        </div>

        {/* 4 Leitner Memory Boxes */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              box: 1,
              label: isRu ? 'Ур. 1 • 10м' : 'Lv. 1 • 10m',
              sub: isRu ? 'Новые' : 'Fresh',
              color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
            },
            {
              box: 2,
              label: isRu ? 'Ур. 2 • 1д' : 'Lv. 2 • 1d',
              sub: isRu ? 'В процессе' : 'Learning',
              color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
            },
            {
              box: 3,
              label: isRu ? 'Ур. 3 • 3д' : 'Lv. 3 • 3d',
              sub: isRu ? 'Уверенно' : 'Good',
              color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50',
            },
            {
              box: 4,
              label: isRu ? 'Ур. 4 • 7д+' : 'Lv. 4 • 7d+',
              sub: isRu ? 'Мастер' : 'Master',
              color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
            },
          ].map((b) => (
            <div
              key={b.box}
              className={`p-2 rounded-2xl border text-center ${b.color}`}
            >
              <span className="font-duo font-black text-sm block">
                {srsStats.boxCounts[b.box] || 0}
              </span>
              <span className="text-[10px] font-bold block leading-tight">{b.label}</span>
              <span className="text-[9px] opacity-75 block">{b.sub}</span>
            </div>
          ))}
        </div>

        {/* Action buttons inside SRS card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => {
              telegramService.hapticSelection();
              setSelectedCategory('srs');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`py-2.5 px-3 rounded-2xl font-duo font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition ${
              selectedCategory === 'srs'
                ? 'bg-indigo-600 text-white shadow-sm btn-3d border-indigo-800'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>
              {isRu
                ? `Карточки SRS (${srsStats.dueWords.length})`
                : `SRS Flashcards (${srsStats.dueWords.length})`}
            </span>
          </button>

          {onStartLesson && (
            <button
              type="button"
              onClick={handleLaunchSrsMiniLesson}
              className="py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-duo font-black text-xs flex items-center justify-center gap-1.5 btn-3d border-emerald-700 cursor-pointer transition"
            >
              <Zap className="w-4 h-4" />
              <span>
                {mistakeWords.length > 0
                  ? isRu
                    ? `Блиц-тест по ошибкам (${mistakeWords.length})`
                    : `Mistakes Quiz (${mistakeWords.length})`
                  : isRu
                  ? 'Блиц-тест умного повтора'
                  : 'Smart Review Quiz'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1.5">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('srs');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'srs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🧠 {isRu ? 'Умный повтор (SRS)' : 'Smart SRS'} ({srsStats.dueWords.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCategory('mistakes');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'mistakes'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🛠️ {isRu ? 'Ошибки' : 'Mistakes'} ({mistakeWords.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {t.all} ({VOCAB_WORDS.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedCategory('unlearned');
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'unlearned'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {t.unlearned} ({VOCAB_WORDS.length - learnedIds.length})
        </button>

        {VOCAB_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {cat.icon} {lang === 'en' ? cat.enName : cat.name}
          </button>
        ))}
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {t.cardCounter((currentIndex % filteredWords.length) + 1, filteredWords.length)}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <Clock className="w-3 h-3 text-indigo-500" />
            {formatNextReviewLabel(currentSrsEntry)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setReverseMode(!reverseMode);
            setIsFlipped(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
          {reverseMode ? t.modeReverse : t.modeNormal}
        </button>
      </div>

      {/* Main Interactive Flashcard */}
      <div
        onClick={() => {
          telegramService.hapticSelection();
          setIsFlipped(!isFlipped);
          if (!isFlipped) {
            audioEngine.speakText(rawWord, 0.85);
          }
        }}
        className={`w-full min-h-[310px] rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
          isFlipped
            ? 'bg-slate-900 border-emerald-500 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-400'
        }`}
      >
        {/* Top Row of Card */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isMistakeWord
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                  : currentSrsEntry.box >= 3
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
              }`}
            >
              {isMistakeWord
                ? isRu
                  ? '🛠️ Ошибка • Повтор'
                  : '🛠️ Mistake • Review'
                : isRu
                ? `🧠 Память: Ур. ${currentSrsEntry.box || 0}/4`
                : `🧠 Memory: Lv. ${currentSrsEntry.box || 0}/4`}
            </span>

            {/* Visual 4-dot memory indicator */}
            <div className="flex items-center gap-1" title="SRS Memory Level">
              {[1, 2, 3, 4].map((dot) => (
                <span
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    (currentSrsEntry.box || 0) >= dot
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Audio Normal & Slow Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => handlePlayAudio(e, 0.55)}
              className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer btn-3d border-amber-300"
              title={t.slow}
            >
              <Turtle className="w-4 h-4" /> {t.slow}
            </button>
            <button
              type="button"
              onClick={(e) => handlePlayAudio(e, 0.85)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d border-sky-700 shadow-sm"
              title={t.listen}
            >
              <Volume2 className="w-4 h-4" /> {t.listen}
            </button>
          </div>
        </div>

        {/* Center Content */}
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="text-center py-6 space-y-2">
            {!reverseMode ? (
              <>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                  {t.howPronounced}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  {currentWord.displayTrans}
                </h3>
                <p className="text-base sm:text-lg font-mono font-semibold text-slate-500 dark:text-slate-400">
                  [{currentWord.displayAltTrans}]
                </p>
              </>
            ) : (
              <>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                  {t.recallLao}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentWord.displayMeaning}
                </h3>
              </>
            )}
          </div>
        ) : (
          /* BACK SIDE (REVEALED) */
          <div className="text-center py-4 space-y-3 animate-in fade-in">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
                {currentWord.displayTrans}
              </h3>
              <p className="text-sm font-mono text-slate-300">[{currentWord.displayAltTrans}]</p>
            </div>

            <div className="py-2 px-4 rounded-2xl bg-white/10 inline-block">
              <p className="text-lg sm:text-xl font-bold text-white">{currentWord.displayMeaning}</p>
            </div>

            <div className="text-left bg-slate-800/90 rounded-2xl p-3.5 text-xs space-y-1.5 border border-slate-700">
              <p className="text-emerald-300 font-medium">
                💡 <strong>{t.howToPronounceLabel}</strong> {currentWord.displayHint}
              </p>
              {currentWord.displayLiteral && (
                <p className="text-slate-300">
                  🧩 <strong>{t.literalLabel}</strong> {currentWord.displayLiteral}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Hint */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.tapToFlip}</span>
        </div>
      </div>

      {/* 4 SMART SRS RATING BUTTONS (Снова / Трудно / Хорошо / Легко) */}
      <div className="space-y-2">
        <div className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {isRu
            ? 'Оцените, насколько легко вспомнили слово (интервал SRS):'
            : 'Rate how well you remembered this word (SRS interval):'}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSrsRate('again')}
            className="py-3 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-duo font-black text-xs cursor-pointer btn-3d flex flex-col items-center justify-center gap-0.5"
          >
            <span>🔄 {isRu ? 'Снова' : 'Again'}</span>
            <span className="text-[10px] font-bold opacity-75">
              {isRu ? '1 мин' : '1m'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSrsRate('hard')}
            className="py-3 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 border-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-duo font-black text-xs cursor-pointer btn-3d flex flex-col items-center justify-center gap-0.5"
          >
            <span>🤔 {isRu ? 'Трудно' : 'Hard'}</span>
            <span className="text-[10px] font-bold opacity-75">
              {isRu ? '10 мин • +3 XP' : '10m • +3 XP'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSrsRate('good')}
            className="py-3 px-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-duo font-black text-xs cursor-pointer btn-3d border-sky-700 flex flex-col items-center justify-center gap-0.5"
          >
            <span>👍 {isRu ? 'Хорошо' : 'Good'}</span>
            <span className="text-[10px] font-bold opacity-90">
              {isRu ? '1–3 дн • +5 XP' : '1–3d • +5 XP'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSrsRate('easy')}
            className="py-3 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-duo font-black text-xs cursor-pointer btn-3d border-emerald-700 flex flex-col items-center justify-center gap-0.5"
          >
            <span>⚡ {isRu ? 'Легко' : 'Easy'}</span>
            <span className="text-[10px] font-bold opacity-90">
              {isRu ? '7 дн • +8 XP' : '7d • +8 XP'}
            </span>
          </button>
        </div>
      </div>

      {/* Optional Microphone Self-Check */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowVoiceStudio(!showVoiceStudio)}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Mic className="w-4 h-4 text-rose-500" />
          {showVoiceStudio ? t.hideVoice : t.showVoice}
        </button>

        {showVoiceStudio && (
          <div className="mt-3">
            <VoiceRecorder
              targetPhrase={currentWord.displayTrans}
              targetRom={currentWord.displayAltTrans}
              audioItem={rawWord}
              lang={lang}
              onPracticeComplete={() => {
                if (onAwardXP) onAwardXP(10);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
