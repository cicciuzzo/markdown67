'use client';

import { useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import markdownLang from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';
import { applySubstitution } from '@/lib/substitutions';

hljs.registerLanguage('markdown', markdownLang);

// Editable raw-markdown source. The <textarea> is the real editable layer;
// a highlighted <pre> sits directly behind it (transparent textarea text on
// top) so the caret/selection live in the textarea and colors come from the
// pre. Both layers share font metrics + padding + wrapping so they stay
// aligned. Line numbers are a CSS counter in the left gutter.
//
// ponytail: per-logical-line numbering. On a wrapped line the number sits at
// the line's first visual row (standard editor behavior), not per visual row.
export default function RawMarkdownPanel({
  value,
  onChange,
  active,
  onActivate,
  scrollRef,
  onScroll,
}: {
  value: string;
  onChange: (v: string) => void;
  active: boolean;
  onActivate: () => void;
  // E4: lets EditorApp read the real scroll container (the <textarea>) so it can
  // drive percentage-mapped synced scrolling, and be notified when it scrolls.
  scrollRef?: (el: HTMLTextAreaElement | null) => void;
  onScroll?: () => void;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Merge the internal ref (caret restore) with the parent's scroll ref.
  const setTaRef = (el: HTMLTextAreaElement | null) => {
    taRef.current = el;
    scrollRef?.(el);
  };

  // Typographic auto-substitutions (E1). Run the pure pass on the just-typed
  // text/caret; when it rewrites the buffer, restore the caret after React
  // re-renders the (now shorter) controlled value.
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { text, caret } = applySubstitution(el.value, el.selectionStart);
    onChange(text);
    if (text !== el.value) {
      requestAnimationFrame(() => {
        taRef.current?.setSelectionRange(caret, caret);
      });
    }
  };

  // Highlight, then split into per-line blocks so the CSS counter can number
  // each logical line. Trailing newline -> keep an empty last line visible.
  const highlighted = hljs.highlight(value, { language: 'markdown' }).value;
  const lines = highlighted.split('\n');

  // Keep the highlight layer scroll-synced to the textarea, then let the parent
  // mirror the scroll into the other editor (E4).
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) preRef.current.scrollTop = e.currentTarget.scrollTop;
    onScroll?.();
  };

  return (
    <div className="raw-panel" onMouseDown={onActivate}>
      <style>{`
        .raw-panel { position: relative; height: 100%; overflow: hidden;
          counter-reset: none; }
        .raw-layer {
          margin: 0; box-sizing: border-box;
          position: absolute; inset: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 13px; line-height: 1.5;
          padding: 8px 8px 8px 48px;
          white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word;
          overflow: auto; border: 0; tab-size: 2;
        }
        .raw-pre { counter-reset: ln; color: inherit; pointer-events: none; z-index: 0; }
        .raw-line { position: relative; counter-increment: ln; min-height: 1.5em; }
        .raw-line::before {
          content: counter(ln);
          position: absolute; left: -40px; width: 32px;
          text-align: right; color: #a0a4ae;
        }
        .raw-ta {
          z-index: 1; resize: none; background: transparent;
          color: transparent; caret-color: #20222e; outline: none;
        }
        .raw-ta::selection { background: rgba(246,196,69,0.35); }
      `}</style>

      <pre ref={preRef} className="raw-layer raw-pre" aria-hidden="true">
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className="raw-line"
              // hljs output is trusted, escaped HTML for one line.
              dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
            />
          ))}
        </code>
      </pre>

      <textarea
        ref={setTaRef}
        className="raw-layer raw-ta"
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        onFocus={onActivate}
        readOnly={!active}
        spellCheck={false}
        placeholder="Write markdown here..."
      />
    </div>
  );
}
