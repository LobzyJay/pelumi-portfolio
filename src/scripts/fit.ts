// Signal: fits a display block to its column.
//
// All lines in a container share ONE size — the size at which the *widest*
// line exactly fills the column. Shorter lines are then centred and sit
// narrower, which is what the reference comp does (PELUMI centred above a
// full-bleed IGBALAJOBI, both the same cap height).
//
// The measurement happens once to learn the ratio; the result is handed to
// CSS as a `cqw` (container query width) value so the browser maintains the
// fit at every width afterwards, with no resize handling. Relying on resize
// events and animation frames was the old failure mode: when they're
// throttled the name is left stale, overflowing its column by hundreds of px.

function fitLines(container: HTMLElement) {
  const lines = Array.from(container.querySelectorAll<HTMLElement>('[data-fit-line]'));
  if (lines.length === 0) return;

  const cs = getComputedStyle(container);
  const available = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if (!available) return;

  const ref = Number(container.dataset.fitRef ?? 200);

  // Measure every line at the same reference size; the widest one dictates.
  let size = Infinity;
  lines.forEach((line) => {
    line.style.fontSize = `${ref}px`;
    const width = line.getBoundingClientRect().width;
    if (width > 0) size = Math.min(size, (ref * available) / width);
  });
  if (!Number.isFinite(size)) return;

  // Corrective passes: glyph advances don't scale linearly (hinting,
  // tracking, variable-font interpolation), so one estimate can still be ~1%
  // out — 15px of overhang on a 280px line. Iterate until it lands.
  for (let pass = 0; pass < 4; pass += 1) {
    lines.forEach((l) => { l.style.fontSize = `${size}px`; });
    let widest = 0;
    lines.forEach((l) => { widest = Math.max(widest, l.getBoundingClientRect().width); });
    if (widest <= 0) break;
    if (Math.abs(widest - available) < 0.5) break;
    size *= available / widest;
  }

  // Express as a share of the container's inline size, floored so we land
  // just inside the column, never just outside.
  const ratio = Math.floor(((size / available) * 100) * 1000) / 1000;
  lines.forEach((l) => { l.style.fontSize = `${ratio}cqw`; });
}

export function initSignalFit() {
  const containers = Array.from(document.querySelectorAll<HTMLElement>('[data-fit-container]'));
  if (containers.length === 0) return;

  const run = () => containers.forEach(fitLines);

  // Re-measure only when the metrics themselves can change: at start, and
  // once the real webfont replaces the fallback. Width changes need no
  // re-measure — cqw handles them.
  run();
  document.fonts?.ready.then(run);
  setTimeout(run, 300);
}
