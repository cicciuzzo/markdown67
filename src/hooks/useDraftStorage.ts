import { useEffect, useRef, useState } from 'react';
import { loadDraft, saveDraft, deleteDraft } from '@/lib/storage';
import type { DraftData } from '@/types';

// Seeds the editor from a persisted draft on mount and auto-saves edits.
// `draft` is reactive: it reflects the currently-stored draft, updating after
// each save and clearing on delete (so the "delete draft" UI stays in sync
// without a page reload).
// ponytail: plain setTimeout debounce, no external debounce dep.
export function useDraftStorage(
  markdown: string,
  delayMs = 1000,
): { draft: DraftData | null; clearDraft: () => void } {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const firstRun = useRef(true);

  // loadDraft already handles expiry + cleanup; seed once on mount.
  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  // Auto-save on change. Skip the mount run (don't overwrite before any edit)
  // and skip empty markdown (don't persist an empty draft). Re-read after save
  // so `draft` carries the fresh timestamp.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (markdown === '') return;
    const id = setTimeout(() => {
      saveDraft(markdown);
      setDraft(loadDraft());
    }, delayMs);
    return () => clearTimeout(id);
  }, [markdown, delayMs]);

  const clearDraft = () => {
    deleteDraft();
    setDraft(null);
  };

  return { draft, clearDraft };
}
