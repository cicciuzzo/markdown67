export interface DraftData {
  content: string;   // markdown source
  timestamp: number; // creation / last-edit epoch ms
  expiresAt: number; // timestamp + 72h
}
export type EditorMode = 'wysiwyg' | 'raw';
