import React, { useState, useEffect, useRef } from 'react';
import DuoTopBar from './components/DuoTopBar';
import DuoNavBar from './components/DuoNavBar';
import DuoPath from './components/DuoPath';
import LessonModal from './components/LessonModal';
import FlashcardsTrainerView from './components/FlashcardsTrainerView';
import PhrasebookView from './components/PhrasebookView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import { telegramService } from './services/telegramService';
import { syncService, mergeStates } from './services/syncService';

export default function App() {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'cards' | 'dictionary' | 'leaderboard' | 'profile'
  const [activeLesson, setActiveLesson] = useState(null);
  const [syncId, setSyncId] = useState(() => syncService.getSyncId());

  // Bilingual support: 'ru' | 'en'
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('laolingo_lang');
      if (saved === 'en' || saved === 'ru') return saved;
      const tgUser = telegramService.getUser();
      if (tgUser?.languageCode && tgUser.languageCode.startsWith('en')) return 'en';
      return 'ru';
    } catch {
      return 'ru';
    }
  });

  // Real user state (0 demo data)
  const [hearts, setHearts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('laolingo_hearts') || '5', 10);
    } catch {
      return 5;
    }
  });

  const [gems, setGems] = useState(() => {
    try {
      return parseInt(localStorage.getItem('laolingo_gems') || '100', 10);
    } catch {
      return 100;
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('laolingo_streak') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [streakFreezeActive, setStreakFreezeActive] = useState(() => {
    try {
      return localStorage.getItem('laolingo_streak_freeze') === 'true';
    } catch {
      return false;
    }
  });

  const [xp, setXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem('laolingo_xp') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_completed_lessons') || '[]');
    } catch {
      return [];
    }
  });

  const [unlockedChests, setUnlockedChests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_unlocked_chests') || '[]');
    } catch {
      return [];
    }
  });

  const [learnedWords, setLearnedWords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_learned_words') || '[]');
    } catch {
      return [];
    }
  });

  const [savedPhrases, setSavedPhrases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_saved_phrases') || '[]');
    } catch {
      return [];
    }
  });

  const isInitialMount = useRef(true);

  const applyMergedState = (merged) => {
    if (!merged) return;
    if (typeof merged.xp === 'number') setXp(merged.xp);
    if (typeof merged.streak === 'number') setStreak(merged.streak);
    if (typeof merged.hearts === 'number') setHearts(merged.hearts);
    if (typeof merged.gems === 'number') setGems(merged.gems);
    if (typeof merged.streakFreezeActive === 'boolean') {
      setStreakFreezeActive(merged.streakFreezeActive);
    }
    if (Array.isArray(merged.completedLessons)) {
      setCompletedLessons(merged.completedLessons);
    }
    if (Array.isArray(merged.unlockedChests)) {
      setUnlockedChests(merged.unlockedChests);
    }
    if (Array.isArray(merged.learnedWords)) {
      setLearnedWords(merged.learnedWords);
    }
    if (Array.isArray(merged.savedPhrases)) {
      setSavedPhrases(merged.savedPhrases);
    }
    if (merged.lang === 'en' || merged.lang === 'ru') {
      setLang(merged.lang);
    }
  };

  // Initial sync on load (URL Magic Link + Telegram CloudStorage + Cloud KV)
  useEffect(() => {
    const currentSnapshot = {
      xp,
      streak,
      hearts,
      gems,
      streakFreezeActive,
      completedLessons,
      unlockedChests,
      learnedWords,
      savedPhrases,
      lang,
      updatedAt: Number(localStorage.getItem('laolingo_updated_at') || 0),
    };

    const urlState = syncService.consumeUrlSyncData();
    setSyncId(syncService.getSyncId());

    const baseState = urlState ? mergeStates(currentSnapshot, urlState) : currentSnapshot;
    if (urlState) {
      applyMergedState(baseState);
    }

    syncService.syncAll(baseState).then((remoteMerged) => {
      if (remoteMerged) {
        applyMergedState(remoteMerged);
      }
      isInitialMount.current = false;
    });
  }, []);

  // Save to localStorage and sync to Cloud whenever state updates
  useEffect(() => {
    localStorage.setItem('laolingo_lang', lang);
    localStorage.setItem('laolingo_hearts', hearts.toString());
    localStorage.setItem('laolingo_gems', gems.toString());
    localStorage.setItem('laolingo_streak', streak.toString());
    localStorage.setItem('laolingo_streak_freeze', streakFreezeActive.toString());
    localStorage.setItem('laolingo_xp', xp.toString());
    localStorage.setItem('laolingo_completed_lessons', JSON.stringify(completedLessons));
    localStorage.setItem('laolingo_unlocked_chests', JSON.stringify(unlockedChests));
    localStorage.setItem('laolingo_learned_words', JSON.stringify(learnedWords));
    localStorage.setItem('laolingo_saved_phrases', JSON.stringify(savedPhrases));

    const now = Date.now();
    localStorage.setItem('laolingo_updated_at', now.toString());

    if (isInitialMount.current) return;

    const payload = {
      xp,
      streak,
      hearts,
      gems,
      streakFreezeActive,
      completedLessons,
      unlockedChests,
      learnedWords,
      savedPhrases,
      lang,
      updatedAt: now,
    };

    const timer = setTimeout(() => {
      syncService.saveToTelegramCloud(payload);
      syncService.pushToCloudKV(payload);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    lang,
    hearts,
    gems,
    streak,
    streakFreezeActive,
    xp,
    completedLessons,
    unlockedChests,
    learnedWords,
    savedPhrases,
  ]);

  useEffect(() => {
    if (activeLesson) {
      telegramService.setupBackButton(() => setActiveLesson(null));
    } else {
      telegramService.hideBackButton();
    }
  }, [activeLesson]);

  const handleAwardXP = (amount) => {
    setXp((prev) => prev + amount);
    setStreak((prev) => (prev === 0 ? 1 : prev));
  };

  const handleFinishLesson = (lesson, isPerfect) => {
    const gainedXp = lesson.xpReward + (isPerfect ? 5 : 0);
    const gainedGems = lesson.gemReward;

    setXp((prev) => prev + gainedXp);
    setGems((prev) => prev + gainedGems);
    setStreak((prev) => (prev === 0 ? 1 : prev));

    if (!completedLessons.includes(lesson.id)) {
      setCompletedLessons((prev) => [...prev, lesson.id]);
    }
  };

  const handleUnlockChest = (unit) => {
    if (!unlockedChests.includes(unit.id)) {
      setUnlockedChests((prev) => [...prev, unit.id]);
      setGems((prev) => prev + unit.chestRewardGems);
    }
  };

  const handleSyncWithCode = async (targetCode) => {
    const currentSnapshot = {
      xp,
      streak,
      hearts,
      gems,
      streakFreezeActive,
      completedLessons,
      unlockedChests,
      learnedWords,
      savedPhrases,
      lang,
      updatedAt: Date.now(),
    };
    const merged = await syncService.syncAll(currentSnapshot, targetCode);
    setSyncId(syncService.getSyncId());
    applyMergedState(merged);
  };

  const currentStateForLink = {
    xp,
    streak,
    hearts,
    gems,
    streakFreezeActive,
    completedLessons,
    unlockedChests,
    learnedWords,
    savedPhrases,
    lang,
    updatedAt: Date.now(),
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-col md:flex-row min-h-screen">
        <DuoNavBar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          <div className="flex-1 flex flex-col min-h-screen">
            <DuoTopBar
              hearts={hearts}
              gems={gems}
              streak={streak}
              streakFreezeActive={streakFreezeActive}
              onOpenShop={() => setActiveTab('profile')}
              lang={lang}
              setLang={setLang}
            />

            <main className="flex-1 pb-24 md:pb-12">
              {activeTab === 'path' && (
                <DuoPath
                  completedLessons={completedLessons}
                  onStartLesson={(lesson) => setActiveLesson(lesson)}
                  unlockedChests={unlockedChests}
                  onUnlockChest={handleUnlockChest}
                  lang={lang}
                />
              )}

              {activeTab === 'cards' && (
                <FlashcardsTrainerView
                  lang={lang}
                  learnedIds={learnedWords}
                  onUpdateLearnedIds={setLearnedWords}
                  onAwardXP={(amount) => {
                    handleAwardXP(amount);
                    if (hearts < 5) setHearts((prev) => Math.min(5, prev + 1));
                  }}
                />
              )}

              {activeTab === 'dictionary' && (
                <PhrasebookView
                  lang={lang}
                  bookmarkedIds={savedPhrases}
                  onUpdateBookmarkedIds={setSavedPhrases}
                  onAwardXP={(amount) => handleAwardXP(amount)}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView
                  userXp={xp}
                  streak={streak}
                  completedLessonsCount={completedLessons.length}
                  learnedWordsCount={learnedWords.length}
                  lang={lang}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  xp={xp}
                  streak={streak}
                  hearts={hearts}
                  setHearts={setHearts}
                  gems={gems}
                  setGems={setGems}
                  streakFreezeActive={streakFreezeActive}
                  setStreakFreezeActive={setStreakFreezeActive}
                  completedLessonsCount={completedLessons.length}
                  lang={lang}
                  setLang={setLang}
                  syncId={syncId}
                  onSyncWithCode={handleSyncWithCode}
                  currentStateForLink={currentStateForLink}
                />
              )}
            </main>

            {activeLesson && (
              <LessonModal
                lesson={activeLesson}
                hearts={hearts}
                setHearts={setHearts}
                gems={gems}
                setGems={setGems}
                onFinishLesson={handleFinishLesson}
                onClose={() => setActiveLesson(null)}
                lang={lang}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
