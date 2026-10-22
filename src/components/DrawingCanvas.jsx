import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool, Eraser, Sparkles } from 'lucide-react';
import { audioEngine } from '../services/audioService';

export default function DrawingCanvas({ character, charName = '', onComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState('pen'); // 'pen' | 'eraser'
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    clearCanvas();
    setCompleted(false);
  }, [character]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'pen') {
      ctx.strokeStyle = '#e11d48'; // vibrant rose
      ctx.lineWidth = 14;
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 28;
    }

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleFinish = () => {
    setCompleted(true);
    audioEngine.playFeedback('success');
    if (onComplete) onComplete(character);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-rose-500" />
            Letter Stroke Practice
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trace {charName || character} by hand to build muscle memory
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode('pen')}
            className={`p-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'pen'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Pen mode"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode('eraser')}
            className={`p-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'eraser'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Eraser mode"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            title="Clear canvas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawing Pad with Guide Grid and Character Shadow */}
      <div className="relative w-72 h-72 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/60 bg-amber-50/20 dark:bg-slate-950 flex items-center justify-center overflow-hidden touch-none select-none">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px border-b border-dashed border-slate-200 dark:border-slate-800" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-r border-dashed border-slate-200 dark:border-slate-800" />
          <div className="absolute top-1/4 left-0 right-0 h-px border-b border-dotted border-slate-200/60 dark:border-slate-800/60" />
          <div className="absolute top-3/4 left-0 right-0 h-px border-b border-dotted border-slate-200/60 dark:border-slate-800/60" />
        </div>

        {/* Ghost reference character */}
        <div className="absolute font-lao text-9xl font-bold select-none text-slate-200/80 dark:text-slate-800 pointer-events-none transition-all">
          {character}
        </div>

        {/* Active drawing canvas */}
        <canvas
          ref={canvasRef}
          width={288}
          height={288}
          className="relative z-10 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Completion button */}
      <div className="mt-4 w-full flex justify-end">
        <button
          type="button"
          disabled={!hasDrawn || completed}
          onClick={handleFinish}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            completed
              ? 'bg-emerald-500 text-white'
              : hasDrawn
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:scale-[0.99]'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {completed ? (
            <>
              <Check className="w-4 h-4" /> Written & Mastered! (+10 XP)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Check & Complete (+10 XP)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
