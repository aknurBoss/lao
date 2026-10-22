import React, { useState } from 'react';
import { TONE_DEFINITIONS, TONE_RULES_TABLE } from '../data/tones';
import { analyzeSyllable } from '../services/toneCalculator';
import AudioPlayerButton from './AudioPlayerButton';
import { audioEngine } from '../services/audioService';
import { Music, Calculator, Sparkles, Check, ArrowRight, BookOpen, Volume2 } from 'lucide-react';

export default function ToneMasterView({ onAwardXP }) {
  const [inputSyllable, setInputSyllable] = useState('ບ້ານ');
  const [activeAnalysis, setActiveAnalysis] = useState(() => analyzeSyllable('ບ້ານ'));

  const handleCalculate = (syllable) => {
    setInputSyllable(syllable);
    const result = analyzeSyllable(syllable);
    setActiveAnalysis(result);
  };

  const sampleWords = [
    { word: 'ກາ', label: 'Mid (Live Mid)' },
    { word: 'ຂາ', label: 'Rising (Live High)' },
    { word: 'ມາ', label: 'High (Live Low)' },
    { word: 'ໄກ່', label: 'Low (Mid + May Ek)' },
    { word: 'ບ້ານ', label: 'High-Falling (Mid + May Tho)' },
    { word: 'ແມ່', label: 'Low-Falling (Low + May Ek)' },
    { word: 'ໝາ', label: 'Rising (Compound High)' },
    { word: 'ເຂົ້າ', label: 'High-Falling (High + May Tho)' },
  ];

  return (
    <div className="space-y-8">
      {/* View Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Music className="w-3.5 h-3.5" />
            ລະບົບສຽງວັນນະຍຸດ (Lao Tone Master)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            6 Lao Tones & Interactive Syllable Decoder
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            In Lao, changing the pitch completely changes the meaning. Use the live tone calculator to instantly decipher the exact tone of any word using Lao phonological rules!
          </p>
        </div>

        <div className="absolute -right-4 -bottom-10 opacity-15 text-9xl font-lao font-bold pointer-events-none select-none">
          ່້໊໋
        </div>
      </div>

      {/* 1. INTERACTIVE LIVE SYLLABLE DECODER / TONE CALCULATOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Calculator className="w-4 h-4" /> Live Tool
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Lao Syllable Tone Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Type or select any Lao word to inspect its consonant class, vowel length, ending, and calculated tone pitch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Quick examples:</span>
            {sampleWords.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => handleCalculate(item.word)}
                className={`px-2.5 py-1 rounded-lg text-xs font-lao font-medium transition cursor-pointer ${
                  inputSyllable === item.word
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative w-full">
            <input
              type="text"
              value={inputSyllable}
              onChange={(e) => handleCalculate(e.target.value)}
              placeholder="Type any Lao syllable, e.g. ບ້ານ, ໄກ່, ຂາ..."
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-lao text-2xl focus:border-rose-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Decoder Output Result */}
        {activeAnalysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Result Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Resulting Tone
                </span>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-3xl font-extrabold text-white">
                    {activeAnalysis.tone.name}
                  </h3>
                  <span className="text-sm font-mono px-2.5 py-1 rounded-lg bg-white/10 text-rose-300 font-bold">
                    {activeAnalysis.tone.pitchNumber}
                  </span>
                </div>
                <p className="font-lao text-lg font-medium text-indigo-200 mt-1">
                  {activeAnalysis.tone.nameLao}
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {activeAnalysis.tone.description}
                </p>
              </div>

              {/* Audio buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => audioEngine.playToneContour(activeAnalysis.tone.id)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Music className="w-4 h-4" /> Play Pitch Curve ({activeAnalysis.tone.ipaSymbol})
                </button>
                <button
                  type="button"
                  onClick={() => audioEngine.speakText(activeAnalysis.syllable)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" /> Speak Word
                </button>
              </div>
            </div>

            {/* Right Breakdown Components */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  1. Initial Consonant
                </span>
                <div className="flex items-center gap-2 my-1">
                  <span className="font-lao text-3xl font-bold text-slate-800 dark:text-white">
                    {activeAnalysis.initial || '-'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {activeAnalysis.consonantClass} Class
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeAnalysis.isCompound ? 'Raised by ຫ prefix to High class' : 'Base class'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  2. Tone Mark
                </span>
                <div className="flex items-center gap-2 my-1">
                  <span className="font-lao text-2xl font-bold text-slate-800 dark:text-white">
                    {activeAnalysis.toneMarkName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeAnalysis.toneMark ? 'Overrules natural tone' : 'Uses inherent live/dead rule'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  3. Ending / Coda
                </span>
                <div className="flex items-center gap-2 my-1">
                  <span className="text-base font-bold capitalize text-slate-800 dark:text-white">
                    {activeAnalysis.endingType} Syllable
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeAnalysis.endingReason}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  4. Why this tone?
                </span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 my-1 leading-snug">
                  {activeAnalysis.explanation}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Follows Lao Standard Rule
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            Enter a Lao syllable above to see the calculation breakdown.
          </div>
        )}
      </div>

      {/* 2. ALL 6 LAO TONES - VISUAL PITCH CONTOURS & AUDIO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              The 6 Tones of Vientiane Lao
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Listen to the characteristic pitch contours and practice speaking along
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(TONE_DEFINITIONS).map((t) => (
            <div
              key={t.id}
              className={`rounded-2xl p-5 border shadow-sm transition hover:shadow-md flex flex-col justify-between ${t.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/10">
                    {t.pitchNumber}
                  </span>
                  <span className="text-lg font-lao font-bold">{t.ipaSymbol}</span>
                </div>

                <h3 className="text-lg font-bold">{t.name}</h3>
                <h4 className="font-lao text-sm font-semibold opacity-90">{t.nameLao}</h4>
                <p className="text-xs mt-2.5 opacity-85 leading-relaxed">{t.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/15 flex items-center justify-between">
                <span className="text-xs font-lao font-medium">Eg: {t.exampleWord}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => audioEngine.playToneContour(t.id)}
                    className="p-2 rounded-xl bg-current/10 hover:bg-current/20 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                    title={`Hear pitch for ${t.name}`}
                  >
                    <Music className="w-3.5 h-3.5" /> Pitch
                  </button>
                  <AudioPlayerButton text={t.exampleWord.split(' ')[0]} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TONE DETERMINATION RULES TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-500" />
          Tone Determination Matrix Table
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Reference table summarizing the interaction between Consonant Class, Syllable Ending, and Tone Marks:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                <th className="py-3 px-3 font-semibold">Consonant Class</th>
                <th className="py-3 px-3 font-semibold">Live Syllable (No Mark)</th>
                <th className="py-3 px-3 font-semibold">Dead Short Vowel</th>
                <th className="py-3 px-3 font-semibold">Dead Long Vowel</th>
                <th className="py-3 px-3 font-semibold">With ໄມ້ເອກ ( ່ )</th>
                <th className="py-3 px-3 font-semibold">With ໄມ້ໂທ ( ້ )</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TONE_RULES_TABLE.map((row) => (
                <tr key={row.consonantClass} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                    {row.consonantClass}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{row.noMarkLive.tone}</span>
                    <span className="block text-[11px] text-slate-400 font-lao">{row.noMarkLive.example}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{row.noMarkDeadShort.tone}</span>
                    <span className="block text-[11px] text-slate-400 font-lao">{row.noMarkDeadShort.example}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{row.noMarkDeadLong.tone}</span>
                    <span className="block text-[11px] text-slate-400 font-lao">{row.noMarkDeadLong.example}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{row.mayEk.tone}</span>
                    <span className="block text-[11px] text-slate-400 font-lao">{row.mayEk.example}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{row.mayTho.tone}</span>
                    <span className="block text-[11px] text-slate-400 font-lao">{row.mayTho.example}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
