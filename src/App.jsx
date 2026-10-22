import React, { useState, useEffect } from 'react';
import DuoTopBar from './components/DuoTopBar';
import DuoNavBar from './components/DuoNavBar';
import DuoPath from './components/DuoPath';
import LessonModal from './components/LessonModal';
import FlashcardsTrainerView from './components/FlashcardsTrainerView';
import PhrasebookView from './components/PhrasebookView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import { telegramService } from './services/telegramService';

export default function App() {
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'cards' | 'dictionary' | 'leaderboard' | 'profile'
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPhoneMockup, setIsPhoneMockup] = useState(false);

  const [hearts, setHearts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lao_user_hearts') || '5', 10);
    } catch {
      return 5;
    }
  });

  const [gems, setGems] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lao_user_gems') || '150', 10);
    } catch {
      return 150;
    }
  });

  const [streak, setStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lao_user_streak') || '2', 10);
    } catch {
      return 2;
    }
  });

  const [streakFreezeActive, setStreakFreezeActive] = useState(() => {
    try {
      return localStorage.getItem('lao_streak_freeze') === 'true';
    } catch {
      return false;
    }
  });

  const [xp, setXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lao_user_xp') || '45', 10);
    } catch {
      return 45;
    }
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_completed_lessons') || '[]');
    } catch {
      return [];
    }
  });

  const [unlockedChests, setUnlockedChests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lao_unlocked_chests') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lao_user_hearts', hearts.toString());
  }, [hearts]);

  useEffect(() => {
    localStorage.setItem('lao_user_gems', gems.toString());
  }, [gems]);

  useEffect(() => {
    localStorage.setItem('lao_user_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lao_streak_freeze', streakFreezeActive.toString());
  }, [streakFreezeActive]);

  useEffect(() => {
    localStorage.setItem('lao_user_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('lao_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('lao_unlocked_chests', JSON.stringify(unlockedChests));
  }, [unlockedChests]);

  useEffect(() => {
    if (activeLesson) {
      telegramService.setupBackButton(() => setActiveLesson(null));
    } else {
      telegramService.hideBackButton();
    }
  }, [activeLesson]);

  const handleFinishLesson = (lesson, isPerfect) => {
    const gainedXp = lesson.xpReward + (isPerfect ? 5 : 0);
    const gainedGems = lesson.gemReward;

    setXp((prev) => prev + gainedXp);
    setGems((prev) => prev + gainedGems);

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

  const handleResetProgress = () => {
    if (window.confirm('Сбросить весь прогресс, выученные слова и опыт?')) {
      localStorage.clear();
      setHearts(5);
      setGems(150);
      setStreak(1);
      setStreakFreezeActive(false);
      setXp(0);
      setCompletedLessons([]);
      setUnlockedChests([]);
      window.location.reload();
    }
  };

  const renderContent = () => (
    <div className="flex-1 flex flex-col min-h-screen">
      <DuoTopBar
        hearts={hearts}
        gems={gems}
        streak={streak}
        streakFreezeActive={streakFreezeActive}
        onOpenShop={() => setActiveTab('profile')}
        isPhoneMockup={isPhoneMockup}
        setIsPhoneMockup={setIsPhoneMockup}
      />

      <main className="flex-1 pb-24 md:pb-12">
        {activeTab === 'path' && (
          <DuoPath
            completedLessons={completedLessons}
            onStartLesson={(lesson) => setActiveLesson(lesson)}
            unlockedChests={unlockedChests}
            onUnlockChest={handleUnlockChest}
          />
        )}

        {activeTab === 'cards' && (
          <FlashcardsTrainerView
            onAwardXP={(amount) => {
              setXp((prev) => prev + amount);
              if (hearts < 5) setHearts((prev) => Math.min(5, prev + 1));
            }}
          />
        )}

        {activeTab === 'dictionary' && (
          <PhrasebookView onAwardXP={(amount) => setXp((prev) => prev + amount)} />
        )}

        {activeTab === 'leaderboard' && <LeaderboardView userXp={xp} />}

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
            onResetProgress={handleResetProgress}
            isPhoneMockup={isPhoneMockup}
            setIsPhoneMockup={setIsPhoneMockup}
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
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {isPhoneMockup ? (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-900">
          <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] bg-white dark:bg-slate-950 rounded-[44px] shadow-2xl border-8 border-slate-800 flex flex-col overflow-hidden relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-50"></div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              {renderContent()}
              <DuoNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row min-h-screen">
          <DuoNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
