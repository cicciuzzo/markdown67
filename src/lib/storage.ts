import type { DraftData } from '@/types';

const DRAFT_KEY = 'md67:draft';
const TTL_MS = 72 * 60 * 60 * 1000;

export function isDraftExpired(draft: DraftData): boolean {
  return Date.now() > draft.expiresAt;
}

export function saveDraft(markdown: string): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const draft: DraftData = { content: markdown, timestamp: now, expiresAt: now + TTL_MS };
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): DraftData | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  let draft: DraftData;
  try {
    draft = JSON.parse(raw) as DraftData;
  } catch {
    // ponytail: corrupt storage -> treat as no draft
    return null;
  }
  // Cast above is a compile-time lie: guard the shape at runtime so tampered
  // storage (bad expiresAt => never expires, non-string content) can't leak in.
  if (typeof draft.content !== 'string' || typeof draft.expiresAt !== 'number') {
    deleteDraft();
    return null;
  }
  if (isDraftExpired(draft)) {
    deleteDraft();
    return null;
  }
  return draft;
}

export function deleteDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}
