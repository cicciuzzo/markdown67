// Footer shrug that "waves": right arm up by default; while hovered the two
// frames alternate in an infinite loop (~0.3s/frame) for a waving effect. Both
// frames are 7 chars so there's no layout shift. Styles live in globals.css
// (.shrug-wave). No client JS needed — pure CSS hover-driven keyframes.
export default function Shrug() {
  return (
    <span className="shrug-wave select-none font-mono text-ink" aria-hidden>
      <span className="shrug-r">{'-_(ツ)/¯'}</span>
      <span className="shrug-l">{'¯\\(ツ)_-'}</span>
    </span>
  );
}
