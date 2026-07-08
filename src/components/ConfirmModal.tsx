'use client';

import { useEffect, useRef } from 'react';

// Reusable confirm dialog, same shell/contract as WhyModal: parent owns `open`,
// closes on Escape and backdrop click, focuses the confirm button on open.
// onConfirm does NOT self-close — the caller decides what happens next.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Replace',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="modal-in relative w-full max-w-md rounded-2xl border border-hairline bg-surface p-7 shadow-[0_24px_64px_-16px_rgba(32,34,46,0.45)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-2xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-hairline px-4 py-2 text-sm text-inksoft transition-colors hover:border-ink hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-mark px-4 py-2 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
