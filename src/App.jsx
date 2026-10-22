import React, { useState, useEffect, useRef } from 'react';
import DuoTopBar from './components/DuoTopBar';
import DuoNavBar from './components/DuoNavBar';
import DuoPath from './components/DuoPath';
import LessonModal from './components/LessonModal';
import FlashcardsTrainerView from './components/FlashcardsTrainerView';
import PhrasebookView from './components/PhrasebookView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import TelegramAuthScreen from './components/TelegramAuthScreen';
import { telegramService } from './services/telegramService';
import { syncService, mergeStates } from './services/syncService';

export default function App() {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'cards' | 'dictionary' | 'leaderboard' | 'profile'
  const [activeLesson, setActiveLesson] = useState(null);
  const [syncId, setSyncId] = useState(() => syncService.getSyncId());
  const [isAuthenticated, setIsAuthenticated] = useState(() => syncService.isAuthenticated());
  const [qrBannerMsg, setQrBannerMsg] = useState('');

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

  const [mistakeWords, setMistakeWords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_mistake_words') || '[]');
    } catch {
      return [];
    }
  });

  const [srsData, setSrsData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_srs_data') || '{}');
    } catch {
      return {};
    }
  });

  const [savedPhrases, setSavedPhrases] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_saved_phrases') || '[]');
    } catch {
      return [];
    }
  });

  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const [revokedSessionIds, setRevokedSessionIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laolingo_revoked_sessions') || '[]');
    } catch {
      return [];
    }
  });

  const isInitialMount = useRef(true);
  const suppressNextPush = useRef(false);

  const handleSessionRevoked = () => {
    syncService.logoutLocalSession();
    setSyncId('');
    setIsAuthenticated(false);
  };

  const applyMergedState = (merged, fromRemoteLive = false) => {
    if (!merged) return;

    if (merged.__sessionRevoked) {
      handleSessionRevoked();
      return;
    }

    if (
      !telegramService.isInsideTelegram() &&
      Array.isArray(merged.revokedSessionIds) &&
      merged.revokedSessionIds.includes(syncService.getSessionId())
    ) {
      handleSessionRevoked();
      return;
    }

    if (fromRemoteLive) {
      suppressNextPush.current = true;
    }
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
    if (Array.isArray(merged.mistakeWords)) {
      setMistakeWords(merged.mistakeWords);
    }
    if (merged.srsData && typeof merged.srsData === 'object') {
      setSrsData(merged.srsData);
    }
    if (Array.isArray(merged.savedPhrases)) {
      setSavedPhrases(merged.savedPhrases);
    }
    if (Array.isArray(merged.sessions)) {
      setSessions(merged.sessions);
    }
    if (Array.isArray(merged.revokedSessionIds)) {
      setRevokedSessionIds(merged.revokedSessionIds);
    }
    if (merged.lang === 'en' || merged.lang === 'ru') {
      setLang(merged.lang);
    }
  };

  const getCurrentSnapshot = () => ({
    xp,
    streak,
    hearts,
    gems,
    streakFreezeActive,
    completedLessons,
    unlockedChests,
    learnedWords,
    mistakeWords,
    srsData,
    savedPhrases,
    sessions,
    revokedSessionIds,
    lang,
    updatedAt: Number(localStorage.getItem('laolingo_updated_at') || Date.now()),
  });

  // Initial sync on load (URL Magic Link + QR Approval + Telegram CloudStorage + Cloud KV)
  useEffect(() => {
    const currentSnapshot = getCurrentSnapshot();
    const urlState = syncService.consumeUrlSyncData();
    const activeSyncId = syncService.getSyncId();
    setSyncId(activeSyncId);
    const authed = syncService.isAuthenticated();
    setIsAuthenticated(authed);

    // Check if user scanned a Laptop QR Code (?approveQr=QR-...)
    let pendingQrChallenge = null;
    try {
      const params = new URLSearchParams(window.location.search);
      pendingQrChallenge = params.get('approveQr');
      if (pendingQrChallenge) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}

    if (!authed) {
      isInitialMount.current = false;
      return;
    }

    const baseState = urlState ? mergeStates(currentSnapshot, urlState) : currentSnapshot;
    if (urlState) {
      applyMergedState(baseState, true);
    }

    if (pendingQrChallenge && pendingQrChallenge.startsWith('QR-')) {
      syncService.approveLaptopQrChallenge(pendingQrChallenge, baseState).then(() => {
        setQrBannerMsg(
          lang === 'ru'
            ? '✅ Вход на ноутбуке по QR-коду успешно подтверждён!'
            : '✅ Laptop QR Login successfully approved!'
        );
        setTimeout(() => setQrBannerMsg(''), 5000);
      });
    }

    syncService.syncAll(baseState).then((remoteMerged) => {
      if (remoteMerged) {
        applyMergedState(remoteMerged, true);
      }
      isInitialMount.current = false;
    });
  }, []);

  // Subscribe to real-time SSE updates for the active syncId
  useEffect(() => {
    if (!isAuthenticated || !syncId) return;

    const unsubscribe = syncService.subscribeLiveUpdates((remoteState) => {
      if (
        !telegramService.isInsideTelegram() &&
        Array.isArray(remoteState.revokedSessionIds) &&
        remoteState.revokedSessionIds.includes(syncService.getSessionId())
      ) {
        handleSessionRevoked();
        return;
      }

      const localSnapshot = {
        xp: Number(localStorage.getItem('laolingo_xp') || 0),
        streak: Number(localStorage.getItem('laolingo_streak') || 0),
        hearts: Number(localStorage.getItem('laolingo_hearts') || 5),
        gems: Number(localStorage.getItem('laolingo_gems') || 100),
        streakFreezeActive: localStorage.getItem('laolingo_streak_freeze') === 'true',
        completedLessons: JSON.parse(localStorage.getItem('laolingo_completed_lessons') || '[]'),
        unlockedChests: JSON.parse(localStorage.getItem('laolingo_unlocked_chests') || '[]'),
        learnedWords: JSON.parse(localStorage.getItem('laolingo_learned_words') || '[]'),
        mistakeWords: JSON.parse(localStorage.getItem('laolingo_mistake_words') || '[]'),
        srsData: JSON.parse(localStorage.getItem('laolingo_srs_data') || '{}'),
        savedPhrases: JSON.parse(localStorage.getItem('laolingo_saved_phrases') || '[]'),
        sessions: JSON.parse(localStorage.getItem('laolingo_sessions') || '[]'),
        revokedSessionIds: JSON.parse(localStorage.getItem('laolingo_revoked_sessions') || '[]'),
        lang: localStorage.getItem('laolingo_lang') || 'ru',
        updatedAt: Number(localStorage.getItem('laolingo_updated_at') || 0),
      };
      const merged = mergeStates(localSnapshot, remoteState);
      applyMergedState(merged, true);
    });
    return () => unsubscribe();
  }, [syncId, isAuthenticated]);

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
    localStorage.setItem('laolingo_mistake_words', JSON.stringify(mistakeWords));
    localStorage.setItem('laolingo_srs_data', JSON.stringify(srsData));
    localStorage.setItem('laolingo_saved_phrases', JSON.stringify(savedPhrases));
    localStorage.setItem('laolingo_sessions', JSON.stringify(sessions));
    localStorage.setItem('laolingo_revoked_sessions', JSON.stringify(revokedSessionIds));

    const now = Date.now();
    localStorage.setItem('laolingo_updated_at', now.toString());

    if (!isAuthenticated || isInitialMount.current) return;
    if (suppressNextPush.current) {
      suppressNextPush.current = false;
      return;
    }

    const payload = {
      xp,
      streak,
      hearts,
      gems,
      streakFreezeActive,
      completedLessons,
      unlockedChests,
      learnedWords,
      mistakeWords,
      srsData,
      savedPhrases,
      sessions,
      revokedSessionIds,
      lang,
      updatedAt: now,
    };

    const timer = setTimeout(() => {
      syncService.saveToTelegramCloud(payload);
      syncService.pushToCloudKV(payload);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    lang,
    hearts,
    gems,
    streak,
    streakFreezeActive,
    xp,
    completedLessons,
    unlockedChests,
    learnedWords,
    mistakeWords,
    srsData,
    savedPhrases,
    sessions,
    revokedSessionIds,
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

  const handleRecordMistake = (wordId) => {
    if (!wordId) return;
    setMistakeWords((prev) => (prev.includes(wordId) ? prev : [...prev, wordId]));
    setSrsData((prev) => ({
      ...prev,
      [wordId]: {
        box: 1,
        lastReviewed: Date.now(),
        nextReview: Date.now() + 60 * 1000,
      },
    }));
  };

  const handleFinishLesson = (lesson, isPerfect) => {
    const gainedXp = lesson.xpReward + (isPerfect ? 5 : 0);
    const gainedGems = lesson.gemReward;

    setXp((prev) => prev + gainedXp);
    setGems((prev) => prev + gainedGems);
    setStreak((prev) => (prev === 0 ? 1 : prev));

    // If this was a Smart Review / Mistakes Review lesson, clear reviewed mistakes, advance SRS box, and restore +1 heart
    if (lesson.isReviewLesson) {
      if (Array.isArray(lesson.reviewedWordIds) && lesson.reviewedWordIds.length > 0) {
        setMistakeWords((prev) =>
          prev.filter((id) => !lesson.reviewedWordIds.includes(id))
        );
        setSrsData((prev) => {
          const next = { ...prev };
          for (const wid of lesson.reviewedWordIds) {
            const currentBox = next[wid]?.box || 1;
            const newBox = Math.min(4, currentBox + 1);
            next[wid] = {
              box: newBox,
              lastReviewed: Date.now(),
              nextReview: Date.now() + 24 * 60 * 60 * 1000,
            };
          }
          return next;
        });
      }
      setHearts((prev) => Math.min(5, prev + 1));
      return;
    }

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

  const handleSyncWithCode = async (targetCode, directData = null) => {
    const currentSnapshot = getCurrentSnapshot();
    const merged = await syncService.syncAll(currentSnapshot, targetCode, directData);
    setSyncId(syncService.getSyncId());
    setIsAuthenticated(true);
    applyMergedState(merged, true);
  };

  const handleRegisterMasterTelegram = async (tgUsername) => {
    telegramService.setAsMasterTelegram(tgUsername);
    const newSyncId = syncService.initSyncId();
    setSyncId(newSyncId);
    setIsAuthenticated(true);
    const currentSnapshot = getCurrentSnapshot();
    const merged = await syncService.syncAll(currentSnapshot, newSyncId);
    applyMergedState(merged, true);
  };

  const handleTerminateSession = async (targetSessionId) => {
    const updated = await syncService.terminateSession(
      targetSessionId,
      getCurrentSnapshot()
    );
    applyMergedState(updated, true);
  };

  const handleTerminateAllOtherSessions = async () => {
    const updated = await syncService.terminateAllOtherSessions(getCurrentSnapshot());
    applyMergedState(updated, true);
  };

  const handleLogoutLaptop = async () => {
    const mySessionId = syncService.getSessionId();
    await syncService.terminateSession(mySessionId, getCurrentSnapshot());
    handleSessionRevoked();
  };

  // Require Telegram Authentication before using the app
  if (!isAuthenticated) {
    return (
      <TelegramAuthScreen
        lang={lang}
        setLang={setLang}
        onLoginWithTelegramCode={handleSyncWithCode}
        onRegisterMasterTelegram={handleRegisterMasterTelegram}
      />
    );
  }

  const currentStateForLink = getCurrentSnapshot();

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

            {qrBannerMsg && (
              <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500 text-white text-xs font-duo font-bold text-center shadow-md">
                {qrBannerMsg}
              </div>
            )}

            <main className="flex-1 pb-24 md:pb-12">
              {activeTab === 'path' && (
                <DuoPath
                  completedLessons={completedLessons}
                  onStartLesson={(lesson) => setActiveLesson(lesson)}
                  unlockedChests={unlockedChests}
                  onUnlockChest={handleUnlockChest}
                  lang={lang}
                  mistakeWords={mistakeWords}
                  learnedWords={learnedWords}
                />
              )}

              {activeTab === 'cards' && (
                <FlashcardsTrainerView
                  lang={lang}
                  learnedIds={learnedWords}
                  onUpdateLearnedIds={setLearnedWords}
                  mistakeWords={mistakeWords}
                  onUpdateMistakeWords={setMistakeWords}
                  srsData={srsData}
                  onUpdateSrsData={setSrsData}
                  onStartLesson={(lesson) => setActiveLesson(lesson)}
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
                  sessions={sessions}
                  onSyncWithCode={handleSyncWithCode}
                  onTerminateSession={handleTerminateSession}
                  onTerminateAllOtherSessions={handleTerminateAllOtherSessions}
                  onLogoutLaptop={handleLogoutLaptop}
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
                onRecordMistake={handleRecordMistake}
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
