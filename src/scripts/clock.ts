// The current time in Washington, D.C. — not a gimmick, it just grounds the
// site in the place the positioning line names. Text updates on a coarse
// interval; nothing loops or animates, so it holds inside Signal's
// no-motion rule.
//
// Two hooks:
//   [data-dc-clock] → "Washington, D.C. · 11:38 AM ET"  (footer line)
//   [data-dc-time]  → "11:38 AM"                        (display clock)
//   [data-dc-date]  → "Monday, 8 September"             (display clock)
export function initClock() {
  const lineEls = document.querySelectorAll<HTMLElement>('[data-dc-clock]');
  const timeEls = document.querySelectorAll<HTMLElement>('[data-dc-time]');
  const dateEls = document.querySelectorAll<HTMLElement>('[data-dc-date]');
  if (lineEls.length + timeEls.length + dateEls.length === 0) return;

  const zone = 'America/New_York';
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  function tick() {
    const now = new Date();
    const t = time.format(now);
    lineEls.forEach((el) => { el.textContent = `Washington, D.C. · ${t} ET`; });
    timeEls.forEach((el) => { el.textContent = t; });
    dateEls.forEach((el) => { el.textContent = date.format(now); });
  }

  tick();
  const id = setInterval(tick, 15_000);
  window.addEventListener('beforeunload', () => clearInterval(id), { once: true });
}
