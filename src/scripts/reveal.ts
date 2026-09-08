// Reveal-in-reading-order primitive. README §8 / PRD §7.5.9: "motion follows
// the path" — elements marked [data-reveal] rise 24px + fade once, staggered
// 60–80ms in the order given by [data-reveal-order] (falling back to DOM
// order within a shared [data-reveal-group]). Runs once per element; disabled
// content (prefers-reduced-motion) is handled purely in CSS (see global.css),
// so this script only needs to add/remove a class.

function initReveal() {
  const groups = new Map<string, HTMLElement[]>();

  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.dataset.revealGroup ?? 'default';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(el);
  });

  const stagger = 70; // ms, within the 60–80ms band

  groups.forEach((els) => {
    els.sort((a, b) => {
      const orderA = Number(a.dataset.revealOrder ?? 0);
      const orderB = Number(b.dataset.revealOrder ?? 0);
      return orderA - orderB;
    });

    const seen = new WeakSet<Element>();
    const reveal = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      const index = els.indexOf(el);
      const delay = Math.max(0, index) * stagger;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('is-revealed');
      observer.unobserve(el);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px 0px 0px' },
    );

    els.forEach((el) => observer.observe(el));

    // Safety net: a throttled/occluded tab (or a rare browser quirk) can
    // leave IntersectionObserver silent even for on-screen content. Never
    // let a section stay invisible forever — force it in after a beat.
    setTimeout(() => els.forEach((el) => reveal(el)), 2500);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}

// Re-run after Astro View Transitions swap the DOM.
document.addEventListener('astro:page-load', initReveal);
