import { format } from 'date-fns';
import { normalizeHardBreaks } from './markdown';

// Exported so the filename format can be checked without a DOM.
export function buildDownloadFilename(date: Date = new Date()): string {
  return `MD67_${format(date, 'yyyy-MM-dd_HH-mm-ss')}.md`;
}

export function downloadMarkdown(content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = buildDownloadFilename();
  a.click();
  URL.revokeObjectURL(url);
}

export async function parseUploadFile(file: File): Promise<string> {
  // ponytail: native file.text() — no FileReader boilerplate
  // Canonicalize hard breaks to backslash form so they survive the round-trip.
  return normalizeHardBreaks(await file.text());
}

// Pure decision: is the async Clipboard API usable? It requires a secure
// context (https/localhost) AND the API being present. On the http LAN test
// server this is false, so copyToClipboard falls back to execCommand.
// Extracted so the branch is testable without a DOM (see __checks__).
export function canUseClipboardApi(secureContext: boolean, hasClipboard: boolean): boolean {
  return secureContext && hasClipboard;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (canUseClipboardApi(window.isSecureContext, !!navigator.clipboard)) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the execCommand path
    }
  }

  // Fallback for non-secure contexts (works on http): offscreen textarea + execCommand.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
