'use client';

import { useEffect } from 'react';
import clsx from 'clsx';

// ponytail: a single toast, not a queue/provider system.
export default function Toast({
  message,
  type = 'error',
  onDismiss,
}: {
  message: string | null;
  type?: 'error' | 'success';
  onDismiss?: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onDismiss?.(), 3000);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={clsx(
        'toast-in fixed top-20 right-5 z-50 rounded-xl border px-4 py-2.5 text-sm shadow-card',
        type === 'error'
          ? 'border-danger/40 bg-dangertint text-danger'
          : 'border-success/40 bg-successtint text-success',
      )}
      onClick={() => onDismiss?.()}
    >
      {message}
    </div>
  );
}
