// Fits a display block to its column, whatever it says.
//
// All lines in a container share ONE size — the size at which the *widest*
// line exactly fills the column. Shorter lines are centred (or left-aligned,
// per the container's own CSS) and sit narrower.
//
// The measurement happens once to learn a ratio; the result is handed to CSS
// as a `cqw` (container query width) value so the browser keeps the fit at
// every width afterwards, with no resize handling. Relying on resize events
// and animation frames was the old failure mode: when they're throttled the
// name is left stale, overflowing its column by hundreds of px.
//
// What keeps it from breaking, whatever the name or style:
//   - It measures the real text in the real font, so a longer name, a
//     different weight or all-caps just produces a different size.
//   - After fitting it verifies the widest line, and corrects if it is over.
//   - It re-measures when the webfont arrives, and on a `pi:refit` event
//     (dispatched on `document`) for anything that changes the text or style.
//   - The CSS gives every line a safe estimate first (see Hero.astro), so the
//     name already fits before this script runs, or if it never does.
//   - `data-fit-max` (a share of the container width, like the result) puts a
//     ceiling on the size. Without it a very short name would be scaled to
//     fill the column and make the block absurdly tall — fitting the width
//     is only half of "doesn't break the layout".

const MAX_PASSES = 4;
const TOLERANCE = 0.5; // px

function fitLines(container: HTMLElement) {
  const lines = Array.from(container.querySelectorAll<HTMLElement>('[data-fit-line]'));
  if (lines.length === 0) return;

  const cs = getComputedStyle(container);
  const available =
    container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  // Hidden or not laid out yet: nothing to measure. The CSS estimate stands.
  if (!(available > 0)) return;

  const widest = () =>
    lines.reduce((w, l) => Math.max(w, l.getBoundingClientRect().width), 0);

  const ref = Number(container.dataset.fitRef ?? 200);

  // Measure every line at the same reference size; the widest one dictates.
  let size = Infinity;
  lines.forEach((line) => {
    line.style.fontSize = `${ref}px`;
    const width = line.getBoundingClientRect().width;
    if (width > 0) size = Math.min(size, (ref * available) / width);
  });
  if (!Number.isFinite(size)) return;

  // Corrective passes: glyph advances don't scale linearly (hinting, tracking,
  // variable-font interpolation), so one estimate can still be ~1% out.
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    lines.forEach((l) => { l.style.fontSize = `${size}px`; });
    const w = widest();
    if (w <= 0 || Math.abs(w - available) < TOLERANCE) break;
    size *= available / w;
  }

  // Express as a share of the container's inline size, floored so we land just
  // inside the column, never just outside — and never above the ceiling.
  const max = Number(container.dataset.fitMax);
  let ratio = Math.floor((size / available) * 100 * 1000) / 1000;
  if (max > 0) ratio = Math.min(ratio, max);
  lines.forEach((l) => { l.style.fontSize = `${ratio}cqw`; });

  // Verify in the units we actually shipped. If anything is still over, step
  // down until it is not.
  for (let i = 0; i < MAX_PASSES && widest() > available + TOLERANCE; i += 1) {
    ratio = Math.floor(ratio * (available / widest()) * 1000) / 1000;
    lines.forEach((l) => { l.style.fontSize = `${ratio}cqw`; });
  }
}

export function initFit() {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('[data-fit-container]'));
  if (containers.length === 0) return;

  const run = () => containers.forEach(fitLines);

  // Re-measure only when the metrics themselves can change: at start, once the
  // real webfont replaces the fallback, and on request. Width changes need no
  // re-measure — cqw handles them.
  run();
  document.fonts?.ready.then(run);
  window.addEventListener('load', run);
  document.addEventListener('pi:refit', run);
  // A style switch (e.g. regular <-> caps) changes glyph widths too.
  const observer = new MutationObserver(run);
  containers.forEach((c) => observer.observe(c, { attributes: true, attributeFilter: ['data-name-style'] }));
}
