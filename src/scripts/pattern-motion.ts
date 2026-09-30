// The hero pattern: lines that draw themselves in, light that runs them, and
// lines that draw back out — on a loop, so anyone can watch it arrive and leave.
//
// One cycle (LOOP seconds):
//
//   0.35s   the lines DRAW IN, all together — "Trim Paths" in After Effects.
//           Solid rails grow; dashed routes reveal dash by dash; the dots
//           fade up at the end.
//   3.3s    light runs INTO every visible line: a wave whose front sweeps
//           diagonally across the frame, each streak entering at the outer edge
//           and running inward until it slips beneath the card.
//   7.2s    light runs back OUT along the same lines, the front sweeping the
//           other way.
//   11s     the lines DRAW OUT, retracing themselves.
//   then a beat of rest, and round again.
//
// On a hero the dark card covers most of the pink ground, so the lines are
// only visible in the frame around it. This script measures where the cards sit
// and only animates lines that are actually visible there.
//
// THE GRID IS THE CARD'S GRID. The pattern is anchored to the hero card: a
// vertical line runs exactly along the card's left and right edges (which are
// also the header's edges), with more at equal sixths between; a horizontal
// line runs along its top and bottom edges, with more at equal steps between.
// So the lines grow out of the card into the frame instead of sliding past it,
// the proportions are identical at every width, and the sixths line up with
// the thirds of the sections below. The dots sit only where the dashed route
// crosses a rail.
//
// The lines are drawn as live SVG and STAY that way while the page is open —
// the static CSS image is only for reduced motion and no-JavaScript. Having one
// drawing means the light shares the lines' exact grid by construction: there is
// no second copy to drift out of line at some breakpoint.
//
// Only `stroke-dasharray`/`stroke-dashoffset` and `opacity` change, on small
// paths, with no filters. Nothing runs while the hero is off-screen, and under
// prefers-reduced-motion the lines simply appear.
//
// The footer's arches get a slower, quieter light of their own.

const NS = 'http://www.w3.org/2000/svg';

// ---- the cycle (seconds) ---------------------------------------------------
const LOOP = 14;
const DRAW_IN_AT = 0.35;
const DRAW_IN = 2.6;
const IN_WAVE_AT = 3.3;
const OUT_WAVE_AT = 7.2;
const DRAW_OUT_AT = 11;
const DRAW_OUT = 1.8;

const TAIL = 72; // tile units the streak's wake trails behind its head
const WAVE_SPEED = 640; // px/s — how fast the wave front sweeps across the frame

type Pt = [number, number];

const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const m = 1 - t;
  return [
    m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
    m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
  ];
};

/** The four lines of a 240px tile (see pi-links.svg), each in both directions.
 *  Lengths are measured; `at` gives a point a fraction of the way along `fwd`. */
interface Line {
  kind: 'rail' | 'route';
  len: number;
  fwd: string;
  rev: string;
  at: (t: number) => Pt;
}
const LINES: Line[] = [
  { kind: 'rail', len: 240, fwd: 'M0 60H240', rev: 'M240 60H0', at: (t) => [t * 240, 60] },
  { kind: 'rail', len: 240, fwd: 'M180 0V240', rev: 'M180 240V0', at: (t) => [180, t * 240] },
  {
    kind: 'route', len: 146.6,
    fwd: 'M0 180C60 180 120 200 120 240', rev: 'M120 240C120 200 60 180 0 180',
    at: (t) => cubic([0, 180], [60, 180], [120, 200], [120, 240], t),
  },
  {
    kind: 'route', len: 226.2,
    fwd: 'M120 0C120 60 200 180 240 180', rev: 'M240 180C200 180 120 60 120 0',
    at: (t) => cubic([120, 0], [120, 60], [200, 180], [240, 180], t),
  },
];

// Footer arches (tile units, 200 x 240): light rises one side, crosses the
// apex, and comes down the other.
const ARCHES = [
  { d: 'M30 240V150A70 70 0 0 1 170 150V240', len: 399.9 },
  { d: 'M60 240V150A40 40 0 0 1 140 150V240', len: 305.7 },
];
const ARCH_SPEED = 70;
const ARCH_TRAVEL_SHARE = 0.34;

/** Stable pseudo-random in [0,1) from two integers (a murmur-style mix; a plain
 *  multiply-and-xor clusters badly when both inputs are small tile indices). */
function hash(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b1, 0x85ebca6b) ^ Math.imul(b ^ 0x7f4a7c15, 0xc2b2ae35);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  cls?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (cls) node.setAttribute('class', cls);
  return node;
}

const vars = (node: SVGElement, v: Record<string, string | number>) =>
  Object.entries(v).forEach(([k, val]) => node.style.setProperty(k, String(val)));

/** A bright head with a wider, fainter wake: two strokes sharing one dash position. */
function comet(parent: SVGElement, d: string) {
  parent.append(svg('path', { d }, 'pf-sig pf-tail'), svg('path', { d }, 'pf-sig pf-head'));
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** How much of the lines are drawn (0..1) at a moment in the cycle. */
function drawnAt(clock: number): number {
  if (clock < DRAW_IN_AT) return 0;
  if (clock < DRAW_IN_AT + DRAW_IN) return easeOutQuart((clock - DRAW_IN_AT) / DRAW_IN);
  if (clock < DRAW_OUT_AT) return 1;
  if (clock < DRAW_OUT_AT + DRAW_OUT) return 1 - easeInOutCubic((clock - DRAW_OUT_AT) / DRAW_OUT);
  return 0;
}

// ---- measuring the hero ----------------------------------------------------

interface Hole { x: number; y: number; w: number; h: number }

/** Everything that sits on top of the pink ground (the cards), as rectangles
 *  relative to the hero, plus the hero's own size. Uses offsetLeft/offsetTop
 *  rather than on-screen positions: the cards are mid-entrance (shifted by a
 *  transform) when this first runs, and screen positions would be off by
 *  exactly that. */
interface Frame { W: number; H: number; holes: Hole[]; card: Hole }

function measureFrame(field: HTMLElement): Frame {
  const hero = field.closest<HTMLElement>('.pi-hero');
  const inner = hero?.querySelector<HTMLElement>('.pi-hero__inner');
  const W = field.clientWidth;
  const H = field.clientHeight;
  const holes: Hole[] =
    hero && inner
      ? Array.from(inner.children)
          .filter((el): el is HTMLElement => el instanceof HTMLElement)
          .map((el) => {
            let x = 0, y = 0;
            for (let n: HTMLElement | null = el; n && n !== hero; n = n.offsetParent as HTMLElement | null) {
              x += n.offsetLeft;
              y += n.offsetTop;
            }
            return { x, y, w: el.offsetWidth, h: el.offsetHeight };
          })
      : [];
  // the main card is the biggest thing on the ground; the frame is measured from it
  const card = holes.slice().sort((p, q) => q.w * q.h - p.w * p.h)[0] ?? { x: 0, y: 0, w: W, h: H };
  return { W, H, holes, card };
}

// ---- hero: one grid for the lines and the light ----------------------------

interface Grid {
  /** one tile's width and height, in pixels (they differ by a few percent so
   *  the rails can land on all four edges of the card) */
  tx: number;
  ty: number;
  /** the scale from the 240-unit drawing to a tile */
  sx: number;
  sy: number;
  /** where tile (0,0)'s top-left corner falls, in hero coordinates */
  ox: number;
  oy: number;
  W: number;
  H: number;
  mobile: boolean;
  cells: { c: number; r: number }[];
}

/** Anchor the tile grid to the card (see the note at the top). Everything
 *  below is in hero coordinates, origin at the hero's top-left. */
function gridFor(f: Frame): Grid {
  const mobile = window.matchMedia('(max-width: 1023px)').matches;
  const { W, H, card } = f;

  // Columns: sixths on a desktop-width card (they line up with the 2- and
  // 3-column sections below), quarters on a narrow one; thirds on a phone,
  // sixths on a tablet.
  const cols = mobile ? (card.w < 500 ? 3 : 6) : card.w >= 1150 ? 6 : 4;
  const tx = card.w / cols;
  // Rows: whichever whole number of rows on the card's height makes the tiles
  // closest to square (compared as ratios, so "a bit tall" and "a bit squat"
  // count the same).
  const exact = card.h / tx;
  const lo = Math.max(2, Math.floor(exact));
  const hi = Math.max(2, Math.ceil(exact));
  const off = (n: number) => Math.abs(Math.log(card.h / n / tx));
  const rows = off(lo) <= off(hi) ? lo : hi;
  const ty = card.h / rows;
  const sx = tx / 240;
  const sy = ty / 240;

  // The drawing has its vertical rail 75% across the tile and its horizontal
  // rail 25% down it; shift the grid so those land on the card's left and top
  // edges (every other rail then falls on an equal step from there).
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const ox = mod(card.x - 0.75 * tx, tx) - tx;
  const oy = mod(card.y - 0.25 * ty, ty) - ty;

  const cells: Grid['cells'] = [];
  for (let r = 0; oy + r * ty < H; r += 1) {
    for (let c = 0; ox + c * tx < W; c += 1) cells.push({ c, r });
  }
  return { tx, ty, sx, sy, ox, oy, W, H, mobile, cells };
}

const newSvg = (g: Grid, cls: string) =>
  svg('svg', { width: g.W, height: g.H, viewBox: `0 0 ${g.W} ${g.H}`, focusable: 'false' }, cls);

const placeTile = (g: Grid, root: SVGElement, c: number, r: number) => {
  const tile = svg('g', { transform: `translate(${g.ox + c * g.tx} ${g.oy + r * g.ty}) scale(${g.sx} ${g.sy})` });
  root.append(tile);
  return tile;
};

// ---- the lines (drawn, and they stay) --------------------------------------

interface Trim { el: SVGPathElement; kind: 'rail' | 'route'; len: number }

/** Set how much of a line is drawn (0..1). Routes are dashed, and a dash
 *  pattern can't be trimmed with a single offset, so the pattern is written out
 *  for as many dashes as currently fit. */
function setTrim({ el, kind, len }: Trim, q: number) {
  if (q <= 0.002) { el.style.opacity = '0'; return; }
  el.style.opacity = '1';
  if (kind === 'rail') {
    el.style.strokeDasharray = `${(q * len).toFixed(2)} ${len + 10}`;
    return;
  }
  const drawn = q * len;
  const whole = Math.floor(drawn / 9); // one dash + gap = 3 + 6
  const part = drawn - whole * 9;
  let d = '3 6 '.repeat(whole);
  d += part > 0.4 ? `${Math.min(3, part).toFixed(2)} ${len + 10}` : `0.01 ${len + 10}`;
  el.style.strokeDasharray = d.trim();
}

// Where the dashed route crosses the rails (tile units; see the geometry check).
const DOTS: Pt[] = [[135.9, 60], [180, 133.3]];

function buildLines(pan: HTMLElement, g: Grid) {
  const root = newSvg(g, 'pf__draw');
  const trims: Trim[] = [];
  const decor: SVGElement[] = [];

  for (const { c, r } of g.cells) {
    const tile = placeTile(g, root, c, r);
    LINES.forEach((line) => {
      const el = svg('path', { d: line.fwd }, line.kind === 'rail' ? 'pf-line pf-line--rail' : 'pf-line pf-line--route');
      tile.append(el);
      trims.push({ el, kind: line.kind, len: line.len });
    });
    // The dots sit where the dashed route crosses a rail — never on empty
    // ground. (The ring-and-centre "target" that used to mark where the two
    // rails cross has been removed from the design.)
    const deco = svg('g', {}, 'pf-deco');
    DOTS.forEach(([cx, cy]) => deco.append(svg('circle', { cx, cy, r: 3.5 }, 'pf-dot')));
    tile.append(deco);
    decor.push(deco);
  }

  pan.querySelector('.pf__draw')?.remove();
  pan.append(root);
  return { trims, decor };
}

// ---- the light -------------------------------------------------------------

/** Two waves per cycle, over every line that shows on the frame: one running
 *  in (toward the card), one running back out. `clock` is how far into the
 *  cycle we are, so a rebuild mid-cycle (a resize) drops in at the right phase. */
function buildLight(pan: HTMLElement, g: Grid, holes: Hole[], clock: number) {
  const root = newSvg(g, 'pf__signals');
  const maxDist = Math.hypot(g.W, g.H);

  const visible = (X: number, Y: number) =>
    X >= -2 && X <= g.W + 2 && Y >= -2 && Y <= g.H + 2 &&
    !holes.some((h) => X > h.x + 1 && X < h.x + h.w - 1 && Y > h.y + 1 && Y < h.y + h.h - 1);

  const SAMPLES = 18;
  for (const { c, r } of g.cells) {
    const tile = placeTile(g, root, c, r);
    let any = false;

    for (const line of LINES) {
      // where is this line on screen (hero coordinates), sampled along its length
      const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => {
        const [px, py] = line.at(i / SAMPLES);
        return [g.ox + c * g.tx + px * g.sx, g.oy + r * g.ty + py * g.sy] as Pt;
      });
      const vis = pts.map(([X, Y]) => visible(X, Y));
      if (!vis.some(Boolean)) continue;

      // Orient the inbound streak to start on the visible side and run toward the card.
      const reverse = !vis[0] && vis[SAMPLES];
      const inD = reverse ? line.rev : line.fwd;
      const outD = reverse ? line.fwd : line.rev;
      const outer = reverse ? vis.lastIndexOf(true) : vis.indexOf(true); // nearest the frame's outer edge
      const inner = reverse ? vis.indexOf(true) : vis.lastIndexOf(true); // nearest the card
      const [xo, yo] = pts[outer];
      const [xi, yi] = pts[inner];
      const jitter = hash(c + 7, r + 3) * 0.12;
      const common = { '--H': line.len + TAIL, '--wk': g.mobile ? 1.6 : 1 };

      const inbound = svg('g', {}, 'pf-wave');
      vars(inbound, { ...common, '--delay': `${(IN_WAVE_AT + Math.hypot(xo, yo) / WAVE_SPEED + jitter - clock).toFixed(2)}s` });
      comet(inbound, inD);

      // heading out, the front sweeps back the way it came
      const outbound = svg('g', {}, 'pf-wave');
      vars(outbound, { ...common, '--delay': `${(OUT_WAVE_AT + (maxDist - Math.hypot(xi, yi)) / WAVE_SPEED + jitter - clock).toFixed(2)}s` });
      comet(outbound, outD);

      tile.append(inbound, outbound);
      any = true;
    }
    if (!any) tile.remove();
  }

  pan.querySelector('.pf__signals')?.remove();
  pan.append(root);
}

// ---- footer arches ---------------------------------------------------------

function buildArches(pan: HTMLElement, tx: number, ty: number, box: { w: number; h: number }) {
  const panW = box.w + 2 * tx;
  const panH = box.h + 2 * ty;
  const root = svg('svg', { width: panW, height: panH, viewBox: `0 0 ${panW} ${panH}`, focusable: 'false' }, 'pf__signals');

  // Only the top of the card is visible (the rest fades to solid ink), so
  // light is only needed in the first two rows of the visible area.
  const cMax = Math.ceil((tx + box.w) / tx);
  const cand: { c: number; r: number }[] = [];
  for (let r = 1; r <= 2; r += 1) for (let c = 1; c <= cMax; c += 1) cand.push({ c, r });
  cand.sort((p, q) => hash(p.c * 3, p.r * 7) - hash(q.c * 3, q.r * 7));

  // a couple lit at a time, however wide the card is
  for (const { c, r } of cand.slice(0, Math.max(2, Math.round(cand.length * 0.3)))) {
    const arch = ARCHES[Math.floor(hash(c + 11, r + 2) * ARCHES.length)];
    const H = arch.len + TAIL;
    const T = H / ARCH_SPEED / ARCH_TRAVEL_SHARE;
    const g = svg('g', { transform: `translate(${c * tx} ${r * ty})` }, 'pf-arch');
    vars(g, { '--H': H, '--T': `${T.toFixed(1)}s`, '--d': `${(hash(c + 5, r + 1) * T).toFixed(1)}s` });
    comet(g, arch.d);
    root.append(g);
  }
  pan.querySelector('.pf__signals')?.remove();
  pan.append(root);
}

// ---- running a hero --------------------------------------------------------

class Hero {
  private clock = 0; // seconds into the cycle
  private drawn = -1;
  private cycle: 'a' | 'b' = 'a';
  private raf = 0;
  private last = 0;
  private trims: Trim[] = [];
  private decor: SVGElement[] = [];
  visible = false;

  /** `animated` false = reduced motion: the same anchored lines, fully drawn,
   *  with no drawing in or out and no light. */
  constructor(private field: HTMLElement, private animated = true) {
    this.build();
    this.field.setAttribute('data-live', '');
    if (this.animated) this.field.dataset.cycle = this.cycle;
  }

  /** (Re)build everything for the current size. Keeps the clock, so a resize
   *  mid-cycle carries on from the same moment rather than restarting. */
  build() {
    const pan = this.field.querySelector<HTMLElement>('[data-pf-pan]');
    if (!pan || this.field.clientWidth === 0 || this.field.clientHeight === 0) return;
    const frame = measureFrame(this.field);
    const grid = gridFor(frame);

    const lines = buildLines(pan, grid);
    this.trims = lines.trims;
    this.decor = lines.decor;
    if (this.animated) buildLight(pan, grid, frame.holes, this.clock);
    this.drawn = -1; // force a repaint of the lines at the current stage
    this.paint(this.animated ? drawnAt(this.clock) : 1);
  }

  /** Reduced motion switched on while the page is open: stop, and settle into
   *  the static drawing. */
  settle() {
    this.animated = false;
    cancelAnimationFrame(this.raf);
    this.field.removeAttribute('data-cycle');
    this.field.querySelectorAll('.pf__signals').forEach((n) => n.remove());
    this.drawn = -1;
    this.paint(1);
  }

  private paint(q: number) {
    if (Math.abs(q - this.drawn) < 0.0005) return;
    this.drawn = q;
    this.trims.forEach((t) => setTrim(t, q));
    const fade = clamp01((q - 0.55) / 0.45);
    this.decor.forEach((d) => (d.style.opacity = String(fade)));
  }

  private tick = (now: number) => {
    const dt = Math.min(0.1, (now - this.last) / 1000); // a long gap (tab switch) must not skip the cycle
    this.last = now;
    this.clock += dt;
    if (this.clock >= LOOP) {
      this.clock -= LOOP;
      // Restart the light for the new cycle by switching to an identical set of
      // keyframes with a different name — no forced reflow needed.
      this.cycle = this.cycle === 'a' ? 'b' : 'a';
      this.field.dataset.cycle = this.cycle;
    }
    this.paint(drawnAt(this.clock));
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Run while on screen; stop entirely while off it. The light is CSS and is
   *  paused with data-paused, so both halves freeze and resume together. */
  setVisible(v: boolean) {
    if (!this.animated) return;
    this.visible = v;
    this.field.toggleAttribute('data-paused', !v);
    cancelAnimationFrame(this.raf);
    if (v) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }
}

// ---- wiring ----------------------------------------------------------------

export function initPatterns() {
  const fields = Array.from(document.querySelectorAll<HTMLElement>('[data-pf]:not([data-static])'));
  if (fields.length === 0) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heroes = new Map<HTMLElement, Hero>();

  // Reduced motion: no drawing in or out and no light, but the same anchored
  // lines — so the page looks identical, just at rest. (The footer's arches are
  // light-only, so they simply stay plain.)
  const animated = !reduce.matches;

  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const f = e.target as HTMLElement;
      if (f.dataset.variant === 'tile') f.toggleAttribute('data-paused', !e.isIntersecting);
      else heroes.get(f)?.setVisible(e.isIntersecting);
    });
  });

  fields.forEach((field) => {
    if (field.dataset.variant === 'tile') {
      const pan = field.querySelector<HTMLElement>('[data-pf-pan]');
      const cs = getComputedStyle(field);
      if (animated && pan && field.clientWidth) {
        buildArches(pan, parseFloat(cs.getPropertyValue('--tile-x')) || 200, parseFloat(cs.getPropertyValue('--tile-y')) || 240, { w: field.clientWidth, h: field.clientHeight });
      }
    } else {
      heroes.set(field, new Hero(field, animated));
    }
    if (animated || field.dataset.variant !== 'tile') watcher.observe(field);

    // Rebuild when the section changes size enough to change the grid or what is visible.
    let last = `${field.clientWidth}x${field.clientHeight}`;
    let timer = 0;
    new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const now = `${field.clientWidth}x${field.clientHeight}`;
        if (now === last) return;
        last = now;
        if (field.dataset.variant === 'tile') {
          const pan = field.querySelector<HTMLElement>('[data-pf-pan]');
          const cs = getComputedStyle(field);
          if (animated && pan) buildArches(pan, parseFloat(cs.getPropertyValue('--tile-x')) || 200, parseFloat(cs.getPropertyValue('--tile-y')) || 240, { w: field.clientWidth, h: field.clientHeight });
        } else heroes.get(field)?.build();
      }, 250);
    }).observe(field);
  });

  // If the preference flips on while the page is open, stop and settle.
  reduce.addEventListener('change', () => {
    if (!reduce.matches) return;
    heroes.forEach((h) => h.settle());
    document.querySelectorAll('[data-variant="tile"] .pf__signals').forEach((n) => n.remove());
  });
}
