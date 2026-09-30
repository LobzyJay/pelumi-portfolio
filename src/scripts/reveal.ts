// Scroll-triggered entrances: anything marked [data-reveal] stays hidden (CSS,
// see theme.css) until it is about to come into view, then gets `.is-in` once
// and is never watched again. Nothing replays when you scroll back up.
//
// This is time-based (a short rise-and-fade), not scroll-linked, on purpose: it
// works in every browser, and a fixed, brief motion reads as the page building
// itself rather than as something you have to drag along. The scroll-linked
// moments (the focus words, the cards) are separate and pure CSS.

export function initReveal() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  const show = (el: Element) => el.classList.add('is-in');

  // No IntersectionObserver, or motion is off: everything is simply shown.
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(show);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        show(e.target);
        io.unobserve(e.target);
      });
    },
    // fire a little before the element is fully in, so it is already moving as
    // it arrives instead of starting once it is on screen
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  targets.forEach((t) => io.observe(t));
}
