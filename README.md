<div align="center">

<img src="public/readme-banner.png" alt="Markdown67 — Write Markdown the way you think it" width="680">

**A frictionless, Notion-like WYSIWYG editor for Markdown, right in your browser.**

### ▶ Try it live at **[markdown67.app](https://markdown67.app)** (no install, no sign-up).

[![Live](https://img.shields.io/badge/live-markdown67.app-000)](https://markdown67.app)
[![Version](https://img.shields.io/github/package-json/v/cicciuzzo/markdown67?label=version)](https://github.com/cicciuzzo/markdown67/blob/main/package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![BlockNote](https://img.shields.io/badge/BlockNote-0.51-6366F1)](https://www.blocknotejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Static export](https://img.shields.io/badge/backend-none-lightgrey)](#architecture)

</div>

## The problem

Editing Markdown is still full of friction. Either you write **raw text** with the
syntax getting in your way (`##`, `**`, `- [ ]`, escaping, fenced blocks), or you
reach for a **WYSIWYG editor** that locks you into its own proprietary format and
hands you messy Markdown on export.

**Markdown67** removes the friction. A **Notion-like WYSIWYG panel** and the **raw
Markdown** live side by side, synced to the *same* document in real time. Write the
way you think, watch the Markdown stay clean, and walk away with a portable `.md`
file. No account, no upload, no backend. Everything runs in your browser.

## Features

- **Dual-panel editor**: WYSIWYG ⇄ raw Markdown, one document, one source of truth. Click the shrug between the mode chips to switch which side you drive.
- **Live GFM validation**: raw keystrokes are validated as GitHub-Flavored Markdown; the WYSIWYG freezes (instead of crashing) on invalid input, with a toast explaining why.
- **Native serialization**: conversion uses BlockNote's own `blocksToMarkdown` / `markdownToBlocks`, never hand-rolled parsing.
- **Local drafts**: auto-saved to `localStorage` with a 72h TTL; expired drafts are cleaned automatically. Nothing leaves your machine.
- **File I/O**: copy to clipboard, download a timestamped `MD67_YYYY-MM-DD_HH-MM-SS.md`, or upload/drag-drop an existing `.md` (validated by extension + GFM parse).
- **Onboarding**: first-visit welcome modal, reopenable from the footer; plus a small "Why 67?" easter egg.
- **Responsive**: side-by-side panels on desktop; below 1100px it collapses to a single-editor layout (one panel at a time, sync always on) that works on mobile and tablets.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router), exported as a fully static site (`output: 'export'`) |
| UI | React 19, Tailwind CSS 3 |
| WYSIWYG | BlockNote (Mantine) |
| Markdown validation | `marked` (GFM) |
| Syntax highlight | highlight.js |
| Dates / filenames | date-fns |
| Language | TypeScript 5 |
| Package manager | pnpm 9 |

No API routes, no database, no server functions. The browser does everything.

## Getting started

**Requirements:** Node 20+ and pnpm 9.

```bash
# pnpm is pinned to 9.15.9 (pnpm 10/11 need Node 22.13+)
corepack prepare pnpm@9.15.9 --activate

pnpm install
pnpm dev      # dev server on http://localhost:3067
```

Other commands:

```bash
pnpm build    # static export -> ./out
pnpm lint     # eslint (eslint-config-next)
pnpm test     # run the runnable self-checks for the pure lib/ and hooks/ logic
```

## Architecture

The whole app is a single editor screen with two synced views of one Markdown
document:

- The **Markdown string is the single source of truth.** WYSIWYG ⇄ raw sync flows
  from whichever panel is active to the inactive one; only one panel is active at a
  time.
- **Validation gates the WYSIWYG.** Raw keystrokes are debounced and validated as
  GFM before they reach BlockNote's parser, so malformed Markdown can never crash the
  rich editor.
- **Persistence is `localStorage` only**, with a 72h TTL and debounced auto-save.
- **File I/O is browser-native** (Blob download + File-as-text upload).
- Pure functions live in `src/lib/` (no React), stateful glue in `src/hooks/`, UI in
  `src/components/`. Because it's a static export, there are no API routes,
  middleware, or server functions.

`pnpm build` emits a plain static `./out` you can host anywhere: any static host,
CDN, or even `file://`. A `vercel.json` is included as an example that sets
security response headers (`X-Frame-Options`, `X-Content-Type-Options`, ...), since
`output: 'export'` ignores `next.config` `headers()`; on another host, configure the
equivalent headers there.

## Contributing

Issues and pull requests are welcome. To hack on it: fork, `pnpm install`,
`pnpm dev`, and run `pnpm test` before opening a PR. Bug reports go to the
[issue tracker](https://github.com/cicciuzzo/markdown67/issues).

## License

[MIT](./LICENSE) © Romano Battiti
