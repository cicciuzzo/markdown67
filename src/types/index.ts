export interface DraftData {
  content: string;   // markdown source
  timestamp: number; // creation / last-edit epoch ms
  expiresAt: number; // timestamp + 72h
}
export type EditorMode = 'wysiwyg' | 'raw';

// File Handling API (Chromium desktop, installed PWA only) — not in lib.dom yet.
// Only the two members EditorApp actually reads.
declare global {
  interface Window {
    launchQueue?: {
      setConsumer(consumer: (params: { files: FileSystemFileHandle[] }) => void): void;
    };
  }
}
