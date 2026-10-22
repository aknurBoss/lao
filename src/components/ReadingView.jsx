import React, { useState } from 'react';
import { READING_PASSAGES } from '../data/readingPassages';
import AudioPlayerButton from './AudioPlayerButton';
import { audioEngine } from '../services/audioService';
import { BookOpen, Eye, EyeOff, Volume2, CheckCircle2, XCircle, Sparkles, Award } from 'lucide-react';

export default function ReadingView({ onAwardXP }) {
  const [selectedPassage, setSelectedPassage] = useState(READING_PASSAGES[0]);
  const [showRom, setShowRom] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [inspectedWord, setInspectedWord] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [completedPassages, setCompletedPassages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_completed_readings') || '[]');
    } catch {
      return [];
    }
  });

  const handleSelectPassage = (passage) => {
    setSelectedPassage(passage);
    setInspectedWord(null);
    setQuizAnswer(null);
    setIsQuizSubmitted(false);
  };

  const handleQuizSubmit = (optionIndex) => {
    setQuizAnswer(optionIndex);
    setIsQuizSubmitted(true);

    if (optionIndex === selectedPassage.quiz.correctIndex) {
      audioEngine.playFeedback('success');
      if (!completedPassages.includes(selectedPassage.id)) {
        const updated = [...completedPassages, selectedPassage.id];
        setCompletedPassages(updated);
        localStorage.setItem('lao_completed_readings', JSON.stringify(updated));
        if (onAwardXP) onAwardXP(25);
      }
    } else {
      audioEngine.playFeedback('error');
    }
  };

  const isCompleted = completedPassages.includes(selectedPassage.id);

  return (
    <div className="space-y-8">
      {/* View Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            ການຝຶກອ່ານ (Lao Reading Practice)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Interactive Graded Reader
          </h1>
          <p className="mt-2 text-sky-100 text-sm sm:text-base leading-relaxed">
            Read authentic Lao passages with clickable word-by-word token lookup. Click any word to inspect its tones, phonetics, and English definition!
          </p>
        </div>

        <div className="absolute -right-4 -bottom-10 opacity-15 text-9xl font-lao font-bold pointer-events-none select-none">
          ອ່ານ
        </div>
      </div>

      {/* Graded Passages Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {READING_PASSAGES.map((p) => {
          const done = completedPassages.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPassage(p)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                selectedPassage.id === p.id
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {p.level}
                  </span>
                  {done && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                </div>
                <h3 className="font-lao text-lg font-bold text-slate-900 dark:text-white">
                  {p.titleLao}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.titleEnglish}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Reading Canvas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-lao text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {selectedPassage.titleLao}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedPassage.titleRom} • {selectedPassage.titleEnglish}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => audioEngine.speakText(selectedPassage.fullTextLao)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Listen to Story
            </button>
            <button
              type="button"
              onClick={() => setShowRom(!showRom)}
              className={`px-3 py-2 rounded-xl font-medium text-xs border transition cursor-pointer ${
                showRom
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-transparent border-slate-200 text-slate-400'
              }`}
            >
              {showRom ? 'Hide Phonetics' : 'Show Phonetics'}
            </button>
            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-2 rounded-xl font-medium text-xs border transition cursor-pointer ${
                showTranslation
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-transparent border-slate-200 text-slate-400'
              }`}
            >
              {showTranslation ? 'Hide Translation' : 'Show English Translation'}
            </button>
          </div>
        </div>

        {/* Tokenized Text Reading Area */}
        <div className="bg-slate-50/70 dark:bg-slate-950/60 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-400 mb-3 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Click any Lao word to decode:
          </p>

          <div className="flex flex-wrap gap-x-2 gap-y-4 items-end leading-relaxed">
            {selectedPassage.tokens.map((token, index) => {
              const isSelected = inspectedWord && inspectedWord.index === index;
              return (
                <div
                  key={index}
                  onClick={() => setInspectedWord({ ...token, index })}
                  className={`group flex flex-col items-center cursor-pointer transition-all duration-150 px-2 py-1 rounded-xl ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'hover:bg-indigo-100 dark:hover:bg-indigo-950/60'
                  }`}
                >
                  {/* Lao Word */}
                  <span
                    className={`font-lao text-2xl sm:text-3xl font-medium ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600'
                    }`}
                  >
                    {token.lao}
                  </span>

                  {/* Interlinear Romanization */}
                  {showRom && (
                    <span
                      className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                        isSelected
                          ? 'text-indigo-100'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {token.rom}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Word Inspector Card */}
        {inspectedWord && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="font-lao text-3xl font-bold text-indigo-900 dark:text-indigo-200">
                {inspectedWord.lao}
              </span>
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                  {inspectedWord.rom}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                  English: {inspectedWord.meaning}
                </p>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Tone: {inspectedWord.tone}
                </span>
              </div>
            </div>

            <AudioPlayerButton text={inspectedWord.lao} label="Pronounce Word" size="md" />
          </div>
        )}

        {/* English Translation Collapsible */}
        {showTranslation && (
          <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2">
              Full English Translation
            </h4>
            {selectedPassage.translation}
          </div>
        )}

        {/* Reading Comprehension Quiz */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Comprehension Check
            </h3>
          </div>

          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-4">
            {selectedPassage.quiz.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedPassage.quiz.options.map((opt, i) => {
              const isSelected = quizAnswer === i;
              const isCorrect = i === selectedPassage.quiz.correctIndex;

              let btnStyle =
                'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100';

              if (isQuizSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold dark:bg-emerald-950/60 dark:text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isQuizSubmitted}
                  onClick={() => handleQuizSubmit(i)}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isQuizSubmitted && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isQuizSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isQuizSubmitted && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              💡 {selectedPassage.quiz.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
