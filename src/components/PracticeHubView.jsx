import React, { useState } from 'react';
import { Heart, BookOpen, Music, MessageSquare, BookMarked, Sparkles, Check, ArrowRight } from 'lucide-react';
import AlphabetView from './AlphabetView';
import ToneMasterView from './ToneMasterView';
import SpeakingView from './SpeakingView';
import ReadingView from './ReadingView';
import PhrasebookView from './PhrasebookView';
import { audioEngine } from '../services/audioService';
import { telegramService } from '../services/telegramService';
import confetti from 'canvas-confetti';

export default function PracticeHubView({ hearts, setHearts, onAwardXP }) {
  const [activeSubView, setActiveSubView] = useState('hub'); // 'hub' | 'alphabet' | 'tones' | 'speaking' | 'reading' | 'phrasebook' | 'heartDrill'
  const [drillStep, setDrillStep] = useState(0);

  const heartDrillQuestions = [
    {
      q: 'How do you say "Thank you" in Lao?',
      options: ['ຂອບໃຈ (khawp-jai)', 'ສະບາຍດີ (sa-baai-dii)', 'ລາກ່ອນ (laa-kawn)'],
      correct: 0,
      audio: 'ຂອບໃຈ',
    },
    {
      q: 'Which tone mark is ໄມ້ໂທ (May Tho)?',
      options: ['່ (May Ek)', '້ (May Tho)', '໊ (May Tri)'],
      correct: 1,
      audio: 'ບ້ານ',
    },
    {
      q: 'What is sticky rice in Lao?',
      options: ['ເຂົ້າໜຽວ (khao-niaw)', 'ເຂົ້າຈີ່ (khao-jii)', 'ເຝີ (feuu)'],
      correct: 0,
      audio: 'ເຂົ້າໜຽວ',
    },
  ];

  const handleDrillAnswer = (optionIdx) => {
    if (optionIdx === heartDrillQuestions[drillStep].correct) {
      telegramService.hapticNotification('success');
      audioEngine.playFeedback('success');

      if (drillStep + 1 < heartDrillQuestions.length) {
        setDrillStep((prev) => prev + 1);
      } else {
        // Completed heart drill!
        confetti({ particleCount: 50, spread: 60 });
        setHearts((prev) => Math.min(5, prev + 1));
        if (onAwardXP) onAwardXP(10);
        setActiveSubView('hub');
        setDrillStep(0);
      }
    } else {
      telegramService.hapticNotification('error');
      audioEngine.playFeedback('error');
    }
  };

  if (activeSubView === 'alphabet') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-duo font-bold text-xs cursor-pointer"
        >
          ← Back to Practice Hub
        </button>
        <AlphabetView onAwardXP={onAwardXP} />
      </div>
    );
  }

  if (activeSubView === 'tones') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-duo font-bold text-xs cursor-pointer"
        >
          ← Back to Practice Hub
        </button>
        <ToneMasterView onAwardXP={onAwardXP} />
      </div>
    );
  }

  if (activeSubView === 'speaking') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-duo font-bold text-xs cursor-pointer"
        >
          ← Back to Practice Hub
        </button>
        <SpeakingView onAwardXP={onAwardXP} />
      </div>
    );
  }

  if (activeSubView === 'reading') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-duo font-bold text-xs cursor-pointer"
        >
          ← Back to Practice Hub
        </button>
        <ReadingView onAwardXP={onAwardXP} />
      </div>
    );
  }

  if (activeSubView === 'phrasebook') {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-duo font-bold text-xs cursor-pointer"
        >
          ← Back to Practice Hub
        </button>
        <PhrasebookView onAwardXP={onAwardXP} />
      </div>
    );
  }

  if (activeSubView === 'heartDrill') {
    const q = heartDrillQuestions[drillStep];
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 font-duo font-bold">
          <span>Question {drillStep + 1} of 3</span>
          <span className="text-rose-500 flex items-center gap-1">
            <Heart className="w-4 h-4 fill-current" /> Reward: +1 Heart
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-black font-duo text-slate-900 dark:text-white">
            {q.q}
          </h3>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDrillAnswer(i)}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-lao font-bold text-base text-left hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer btn-3d"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveSubView('hub')}
          className="w-full py-2.5 text-center text-xs text-slate-400 font-duo font-bold"
        >
          Cancel Drill
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black font-duo text-slate-900 dark:text-white">
          Practice Hub (ຝຶກຊ້ອມ)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Restore hearts, practice writing Lao script, decode tones, or roleplay dialogues.
        </p>
      </div>

      {/* 1. Earn Hearts Practice Card */}
      <div className="bg-gradient-to-tr from-rose-500 to-pink-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80 font-duo">
            Hearts: {hearts}/5
          </span>
          <h3 className="text-lg font-black font-duo mt-0.5">Practice to Earn Hearts</h3>
          <p className="text-xs text-rose-100 mt-1 max-w-[200px]">
            Answer 3 quick review questions to refill +1 Heart for free!
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveSubView('heartDrill')}
          className="px-4 py-3 rounded-2xl bg-white text-rose-600 font-duo font-bold text-xs shadow-md btn-3d border-rose-200 cursor-pointer"
        >
          +1 ❤️ Drill
        </button>
      </div>

      {/* 2. Specialized Practice Modules */}
      <div className="space-y-3">
        <h3 className="font-duo font-bold text-base text-slate-900 dark:text-white">
          Deep Dive Workshops
        </h3>

        {[
          {
            id: 'alphabet',
            title: 'Lao Script & Handwriting',
            desc: 'Trace 27 consonants, vowels, and master stroke order',
            icon: BookOpen,
            color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          },
          {
            id: 'tones',
            title: 'Tone Master & Pitch Synthesizer',
            desc: 'Live syllable analyzer and formant pitch curves',
            icon: Music,
            color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
          },
          {
            id: 'speaking',
            title: 'Conversational Speaking Studio',
            desc: 'Real-world dialogues & mic recording comparison',
            icon: MessageSquare,
            color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
          },
          {
            id: 'reading',
            title: 'Graded Reader & Token Decoder',
            desc: 'Click-to-lookup stories from beginner to intermediate',
            icon: BookOpen,
            color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
          },
          {
            id: 'phrasebook',
            title: 'Searchable Lao Phrasebook',
            desc: 'Market, food, travel & emergency phrases',
            icon: BookMarked,
            color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubView(item.id)}
              className="w-full p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between text-left btn-3d shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-duo font-bold text-sm text-slate-800 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
