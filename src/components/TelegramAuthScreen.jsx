import React, { useState, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  Laptop,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
  RefreshCw,
} from 'lucide-react';
import DuoMascot from './DuoMascot';
import { telegramService } from '../services/telegramService';
import { syncService } from '../services/syncService';

export default function TelegramAuthScreen({
  lang = 'ru',
  setLang,
  onLoginWithTelegramCode,
  onRegisterMasterTelegram,
}) {
  const [inputCode, setInputCode] = useState('');
  const [tgUsername, setTgUsername] = useState('');
  const [mode, setMode] = useState('laptop'); // 'laptop' | 'register_tg'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [qrChallengeId, setQrChallengeId] = useState(() =>
    'QR-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [qrApproved, setQrApproved] = useState(false);

  const isRu = lang === 'ru';

  // Listen for QR code approval from the phone/Telegram
  useEffect(() => {
    if (mode !== 'laptop' || !qrChallengeId) return;

    const unsubscribe = syncService.listenForQrChallengeApproval(
      qrChallengeId,
      async (approvedSyncId, approvedData) => {
        setQrApproved(true);
        telegramService.hapticNotification('success');
        setIsLoading(true);
        try {
          await onLoginWithTelegramCode(approvedSyncId, approvedData);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [mode, qrChallengeId]);

  const qrApprovalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?approveQr=${encodeURIComponent(
          qrChallengeId
        )}`
      : `https://laolingo.pages.dev/?approveQr=${qrChallengeId}`;

  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(
    qrApprovalUrl
  )}`;

  const handleRefreshQr = () => {
    setQrChallengeId('QR-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    setQrApproved(false);
  };

  const handleLaptopLogin = async (e) => {
    e.preventDefault();
    const raw = inputCode.trim();
    if (!raw) {
      setErrorMsg(
        isRu
          ? 'Введите код входа из вашего Telegram (например, TG-123456) или отсканируйте QR-код выше'
          : 'Please enter the login code from your Telegram (e.g. TG-123456) or scan the QR code above'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      let cleanCode = raw;
      let directData = null;

      if (raw.includes('sync=') || raw.includes('data=')) {
        try {
          const url = new URL(raw);
          const s = url.searchParams.get('sync');
          const d = url.searchParams.get('data');
          if (s) cleanCode = s;
          if (d) directData = d;
        } catch (err) {}
      }

      await onLoginWithTelegramCode(cleanCode, directData);
    } catch (err) {
      setErrorMsg(
        isRu
          ? 'Не удалось подключиться. Проверьте код и попробуйте снова.'
          : 'Connection failed. Please check the code and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterMaster = (e) => {
    e.preventDefault();
    telegramService.hapticNotification('success');
    onRegisterMasterTelegram(tgUsername.trim() || '@telegram_user');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between px-4 pb-4 pt-safe sm:p-6">
      {/* Top Bar with Brand & Language Switch */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            🐘
          </div>
          <div>
            <span className="font-duo font-black text-xl tracking-tight text-slate-900 dark:text-white">
              Lao<span className="text-emerald-500">Lingo</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5 font-bold">
              Telegram Primary Auth
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setLang(isRu ? 'en' : 'ru')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-xs font-duo font-black text-slate-700 dark:text-slate-200 cursor-pointer hover:border-emerald-400 transition"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>{isRu ? 'RU 🇷🇺' : 'EN 🇬🇧'}</span>
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col items-center text-center space-y-2">
            <DuoMascot
              mood="happy"
              size="md"
              message={
                isRu
                  ? 'Са-ба́й-ди! Главный аккаунт — ваш Telegram!'
                  : 'Sa-baai-dii! Telegram is your primary account!'
              }
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-duo font-bold mt-2">
              <ShieldCheck className="w-4 h-4" />
              {isRu ? 'Авторизация через Telegram' : 'Telegram Authentication'}
            </span>
            <h1 className="text-2xl font-black font-duo text-slate-900 dark:text-white">
              {isRu ? 'Вход в LaoLingo' : 'Sign in to LaoLingo'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isRu
                ? 'Telegram — ваше главное устройство. Отсканируйте QR-код с телефона или введите код входа.'
                : 'Telegram is your master device. Scan the QR code with your phone or enter your login code.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-duo font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('laptop');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'laptop'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>{isRu ? 'Я с ноутбука' : 'On Laptop'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register_tg');
                setErrorMsg('');
              }}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'register_tg'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isRu ? 'Я в Telegram' : 'In Telegram'}</span>
            </button>
          </div>

          {mode === 'laptop' ? (
            <form onSubmit={handleLaptopLogin} className="space-y-4">
              {/* Instant QR Code Login Block */}
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 flex flex-col items-center text-center space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-duo font-black text-sky-600 dark:text-sky-400">
                  <QrCode className="w-4 h-4" />
                  <span>
                    {isRu
                      ? 'Быстрый вход по QR-коду (без ввода кода)'
                      : 'Instant Login via QR Code'}
                  </span>
                </div>

                <div className="relative bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                  <img
                    src={qrImageSrc}
                    alt="QR Login"
                    className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                  />
                  {qrApproved && (
                    <div className="absolute inset-0 bg-emerald-500/95 rounded-2xl flex flex-col items-center justify-center text-white p-2">
                      <CheckCircle2 className="w-10 h-10 mb-1 animate-bounce" />
                      <span className="text-xs font-duo font-black">
                        {isRu ? 'Вход подтверждён!' : 'Login Approved!'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    {isRu
                      ? 'Наведите камеру телефона или нажмите «Сканировать QR» в Профиле Telegram'
                      : 'Scan with your phone camera or tap "Scan QR" in Telegram Profile'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshQr}
                    className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-500 cursor-pointer shrink-0"
                    title={isRu ? 'Обновить QR-код' : 'Refresh QR Code'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRu ? 'или по коду TG-...' : 'or enter TG-... code'}
                </span>
                <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-duo font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  {isRu
                    ? 'Код входа из Telegram (или ссылка):'
                    : 'Telegram Login Code (or Magic Link):'}
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={isRu ? 'Например: TG-849201' : 'e.g. TG-849201'}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-duo font-black text-sm shadow-lg shadow-emerald-500/25 btn-3d border-emerald-700 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>
                  {isLoading
                    ? isRu
                      ? 'ПОДКЛЮЧЕНИЕ К TELEGRAM...'
                      : 'CONNECTING TO TELEGRAM...'
                    : isRu
                    ? 'ВОЙТИ ПО КОДУ ИЗ TELEGRAM'
                    : 'SIGN IN WITH TELEGRAM CODE'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterMaster} className="space-y-4">
              <div className="bg-sky-50 dark:bg-sky-950/40 rounded-2xl p-4 text-xs text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800/60 space-y-1.5">
                <p className="font-bold">
                  {isRu
                    ? '📱 Регистрация главного устройства Telegram'
                    : '📱 Register Master Telegram Device'}
                </p>
                <p className="opacity-90 leading-relaxed">
                  {isRu
                    ? 'Если вы открыли приложение по прямой ссылке из Telegram, укажите ваш @username, чтобы сделать это устройство главным и управлять сеансами ноутбука:'
                    : 'If you opened the app via a direct link from Telegram, enter your @username to set this device as your Master Telegram account and manage laptop sessions:'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-duo font-bold text-slate-700 dark:text-slate-300 block">
                  {isRu ? 'Ваш Telegram @username или Имя:' : 'Your Telegram @username or Name:'}
                </label>
                <input
                  type="text"
                  value={tgUsername}
                  onChange={(e) => setTgUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-duo font-black text-sm shadow-lg shadow-sky-500/25 btn-3d border-sky-700 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {isRu
                    ? 'ЗАРЕГИСТРИРОВАТЬ КАК ГЛАВНЫЙ TELEGRAM'
                    : 'REGISTER AS MASTER TELEGRAM'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        {isRu
          ? 'Управляйте всеми подключёнными ноутбуками и браузерами на вкладке «Профиль → Сеансы» в Telegram'
          : 'Manage all connected laptops and browsers in "Profile → Active Sessions" inside Telegram'}
      </div>
    </div>
  );
}
