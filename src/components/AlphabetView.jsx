import React, { useState } from 'react';
import { CONSONANTS, COMPOUND_CONSONANTS, CONSONANT_CLASSES } from '../data/consonants';
import { VOWELS } from '../data/vowels';
import { TONE_MARKS } from '../data/tones';
import AudioPlayerButton from './AudioPlayerButton';
import DrawingCanvas from './DrawingCanvas';
import { Volume2, PenTool, X, Filter, BookOpen, Sparkles, CheckCircle } from 'lucide-react';

export default function AlphabetView({ onAwardXP }) {
  const [activeTab, setActiveTab] = useState('consonants'); // 'consonants' | 'vowels' | 'toneMarks'
  const [consonantFilter, setConsonantFilter] = useState('all'); // 'all' | 'high' | 'middle' | 'low' | 'compound'
  const [vowelFilter, setVowelFilter] = useState('all'); // 'all' | 'short' | 'long' | 'special'
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [masteredLetters, setMasteredLetters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_mastered_letters') || '[]');
    } catch {
      return [];
    }
  });

  const handleLetterMastered = (char) => {
    if (!masteredLetters.includes(char)) {
      const updated = [...masteredLetters, char];
      setMasteredLetters(updated);
      localStorage.setItem('lao_mastered_letters', JSON.stringify(updated));
      if (onAwardXP) onAwardXP(10);
    }
  };

  const filteredConsonants = () => {
    if (consonantFilter === 'compound') return COMPOUND_CONSONANTS;
    if (consonantFilter === 'all') return CONSONANTS;
    return CONSONANTS.filter((c) => c.class === consonantFilter);
  };

  const filteredVowels = () => {
    if (vowelFilter === 'all') return VOWELS;
    return VOWELS.filter((v) => v.length === vowelFilter);
  };

  const getClassBadge = (cls) => {
    const map = {
      high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
      middle: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300',
      low: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300',
    };
    return map[cls] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            ອັກສອນລາວ (Lao Script Foundation)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Consonants, Vowels & Tone Marks
          </h1>
          <p className="mt-2 text-rose-100 text-sm sm:text-base leading-relaxed">
            Master the Lao script step by step. Click any character to hear its authentic pronunciation, inspect its consonant class, and practice writing the stroke by hand!
          </p>
        </div>

        {/* Decorative Lao characters in background */}
        <div className="absolute -right-6 -bottom-10 opacity-15 text-9xl font-lao font-bold pointer-events-none select-none">
          ກຂຄ
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('consonants')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'consonants'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          ພະຍັນຊະນະ (Consonants - 27)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vowels')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'vowels'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          ສະຫຼະ (Vowels - 28)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('toneMarks')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 whitespace-nowrap transition cursor-pointer ${
            activeTab === 'toneMarks'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          ວັນນະຍຸດ (Tone Marks - 4)
        </button>
      </div>

      {/* CONSONANTS TAB */}
      {activeTab === 'consonants' && (
        <div className="space-y-5">
          {/* Class Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Consonants' },
              { id: 'middle', label: 'Middle Class (7)' },
              { id: 'high', label: 'High Class (6)' },
              { id: 'low', label: 'Low Class (14)' },
              { id: 'compound', label: 'Compounds (ຫ + ...)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setConsonantFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  consonantFilter === f.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Consonant Class Info Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 text-xs">
              <span className="font-bold text-sky-800 dark:text-sky-300 block mb-1">
                Middle Class (ອັກສອນກາງ)
              </span>
              Unmarked live syllable produces a comfortable <strong>Mid tone (˧)</strong>. Can take all 4 tone marks.
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                High Class (ອັກສອນສູງ)
              </span>
              Inherent <strong>Rising tone (˨˦)</strong> without tone mark! Forces words like ຂາ, ສາ to rise.
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                Low Class (ອັກສອນຕໍ່າ)
              </span>
              Inherent <strong>High tone (˥)</strong> in unmarked live syllables. Largest class (14 letters).
            </div>
          </div>

          {/* Grid of Consonants */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredConsonants().map((item) => {
              const isMastered = masteredLetters.includes(item.char);
              return (
                <div
                  key={item.char}
                  onClick={() => setSelectedLetter(item)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative"
                >
                  {isMastered && (
                    <span
                      className="absolute top-2.5 right-2.5 text-emerald-500"
                      title="Letter Mastered!"
                    >
                      <CheckCircle className="w-4 h-4 fill-emerald-100" />
                    </span>
                  )}

                  {/* Consonant Class badge */}
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border mb-2 ${getClassBadge(
                      item.class
                    )}`}
                  >
                    {item.class}
                  </span>

                  {/* Large Lao Character */}
                  <span className="font-lao text-5xl font-bold text-slate-800 dark:text-slate-100 my-1 group-hover:scale-110 transition-transform">
                    {item.char}
                  </span>

                  {/* Name and Meaning */}
                  <span className="font-lao text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
                    {item.nameLao}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-center truncate max-w-full">
                    {item.nameMeaning}
                  </span>

                  {/* Quick Audio & Trace Action */}
                  <div className="mt-3 w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <AudioPlayerButton text={item.audioWord || item.char} size="sm" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLetter(item);
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PenTool className="w-3 h-3" /> Practice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VOWELS TAB */}
      {activeTab === 'vowels' && (
        <div className="space-y-5">
          {/* Vowel Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Length:
            </span>
            {[
              { id: 'all', label: 'All Vowels' },
              { id: 'short', label: 'Short Vowels (ສຽງສັ້ນ)' },
              { id: 'long', label: 'Long Vowels (ສຽງຍາວ)' },
              { id: 'special', label: 'Special / Diphthongs' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setVowelFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  vowelFilter === f.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVowels().map((v) => (
              <div
                key={v.pattern}
                onClick={() =>
                  setSelectedLetter({
                    char: v.pattern,
                    nameLao: v.nameLao,
                    nameMeaning: v.sound,
                    class: v.length,
                    example: v.example,
                    audioWord: v.audioWord,
                    tip: v.description,
                  })
                }
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        v.length === 'short'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                          : v.length === 'long'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300'
                      }`}
                    >
                      {v.length} vowel
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Pos: {v.position}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <span className="font-lao text-4xl font-bold text-slate-900 dark:text-white">
                      {v.pattern}
                    </span>
                    <p className="font-lao text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                      {v.nameLao}
                    </p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Sound: {v.sound} ({v.ipa})
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {v.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-lao font-medium text-slate-600 dark:text-slate-400">
                    Eg: {v.example}
                  </span>
                  <AudioPlayerButton text={v.audioWord} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TONE MARKS TAB */}
      {activeTab === 'toneMarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TONE_MARKS.map((m) => (
              <div
                key={m.mark}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center font-lao text-4xl font-extrabold text-rose-600 dark:text-rose-400">
                    {m.mark}
                  </div>
                  <div>
                    <h3 className="font-lao text-lg font-bold text-slate-900 dark:text-white">
                      {m.nameLao}
                    </h3>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      {m.nameEnglish}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.description}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-lao flex items-center justify-between">
                  <span>
                    <strong>ຕົວຢ່າງ (Example):</strong> {m.example}
                  </span>
                  <AudioPlayerButton text={m.example.split(' ')[0]} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Letter Detail & Drawing Practice Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedLetter(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-lao text-5xl font-bold shadow-md">
                {selectedLetter.char}
              </div>
              <div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getClassBadge(
                    selectedLetter.class
                  )}`}
                >
                  {selectedLetter.class}
                </span>
                <h3 className="font-lao text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedLetter.nameLao}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedLetter.nameMeaning} • IPA: {selectedLetter.ipa}
                </p>
              </div>
            </div>

            {/* Pronunciation & details */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 mb-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Initial sound:</strong> {selectedLetter.initial || selectedLetter.sound}
                </span>
                {selectedLetter.final && (
                  <span>
                    <strong>Final sound:</strong> {selectedLetter.final}
                  </span>
                )}
                <AudioPlayerButton
                  text={selectedLetter.audioWord || selectedLetter.char}
                  label="Play Sound"
                  size="sm"
                />
              </div>
              {selectedLetter.tip && (
                <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  💡 {selectedLetter.tip}
                </p>
              )}
            </div>

            {/* Interactive Drawing Canvas */}
            <DrawingCanvas
              character={selectedLetter.char}
              charName={selectedLetter.nameLao}
              onComplete={(char) => handleLetterMastered(char)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
