'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import { filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import {
  FormattingToolbar,
  FormattingToolbarController,
  BlockTypeSelect,
  BasicTextStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  SideMenu,
  SideMenuController,
  AddBlockButton,
  DragHandleButton,
  DragHandleMenu,
  RemoveBlockItem,
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  EditLinkMenuItems,
} from '@blocknote/react';
import '@blocknote/mantine/style.css';

// Heuristic: does the selected text look like a URL we can pre-fill the link
// popover with? scheme://… or a bare domain (foo.com, sub.foo.co.uk, +path).
// No trailing/leading whitespace allowed — a real single-token URL.
function looksLikeUrl(s: string): boolean {
  const t = s.trim();
  if (!t || /\s/.test(t)) return false;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) || /^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i.test(t);
}

const LinkGlyph = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M18.364 15.536 16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607 1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
  </svg>
);

// B4a: a Create-Link button that pre-fills the URL field. BlockNote's stock
// CreateLinkButton seeds the URL only from getSelectedLinkUrl() (empty unless
// the selection is already a link). We also seed it from the selection when the
// selected text itself looks like a URL. Seed is captured at click time so it
// survives the selection settling while the popover opens.
function CreateLinkButtonPrefilled() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState<{ url: string; text: string; range: { from: number; to: number } }>({
    url: '',
    text: '',
    range: { from: 0, to: 0 },
  });

  const capture = () => {
    const text = editor.getSelectedText();
    const existing = editor.getSelectedLinkUrl();
    const sel = editor.prosemirrorState.selection;
    setSeed({
      url: existing || (looksLikeUrl(text) ? text.trim() : ''),
      text,
      range: { from: sel.from, to: sel.to },
    });
  };

  return (
    <Components.Generic.Popover.Root open={open} onOpenChange={setOpen}>
      <Components.Generic.Popover.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label={dict.formatting_toolbar.link.tooltip}
          mainTooltip={dict.formatting_toolbar.link.tooltip}
          icon={<LinkGlyph />}
          onClick={() => {
            if (!open) capture();
            setOpen((o) => !o);
          }}
        />
      </Components.Generic.Popover.Trigger>
      <Components.Generic.Popover.Content className="bn-popover-content bn-form-popover" variant="form-popover">
        <EditLinkMenuItems
          url={seed.url}
          text={seed.text}
          range={seed.range}
          showTextField={false}
          setToolbarOpen={setOpen}
        />
      </Components.Generic.Popover.Content>
    </Components.Generic.Popover.Root>
  );
}

// Only formatting that survives markdown serialization. Omits color, background,
// text alignment and underline — BlockNote drops those on blocksToMarkdownLossy,
// so offering them would silently lose the user's styling on the raw side.
function MarkdownFormattingToolbar() {
  return (
    <FormattingToolbar>
      <BlockTypeSelect key="blockType" />
      <BasicTextStyleButton basicTextStyle="bold" key="bold" />
      <BasicTextStyleButton basicTextStyle="italic" key="italic" />
      <BasicTextStyleButton basicTextStyle="strike" key="strike" />
      <BasicTextStyleButton basicTextStyle="code" key="code" />
      <CreateLinkButtonPrefilled key="link" />
      <NestBlockButton key="nest" />
      <UnnestBlockButton key="unnest" />
    </FormattingToolbar>
  );
}

// Slash-menu blocks with no markdown equivalent (media are file embeds, page
// break is HTML). Keep headings, lists, paragraph, code, quote, table.
const NON_MARKDOWN_SLASH = new Set(['image', 'video', 'audio', 'file', 'page_break']);

// B2: block types that trap the caret when they're the last block in the doc, so
// clicking below them must create a paragraph rather than re-enter the block.
const TRAPPING_LAST_BLOCKS = new Set(['codeBlock', 'table', 'divider', 'image', 'video', 'audio', 'file']);

function markdownSlashItems(editor: BlockNoteEditor) {
  return getDefaultReactSlashMenuItems(editor).filter((item) => {
    // Type omits `key`, but it's present at runtime; fall back to title.
    const key = (item as { key?: string }).key;
    if (key) return !NON_MARKDOWN_SLASH.has(key);
    return !['image', 'video', 'audio', 'file'].includes(item.title.trim().toLowerCase());
  });
}

export default function WysiwygPanel({
  editor,
  frozen,
  onChange,
  active,
  onActivate,
  errorMessage,
  theme,
  onDragStart,
  onEdit,
}: {
  // Base BlockNoteEditor: BlockNote's schema generics are invariant, so the
  // concrete default-schema instance is bridged with a cast in the parent.
  editor: BlockNoteEditor;
  frozen: boolean;
  onChange: () => void;
  active: boolean;
  onActivate: () => void;
  errorMessage?: string;
  // Driven by EditorApp so BlockNote flips together with the CSS tokens (E9).
  theme: 'light' | 'dark';
  // B3-edge: fired when a block-reorder drag starts, so the parent can cancel a
  // pending useEditorSync debounce that would otherwise fire mid-drag.
  onDragStart?: () => void;
  // B1 edit-gate: fired on a genuine user edit so the parent opens the write-back
  // gate. Focus/selection alone must NOT fire this.
  onEdit?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Drag-aware serialization gate (B3-fix). BlockNote's block-reorder uses
  // native HTML5 drag and fires onChange on every micro-step of the drag;
  // serializing a mid-drag (transitory) document yields garbled/concatenated
  // markdown plus redundant churn. Suspend serialization while a drag is in
  // flight, then emit exactly ONE after it ends. Listeners live on this panel's
  // container: BlockNote renders the drag handle inside the editor subtree, so
  // dragstart/dragend bubble up here, while header file-upload drags stay out.
  const handleChange = useCallback(() => {
    if (draggingRef.current) return; // suspend WYSIWYG->state during a drag
    onChange();
  }, [onChange]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const onDragStartEvt = () => {
      draggingRef.current = true;
      // B3-edge: kill any debounce scheduled just before this drag began.
      onDragStart?.();
    };
    const onDragEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // rAF: let the drop settle into the document, then serialize once.
      requestAnimationFrame(() => onChange());
    };
    root.addEventListener('dragstart', onDragStartEvt);
    root.addEventListener('dragend', onDragEnd);
    return () => {
      root.removeEventListener('dragstart', onDragStartEvt);
      root.removeEventListener('dragend', onDragEnd);
    };
  }, [onChange, onDragStart]);

  // B1 edit-gate: distinguish a real user edit from BlockNote's focus-time
  // normalization onChange. Only these input events open the parent's write-back
  // gate; plain focus/selection never fires them. Gated on `active` so events
  // bubbling up while the panel is inactive are ignored.
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !active) return;
    const fire = () => onEdit?.();
    // keydown covers typing and formatting shortcuts (Cmd/Ctrl+B etc.).
    const inputEvents = ['beforeinput', 'paste', 'drop', 'cut', 'keydown'] as const;
    // Toolbar formatting via mouse click emits no beforeinput; a pointerdown on
    // any BlockNote toolbar (formatting/link) counts as edit intent.
    // ponytail: mousedown on a toolbar is treated as an edit even if the click is
    // ultimately a no-op (e.g. pressing an already-inactive button and dismissing)
    // — worst case the gate opens and the next real onChange writes identical md.
    const onPointerDown = (e: Event) => {
      if ((e.target as HTMLElement).closest('.bn-toolbar')) onEdit?.();
    };
    inputEvents.forEach((t) => root.addEventListener(t, fire));
    root.addEventListener('pointerdown', onPointerDown);
    return () => {
      inputEvents.forEach((t) => root.removeEventListener(t, fire));
      root.removeEventListener('pointerdown', onPointerDown);
    };
  }, [active, onEdit]);

  // Put the caret at the end of the document. Used when the click lands on the
  // empty card area rather than on a block, so you don't have to aim precisely.
  const focusEnd = () => {
    editor.focus();
    const blocks = editor.document;
    const last = blocks[blocks.length - 1];
    if (!last) return;
    const addParagraphAfter = () => {
      try {
        const [p] = editor.insertBlocks([{ type: 'paragraph' }], last.id, 'after');
        editor.setTextCursorPosition(p.id, 'end');
      } catch {
        // ponytail: give up quietly; focus() already ran.
      }
    };
    // B2: blocks that trap the caret when they're last — a table/divider/media
    // has no text cursor, and a code block swallows Enter, so there's no way to
    // type below them. Clicking the empty area under the content drops you into a
    // fresh paragraph after the block instead of back inside it.
    if (TRAPPING_LAST_BLOCKS.has(last.type)) {
      addParagraphAfter();
      return;
    }
    try {
      editor.setTextCursorPosition(last.id, 'end');
    } catch {
      addParagraphAfter();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onActivate();
    // Empty card area -> drop the caret at the end. rAF so it runs after
    // `editable` flips true on activation.
    // Leave editor content, buttons, form controls, and any floating BlockNote
    // UI alone: BlockNote's toolbars/menus/popovers are portaled but their
    // clicks still bubble here through React's tree, and preventDefault() on a
    // popover input robs it of focus (e.g. the link "Edit" popover fields).
    const el = e.target as HTMLElement;
    if (
      el.closest('.bn-editor') ||
      el.closest('button, input, textarea, select, label, a[href]') ||
      el.closest('.bn-toolbar, .bn-popover-content, [class*="Popover"], [class*="Menu"], [class*="Tooltip"]')
    ) {
      return;
    }
    e.preventDefault();
    requestAnimationFrame(focusEnd);
  };

  return (
    <div ref={containerRef} className="relative h-full p-1" onMouseDown={handleMouseDown}>
      <BlockNoteView
        editor={editor}
        theme={theme}
        editable={active && !frozen}
        onChange={handleChange}
        formattingToolbar={false}
        slashMenu={false}
        sideMenu={false}
      >
        <FormattingToolbarController formattingToolbar={MarkdownFormattingToolbar} />

        {/* E2: the slash menu renders inline (not portaled) inside the editor,
            which sits in a scroll container (`overflow-auto` on the panel's
            <section>). With the default `absolute` strategy that container both
            visually clips the popover near the bottom edge and bounds floating-ui's
            flip/size, so it can't open upward. `strategy: 'fixed'` positions it
            against the viewport (no ancestor is a fixed containing block), so it
            escapes the clip and flips correctly — no manual positioning needed.
            0.51 rename: the old `floatingOptions={{ strategy }}` is now
            `floatingUIOptions.useFloatingOptions.strategy` (floating-ui passthrough). */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(markdownSlashItems(editor), query)}
          floatingUIOptions={{ useFloatingOptions: { strategy: 'fixed' } }}
        />

        {/* Drag-handle menu without the "Colors" item (no markdown equivalent). */}
        <SideMenuController
          sideMenu={(props) => (
            <SideMenu {...props}>
              {/* 0.51: AddBlockButton reads block context internally — no props. */}
              <AddBlockButton />
              <DragHandleButton
                {...props}
                dragHandleMenu={(menuProps) => (
                  <DragHandleMenu {...menuProps}>
                    <RemoveBlockItem {...menuProps}>Delete</RemoveBlockItem>
                  </DragHandleMenu>
                )}
              />
            </SideMenu>
          )}
        />
      </BlockNoteView>

      {frozen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 p-4 text-center backdrop-blur-[1px]">
          <div>
            <p className="font-display text-base font-bold text-danger">WYSIWYG frozen</p>
            <p className="mt-1 text-sm text-inksoft">
              {errorMessage ?? 'Fix the raw markdown to resume editing here.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
