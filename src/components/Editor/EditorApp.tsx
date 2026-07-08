'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCreateBlockNote } from '@blocknote/react';
import type { BlockNoteEditor } from '@blocknote/core';
import clsx from 'clsx';
import type { EditorMode } from '@/types';
import { parseUploadFile } from '@/lib/fileOps';
import { loadDraft } from '@/lib/storage';
import { SAMPLE_DOCUMENT } from '@/lib/sampleDocument';
import { validateUploadFile } from '@/lib/validation';
import { useMarkdownValidation } from '@/hooks/useMarkdownValidation';
import { TypographicInputRules } from '@/lib/typographicInputRules';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { useEditorSync } from '@/hooks/useEditorSync';
import WysiwygPanel from './WysiwygPanel';
import RawMarkdownPanel from './RawMarkdownPanel';
import EditorModeIndicator from './EditorModeIndicator';
import FileOps from '../FileOps';
import DraftManager from '../DraftManager';
import ExportActions from '../ExportActions';
import Toast from '../Toast';
import WelcomeModal from '../WelcomeModal';
import WhyModal from '../WhyModal';
import FossModal from '../FossModal';
import InstallPrompt from '../InstallPrompt';
import ConfirmModal from '../ConfirmModal';
import Shrug from '../Shrug';
// tsconfig has resolveJsonModule; default-import the manifest (a named `version`
// import trips Next's "named export from a default-exporting module" warning).
import pkg from '../../../package.json';

// ponytail: maximize/minimize glyphs are inlined here. Icons.tsx is owned by a
// concurrent agent on this branch; I'd have preferred to add them there.
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function MaximizeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function MinimizeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function SunIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

type Theme = 'light' | 'dark';

// The integrator. `markdown` is the single source of truth; exactly one panel
// is active at a time. Sync direction is handled by useEditorSync.
// Loaded client-only by EditorContainer (BlockNote touches `document` at
// render time, which crashes static prerender), so this file assumes a browser.
export default function EditorApp() {
  const [markdown, setMarkdown] = useState('');
  const [activeEditor, setActiveEditor] = useState<EditorMode>('wysiwyg');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [fossOpen, setFossOpen] = useState(false);
  // Upload-overwrite guard: the confirm modal is open while a file is pending.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // Which panel (if any) is expanded to ~90%. null = balanced 50/50.
  const [maximized, setMaximized] = useState<EditorMode | null>(null);
  // Below this viewport width (mobile/tablet) the 50/50 split collapses to a
  // single full-width panel; the ASCII selector above switches which one shows
  // (E8). 1100px keeps two usable columns above it.
  const [compact, setCompact] = useState(false);
  // E9: light/dark. The inline script in layout.tsx resolves the effective theme
  // (stored choice, else OS preference, else light) onto <html data-theme> before
  // paint; we initialise from it so state, the CSS tokens and BlockNote all agree
  // from the first render — and the [theme] effect below never clobbers it back.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light',
  );
  // E4: mirror scroll from the active editor into the inactive one (default ON).
  const [syncScroll, setSyncScroll] = useState(true);
  // E3: window-level .md drop zone overlay is visible while a file is dragged.
  const [dropActive, setDropActive] = useState(false);

  // E4: the real scroll containers — the raw <textarea> and the wysiwyg
  // <section> (overflow-auto). Kept as refs so scroll handlers stay allocation-free.
  const rawScrollRef = useRef<HTMLTextAreaElement | null>(null);
  const wysiwygScrollRef = useRef<HTMLElement | null>(null);
  // E4: which panel the cursor is currently over — the sync driver (see
  // onEditorScroll). Falls back to the focused editor for keyboard scrolling.
  const hoveredRef = useRef<EditorMode | null>(null);
  // E4: anti-loop lock. When we programmatically scroll the follower, its own
  // scroll event fires; we suppress that editor's handler for a short window.
  const suppressRef = useRef<{ editor: EditorMode; until: number } | null>(null);
  // E3: dragenter/dragleave fire per child; count them so the overlay doesn't
  // flicker as the cursor crosses nested elements.
  const dragDepth = useRef(0);
  // Upload guard: read the live document without adding `markdown` to handleFile's
  // deps (that would re-subscribe the E3 drop effect on every keystroke).
  const contentRef = useRef(markdown);
  contentRef.current = markdown;

  // E1 (WYSIWYG side): typographic arrow substitutions mirroring the raw panel,
  // injected as ProseMirror input rules through BlockNote's TipTap escape hatch.
  const editor = useCreateBlockNote({
    _tiptapOptions: { extensions: [TypographicInputRules] },
  });
  // ponytail: BlockNote's default-schema editor is invariant vs the base
  // BlockNoteEditor generic our hook/panel declare; one cast bridges the quirk.
  const baseEditor = editor as unknown as BlockNoteEditor;
  const { valid, error } = useMarkdownValidation(markdown);
  const { draft, clearDraft } = useDraftStorage(markdown);
  const { handleWysiwygChange, reseedWysiwyg, cancelPending, markWysiwygEdited, clearWysiwygDirty } =
    useEditorSync({
      editor: baseEditor,
      mode: activeEditor,
      markdown,
      setMarkdown,
      valid,
    });

  // Seed from a persisted draft exactly once, and only if the user hasn't
  // started typing (guard against clobbering live edits).
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    if (draft?.content) {
      seeded.current = true;
      setMarkdown((cur) => (cur === '' ? draft.content : cur));
      // WYSIWYG is the default active panel, so the raw->wysiwyg sync effect
      // (gated on raw mode) won't run: push the seeded content into BlockNote.
      void reseedWysiwyg(draft.content);
    }
  }, [draft, reseedWysiwyg]);

  // First-ever visit with nothing stored: prefill the editor with a sample doc
  // so the app isn't empty on first impression. Runs once; later visits start
  // empty or from the saved draft. ponytail: gated by a localStorage flag.
  useEffect(() => {
    try {
      if (localStorage.getItem('md67_seeded')) return;
      localStorage.setItem('md67_seeded', '1');
      if (loadDraft()?.content) return; // a real saved draft wins over the sample
      setMarkdown((cur) => (cur === '' ? SAMPLE_DOCUMENT : cur));
      void reseedWysiwyg(SAMPLE_DOCUMENT); // populate the default (WYSIWYG) panel
    } catch {
      // private mode: skip seeding, no harm
    }
  }, [reseedWysiwyg]);

  // Show the welcome modal on the first visit; remember it in localStorage (no
  // application cookies). ponytail: localStorage unavailable (private mode) ->
  // just show the welcome, same as a first visit.
  useEffect(() => {
    try {
      if (!localStorage.getItem('md67_welcome')) {
        setWelcomeOpen(true);
        localStorage.setItem('md67_welcome', '1');
      }
    } catch {
      setWelcomeOpen(true);
    }
  }, []);

  // E8: track the compact breakpoint via matchMedia (cleaned up on unmount).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1099px)');
    const onChange = () => setCompact(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // B1 edit-gate: whenever the WYSIWYG stops being the active panel, close the
  // write-back gate. Re-activating it starts clean (seeds reset dirty too), so a
  // mere focus can't overwrite the raw source of truth until a real edit occurs.
  useEffect(() => {
    if (activeEditor !== 'wysiwyg') clearWysiwygDirty();
  }, [activeEditor, clearWysiwygDirty]);

  // E9: adopt whatever the anti-flash script already put on <html>, then keep the
  // attribute in sync as the toggle changes it. matchMedia keeps auto users (no
  // stored choice) tracking the OS while the page is open.
  useEffect(() => {
    const d = document.documentElement.dataset.theme;
    setTheme(d === 'dark' ? 'dark' : 'light');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        if (localStorage.getItem('md67_theme')) return; // user chose explicitly
      } catch {
        /* ignore */
      }
      setTheme(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () =>
    setTheme((cur) => {
      const next = cur === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('md67_theme', next);
      } catch {
        /* private mode: theme still applies for this session */
      }
      return next;
    });

  const notify = useCallback(
    (message: string, type: 'error' | 'success') => setToast({ message, type }),
    [],
  );

  // Top-right button: maximize this panel, or (only when not compact) restore
  // the balanced split by minimizing it again.
  const toggleMax = (which: EditorMode) =>
    setMaximized((cur) => (cur === which && !compact ? null : which));

  // E7b: switching editors from the ASCII selector. When a panel is maximized,
  // the maximization follows the newly-active editor (90/10 <-> 10/90) so it
  // stays maximized on the one you're working in. When nothing is maximized it
  // stays the balanced 50/50. Under the compact breakpoint maximized is forced
  // non-null (E8), so the selector still just moves the maximized side.
  const handleSelectEditor = (m: EditorMode) => {
    setActiveEditor(m);
    setMaximized((cur) => (cur === null ? null : m));
  };

  // E4: mirror scroll bidirectionally, mapped by percentage (the two containers
  // differ in height/content). The driver is whichever editor the user is
  // actually scrolling — the one under the mouse (hoveredRef), with a fallback to
  // the focused editor for keyboard scrolling. Anti-loop: before scrolling the
  // follower we arm a short time-lock on it (suppressRef), so the follower's own
  // resulting scroll event is ignored instead of bouncing back.
  const onEditorScroll = (source: EditorMode) => {
    // Compact/mobile shows one panel at a time; sync is forced on there (E8).
    if (!syncScroll && !compact) return;
    const driver = hoveredRef.current ?? activeEditor;
    if (source !== driver) return;
    const sup = suppressRef.current;
    if (sup && sup.editor === source && performance.now() < sup.until) return;
    const src = source === 'raw' ? rawScrollRef.current : wysiwygScrollRef.current;
    const dst = source === 'raw' ? wysiwygScrollRef.current : rawScrollRef.current;
    if (!src || !dst) return;
    const srcMax = src.scrollHeight - src.clientHeight;
    const dstMax = dst.scrollHeight - dst.clientHeight;
    if (srcMax <= 0 || dstMax <= 0) return;
    const dstEditor: EditorMode = source === 'raw' ? 'wysiwyg' : 'raw';
    suppressRef.current = { editor: dstEditor, until: performance.now() + 250 };
    dst.scrollTo({ top: (src.scrollTop / srcMax) * dstMax, behavior: 'smooth' });
  };

  // Compact: single full-width column (only the active panel is rendered).
  const gridCols = compact
    ? '1fr'
    : maximized === 'raw'
      ? '9fr 1fr'
      : maximized === 'wysiwyg'
        ? '1fr 9fr'
        : '1fr 1fr';

  // The collapsed-strip mechanic only exists in the desktop split view.
  const rawCompressed = !compact && maximized === 'wysiwyg';
  const wysiwygCompressed = !compact && maximized === 'raw';

  // External markdown replacements (draft delete, upload). Besides updating the
  // raw source of truth we must re-seed BlockNote directly: the raw->wysiwyg
  // effect only runs while the raw panel is active, so a wysiwyg-active user
  // would otherwise keep the stale document.
  const handleDeleteDraft = () => {
    clearDraft();
    setMarkdown('');
    void reseedWysiwyg('');
  };

  const handleUpload = useCallback(
    (text: string) => {
      setMarkdown(text);
      void reseedWysiwyg(text);
    },
    [reseedWysiwyg],
  );

  // Parse + load a validated file (used once confirmation, if any, is resolved).
  const loadFile = useCallback(
    async (file: File) => {
      try {
        const text = await parseUploadFile(file);
        handleUpload(text);
        notify(`Loaded ${file.name}`, 'success');
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Failed to read file', 'error');
      }
    },
    [handleUpload, notify],
  );

  // Shared validate path for both the file picker (FileOps) and the window-level
  // drop zone (E3). If a non-empty document is open, gate on a confirm modal so
  // an upload can't silently overwrite the current work; otherwise load directly.
  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      const check = validateUploadFile(file);
      if (!check.valid) {
        notify(check.error ?? 'Invalid file', 'error');
        return;
      }
      if (contentRef.current.trim() !== '') {
        setPendingFile(file);
        return;
      }
      void loadFile(file);
    },
    [loadFile, notify],
  );

  const confirmUpload = () => {
    if (pendingFile) void loadFile(pendingFile);
    setPendingFile(null);
  };

  // E3: full-viewport drop zone for .md files. We only react when the drag
  // carries OS files (`types` includes 'Files') — BlockNote's internal block
  // reorder uses a non-file drag, so it never triggers the overlay or a load.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types?.includes('Files') ?? false;
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDropActive(true);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault(); // required for 'drop' to fire
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDropActive(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDropActive(false);
      void handleFile(e.dataTransfer?.files?.[0]);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [handleFile]);

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1200px] flex-col px-6 py-5 2xl:max-w-[1600px]">
      {/* hdr-compact (mobile): CSS hides every .btn-label so the header shrinks
          to icon-only buttons, recovering horizontal space. */}
      <header
        className={clsx(
          'mb-4 flex items-center justify-between gap-4 border-b border-hairline pb-4',
          compact && 'hdr-compact',
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex select-none items-center gap-2">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-md bg-mark font-mono text-base font-bold text-ink"
            >
              ツ
            </span>
            <span className="btn-label font-display text-[19px] font-bold leading-none tracking-tight text-ink">
              Markdown67
            </span>
          </div>
          <span className="h-5 w-px bg-hairline" aria-hidden />
          <FileOps onPick={handleFile} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="grid h-7 w-7 place-items-center rounded-md border border-hairline bg-surface text-inksoft shadow-sm transition hover:text-ink"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <DraftManager draft={draft} content={markdown} onDelete={handleDeleteDraft} />
          <ExportActions content={markdown} onNotify={notify} />
        </div>
      </header>

      <EditorModeIndicator mode={activeEditor} onSelect={handleSelectEditor} />

      <div
        className="grid min-h-0 flex-1 gap-4 transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: gridCols }}
      >
        {/* Left card: raw markdown (source, IDE-style). Clicking it activates it,
            dims WYSIWYG. */}
        <section
          className={clsx(
            'relative min-h-0 rounded-xl border-2 bg-surface transition-all duration-200',
            rawCompressed && 'overflow-hidden',
            compact && activeEditor !== 'raw' && 'hidden',
            activeEditor === 'raw'
              ? 'border-mark shadow-cardactive'
              : 'border-hairline opacity-70 shadow-card',
          )}
          onMouseDownCapture={() => setActiveEditor('raw')}
          onMouseEnter={() => {
            hoveredRef.current = 'raw';
          }}
          onMouseLeave={() => {
            if (hoveredRef.current === 'raw') hoveredRef.current = null;
          }}
        >
          {/* E4: synced-scroll toggle, top-right of the raw column, left of the
              maximize button so they don't overlap. Hidden in compact/mobile,
              where there's only one panel and sync is forced on. */}
          {!compact && (
            <button
              type="button"
              aria-pressed={syncScroll}
              aria-label={syncScroll ? 'Disable synced scrolling' : 'Enable synced scrolling'}
              title={syncScroll ? 'Synced scrolling: on' : 'Synced scrolling: off'}
              className={clsx(
                'absolute top-2 z-10 grid h-7 place-items-center rounded-full border px-2.5 text-[11px] font-medium shadow-sm transition',
                !rawCompressed ? 'right-11' : 'right-2',
                syncScroll
                  ? 'border-transparent bg-mark text-ink'
                  : 'border-hairline bg-surface text-inksoft hover:text-ink',
              )}
              onClick={(e) => {
                e.stopPropagation();
                setSyncScroll((v) => !v);
              }}
            >
              Sync scroll
            </button>
          )}
          {!compact && !rawCompressed && (
            <button
              type="button"
              aria-label={maximized === 'raw' ? 'Restore split view' : 'Maximize raw editor'}
              className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md border border-hairline bg-surface text-inksoft shadow-sm transition hover:text-ink"
              onClick={(e) => {
                e.stopPropagation();
                toggleMax('raw');
              }}
            >
              {maximized === 'raw' ? <MinimizeIcon /> : <MaximizeIcon />}
            </button>
          )}
          <RawMarkdownPanel
            value={markdown}
            onChange={setMarkdown}
            active={activeEditor === 'raw'}
            onActivate={() => setActiveEditor('raw')}
            scrollRef={(el) => {
              rawScrollRef.current = el;
            }}
            onScroll={() => onEditorScroll('raw')}
          />
          {rawCompressed && (
            // Content stays mounted underneath; this overlay hides it but keeps
            // the area clickable — restore 50/50, or swap to it when compact.
            <button
              type="button"
              aria-label={compact ? 'Show raw editor' : 'Restore split view'}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-surface"
              onClick={() => setMaximized(compact ? 'raw' : null)}
            >
              <span className="rotate-180 text-xs font-medium tracking-wide text-inksoft [writing-mode:vertical-rl]">
                RAW
              </span>
            </button>
          )}
        </section>

        {/* Right card: WYSIWYG. Clicking it activates it, dims the raw panel. */}
        {/* The scroll container is the inner div, not the <section>, so the
            maximize button (absolute on the non-scrolling section) stays put
            instead of scrolling away with the content. */}
        <section
          className={clsx(
            'relative min-h-0 overflow-hidden rounded-xl border-2 bg-surface transition-all duration-200',
            compact && activeEditor !== 'wysiwyg' && 'hidden',
            activeEditor === 'wysiwyg'
              ? 'border-mark shadow-cardactive'
              : 'border-hairline opacity-70 shadow-card',
          )}
          onMouseDownCapture={() => setActiveEditor('wysiwyg')}
          onMouseEnter={() => {
            hoveredRef.current = 'wysiwyg';
          }}
          onMouseLeave={() => {
            if (hoveredRef.current === 'wysiwyg') hoveredRef.current = null;
          }}
        >
          {!compact && !wysiwygCompressed && (
            <button
              type="button"
              aria-label={maximized === 'wysiwyg' ? 'Restore split view' : 'Maximize visual editor'}
              className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md border border-hairline bg-surface text-inksoft shadow-sm transition hover:text-ink"
              onClick={(e) => {
                e.stopPropagation();
                toggleMax('wysiwyg');
              }}
            >
              {maximized === 'wysiwyg' ? <MinimizeIcon /> : <MaximizeIcon />}
            </button>
          )}
          <div
            ref={(el) => {
              wysiwygScrollRef.current = el;
            }}
            className={clsx('h-full min-h-0', wysiwygCompressed ? 'overflow-hidden' : 'overflow-auto')}
            onScroll={() => onEditorScroll('wysiwyg')}
          >
            <WysiwygPanel
              editor={baseEditor}
              frozen={!valid}
              onChange={handleWysiwygChange}
              active={activeEditor === 'wysiwyg'}
              onActivate={() => setActiveEditor('wysiwyg')}
              errorMessage={error}
              theme={theme}
              onDragStart={cancelPending}
              onEdit={markWysiwygEdited}
            />
          </div>
          {wysiwygCompressed && (
            <button
              type="button"
              aria-label={compact ? 'Show visual editor' : 'Restore split view'}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-surface"
              onClick={() => setMaximized(compact ? 'wysiwyg' : null)}
            >
              <span className="rotate-180 text-xs font-medium tracking-wide text-inksoft [writing-mode:vertical-rl]">
                WYSIWYG
              </span>
            </button>
          )}
        </section>
      </div>

      <footer className="mt-4 text-center text-xs text-inksoft">
        <p>
          <button type="button" onClick={() => setWelcomeOpen(true)} className="link-mark">
            How does it work?
          </button>{' '}
          ·{' '}
          <button type="button" onClick={() => setWhyOpen(true)} className="link-mark">
            Why 67?
          </button>{' '}
          ·{' '}
          <button type="button" onClick={() => setFossOpen(true)} className="link-mark">
            Open source licenses
          </button>{' '}
          ·{' '}
          <Link href="/about" className="link-mark">
            About MD67
          </Link>
        </p>
        <p className="mt-1">
          Made with <Shrug /> by{' '}
          <a
            href="https://www.linkedin.com/in/battiti/"
            target="_blank"
            rel="noreferrer noopener"
            className="link-mark font-medium"
          >
            Romano Battiti
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/cicciuzzo/markdown67"
            target="_blank"
            rel="noreferrer noopener"
            className="link-mark"
          >
            MD67 v{pkg.version}
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/cicciuzzo/markdown67/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer noopener"
            className="link-mark"
          >
            MIT
          </a>
        </p>
      </footer>

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />

      <WhyModal open={whyOpen} onClose={() => setWhyOpen(false)} />

      <FossModal open={fossOpen} onClose={() => setFossOpen(false)} />

      <InstallPrompt />

      <ConfirmModal
        open={!!pendingFile}
        title="Replace current document?"
        message={
          <>
            Uploading <b>{pendingFile?.name}</b> will replace what you currently have open. This
            can&rsquo;t be undone.
          </>
        }
        confirmLabel="Replace"
        onConfirm={confirmUpload}
        onClose={() => setPendingFile(null)}
      />

      <Toast message={toast?.message ?? null} type={toast?.type} onDismiss={() => setToast(null)} />

      {/* E3: full-viewport drop overlay while an OS file is dragged over the page.
          The window-level drop handler does the actual load. */}
      {dropActive && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-mark bg-surface px-10 py-8 text-center shadow-cardactive">
            <p className="font-display text-lg font-bold text-ink">Release to upload</p>
            <p className="mt-1 text-sm text-inksoft">Drop a .md file to open it</p>
          </div>
        </div>
      )}
    </div>
  );
}
