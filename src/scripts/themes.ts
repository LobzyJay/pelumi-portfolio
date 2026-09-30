// "Browse by theme" rows on the Work page. Choosing a theme jump-scrolls to
// the first matching piece and briefly highlights every piece in that theme.
//
// Without JavaScript each row is still a plain link to #list, so the page
// degrades to "take me to the list" rather than to nothing.

const FLASH_MS = 1800;

export function initThemes() {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-theme-link]');
  if (links.length === 0) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: number | undefined;

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const theme = link.dataset.themeLink;
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-themes~="${theme}"]`),
      );
      if (!theme || rows.length === 0) return;
      e.preventDefault();

      document.querySelectorAll('.is-flash').forEach((el) => el.classList.remove('is-flash'));
      window.clearTimeout(timer);

      rows[0].scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'center' });
      rows.forEach((row) => row.classList.add('is-flash'));
      timer = window.setTimeout(() => {
        rows.forEach((row) => row.classList.remove('is-flash'));
      }, FLASH_MS);
    });
  });
}
