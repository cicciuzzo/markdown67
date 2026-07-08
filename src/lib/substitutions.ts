// Typographic auto-substitutions shared by both editor panels.
//
// Tokens are applied on the character that COMPLETES them, longest-match first,
// so char-by-char typing of the ambiguous '<-' vs '<->' resolves correctly:
//   - on '>':  '<->' -> '↔'  (checked before '->' -> '→')
//   - on '=':  '<='  -> '≤'  and  '>=' -> '≥'
//   - '<-' -> '←' is DEFERRED: it only fires once a following char OTHER than
//     '>' "closes" it, so typing '<', '-', then '>' still becomes '↔', never
//     the premature '←' + '>'. A lone trailing '<-' stays literal until the
//     next keystroke (boundary) resolves it.
// Substitutions never fire inside inline code or fenced code blocks.
//
// Pure + framework-free so src/lib/__checks__/checks.mjs can mirror & assert it.

// completing char -> [token, replacement][] (longest token first)
const ON_COMPLETE: Record<string, ReadonlyArray<readonly [string, string]>> = {
  '>': [
    ['<->', '↔'],
    ['->', '→'],
  ],
  '=': [
    ['<=', '≤'],
    ['>=', '≥'],
  ],
};

// Heuristic: does index `pos` sit inside inline code or a fenced code block?
// ponytail: line-based fence parity + per-line backtick parity, not a real
// markdown parser — enough to keep arrows out of `code` while typing.
export function isInCode(text: string, pos: number): boolean {
  const before = text.slice(0, pos);
  const fences = (before.match(/^[ \t]*(?:```|~~~)/gm) || []).length;
  if (fences % 2 === 1) return true; // inside an open fenced block
  const lineStart = before.lastIndexOf('\n') + 1;
  const ticks = (before.slice(lineStart).match(/`/g) || []).length;
  return ticks % 2 === 1; // inside an open inline-code span on this line
}

// Apply at most one substitution based on the char just typed at `caret`
// (caret = index AFTER that char). Returns the possibly-updated text and the
// adjusted caret; identity when nothing matches.
export function applySubstitution(
  text: string,
  caret: number,
): { text: string; caret: number } {
  const same = { text, caret };
  if (caret < 2 || caret > text.length) return same;
  const typed = text[caret - 1];

  // Deferred left-arrow: '<-' is closed by any following char other than '>'.
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
}
