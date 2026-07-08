// Self-checks for the src/lib pure-function layer.
// Run from the project root with:  node src/lib/__checks__/checks.mjs
// No bundler / DOM needed: reimplements the tiny pure logic and drives the
// real `marked` + `date-fns` deps. storage/download DOM paths are covered by
// their pure sub-logic (TTL math, filename builder) only.
import assert from 'node:assert/strict';
import { marked } from 'marked';
import { format } from 'date-fns';

// --- mirrors of the pure logic in the .ts files ---
const TTL_MS = 72 * 60 * 60 * 1000;
const isDraftExpired = (draft) => Date.now() > draft.expiresAt;
const buildDownloadFilename = (date = new Date()) => `MD67_${format(date, 'yyyy-MM-dd_HH-mm-ss')}.md`;
const validateUploadFile = (file) =>
  file.name.toLowerCase().endsWith('.md') ? { valid: true } : { valid: false, error: 'File must have a .md extension' };
const validateMarkdownString = (input) => {
  if (input === '') return { valid: true };
  try { marked.parse(input, { gfm: true }); return { valid: true }; }
  catch (e) { return { valid: false, error: e instanceof Error ? e.message : String(e) }; }
};

// --- TTL ---
const now = Date.now();
assert.equal(isDraftExpired({ content: '', timestamp: now, expiresAt: now + TTL_MS }), false, 'fresh draft must not be expired');
assert.equal(isDraftExpired({ content: '', timestamp: now, expiresAt: now - 1 }), true, 'past-expiry draft must be expired');

// --- filename format ---
const fname = buildDownloadFilename();
assert.match(fname, /^MD67_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.md$/, `bad filename: ${fname}`);

// --- validateUploadFile ---
assert.equal(validateUploadFile({ name: 'notes.txt' }).valid, false, 'notes.txt must be rejected');
assert.equal(validateUploadFile({ name: 'notes.md' }).valid, true, 'notes.md must be accepted');
assert.equal(validateUploadFile({ name: 'NOTES.MD' }).valid, true, 'NOTES.MD must be accepted');

// --- validateMarkdownString ---
assert.equal(validateMarkdownString('').valid, true, 'empty string is valid');
assert.equal(validateMarkdownString('# Hi\n\n- [x] done\n\n| a | b |\n|---|---|\n| 1 | 2 |').valid, true, 'GFM sample is valid');

// --- canUseClipboardApi (mirror of the pure branch in fileOps.ts) ---
const canUseClipboardApi = (secureContext, hasClipboard) => secureContext && hasClipboard;
assert.equal(canUseClipboardApi(true, true), true, 'secure + clipboard => use API');
assert.equal(canUseClipboardApi(false, true), false, 'http (not secure) => fall back to execCommand');
assert.equal(canUseClipboardApi(true, false), false, 'no clipboard API => fall back');
assert.equal(canUseClipboardApi(false, false), false, 'neither => fall back');

// --- normalizeHardBreaks (mirror of the pure logic in markdown.ts) ---
const normalizeHardBreaks = (md) => {
  const lines = md.split('\n');
  let inFence = false, fenceChar = '';
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^\s*(```+|~~~+)/);
    if (fence) {
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
};
// 2-space hard break between two non-empty lines -> backslash form
assert.equal(normalizeHardBreaks('a  \nb'), 'a \\\nb', '2-space hard break must become backslash');
// trailing spaces before a blank line (paragraph end) -> left untouched
assert.equal(normalizeHardBreaks('a  \n\nb'), 'a  \n\nb', 'paragraph-end trailing spaces must not convert');
// content inside a ``` fence must not be touched
assert.equal(
  normalizeHardBreaks('```\ncode  \nmore\n```'),
  '```\ncode  \nmore\n```',
  'trailing spaces inside a code fence must be preserved',
);

// --- substitutions (mirror of src/lib/substitutions.ts) ---
const ON_COMPLETE = {
  '>': [['<->', '↔'], ['->', '→']],
  '=': [['<=', '≤'], ['>=', '≥']],
};
const isInCode = (text, pos) => {
  const before = text.slice(0, pos);
  const fences = (before.match(/^[ \t]*(?:```|~~~)/gm) || []).length;
  if (fences % 2 === 1) return true;
  const lineStart = before.lastIndexOf('\n') + 1;
  const ticks = (before.slice(lineStart).match(/`/g) || []).length;
  return ticks % 2 === 1;
};
const applySubstitution = (text, caret) => {
  const same = { text, caret };
  if (caret < 2 || caret > text.length) return same;
  const typed = text[caret - 1];
  if (typed !== '>' && caret >= 3 && text.slice(caret - 3, caret - 1) === '<-') {
    if (isInCode(text, caret - 3)) return same;
    return { text: text.slice(0, caret - 3) + '←' + text.slice(caret - 1), caret: caret - 1 };
  }
  const rules = ON_COMPLETE[typed];
  if (!rules) return same;
  for (const [token, repl] of rules) {
    const start = caret - token.length;
    if (start >= 0 && text.slice(start, caret) === token && !isInCode(text, start)) {
      return { text: text.slice(0, start) + repl + text.slice(caret), caret: start + repl.length };
    }
  }
  return same;
};
const sub = (t, c) => applySubstitution(t, c);
// simple completions (caret at end of the just-typed token)
assert.deepEqual(sub('->', 2), { text: '→', caret: 1 }, '-> becomes →');
assert.deepEqual(sub('<->', 3), { text: '↔', caret: 1 }, '<-> becomes ↔ (longest match on >)');
assert.deepEqual(sub('<=', 2), { text: '≤', caret: 1 }, '<= becomes ≤');
assert.deepEqual(sub('>=', 2), { text: '≥', caret: 1 }, '>= becomes ≥');
// the ambiguity: '<-' alone must NOT convert yet (could still become '<->')
assert.deepEqual(sub('<-', 2), { text: '<-', caret: 2 }, 'lone <- stays literal (may extend to <->)');
// '<-' resolves to ← only once a non-'>' char closes it (boundary)
assert.deepEqual(sub('<- ', 3), { text: '← ', caret: 2 }, '<- + space becomes ← + space');
assert.deepEqual(sub('<-x', 3), { text: '←x', caret: 2 }, '<- + letter becomes ← + letter');
// prefix context: '<->' after text takes the ↔ branch, not →
assert.equal(sub('a<->', 4).text, 'a↔', 'trailing <-> after text -> ↔');
// code exclusion: inline code and fenced blocks are left untouched
assert.deepEqual(sub('`->', 3), { text: '`->', caret: 3 }, 'inline code: -> not converted');
assert.deepEqual(sub('```\n->', 6), { text: '```\n->', caret: 6 }, 'fenced block: -> not converted');
assert.equal(sub('`code` ->', 9).text, '`code` →', 'after a closed inline span, -> converts');

// --- WYSIWYG arrow input rules (mirror of src/lib/typographicInputRules.ts) ---
// Pure part only: the ordered rule table + first-match matcher. Code exclusion
// is enforced by TipTap's input-rules plugin at runtime (not reproducible here).
const ARROW_RULES = [
  { find: /<->$/, replace: '↔' }, // before /->$/: '<->' ends in '->'
  { find: /->$/, replace: '→' },
  { find: /<=$/, replace: '≤' },
  { find: />=$/, replace: '≥' },
  { find: /<-$/, replace: '←' },
  { find: /←>$/, replace: '↔' },
];
const matchArrowRule = (textBefore) => {
  for (const { find, replace } of ARROW_RULES) {
    const m = textBefore.match(find);
    if (m) return { replace, length: m[0].length };
  }
  return null;
};
// each token resolves on the char that completes it
assert.deepEqual(matchArrowRule('a->'), { replace: '→', length: 2 }, '-> matches →');
assert.deepEqual(matchArrowRule('x<='), { replace: '≤', length: 2 }, '<= matches ≤');
assert.deepEqual(matchArrowRule('x>='), { replace: '≥', length: 2 }, '>= matches ≥');
assert.deepEqual(matchArrowRule('x<-'), { replace: '←', length: 2 }, '<- matches ← (eager)');
// the ambiguity, step by step: '<-' -> '←', then typing '>' gives '←>' -> '↔'
assert.deepEqual(matchArrowRule('←>'), { replace: '↔', length: 2 }, '←> completes to ↔');
// pasted '<->' arriving whole falls back to the ↔ rule
assert.deepEqual(matchArrowRule('a<->'), { replace: '↔', length: 3 }, 'whole <-> matches ↔');
// no partial token yet -> no match
assert.equal(matchArrowRule('<'), null, 'lone < does not match');
assert.equal(matchArrowRule('plain text'), null, 'ordinary text does not match');

console.log('OK: all src/lib self-checks passed');
