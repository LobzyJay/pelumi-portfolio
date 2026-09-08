// Work-index filter pills. Single-select per group ("All" resets it),
// combined with AND logic. State lives in the URL (?group=&format=&year=) so
// a filtered view is shareable and deep-linkable; without JS every item is
// server-rendered and visible.
//
// Atlas filters by focus area; Signal filters by the three groups those
// areas belong to (nine chips was more filter than six documents can carry).
// Both are supported here so the two designs share one script.
const KEYS = ['focus', 'group', 'format', 'year'] as const;
type Key = (typeof KEYS)[number];

export function initFilters() {
  const root = document.querySelector<HTMLElement>('[data-filters]');
  const items = Array.from(
    document.querySelectorAll<HTMLElement>('[data-focus-areas], [data-room]'),
  );
  if (!root || items.length === 0) return;

  const params = new URLSearchParams(location.search);
  const state = Object.fromEntries(
    KEYS.map((k) => [k, params.get(k) ?? '']),
  ) as Record<Key, string>;

  const empty = document.querySelector<HTMLElement>('[data-filters-empty]');
  const clear = document.querySelector<HTMLElement>('[data-filters-clear]');

  function apply() {
    let visible = 0;
    items.forEach((el) => {
      const focusOk = !state.focus || (el.dataset.focusAreas ?? '').split('|').includes(state.focus);
      const groupOk = !state.group || el.dataset.room === state.group;
      const formatOk = !state.format || el.dataset.format === state.format;
      const yearOk = !state.year || el.dataset.year === state.year;
      const show = focusOk && groupOk && formatOk && yearOk;
      el.hidden = !show;
      if (show) visible += 1;
    });

    // A filter combination can legitimately match nothing (six documents,
    // three filter groups). Say so rather than showing an empty rule.
    if (empty) empty.hidden = visible > 0;

    root!.querySelectorAll<HTMLButtonElement>('.filter-pill').forEach((btn) => {
      const key = btn.dataset.filterKey as Key;
      btn.classList.toggle('is-active', (state[key] || '') === (btn.dataset.filterValue || ''));
    });

    const qp = new URLSearchParams();
    KEYS.forEach((k) => { if (state[k]) qp.set(k, state[k]); });
    const qs = qp.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  root.querySelectorAll<HTMLButtonElement>('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.filterKey as Key;
      state[key] = btn.dataset.filterValue || '';
      apply();
    });
  });

  clear?.addEventListener('click', () => {
    KEYS.forEach((k) => { state[k] = ''; });
    apply();
  });

  apply();
}
