'use client';

import { useRef } from 'react';
import { UploadIcon } from './Icons';

// Click-to-pick a .md file. Drag-and-drop is handled at the window level in
// EditorApp (full-viewport drop zone, E3), so this control no longer owns a drop
// target — the parent validates/parses whatever file we hand it.
export default function FileOps({ onPick }: { onPick: (file: File | undefined | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3 py-1.5 text-sm text-inksoft transition-colors hover:border-ink hover:text-ink"
      >
        <UploadIcon className="h-4 w-4" />
        <span className="btn-label">Upload .md</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".md"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = ''; // allow re-uploading the same file
        }}
      />
    </>
  );
}
