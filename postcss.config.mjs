// ponytail: .mjs not .ts — Next only loads postcss config as js/cjs/mjs, a .ts is silently ignored.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
