import React, { useState } from 'react';
import { CONVERSATIONS } from '../data/conversations';
import AudioPlayerButton from './AudioPlayerButton';
import VoiceRecorder from './VoiceRecorder';
import { audioEngine } from '../services/audioService';
import { MessageSquare, Play, Users, Volume2, Sparkles, Check, HelpCircle } from 'lucide-react';

export default function SpeakingView({ onAwardXP }) {
  const [selectedConversation, setSelectedConversation] = useState(CONVERSATIONS[0]);
  const [showRom, setShowRom] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [activePracticeLine, setActivePracticeLine] = useState(null);
  const [practicedLines, setPracticedLines] = useState([]);

  const handleLineComplete = (index) => {
    if (!practicedLines.includes(index)) {
      const updated = [...practicedLines, index];
      setPracticedLines(updated);
      if (onAwardXP) onAwardXP(15);
    }
  };

  const playWholeDialogue = async () => {
    for (const turn of selectedConversation.dialogue) {
      audioEngine.speakText(turn.lao);
      // Wait roughly for speech duration
      await new Promise((r) => setTimeout(r, 2200));
    }
  };

  return (
    <div className="space-y-8">
      {/* View Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            ການຝຶກເວົ້າ (Lao Speaking & Conversation)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Conversational Lao & Speech Studio
          </h1>
          <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
            Listen to native dialogues, practice roleplaying each speaker, record your voice into your microphone, and compare your pronunciation in real-time!
          </p>
        </div>

        <div className="absolute -right-4 -bottom-10 opacity-15 text-9xl font-lao font-bold pointer-events-none select-none">
          ເວົ້າ
        </div>
      </div>

      {/* Conversation Selector Tabs */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
        {CONVERSATIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setSelectedConversation(c);
              setActivePracticeLine(null);
            }}
            className={`px-4 py-3 rounded-2xl text-left border transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
              selectedConversation.id === c.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="font-lao font-bold block text-sm">{c.title}</span>
            <span
              className={`text-xs block ${
                selectedConversation.id === c.id ? 'text-teal-100' : 'text-slate-400'
              }`}
            >
              {c.englishTitle} • {c.difficulty}
            </span>
          </button>
        ))}
      </div>

      {/* Main Conversation Viewer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Dialogue Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-lao text-2xl font-bold text-slate-900 dark:text-white">
                {selectedConversation.title}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {selectedConversation.difficulty}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {selectedConversation.context}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={playWholeDialogue}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Full Dialogue
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
              onClick={() => setShowEnglish(!showEnglish)}
              className={`px-3 py-2 rounded-xl font-medium text-xs border transition cursor-pointer ${
                showEnglish
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  : 'bg-transparent border-slate-200 text-slate-400'
              }`}
            >
              {showEnglish ? 'Hide English' : 'Show English'}
            </button>
          </div>
        </div>

        {/* Lines of Dialogue */}
        <div className="space-y-4">
          {selectedConversation.dialogue.map((turn, idx) => {
            const isSpeakerA = idx % 2 === 0;
            const isPracticed = practicedLines.includes(idx);
            const isPracticing = activePracticeLine === idx;

            return (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isPracticing
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                    : isSpeakerA
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-200/50 dark:border-teal-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSpeakerA
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {turn.speaker.slice(0, 1)}
                    </span>
                    <span className="font-lao font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {turn.speaker}
                    </span>
                    {isPracticed && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Practiced
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <AudioPlayerButton text={turn.lao} size="sm" />
                    <button
                      type="button"
                      onClick={() =>
                        setActivePracticeLine(isPracticing ? null : idx)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isPracticing
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {isPracticing ? 'Close Studio' : '🎙️ Practice Speaking'}
                    </button>
                  </div>
                </div>

                {/* Lao text */}
                <p className="font-lao text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                  {turn.lao}
                </p>

                {/* Romanization / Pronunciation */}
                {showRom && (
                  <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-1">
                    {turn.rom}
                  </p>
                )}

                {/* English translation */}
                {showEnglish && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {turn.english}
                  </p>
                )}

                {/* Pronunciation & Tone Tip */}
                {turn.toneTip && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{turn.toneTip}</span>
                  </div>
                )}

                {/* Dedicated voice recording drill modal inside this line */}
                {isPracticing && (
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                    <VoiceRecorder
                      targetPhrase={turn.lao}
                      targetRom={turn.rom}
                      onPracticeComplete={() => handleLineComplete(idx)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ESSENTIAL LAO SPEAKING & PRONUNCIATION TIPS */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-500" />
          Native Pronunciation Masterclass Tips
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Master these core acoustic secrets to speak natural, authentic Lao:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              1. Unaspirated Consonants (ກ, ຕ, ປ)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              In English, letters like P, T, and K release a small burst of air ("puff"). In Lao, <strong>ກ (k), ຕ (t), and ປ (p)</strong> are unaspirated—put your hand before your mouth; you should feel <em>zero air puff</em>! Like the "p" in "spin" or "k" in "skill".
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              2. Initial "Ng" (ງ ງູ)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              English only has "ng" at the ends of words (like "sing"). In Lao, words frequently <em>start</em> with ງ (like ງາມ - ngaam / beautiful). Say "si<strong>ng a</strong> song" quickly, then isolate the "nga" to nail it effortlessly!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              3. The Lao Smile Vowel "Ue" (ຶ / ື)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Found in essential words like ໜຶ່ງ (neung - one) or ຊື່ (seu - name). Smile broadly with teeth together, pull your tongue slightly back, and try saying "oo". It creates the unmistakable Lao vowel [ɯ]!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              4. Friendly Ending Particles (ເດີ, ເດ, ເນາະ)
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Lao speakers convey immense politeness and warmth through untranslatable particles: <strong>ເດີ (doe)</strong> softens requests; <strong>ເດ (de)</strong> asks "how about you?"; <strong>ເນາະ (naw)</strong> seeks agreement ("right?").
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
