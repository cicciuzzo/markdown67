'use client';

import { useEffect, useState } from 'react';

// Non-invasive PWA install nudge. After 30s on the app, if the browser has
// offered installation (beforeinstallprompt — Chromium, HTTPS only) and the
// user hasn't installed or dismissed it before, show a small corner card.
// beforeinstallprompt never fires on iOS Safari or over plain http, so there
// those users simply see nothing (by design).
type BipEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'md67_pwa_dismissed';
const DELAY_MS = 30_000;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BipEvent | null>(null);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    // Never nag when already installed/standalone, or after a prior dismissal.
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onBip = (e: Event) => {
      e.preventDefault(); // stash it so we control when the dialog appears
      setDeferred(e as BipEvent);
    };
    const onInstalled = () => {
      setElapsed(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    const t = window.setTimeout(() => setElapsed(true), DELAY_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
      window.clearTimeout(t);
    };
  }, []);

  // Only once the 30s elapsed AND the browser actually offered installation.
  if (!elapsed || !deferred) return null;

  const remember = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode: fine, it may just re-show next session */
    }
  };

  const dismiss = () => {
    setDeferred(null);
    remember();
  };

  const install = async () => {
    remember();
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Install Markdown67"
      className="toast-in fixed bottom-5 right-5 z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-hairline bg-surface p-4 text-sm text-ink shadow-card"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mark text-lg font-bold text-ink"
        >
          ツ
        </span>
        <div className="flex-1">
          <p className="font-medium">Install Markdown67</p>
          <p className="mt-0.5 text-xs text-inksoft">Add it to your device for a full-screen app.</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 rounded p-1 text-inksoft hover:text-ink"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={dismiss} className="rounded-lg px-3 py-1.5 text-inksoft hover:text-ink">
          Not now
        </button>
        <button
          type="button"
          onClick={install}
          className="rounded-lg bg-mark px-3 py-1.5 font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
        >
          Install
        </button>
      </div>
    </div>
  );
}
