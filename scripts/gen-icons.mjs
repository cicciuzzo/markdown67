// One-off PWA icon generator. sharp is not a direct dep — it's pulled in by
// Next (optional dep), so resolve it through Next's module context.
// Run: node scripts/gen-icons.mjs   (outputs PNGs into public/)
//
// The glyph is ツ (katakana tsu, the "shrug face"). No CJK font is installed and
// the default sans-serif renders it as tofu, so we draw it as vector strokes:
// two short top ticks (the "eyes") + one long hook sweeping down-left.
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
  throw new Error('sharp not resolvable — do not add a new dep; fall back to an SVG manifest icon');
}

const sharp = (await import(resolveSharp())).default;

const MARK = '#F6C445'; // amber highlighter (brand accent)
const INK = '#20222E'; // ink glyph, matches the in-app logo tile

// ツ drawn in a 100x100 space, white strokes. `safe` scales the glyph into the
// maskable safe zone; `round` controls the background corner radius.
const svg = (size, { safe = false, round = 18 } = {}) => {
  const scale = safe ? 0.72 : 1; // maskable: keep glyph within the safe zone
  const rx = round; // in the 100 viewBox
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
       <rect width="100" height="100" rx="${rx}" ry="${rx}" fill="${MARK}"/>
       <g transform="translate(50 50) scale(${scale}) translate(-50 -50)"
          fill="none" stroke="${INK}" stroke-width="7"
          stroke-linecap="round" stroke-linejoin="round">
         <path d="M27 31 L36 42"/>
         <path d="M46 28 L55 39"/>
         <path d="M70 26 C 73 49 70 63 30 71"/>
       </g>
     </svg>`,
  );
};

const out = (name) => join(root, 'public', name);
const jobs = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-512-maskable.png', 512, { safe: true, round: 0 }],
  ['apple-touch-icon.png', 180, {}],
];

for (const [name, size, opts] of jobs) {
  await sharp(svg(size, opts)).png().toFile(out(name));
  console.log('wrote', name);
}
console.log('done');
