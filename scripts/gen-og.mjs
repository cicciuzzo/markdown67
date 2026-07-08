// One-off Open Graph image generator (1200x630 -> public/og.png).
// sharp is resolved through Next's module context (same trick as gen-icons.mjs).
// Run: node scripts/gen-og.mjs
//
// On-brand "Ink & Highlighter": paper background, ink wordmark, amber logo tile
// with the vector ツ (no CJK font available -> drawn as strokes), and an amber
// highlighter bar behind the tagline. Latin text renders via system fonts.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function resolveSharp() {
  const attempts = [
    () => require.resolve('sharp'),
    () => require.resolve('sharp', { paths: [require.resolve('next/package.json', { paths: [root] })] }),
  ];
  for (const a of attempts) {
    try {
      return a();
    } catch {
      /* next attempt */
    }
  }
  throw new Error('sharp not resolvable — do not add a new dep');
}

const sharp = (await import(resolveSharp())).default;

const PAPER = '#E9EBF0';
const INK = '#20222E';
const MUTED = '#5A5F6E';
const MARK = '#F6C445';

// ツ vector (100x100 space) reused from the icon generator.
const tsu = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s}) translate(-50 -50)"
     fill="none" stroke="${INK}" stroke-width="7"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M27 31 L36 42"/>
    <path d="M46 28 L55 39"/>
    <path d="M70 26 C 73 49 70 63 30 71"/>
  </g>`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <!-- logo tile -->
  <rect x="100" y="120" width="104" height="104" rx="22" fill="${MARK}"/>
  ${tsu(152, 172, 1.0)}
  <text x="228" y="200" font-family="sans-serif" font-size="60" font-weight="800" fill="${INK}">Markdown 67</text>

  <!-- tagline with a highlighter swipe behind the second line -->
  <text x="100" y="360" font-family="sans-serif" font-size="66" font-weight="800" fill="${INK}">Write Markdown</text>
  <rect x="96" y="398" width="612" height="74" rx="10" fill="${MARK}"/>
  <text x="112" y="452" font-family="sans-serif" font-size="66" font-weight="800" fill="${INK}">the way you think it</text>

  <text x="100" y="540" font-family="sans-serif" font-size="30" fill="${MUTED}">Visual + raw editor, in sync. Export ready-to-use .md.</text>
  <text x="100" y="582" font-family="sans-serif" font-size="26" font-weight="600" fill="${MUTED}">markdown67.app  ·  free  ·  no sign-up  ·  nothing leaves your browser</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(join(root, 'public', 'og.png'));
console.log('wrote public/og.png');
