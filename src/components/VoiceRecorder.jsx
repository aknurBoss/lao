import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../services/audioService';

export default function VoiceRecorder({
  targetPhrase,
  targetRom = '',
  audioItem = null,
  onPracticeComplete,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCompared, setHasCompared] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Запись с микрофона не поддерживается в этом браузере.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Не удалось получить доступ к микрофону. Разрешите доступ к микрофону в браузере.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecordedAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setHasCompared(false);
  };

  const markComplete = () => {
    setHasCompared(true);
    audioEngine.playFeedback('success');
    if (onPracticeComplete) {
      onPracticeComplete();
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-rose-500">
            Тренажёр произношения
          </span>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {targetPhrase}
            </span>
            {targetRom && (
              <span className="text-sm font-mono font-medium text-slate-500 dark:text-slate-400">
                [{targetRom}]
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => audioEngine.speakText(audioItem || targetPhrase)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold text-xs hover:bg-sky-200 transition cursor-pointer"
        >
          <Volume2 className="w-4 h-4" /> Послушать образец
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!audioUrl ? (
            !isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-600/30 active:scale-95 transition cursor-pointer shrink-0"
                title="Начать запись"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 animate-pulse cursor-pointer shrink-0"
                title="Остановить запись"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playRecordedAudio}
                className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 transition cursor-pointer"
                title="Послушать свою запись"
              >
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </button>
              <button
                type="button"
                onClick={resetRecording}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Записать заново"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <div>
            {isRecording ? (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                Идёт запись... {recordingTime} сек
              </div>
            ) : audioUrl ? (
              <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Записано! Нажмите Play и сравните с образцом.
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Нажмите на микрофон и произнесите фразу вслух
              </div>
            )}
          </div>
        </div>

        {audioUrl && (
          <button
            type="button"
            onClick={markComplete}
            disabled={hasCompared}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              hasCompared
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {hasCompared ? 'Отлично! (+10 XP)' : 'Получилось! (+10 XP)'}
          </button>
        )}
      </div>
    </div>
  );
}
