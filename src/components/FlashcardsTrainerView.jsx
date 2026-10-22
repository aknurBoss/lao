import React, { useState, useMemo } from 'react';
import { VOCAB_WORDS, VOCAB_CATEGORIES } from '../data/vocabData';
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
  Filter,
} from 'lucide-react';

export default function FlashcardsTrainerView({ onAwardXP }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reverseMode, setReverseMode] = useState(false); // false: Лаосская транскрипция -> Русский; true: Русский -> Вспомнить произношение
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);

  const [learnedIds, setLearnedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_learned_words') || '[]');
    } catch {
      return [];
    }
  });

  const filteredWords = useMemo(() => {
    if (selectedCategory === 'all') return VOCAB_WORDS;
    if (selectedCategory === 'unlearned') {
      const list = VOCAB_WORDS.filter((w) => !learnedIds.includes(w.id));
      return list.length > 0 ? list : VOCAB_WORDS;
    }
    return VOCAB_WORDS.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, learnedIds]);

  const currentWord = filteredWords[currentIndex % filteredWords.length] || VOCAB_WORDS[0];
  const isWordLearned = learnedIds.includes(currentWord.id);

  const handlePlayAudio = (e, rate = 0.85) => {
    if (e) e.stopPropagation();
    telegramService.hapticImpact('light');
    audioEngine.speakText(currentWord, rate);
  };

  const handleNextCard = (markLearned = false) => {
    telegramService.hapticImpact('medium');
    if (markLearned) {
      audioEngine.playFeedback('success');
      if (!learnedIds.includes(currentWord.id)) {
        const updated = [...learnedIds, currentWord.id];
        setLearnedIds(updated);
        localStorage.setItem('lao_learned_words', JSON.stringify(updated));
      }
      if (onAwardXP) onAwardXP(5);
    }

    setIsFlipped(false);
    setShowVoiceStudio(false);
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
      {/* Header & Progress */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 font-duo">
            Тренажёр запоминания слов
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-duo mt-0.5">
            Выучено: {learnedIds.length} из {VOCAB_WORDS.length} слов
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Слушайте произношение, переворачивайте карточки и повторяйте вслух!
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl font-black font-duo shrink-0">
          {Math.round((learnedIds.length / VOCAB_WORDS.length) * 100)}%
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1.5">
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
          Все ({VOCAB_WORDS.length})
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
          🔥 Ещё не выученные ({VOCAB_WORDS.length - learnedIds.length})
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
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-bold">
          Карточка {(currentIndex % filteredWords.length) + 1} из {filteredWords.length}
        </span>

        <button
          type="button"
          onClick={() => {
            setReverseMode(!reverseMode);
            setIsFlipped(false);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500" />
          {reverseMode ? 'Режим: Русский → Лаосский' : 'Режим: Транскрипция → Перевод'}
        </button>
      </div>

      {/* Main Interactive Flashcard */}
      <div
        onClick={() => {
          telegramService.hapticSelection();
          setIsFlipped(!isFlipped);
          if (!isFlipped) {
            audioEngine.speakText(currentWord, 0.85);
          }
        }}
        className={`w-full min-h-[310px] rounded-3xl p-6 sm:p-8 border-2 shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
          isFlipped
            ? 'bg-slate-900 border-emerald-500 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-400'
        }`}
      >
        {/* Top Row of Card */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isWordLearned
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isWordLearned ? '✅ Выучено' : 'В процессе'} • {currentWord.tone}
          </span>

          {/* Audio Normal & Slow Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={(e) => handlePlayAudio(e, 0.55)}
              className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer btn-3d border-amber-300"
              title="Послушать медленно по слогам"
            >
              <Turtle className="w-4 h-4" /> Медленно
            </button>
            <button
              type="button"
              onClick={(e) => handlePlayAudio(e, 0.85)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-3d border-sky-700 shadow-sm"
              title="Послушать произношение"
            >
              <Volume2 className="w-4 h-4" /> Слушать
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
                  Как произносится:
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  {currentWord.ruTrans}
                </h3>
                <p className="text-base sm:text-lg font-mono font-semibold text-slate-500 dark:text-slate-400">
                  [{currentWord.latTrans}]
                </p>
              </>
            ) : (
              <>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                  Вспомните как сказать по-лаосски:
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {currentWord.ruMeaning}
                </h3>
              </>
            )}
          </div>
        ) : (
          /* BACK SIDE (REVEALED) */
          <div className="text-center py-4 space-y-3 animate-in fade-in">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
                {currentWord.ruTrans}
              </h3>
              <p className="text-sm font-mono text-slate-300">[{currentWord.latTrans}]</p>
            </div>

            <div className="py-2 px-4 rounded-2xl bg-white/10 inline-block">
              <p className="text-lg sm:text-xl font-bold text-white">{currentWord.ruMeaning}</p>
            </div>

            <div className="text-left bg-slate-800/90 rounded-2xl p-3.5 text-xs space-y-1.5 border border-slate-700">
              <p className="text-emerald-300 font-medium">
                💡 <strong>Как произносить:</strong> {currentWord.pronunciationHint}
              </p>
              {currentWord.literal && (
                <p className="text-slate-300">
                  🧩 <strong>Дословно:</strong> {currentWord.literal}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Hint */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Нажмите на карточку, чтобы перевернуть и услышать</span>
        </div>
      </div>

      {/* Action Buttons: Repeat vs Learned + Microphone Test */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleNextCard(false)}
          className="py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-duo font-bold text-sm hover:bg-slate-50 cursor-pointer btn-3d flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-amber-500" /> Повторить ещё
        </button>

        <button
          type="button"
          onClick={() => handleNextCard(true)}
          className="py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-duo font-bold text-sm shadow-md shadow-emerald-500/20 cursor-pointer btn-3d border-emerald-700 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Запомнил! (+5 XP)
        </button>
      </div>

      {/* Optional Microphone Self-Check */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowVoiceStudio(!showVoiceStudio)}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Mic className="w-4 h-4 text-rose-500" />
          {showVoiceStudio ? 'Скрыть запись голоса' : '🎙️ Записать своё произношение и сравнить'}
        </button>

        {showVoiceStudio && (
          <div className="mt-3">
            <VoiceRecorder
              targetPhrase={currentWord.ruTrans}
              targetRom={currentWord.latTrans}
              audioItem={currentWord}
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
