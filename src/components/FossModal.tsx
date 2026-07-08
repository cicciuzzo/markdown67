'use client';

import { useEffect, useRef } from 'react';

// Static credits modal for the FOSS this app stands on. Same open/onClose
// contract and visual shell as WhyModal — the parent owns `open`.
const LIBS: { name: string; use: string; href: string }[] = [
  {
    name: 'BlockNote',
    use: 'The WYSIWYG block editor and its native markdown serializers (@blocknote/core · mantine · react).',
    href: 'https://www.blocknotejs.org/',
  },
  {
    name: 'highlight.js',
    use: 'Syntax highlighting for the raw markdown panel.',
    href: 'https://highlightjs.org/',
  },
  {
    name: 'marked',
    use: 'GFM parsing used to validate the markdown before it reaches the editor.',
    href: 'https://marked.js.org/',
  },
  {
    name: 'date-fns',
    use: 'Timestamp formatting for exported filenames.',
    href: 'https://date-fns.org/',
  },
  {
    name: 'clsx',
    use: 'Conditional className composition.',
    href: 'https://github.com/lukeed/clsx',
  },
  {
    name: 'Next.js',
    use: 'React framework, statically exported to a fully client-side site.',
    href: 'https://nextjs.org/',
  },
  {
    name: 'React',
    use: 'The UI runtime everything is built on.',
    href: 'https://react.dev/',
  },
  {
    name: 'Tailwind CSS',
    use: 'Utility-first styling across the whole app.',
    href: 'https://tailwindcss.com/',
  },
];

export default function FossModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="foss-title"
        className="modal-in relative w-full max-w-lg rounded-2xl border border-hairline bg-surface p-7 shadow-[0_24px_64px_-16px_rgba(32,34,46,0.45)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="foss-title" className="font-display text-2xl font-bold tracking-tight text-ink">
          Open source licenses
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-inksoft">
          Markdown67 is built entirely on free and open-source software. With thanks to:
        </p>

        <ul className="mt-4 max-h-[55vh] space-y-3 overflow-auto pr-1">
          {LIBS.map((lib) => (
            <li key={lib.name} className="rounded-xl border border-hairline bg-paper/70 p-3">
              <a
                href={lib.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-display text-sm font-bold text-ink underline decoration-hairline underline-offset-2 hover:text-mark"
              >
                {lib.name}
              </a>
              <p className="mt-0.5 text-sm leading-relaxed text-inksoft">{lib.use}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg bg-mark px-4 py-2 font-mono text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
