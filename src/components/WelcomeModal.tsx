'use client';

import { useEffect, useRef, useState } from 'react';

// First-visit welcome dialog (also reopenable from the footer). Explains what the
// app solves, with emphasis that everything stays on-device. Presentational: the
// parent owns `open` and the first-visit cookie.
const FRAMES = ['¯\\(ツ)_-', '-_(ツ)/¯'];

export default function WelcomeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [frame, setFrame] = useState(0);

  // Escape to close; focus the primary button when opened.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Flip the shrug every 0.5s while open (same gag as the loading screen).
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setFrame((n) => (n + 1) % FRAMES.length), 500);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="modal-in relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-7 shadow-[0_24px_64px_-16px_rgba(32,34,46,0.45)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="mb-3 select-none font-mono text-2xl text-ink" aria-hidden>
          {FRAMES[frame]}
        </p>
        <h2 id="welcome-title" className="font-display text-2xl font-bold tracking-tight text-ink">
          Welcome to Markdown67
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">
          Write Markdown just as you think it, with no commands to memorize. See exactly what you are
          writing in a visual, Notion-style editor, then export a ready-to-use{' '}
          <code className="font-mono text-ink">.md</code> file.
        </p>

        <div className="mt-4 rounded-xl border border-hairline bg-paper/70 p-4">
          <p className="mb-1 font-display text-sm font-bold text-ink">
            <span className="mark-static">Everything stays on your device</span>
          </p>
          <p className="text-sm leading-relaxed text-inksoft">
            No account, no server, no upload. Nothing you type ever leaves this page. Your draft is
            saved locally for 72 hours, and you can download it as a{' '}
            <code className="font-mono text-ink">.md</code> file anytime.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-mark px-4 py-2 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
          >
            Start writing
          </button>
        </div>
      </div>
    </div>
  );
}
