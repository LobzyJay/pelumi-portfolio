// Mobile menu. A brown card on the page grows into the full-screen menu, and the
// menu shrinks back onto that card when it closes.
//
// How: the panel is the same brown as the page's cards. This script finds the
// brown card that is on screen (anything marked `data-morph-source`), tells the
// CSS where that card is (--t/--r/--b/--l) and what its corner radius is (--br),
// and the CSS opens the panel from there out to the whole screen (see Nav.astro).
// At the first frame the panel *is* the card; the card's own text steps aside
// (theme.css) and the card seems to swell into a blank blade for the menu.
//
// If no brown card is meaningfully on screen — say you are mid-page over the
// cream sections — it grows from the Menu button instead.
//
// Everything is measured fresh each time, so it is right at any screen width,
// on any device, with no coordinates written down.
//
// The contract from the interaction notes still holds: Esc, Close or tapping a
// link dismisses it; page scroll is locked while it is open.
//
// What makes it behave properly:
//   - the page behind is `inert`, so Tab cannot wander into content you can't see
//   - `aria-expanded` and `aria-label` track state for screen readers
//   - `html[data-menu-open]` ("card" or "button") lets CSS restyle the header and
//     move the source card's contents aside
//   - crossing the desktop breakpoint while open closes it, rather than
//     leaving scroll locked behind a panel that no longer exists

// A little longer than the slowest close (560ms clip + the final fade), so the
// panel is only hidden once it has finished shrinking onto its source.
const CLOSE_MS = 680;

// A card has to cover at least this share of the screen to be worth growing from.
const MIN_VISIBLE = 0.12;

export function initMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  const main = document.getElementById('main');
  if (!toggle || !panel) return;

  const root = document.documentElement;
  let open = false;
  let closeTimer: number | undefined;
  /** the card this open is growing from, or null for the button */
  let source: HTMLElement | null = null;

  /** The brown card with the most of itself on screen right now, if it is enough. */
  const pickCard = (): HTMLElement | null => {
    const vw = root.clientWidth;
    const vh = window.innerHeight;
    let best: HTMLElement | null = null;
    let bestArea = 0;
    document.querySelectorAll<HTMLElement>('[data-morph-source]').forEach((el) => {
      // Mid-entrance the card is still scaling/moving, so its rectangle is not
      // where it will settle: don't grow from it.
      if (el.getAnimations().some((a) => a.playState === 'running')) return;
      const r = el.getBoundingClientRect();
      const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (w * h > bestArea) {
        bestArea = w * h;
        best = el;
      }
    });
    return best && bestArea >= MIN_VISIBLE * vw * vh ? best : null;
  };

  /** Point the panel's clip at its source, as it is right now. */
  const aim = (el: HTMLElement | null) => {
    const vw = root.clientWidth;
    const vh = window.innerHeight;
    const r = (el ?? toggle).getBoundingClientRect();
    const radius = el ? parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 : r.height / 2;
    const set = (k: string, v: number) => panel.style.setProperty(k, `${v}px`);
    // (negative values are fine: a card partly off screen just has an inset that
    // reaches past the edge)
    set('--t', r.top);
    set('--r', vw - r.right);
    set('--b', vh - r.bottom);
    set('--l', r.left);
    set('--br', radius);
  };

  const setState = (next: boolean) => {
    if (next === open) return;
    open = next;
    window.clearTimeout(closeTimer);

    toggle.setAttribute('aria-expanded', String(open));
    // the visible Menu/Close words swap in CSS from aria-expanded; this keeps
    // the spoken name in step
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    if (open) {
      source = pickCard();
      aim(source); // measure before the scroll lock, which can shift layout
      root.style.overflow = 'hidden';
      root.setAttribute('data-menu-open', source ? 'card' : 'button');
      if (main) main.setAttribute('inert', '');
      panel.hidden = false;
      // commit the hidden->visible change (at the source's size) before adding
      // the class, or the browser skips the transition and the panel just appears
      void panel.offsetHeight;
      panel.classList.add('is-open');
    } else {
      aim(source); // the same card, re-measured: it is where it was
      root.removeAttribute('data-menu-open');
      root.style.overflow = '';
      if (main) main.removeAttribute('inert');
      panel.classList.remove('is-open');
      closeTimer = window.setTimeout(() => { panel.hidden = true; }, CLOSE_MS);
    }
  };

  toggle.addEventListener('click', () => setState(!open));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setState(false);
      toggle.focus();
    }
  });

  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setState(false);
  });

  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setState(false);
  });

  // Turning the phone while the menu is open: keep the shrink-back target honest.
  window.addEventListener('resize', () => { if (open) aim(source); });

  // Back/forward cache can restore the page mid-state.
  window.addEventListener('pageshow', () => setState(false));
}
