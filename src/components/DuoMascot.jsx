import React from 'react';

export default function DuoMascot({ mood = 'happy', size = 'md', message = '', className = '' }) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44',
  };

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Interactive Speech Bubble if message provided */}
      {message && (
        <div className="relative bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm max-w-[200px] sm:max-w-xs animate-bounce-subtle">
          {message}
          {/* Bubble tail */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-slate-200 dark:border-r-slate-700 border-b-6 border-b-transparent"></div>
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-5 border-t-transparent border-r-7 border-r-white dark:border-r-slate-800 border-b-5 border-b-transparent"></div>
        </div>
      )}

      {/* "Xang" - The Green Lao Elephant Mascot (Lan Xang) */}
      <div className={`${sizeMap[size] || sizeMap.md} shrink-0 animate-float`}>
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="elephantSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#58cc02" /> {/* Duolingo signature vibrant green */}
              <stop offset="100%" stopColor="#46a302" />
            </linearGradient>
            <linearGradient id="earInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb0c5" />
              <stop offset="100%" stopColor="#ff809b" />
            </linearGradient>
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffc800" />
              <stop offset="100%" stopColor="#e5a700" />
            </linearGradient>
          </defs>

          {/* Left Ear */}
          <ellipse cx="28" cy="50" rx="20" ry="24" fill="url(#elephantSkin)" />
          <ellipse cx="28" cy="50" rx="13" ry="17" fill="url(#earInner)" opacity="0.85" />

          {/* Right Ear */}
          <ellipse cx="92" cy="50" rx="20" ry="24" fill="url(#elephantSkin)" />
          <ellipse cx="92" cy="50" rx="13" ry="17" fill="url(#earInner)" opacity="0.85" />

          {/* Elephant Body & Feet */}
          <ellipse cx="60" cy="85" rx="34" ry="26" fill="url(#elephantSkin)" />
          {/* Left Foot */}
          <ellipse cx="44" cy="105" rx="10" ry="8" fill="#46a302" />
          <circle cx="39" cy="106" r="2" fill="#fff" opacity="0.6" />
          <circle cx="44" cy="108" r="2" fill="#fff" opacity="0.6" />
          <circle cx="49" cy="106" r="2" fill="#fff" opacity="0.6" />
          {/* Right Foot */}
          <ellipse cx="76" cy="105" rx="10" ry="8" fill="#46a302" />
          <circle cx="71" cy="106" r="2" fill="#fff" opacity="0.6" />
          <circle cx="76" cy="108" r="2" fill="#fff" opacity="0.6" />
          <circle cx="81" cy="106" r="2" fill="#fff" opacity="0.6" />

          {/* Head */}
          <circle cx="60" cy="52" r="32" fill="url(#elephantSkin)" />

          {/* Cheeks */}
          <ellipse cx="38" cy="62" rx="7" ry="4" fill="#ff809b" opacity="0.5" />
          <ellipse cx="82" cy="62" rx="7" ry="4" fill="#ff809b" opacity="0.5" />

          {/* Eyes based on mood */}
          {mood === 'celebrate' || mood === 'happy' ? (
            <>
              {/* Joyful curved eyes */}
              <circle cx="44" cy="46" r="7" fill="#fff" />
              <circle cx="76" cy="46" r="7" fill="#fff" />
              <circle cx="45" cy="46" r="4.5" fill="#1e293b" />
              <circle cx="77" cy="46" r="4.5" fill="#1e293b" />
              {/* Eye sparkles */}
              <circle cx="43" cy="44" r="2" fill="#fff" />
              <circle cx="75" cy="44" r="2" fill="#fff" />
            </>
          ) : mood === 'sad' ? (
            <>
              {/* Sad sympathetic eyes */}
              <circle cx="44" cy="47" r="7" fill="#fff" />
              <circle cx="76" cy="47" r="7" fill="#fff" />
              <circle cx="44" cy="48" r="4" fill="#1e293b" />
              <circle cx="76" cy="48" r="4" fill="#1e293b" />
              {/* Teardrop */}
              <path d="M 85 58 Q 88 64 85 67 Q 82 64 85 58 Z" fill="#38bdf8" />
            </>
          ) : (
            <>
              {/* Inquisitive thinking eyes */}
              <circle cx="44" cy="46" r="7" fill="#fff" />
              <circle cx="76" cy="46" r="7" fill="#fff" />
              <circle cx="46" cy="44" r="4.5" fill="#1e293b" />
              <circle cx="78" cy="44" r="4.5" fill="#1e293b" />
            </>
          )}

          {/* Little Tusks */}
          <path d="M 45 68 C 45 74, 41 76, 39 74 C 41 70, 44 68, 45 68 Z" fill="#fff" />
          <path d="M 75 68 C 75 74, 79 76, 81 74 C 79 70, 76 68, 75 68 Z" fill="#fff" />

          {/* Elephant Trunk */}
          {mood === 'celebrate' ? (
            /* Trunk raised high celebrating */
            <path
              d="M 54 62 C 54 75, 48 82, 54 86 C 62 89, 74 80, 72 65 C 70 60, 64 60, 64 62 C 65 72, 58 78, 56 74 C 54 70, 60 62, 54 62 Z"
              fill="#46a302"
            />
          ) : (
            /* Relaxed cute trunk */
            <path
              d="M 53 62 C 53 74, 52 82, 58 84 C 64 86, 68 80, 67 74 C 65 74, 62 76, 59 74 C 56 72, 60 62, 60 62 Z"
              fill="#46a302"
            />
          )}

          {/* Victory Crown if celebrating */}
          {mood === 'celebrate' && (
            <g transform="translate(42, 12)">
              <polygon points="0,18 9,0 18,10 27,0 36,18" fill="url(#crownGold)" />
              <circle cx="9" cy="2" r="2.5" fill="#ff4b4b" />
              <circle cx="18" cy="10" r="2.5" fill="#1cb0f6" />
              <circle cx="27" cy="2" r="2.5" fill="#ff4b4b" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
