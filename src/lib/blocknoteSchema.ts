import { BlockNoteSchema, createCodeBlockSpec, defaultBlockSpecs } from '@blocknote/core';

// BlockNote 0.51 dropped the built-in language list from the default code block
// (to shrink the bundle), so the language <select> only renders when the schema
// supplies `supportedLanguages`. We restore the dropdown with a curated list.
// No `createHighlighter` is passed — that would need Shiki (a heavy new dep), so
// blocks are correct monospace + language-tagged but not syntax-colored. The
// language round-trips to/from the markdown fence info-string. In dev, BlockNote
// logs a harmless one-time note about the missing highlighter.
// ponytail: hand-picked common languages; add more here if users ask.
const SUPPORTED_LANGUAGES: Record<string, { name: string; aliases?: string[] }> = {
  text: { name: 'Plain Text', aliases: ['plain', 'txt'] },
  bash: { name: 'Bash', aliases: ['sh', 'shell', 'zsh'] },
  c: { name: 'C' },
  cpp: { name: 'C++', aliases: ['c++'] },
  csharp: { name: 'C#', aliases: ['cs'] },
  css: { name: 'CSS' },
  diff: { name: 'Diff' },
  go: { name: 'Go', aliases: ['golang'] },
  html: { name: 'HTML' },
  java: { name: 'Java' },
  javascript: { name: 'JavaScript', aliases: ['js'] },
  json: { name: 'JSON' },
  kotlin: { name: 'Kotlin', aliases: ['kt'] },
  markdown: { name: 'Markdown', aliases: ['md'] },
  php: { name: 'PHP' },
  python: { name: 'Python', aliases: ['py'] },
  ruby: { name: 'Ruby', aliases: ['rb'] },
  rust: { name: 'Rust', aliases: ['rs'] },
  sql: { name: 'SQL' },
  swift: { name: 'Swift' },
  toml: { name: 'TOML' },
  typescript: { name: 'TypeScript', aliases: ['ts'] },
  xml: { name: 'XML' },
  yaml: { name: 'YAML', aliases: ['yml'] },
};

export const md67Schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec({
      defaultLanguage: 'text',
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
  },
});
