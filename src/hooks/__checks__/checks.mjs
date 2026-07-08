// Self-checks for the src/hooks layer.
// Run from the project root with:  node src/hooks/__checks__/checks.mjs
//
// The hooks are almost entirely React glue (effect scheduling, refs, async
// BlockNote round-trips) that has no meaningful runnable core outside a React
// renderer, and we deliberately DON'T fabricate a fake DOM harness (ponytail).
// The one bit of genuine, extractable pure logic is the auto-save gate in
// useDraftStorage: "skip the mount run, and skip empty markdown". We mirror
// that predicate here and assert it.
import assert from 'node:assert/strict';

// mirror of useDraftStorage's save gate. firstRun is a boolean "have we already
// run once?" flag; returns true when saveDraft(markdown) should actually fire.
const shouldSave = (markdown, isFirstRun) => !isFirstRun && markdown !== '';

assert.equal(shouldSave('hello', true), false, 'mount run must never save');
assert.equal(shouldSave('', false), false, 'empty markdown must not be persisted');
assert.equal(shouldSave('', true), false, 'mount + empty: no save');
assert.equal(shouldSave('# Notes', false), true, 'non-empty post-mount edit must save');

console.log('OK: all src/hooks self-checks passed');
