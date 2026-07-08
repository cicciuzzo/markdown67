'use client';

import { useEffect, useRef, useState } from 'react';

// The "Why 67?" easter egg — only openable from the footer. A tongue-in-cheek
// origin story for the name that leans on the "6 7" meme: the switch between the
// two editors is (definitely, legally) powered by a proprietary "SixSeven"
// balancing algorithm. Presentational: the parent owns `open`.
const FRAMES = ['¯\\(ツ)_-', '-_(ツ)/¯'];

export default function WhyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Flip the shrug in the copy every 0.5s while open (same gag as elsewhere).
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setFrame((n) => (n + 1) % FRAMES.length), 500);
    return () => clearInterval(t);
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
        aria-labelledby="why-title"
        className="modal-in relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-7 shadow-[0_24px_64px_-16px_rgba(32,34,46,0.45)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="why-title" className="font-display text-2xl font-bold tracking-tight text-ink">
          Why 67?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">
          Glad you asked. Every time you switch between the visual and the raw editor, the handoff
          runs through SixSeven, our proprietary balancing algorithm. Patent pending, obviously.
        </p>

        <div className="mt-4 rounded-xl border border-hairline bg-paper/70 p-4">
          <p className="mb-1 font-display text-sm font-bold text-ink">
            <span className="mark-static">The science</span>
          </p>
          <p className="text-sm leading-relaxed text-inksoft">
            You may have seen SixSeven deployed in the wild: palms up, weighing two options, going
            &ldquo;six... seveeen.&rdquo; That is the exact math. Two editors, one perfectly balanced
            decision, computed in real time by the little{' '}
            <span className="select-none font-mono text-ink" aria-hidden>
              {FRAMES[frame]}
            </span>{' '}
            standing between them.
          </p>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-inksoft">
          Is it real? Is it so-so? Is it somewhere in between? Yes. A dictionary made &ldquo;6 7&rdquo;
          its Word of the Year, so consider it peer-reviewed.
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-[11px] leading-tight text-inksoft/70">
            SixSeven is not a real algorithm. The number 67 is real. Probably.
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg bg-mark px-4 py-2 font-mono text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
          >
            6 7
          </button>
        </div>
      </div>
    </div>
  );
}
