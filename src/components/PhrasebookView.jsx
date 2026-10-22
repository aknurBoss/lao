import React, { useState } from 'react';
import { VOCAB_WORDS, VOCAB_CATEGORIES } from '../data/vocabData';
import { audioEngine } from '../services/audioService';
import { telegramService } from '../services/telegramService';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Volume2,
  Turtle,
} from 'lucide-react';

export default function PhrasebookView({ onAwardXP }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_saved_phrases') || '[]');
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id) => {
    telegramService.hapticImpact('light');
    let updated;
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter((item) => item !== id);
    } else {
      updated = [...bookmarkedIds, id];
      if (onAwardXP) onAwardXP(2);
    }
    setBookmarkedIds(updated);
    localStorage.setItem('lao_saved_phrases', JSON.stringify(updated));
  };

  const filteredPhrases = VOCAB_WORDS.filter((p) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'saved'
        ? bookmarkedIds.includes(p.id)
        : p.category === activeCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.ruTrans.toLowerCase().includes(query) ||
      p.latTrans.toLowerCase().includes(query) ||
      p.ruMeaning.toLowerCase().includes(query) ||
      (p.literal && p.literal.toLowerCase().includes(query)) ||
      (p.pronunciationHint && p.pronunciationHint.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-100 font-duo">
          Словарь и Разговорник с озвучкой
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-duo mt-0.5">
          Все нужные слова по транскрипции
        </h1>
        <p className="mt-1 text-sky-100 text-xs sm:text-sm">
          Нажимайте 🔊 для обычного произношения или 🐢 чтобы услышать слово медленно по слогам!
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по-русски или по транскрипции (привет, спасибо, вода, скидка, сабайди...)"
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Все слова ({VOCAB_WORDS.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('saved')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
              activeCategory === 'saved'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ⭐ Избранное ({bookmarkedIds.length})
          </button>

          {VOCAB_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Words List */}
      <div className="space-y-3">
        {filteredPhrases.map((word) => {
          const isSaved = bookmarkedIds.includes(word.id);
          return (
            <div
              key={word.id}
              onClick={() => {
                telegramService.hapticImpact('light');
                audioEngine.speakText(word, 0.85);
              }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 rounded-3xl p-4 sm:p-5 shadow-xs transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {word.ruTrans}
                    </h3>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-slate-400">
                      [{word.latTrans}]
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {word.tone}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {word.ruMeaning}
                  </p>
                </div>

                {/* Audio & Bookmark Buttons */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      telegramService.hapticImpact('light');
                      audioEngine.speakText(word, 0.55);
                    }}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 transition cursor-pointer"
                    title="Медленно по слогам"
                  >
                    <Turtle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      telegramService.hapticImpact('light');
                      audioEngine.speakText(word, 0.85);
                    }}
                    className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition cursor-pointer"
                    title="Прослушать произношение"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleBookmark(word.id)}
                    className={`p-2.5 rounded-xl transition cursor-pointer ${
                      isSaved
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSaved ? 'Убрать из избранного' : 'В избранное'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Pronunciation & Literal Breakdown */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {word.pronunciationHint && (
                  <p>
                    💡 <strong>Произношение:</strong> {word.pronunciationHint}
                  </p>
                )}
                {word.literal && (
                  <p className="text-slate-400">
                    🧩 <strong>Дословно:</strong> {word.literal}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredPhrases.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            По запросу «{searchQuery}» ничего не найдено.
          </div>
        )}
      </div>
    </div>
  );
}
