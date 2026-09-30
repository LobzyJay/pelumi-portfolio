// Mobile menu. The contract (from the interaction notes): "Menu" opens a
// full-screen panel and its label becomes "Close"; Esc, Close or tapping a
// link dismisses it; page scroll is locked while it is open.
//
// Beyond the notes, what makes it behave properly:
//   - the page behind is `inert`, so Tab cannot wander into content you can't see
//   - `aria-expanded` tracks state for screen readers
//   - crossing the desktop breakpoint while open closes it, rather than
//     leaving scroll locked behind a panel that no longer exists

const FADE_MS = 240;

export function initMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-menu]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  const main = document.getElementById('main');
  if (!toggle || !panel || !label) return;

  let open = false;
  let closeTimer: number | undefined;

  const setState = (next: boolean) => {
    if (next === open) return;
    open = next;
    window.clearTimeout(closeTimer);

    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (main) main.toggleAttribute('inert', open);

    if (open) {
      panel.hidden = false;
      // commit the hidden->visible change before adding the class, or the
      // browser skips the transition and the panel just appears
      void panel.offsetHeight;
      panel.classList.add('is-open');
    } else {
      panel.classList.remove('is-open');
      closeTimer = window.setTimeout(() => { panel.hidden = true; }, FADE_MS);
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

  // Back/forward cache can restore the page mid-state.
  window.addEventListener('pageshow', () => setState(false));
}
