'use client';

import { useEffect, useState } from 'react';

// Registers the service worker, but only in a secure context (https/localhost).
// No-ops on the http LAN test server, where SWs are disallowed. Also watches for
// a newer SW taking over and surfaces a "reload" prompt.
export default function PwaRegister() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            // A new SW reaching 'installed' while a controller already exists
            // means this is an update (not the first install).
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  if (!updateReady) return null;

  return (
    <div
      role="status"
      className="toast-in fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-2.5 text-sm text-ink shadow-card"
    >
      New version available
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-mark px-3 py-1 font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
      >
        Reload
      </button>
    </div>
  );
}
