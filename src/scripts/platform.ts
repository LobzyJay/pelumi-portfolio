// The Platform's interaction state machine. README §A3 "States, considered":
// default (idle pulse, once) · hover/focus (lift + recede others) ·
// selected/click (dispatches a pick for the host to act on) · keyboard
// (← → cycle, Enter select, Esc clear, focus ring on the tag not the
// drawing) · touch (no hover; tags visible at 70% until a pick) · reduced
// motion (opacity only). Merged with scroll per the Option 2 decision: the
// host (stage.ts) calls setScrollActive() as the room changes, and that is
// the baseline "active" object whenever nothing is hovered or focused.

export type ObjectId = 'stack' | 'tower' | 'plan' | 'block' | 'platform';

const ORDER: ObjectId[] = ['stack', 'tower', 'plan', 'block', 'platform'];

export interface PlatformPickDetail {
  id: ObjectId;
  action: { kind: 'room'; room: string } | { kind: 'about' };
}

export interface PlatformController {
  setScrollActive(id: ObjectId): void;
  destroy(): void;
}

export function initPlatform(root: HTMLElement): PlatformController {
  const objects = Array.from(root.querySelectorAll<SVGGElement>('.iso-object'));
  const tags = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('[data-tag]').forEach((t) => tags.set(t.dataset.tag!, t));
  const counterEl = root.querySelector<HTMLElement>('[data-platform-counter]');
  const hintEl = root.querySelector<HTMLElement>('[data-platform-hint]');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) root.classList.add('platform--touch');

  let scrollActive: ObjectId = 'stack';
  let hoverId: ObjectId | null = null;
  let focusId: ObjectId | null = null;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let hasInteracted = false;

  const activeId = (): ObjectId => hoverId ?? focusId ?? scrollActive;

  function render() {
    const active = activeId();
    root.dataset.active = 'true';
    objects.forEach((g) => {
      const id = g.dataset.object as ObjectId;
      g.classList.toggle('is-active', id === active);
    });
    tags.forEach((tag, id) => {
      const shown = isTouch ? true : id === active && (hoverId !== null || focusId !== null);
      tag.classList.toggle('is-shown', shown);
      tag.classList.toggle('is-focused', id === focusId);
    });
    const index = ORDER.indexOf(active);
    if (counterEl) counterEl.textContent = `${String(index + 1).padStart(2, '0')} — 05`;
    if (hintEl) {
      hintEl.textContent = focusId
        ? 'Enter to open · Esc to clear'
        : isTouch
          ? 'Tap to open'
          : 'Hover, or press ← → to explore';
    }
  }

  function pick(id: ObjectId) {
    const g = objects.find((o) => o.dataset.object === id);
    if (!g) return;
    const kind = g.dataset.actionKind;
    const detail: PlatformPickDetail =
      kind === 'room'
        ? { id, action: { kind: 'room', room: g.dataset.actionRoom! } }
        : { id, action: { kind: 'about' } };
    root.dispatchEvent(new CustomEvent<PlatformPickDetail>('platform:pick', { detail, bubbles: true }));
  }

  function scheduleIdlePulse() {
    if (reduceMotion || hasInteracted) return;
    idleTimer = setTimeout(() => {
      if (hasInteracted) return;
      const g = objects.find((o) => o.dataset.object === scrollActive);
      g?.classList.add('is-pulsing');
      setTimeout(() => g?.classList.remove('is-pulsing'), 700);
    }, 4000);
  }

  function markInteracted() {
    hasInteracted = true;
    if (idleTimer) clearTimeout(idleTimer);
  }

  const onEnter = (g: SVGGElement) => () => {
    markInteracted();
    hoverId = g.dataset.object as ObjectId;
    render();
  };
  const onLeave = () => {
    hoverId = null;
    render();
  };
  const onFocus = (g: SVGGElement) => () => {
    markInteracted();
    focusId = g.dataset.object as ObjectId;
    render();
  };
  const onBlur = () => {
    focusId = null;
    render();
  };
  const onClick = (g: SVGGElement) => (e: Event) => {
    e.preventDefault();
    markInteracted();
    pick(g.dataset.object as ObjectId);
  };
  const onKey = (g: SVGGElement) => (e: KeyboardEvent) => {
    const id = g.dataset.object as ObjectId;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      markInteracted();
      pick(id);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      markInteracted();
      const i = ORDER.indexOf(id);
      const nextId = ORDER[(i + (e.key === 'ArrowRight' ? 1 : -1) + ORDER.length) % ORDER.length];
      objects.find((o) => o.dataset.object === nextId)?.focus();
    } else if (e.key === 'Escape') {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  };

  const cleanups: Array<() => void> = [];
  objects.forEach((g) => {
    const enter = onEnter(g);
    const leave = onLeave;
    const focus = onFocus(g);
    const blur = onBlur;
    const click = onClick(g);
    const key = onKey(g);
    g.addEventListener('mouseenter', enter);
    g.addEventListener('mouseleave', leave);
    g.addEventListener('focus', focus);
    g.addEventListener('blur', blur);
    g.addEventListener('click', click);
    g.addEventListener('keydown', key);
    cleanups.push(() => {
      g.removeEventListener('mouseenter', enter);
      g.removeEventListener('mouseleave', leave);
      g.removeEventListener('focus', focus);
      g.removeEventListener('blur', blur);
      g.removeEventListener('click', click);
      g.removeEventListener('keydown', key);
    });
  });

  render();
  scheduleIdlePulse();

  return {
    setScrollActive(id: ObjectId) {
      scrollActive = id;
      render();
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      if (idleTimer) clearTimeout(idleTimer);
    },
  };
}
