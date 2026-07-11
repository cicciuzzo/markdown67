import type { BlockNoteEditor } from '@blocknote/core';

// ponytail: BlockNote markdown conversion is lossy AND async, and needs the
// editor instance (no standalone pure fns exist). Round-trip is NOT identity,
// so the raw markdown string stays the app's source of truth — these helpers
// are only for driving the WYSIWYG view.

export async function blocksToMarkdown(editor: BlockNoteEditor): Promise<string> {
  return editor.blocksToMarkdownLossy(editor.document);
}

export async function markdownToBlocks(editor: BlockNoteEditor, md: string) {
  // BlockNote's remark parser doesn't handle CRLF: `\r\n` fences are left
  // unrecognized (code blocks dumped as paragraphs). Normalize to LF at the one
  // chokepoint every parse path flows through (upload, paste, draft, sample).
  return editor.tryParseMarkdownToBlocks(md.replace(/\r\n?/g, '\n'));
}

// Canonicalize hard line breaks to the BACKSLASH form for reliable round-trips.
// Trailing-space breaks ("  \n") are invisible and get stripped in the
// marked/BlockNote round-trip; "\\\n" is explicit and survives. Rule: a
// non-empty line ending in >=2 spaces that is FOLLOWED by another non-empty line
// is an intra-paragraph hard break -> replace the trailing spaces with " \\".
// Trailing spaces before a blank line (paragraph end) are left untouched.
// Fenced code blocks (``` / ~~~) are passed through verbatim.
export function normalizeHardBreaks(md: string): string {
  const lines = md.split('\n');
  let inFence = false;
  let fenceChar = '';
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^\s*(```+|~~~+)/);
    if (fence) {
      // ponytail: char-only fence matching; good enough for well-formed .md
      const ch = fence[1][0];
      if (!inFence) { inFence = true; fenceChar = ch; }
      else if (ch === fenceChar) { inFence = false; fenceChar = ''; }
      continue;
    }
    if (inFence) continue;
    const next = lines[i + 1];
    if (next !== undefined && next.trim() !== '' && / {2,}$/.test(lines[i])) {
      lines[i] = lines[i].replace(/ +$/, ' \\');
    }
  }
  return lines.join('\n');
}
