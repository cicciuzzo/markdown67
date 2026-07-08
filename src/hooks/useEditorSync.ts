import { useCallback, useEffect, useRef } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import type { EditorMode } from '@/types';
import { blocksToMarkdown, markdownToBlocks } from '@/lib/markdown';

// Sync model: the raw markdown string is the single source of truth. Only ONE
// panel is active. Sync flows one direction, active panel -> state -> inactive
// panel. We NEVER auto-round-trip BlockNote output back over the raw buffer
// (it's lossy). BlockNote conversion is async, so effects guard stale results.
//
// - mode 'raw'  : the raw editor drives state; we push valid markdown INTO the
//                 WYSIWYG. Invalid markdown FREEZES the WYSIWYG (we skip it).
// - mode 'wysiwyg': the WYSIWYG drives state via handleWysiwygChange (debounced).
//
// ponytail: no bidirectional continuous sync; plain setTimeout debounce.
export function useEditorSync(params: {
  editor: BlockNoteEditor | null;
  mode: EditorMode;
  markdown: string;
  setMarkdown: (md: string) => void;
  valid: boolean;
}): {
  handleWysiwygChange: () => void;
  reseedWysiwyg: (md: string) => void;
  cancelPending: () => void;
  markWysiwygEdited: () => void;
  clearWysiwygDirty: () => void;
} {
  const { editor, mode, markdown, setMarkdown, valid } = params;

  // True only while we're programmatically rewriting BlockNote's document, so
  // the resulting onChange doesn't round-trip back over the raw buffer. The
  // raw-mode effect below doesn't need it (handleWysiwygChange is already gated
  // on mode==='wysiwyg'); reseedWysiwyg does, because it runs WHILE wysiwyg is
  // the active panel (external replace: draft delete / upload).
  const seeding = useRef(false);

  // B1 edit-gate: the raw buffer (source of truth) must change only after a REAL
  // user edit in the WYSIWYG. Merely focusing the panel makes BlockNote emit a
  // normalization transaction (docChanged) that would otherwise pass the
  // mode==='wysiwyg' guard and overwrite raw with a lossy re-serialization. The
  // panel sets this true on genuine input events; write-back is gated on it.
  const dirty = useRef(false);
  const markWysiwygEdited = useCallback(() => {
    dirty.current = true;
  }, []);
  const clearWysiwygDirty = useCallback(() => {
    dirty.current = false;
  }, []);

  // Re-seed the WYSIWYG from an EXTERNAL markdown source (draft delete, upload)
  // even while the wysiwyg panel is active — the raw-mode effect can't cover
  // that because it's gated on mode==='raw'. Same parse+replace+empty-fallback
  // as the effect below.
  const reseedWysiwyg = useCallback(
    async (md: string) => {
      if (!editor) return;
      const blocks = await markdownToBlocks(editor, md);
      seeding.current = true;
      try {
        // ponytail: replaceBlocks(all, []) throws for empty md -> empty paragraph.
        editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: 'paragraph' }]);
      } catch {
        // ignore transient replace errors
      }
      // onChange fires synchronously inside replaceBlocks, so it's safe to clear
      // the flag right after (ponytail: no async settle).
      seeding.current = false;
      // Programmatic seed, not a user edit — keep the gate closed.
      dirty.current = false;
    },
    [editor],
  );

  // Push raw markdown INTO the WYSIWYG when the raw panel is active and valid.
  useEffect(() => {
    if (mode !== 'raw' || !valid || !editor) return;
    let cancelled = false;
    void (async () => {
      const blocks = await markdownToBlocks(editor, markdown);
      // Drop stale async result if a newer change superseded this run.
      if (cancelled) return;
      try {
        // ponytail: empty markdown -> [] and replaceBlocks(all, []) throws in
        // BlockNote; fall back to a single empty paragraph.
        editor.replaceBlocks(editor.document, blocks.length ? blocks : [{ type: 'paragraph' }]);
      } catch {
        // ignore transient replace errors during rapid edits
      }
      // This seed's onChange is a programmatic write, not a user edit.
      dirty.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, [markdown, mode, valid, editor]);

  // WYSIWYG -> state: debounced blocksToMarkdown on the editor's onChange.
  // CRITICAL: only write back when the WYSIWYG panel is actually active.
  // BlockNote fires onChange for our own programmatic replaceBlocks too, so
  // without this guard, typing in the raw panel triggers a lossy round-trip
  // that clobbers the raw text (and churns state, blocking auto-save).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleWysiwygChange = useCallback(() => {
    if (!editor || mode !== 'wysiwyg' || seeding.current) return;
    // B1 edit-gate: only write back after a genuine user edit. Focus-time
    // normalization transactions arrive with dirty=false and are ignored.
    if (!dirty.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setMarkdown(await blocksToMarkdown(editor));
    }, 150);
  }, [editor, mode, setMarkdown]);

  // B3-edge: drop a debounce timer that was scheduled in the ~150ms just before
  // a drag begins, so it can't fire mid-drag and write transitory markdown. The
  // WysiwygPanel calls this on dragstart; the forced serialization at dragend
  // still produces the single clean write.
  const cancelPending = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return { handleWysiwygChange, reseedWysiwyg, cancelPending, markWysiwygEdited, clearWysiwygDirty };
}
