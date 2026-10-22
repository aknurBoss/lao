import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioEngine } from '../services/audioService';

export default function AudioPlayerButton({
  text,
  toneId = null,
  rate = 0.85,
  size = 'md',
  className = '',
  label = '',
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);

    if (toneId) {
      // Play tone pitch contour
      audioEngine.playToneContour(toneId);
      setTimeout(() => setIsPlaying(false), 700);
    } else if (text) {
      // Speak Lao text
      audioEngine.speakText(text, rate);
      setTimeout(() => setIsPlaying(false), 900);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
        isPlaying
          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-400'
          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={label || `Listen to pronunciation: ${text || toneId}`}
    >
      <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
      {label && <span className="font-medium text-xs pr-1">{label}</span>}
      {isPlaying && (
        <span className="flex items-center gap-0.5">
          <span className="w-1 h-2 bg-current rounded-full animate-pulse"></span>
          <span className="w-1 h-3 bg-current rounded-full animate-pulse delay-75"></span>
          <span className="w-1 h-2 bg-current rounded-full animate-pulse delay-150"></span>
        </span>
      )}
    </button>
  );
}
