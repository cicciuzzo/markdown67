'use client';

import clsx from 'clsx';
import type { EditorMode } from '@/types';

// Signature element: a balance beam. The shrug ツ is the fulcrum — its arms lean
// toward the active editor and the whole glyph tilts that way. Clicking the shrug
// switches to the other editor. The active mode wears a highlighter swipe (amber
// marker behind ink text), echoing what a markdown editor is for.
export default function EditorModeIndicator({
  mode,
  onSelect,
}: {
  mode: EditorMode;
  onSelect: (mode: EditorMode) => void;
}) {
  // Arms lean toward the active side.
  const shrug = mode === 'raw' ? '-_(ツ)/¯' : '¯\\(ツ)_-';
  const other: EditorMode = mode === 'raw' ? 'wysiwyg' : 'raw';

  return (
    <div className="mb-3 flex items-center justify-center gap-4">
      {/* RAW on the left, WYSIWYG on the right — matches the panel order below. */}
      <ModeLabel label="RAW" active={mode === 'raw'} onClick={() => onSelect('raw')} />
      <button
        type="button"
        onClick={() => onSelect(other)}
        aria-label={`Switch to ${other === 'raw' ? 'RAW' : 'WYSIWYG'} editor`}
        className={clsx(
          'beam-shrug cursor-pointer select-none rounded border-0 bg-transparent p-0 font-mono text-xl text-ink',
          `lean-${mode}`,
        )}
      >
        {shrug}
      </button>
      <ModeLabel label="WYSIWYG" active={mode === 'wysiwyg'} onClick={() => onSelect('wysiwyg')} />
    </div>
  );
}

function ModeLabel({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-active={active}
      className="mode-label font-display text-sm font-bold tracking-wide text-ink transition-opacity"
    >
      <span className="mark-swipe">{label}</span>
    </button>
  );
}
