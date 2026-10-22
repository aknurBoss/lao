import React, { useState } from 'react';
import { SCRIPT_QUIZ_QUESTIONS, TONE_DRILLS, INITIAL_FLASHCARDS } from '../data/quizData';
import AudioPlayerButton from './AudioPlayerButton';
import { audioEngine } from '../services/audioService';
import confetti from 'canvas-confetti';
import { Brain, Sparkles, RotateCw, CheckCircle2, XCircle, Trophy, Volume2, ArrowRight } from 'lucide-react';

export default function PracticeView({ onAwardXP }) {
  const [practiceTab, setPracticeTab] = useState('flashcards'); // 'flashcards' | 'scriptQuiz' | 'toneDrill'

  // Flashcards state
  const [cards, setCards] = useState(INITIAL_FLASHCARDS);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Script Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Tone Drill state
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedToneGuess, setSelectedToneGuess] = useState(null);
  const [drillAnswered, setDrillAnswered] = useState(false);

  const currentCard = cards[cardIndex] || cards[0];
  const currentQuiz = SCRIPT_QUIZ_QUESTIONS[quizIndex];
  const currentDrill = TONE_DRILLS[drillIndex];

  // Flashcards handlers
  const handleCardNext = (mastered = false) => {
    if (mastered && onAwardXP) {
      onAwardXP(5);
      audioEngine.playFeedback('success');
    }
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % cards.length);
  };

  // Quiz handlers
  const handleAnswerQuiz = (index) => {
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuiz.correctIndex) {
      audioEngine.playFeedback('success');
      setQuizScore((prev) => prev + 1);
      if (onAwardXP) onAwardXP(10);
    } else {
      audioEngine.playFeedback('error');
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < SCRIPT_QUIZ_QUESTIONS.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz complete
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onAwardXP) onAwardXP(20);
      setQuizIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  // Tone drill handlers
  const handleGuessTone = (toneId) => {
    setSelectedToneGuess(toneId);
    setDrillAnswered(true);
    if (toneId === currentDrill.toneId) {
      audioEngine.playFeedback('success');
      if (onAwardXP) onAwardXP(15);
    } else {
      audioEngine.playFeedback('error');
    }
  };

  const handleNextDrill = () => {
    setDrillIndex((prev) => (prev + 1) % TONE_DRILLS.length);
    setSelectedToneGuess(null);
    setDrillAnswered(false);
  };

  return (
    <div className="space-y-8">
      {/* View Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Brain className="w-3.5 h-3.5" />
            ການຝຶກຊ້ອມ (Interactive Practice)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Flashcards, Quizzes & Tone Training
          </h1>
          <p className="mt-2 text-amber-100 text-sm sm:text-base leading-relaxed">
            Test and consolidate your knowledge. Test your ear with tonal pitch discrimination, flip flashcards, and ace reading comprehension quizzes!
          </p>
        </div>

        <div className="absolute -right-4 -bottom-10 opacity-15 text-9xl font-lao font-bold pointer-events-none select-none">
          ຊ້ອມ
        </div>
      </div>

      {/* Practice Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setPracticeTab('flashcards')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            practiceTab === 'flashcards'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🗂️ SRS Flashcards
        </button>
        <button
          type="button"
          onClick={() => setPracticeTab('scriptQuiz')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            practiceTab === 'scriptQuiz'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📝 Reading & Script Quiz
        </button>
        <button
          type="button"
          onClick={() => setPracticeTab('toneDrill')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            practiceTab === 'toneDrill'
              ? 'border-orange-600 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🎧 Tone Ear Trainer
        </button>
      </div>

      {/* 1. FLASHCARDS TAB */}
      {practiceTab === 'flashcards' && (
        <div className="flex flex-col items-center max-w-xl mx-auto space-y-6">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Card {cardIndex + 1} of {cards.length}
            </span>
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Tap card to flip
            </span>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 rounded-3xl cursor-pointer perspective-1000 select-none group"
          >
            <div
              className={`w-full h-full duration-500 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-between transition-all ${
                isFlipped
                  ? 'bg-slate-900 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:border-orange-400'
              }`}
            >
              {!isFlipped ? (
                /* Front Side */
                <>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-orange-500 tracking-wider">
                      {currentCard.frontSub}
                    </span>
                    <AudioPlayerButton text={currentCard.frontLao} size="sm" />
                  </div>

                  <div className="text-center">
                    <span className="font-lao text-7xl font-bold tracking-tight">
                      {currentCard.frontLao}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">Tap anywhere to reveal answer</p>
                </>
              ) : (
                /* Back Side */
                <>
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">
                      {currentCard.backClass}
                    </span>
                    <AudioPlayerButton text={currentCard.frontLao} size="sm" />
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">{currentCard.backTitle}</h3>
                    <p className="text-sm text-slate-300 font-lao">{currentCard.backExample}</p>
                    <p className="text-xs text-amber-300 font-medium">{currentCard.tone}</p>
                  </div>

                  <p className="text-xs text-slate-400">Tap to flip back</p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleCardNext(false)}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Review Again
            </button>
            <button
              type="button"
              onClick={() => handleCardNext(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md shadow-orange-600/30 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> I Know This (+5 XP)
            </button>
          </div>
        </div>
      )}

      {/* 2. SCRIPT & READING QUIZ */}
      {practiceTab === 'scriptQuiz' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question {quizIndex + 1} of {SCRIPT_QUIZ_QUESTIONS.length}
            </span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              Score: {quizScore}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            {currentQuiz.prompt}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuiz.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === currentQuiz.correctIndex;

              let btnStyle =
                'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200';
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleAnswerQuiz(i)}
                  className={`p-4 rounded-2xl border text-left font-lao text-lg font-semibold transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              💡 {currentQuiz.explanation}
            </div>
          )}

          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuiz}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. TONE EAR TRAINING DRILL */}
      {practiceTab === 'toneDrill' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Drill {drillIndex + 1} of {TONE_DRILLS.length}
            </span>
            <span className="text-orange-500 font-semibold">Ear Training Mode</span>
          </div>

          <div className="text-center py-4 space-y-3">
            <span className="font-lao text-6xl font-bold text-slate-900 dark:text-white">
              {currentDrill.syllable}
            </span>
            <p className="text-xs text-slate-400">
              Meaning: "{currentDrill.english}" ({currentDrill.rom})
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => audioEngine.playToneContour(currentDrill.toneId)}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Play Pitch Contour
              </button>
              <button
                type="button"
                onClick={() => audioEngine.speakText(currentDrill.syllable)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Play Word
              </button>
            </div>
          </div>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Listen closely to the melody: Which of the 6 tones did you hear?
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'mid', label: 'Mid Tone (˧˧)' },
              { id: 'low', label: 'Low Tone (˨˩)' },
              { id: 'high', label: 'High Tone (˥˥)' },
              { id: 'rising', label: 'Rising Tone (˨˦)' },
              { id: 'highFalling', label: 'High Falling (˥˩)' },
              { id: 'lowFalling', label: 'Low Falling (˧˩)' },
            ].map((t) => {
              const isSelected = selectedToneGuess === t.id;
              const isCorrect = t.id === currentDrill.toneId;

              let style =
                'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100';

              if (drillAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-rose-100 border-rose-500 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200';
                }
              }

              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={drillAnswered}
                  onClick={() => handleGuessTone(t.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-between ${style}`}
                >
                  <span>{t.label}</span>
                  {drillAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {drillAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>

          {drillAnswered && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Tone Breakdown:
              </span>
              {currentDrill.class}
            </div>
          )}

          {drillAnswered && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextDrill}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                Next Tone Drill <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
