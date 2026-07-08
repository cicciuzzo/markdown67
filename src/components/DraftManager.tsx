'use client';

import { useState } from 'react';
import type { DraftData } from '@/types';
import { TrashIcon } from './Icons';

// Just a delete action for the saved draft (appears once a draft exists, bouncing
// in), with an inline confirmation popover.
export default function DraftManager({
  draft,
  content,
  onDelete,
}: {
  draft: DraftData | null;
  content: string;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // Hide once there's nothing to delete: no stored draft, or the document was
  // manually emptied (a stale draft may still linger in localStorage).
  if (!draft || content.trim() === '') return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="bounce-in inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-sm text-danger transition-colors hover:border-danger hover:bg-dangertint"
      >
        <TrashIcon className="h-4 w-4" />
        <span className="btn-label">Delete</span>
      </button>

      {confirming && (
        <>
          {/* click-outside backdrop */}
          <button
            type="button"
            aria-label="Cancel"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setConfirming(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-[#D0D4DC] bg-surface p-4 text-sm shadow-[0_10px_30px_-6px_rgba(32,34,46,0.28)]">
            <p className="mb-3 text-inksoft">Delete the saved draft?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-hairline px-3 py-1.5 text-sm text-inksoft transition-colors hover:border-ink hover:text-ink"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onDelete();
                }}
                className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
