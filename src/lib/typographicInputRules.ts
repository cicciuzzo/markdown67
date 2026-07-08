// Typographic auto-substitutions for the WYSIWYG (BlockNote) panel — the mirror
// of src/lib/substitutions.ts, which does the same job on the raw side.
// Same table/symbols: '->'→'→', '<-'→'←', '<->'→'↔', '<='→'≤', '>='→'≥'.
//
// Implemented as a TipTap Extension providing ProseMirror input rules, wired
// into BlockNote at creation time via `_tiptapOptions.extensions`.
//
// Two behaviours we get "for free" from TipTap's input-rules plugin
// (@tiptap/core inputRulesPlugin / run):
//   1. CODE EXCLUSION is built in. Before running any rule the plugin bails when
//      the caret is inside a code block (`$from.parent.type.spec.code`) or an
//      inline `code` mark (`nodeBefore/nodeAfter` carries a mark whose
//      `spec.code` is true). So arrows never fire inside code — no manual guard
//      needed here. (Verified against @tiptap/core 3.27.3 dist/index.js — the
//      code-exclusion guard survived the TipTap 3 rewrite: inputRulesPlugin still
//      bails on `$from.parent.type.spec.code` or an adjacent `spec.code` mark.)
//   2. Rules fire on the character that was just typed, first match wins.
//
// AMBIGUITY '<-' vs '<->' — resolved without any deferred/stateful logic:
//   Typing '<','-','>' step by step, the rules fire per keystroke:
//     '-' typed -> textBefore ends '<-'  -> /<-$/  turns it into '←'
//     '>' typed -> textBefore ends '←>'  -> /←>$/  turns it into '↔'
//   So '<->' still resolves to '↔' even though '<-' eagerly became '←' first.
//   /<->$/ is a fallback for multi-char inserts (paste/programmatic) where all
//   three chars arrive together and '←' was never produced.
//   (This is the one behavioural difference from the raw side, which DEFERS
//    '<-'→'←'; the eager form is what the task specified for WYSIWYG.)
import { Extension, textInputRule } from '@tiptap/core';

// Ordered: FIRST MATCH WINS. Each `find` is anchored at end-of-input ($) so it
// only matches the token the caret just completed. /<->$/ MUST precede /->$/,
// since a whole '<->' ends in '->' and /->$/ would otherwise claim it first.
export const ARROW_RULES: ReadonlyArray<{ find: RegExp; replace: string }> = [
  { find: /<->$/, replace: '↔' }, // fallback: pasted/inserted whole; before /->$/
  { find: /->$/, replace: '→' },
  { find: /<=$/, replace: '≤' },
  { find: />=$/, replace: '≥' },
  { find: /<-$/, replace: '←' },
  { find: /←>$/, replace: '↔' }, // '<-' already became '←', '>' completes it
];

// Pure matcher mirrored by src/lib/__checks__/checks.mjs. Given the text ending
// at the caret, returns the winning replacement and how many chars it consumes,
// or null. (The real code-exclusion guard lives in TipTap's plugin, above.)
export function matchArrowRule(
  textBefore: string,
): { replace: string; length: number } | null {
  for (const { find, replace } of ARROW_RULES) {
    const m = textBefore.match(find);
    if (m) return { replace, length: m[0].length };
  }
  return null;
}

export const TypographicInputRules = Extension.create({
  name: 'typographicArrows',
  addInputRules() {
    return ARROW_RULES.map(({ find, replace }) => textInputRule({ find, replace }));
  },
});
