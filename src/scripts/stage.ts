// Progressively enhances the static Rooms markup into the sticky, scroll-
// driven Stage. README §A2/§A3, Option 2 from the plan: the Platform's
// active object is driven by scroll position, and clicking an object either
// scrolls the wrapper to that room or navigates to /about.
import type { PlatformController, PlatformPickDetail, ObjectId } from './platform';

interface DocRow { slug: string; meta: string; title: string; body: string }
interface RoomData {
  id: 'technology' | 'people' | 'institutions';
  number: string;
  label: string;
  title: string;
  meta: string;
  focusAreas: string[];
  bgVar: string;
  inkVar: string;
  highlight: string;
  docs: DocRow[];
}

const ROOM_TO_OBJECT: Record<RoomData['id'], ObjectId> = {
  technology: 'stack',
  people: 'block',
  institutions: 'tower',
};

const ROOM_TO_HASH: Record<RoomData['id'], string> = {
  technology: 'documents',
  people: 'fieldwork',
  institutions: 'institutions',
};

const upgradeQuery = () => window.matchMedia('(min-width: 640px) and (prefers-reduced-motion: no-preference)');

export function initStage() {
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  if (!stage) return;

  const staticEl = stage.querySelector<HTMLElement>('[data-rooms-static]');
  const enhancedEl = stage.querySelector<HTMLElement>('[data-stage-enhanced]');
  const dataEl = stage.querySelector<HTMLScriptElement>('[data-stage-data]');
  if (!staticEl || !enhancedEl || !dataEl) return;

  const rooms: RoomData[] = JSON.parse(dataEl.textContent || '[]');

  const roomEl = enhancedEl.querySelector<HTMLElement>('.enhanced-room')!;
  const labelEl = enhancedEl.querySelector<HTMLElement>('[data-room-label]')!;
  const metaEl = enhancedEl.querySelector<HTMLElement>('[data-room-meta]')!;
  const textblockEl = enhancedEl.querySelector<HTMLElement>('[data-room-textblock]')!;
  const titleEl = enhancedEl.querySelector<HTMLElement>('[data-room-title]')!;
  const focusEl = enhancedEl.querySelector<HTMLElement>('[data-room-focus]')!;
  const docsEl = enhancedEl.querySelector<HTMLElement>('[data-room-docs]')!;
  const progressEl = enhancedEl.querySelector<HTMLElement>('[data-room-progress]')!;
  const pips = Array.from(enhancedEl.querySelectorAll<HTMLElement>('.enhanced-room__pip'));
  const platformEl = enhancedEl.querySelector<HTMLElement>('[data-platform]');

  let currentIndex = -1;
  let rafId = 0;
  let active = false;
  let mql: MediaQueryList | null = null;
  let swapTimer: ReturnType<typeof setTimeout> | null = null;

  function renderDocs(room: RoomData) {
    docsEl.innerHTML = `
      <div class="doclist" style="--rows:${room.docs.length}">
        <div class="doclist__spine" aria-hidden="true"></div>
        <ul>
          ${room.docs
            .map(
              (d) => `
            <li>
              <span class="doclist__dot${d.slug === room.highlight ? ' doclist__dot--accent' : ''}"></span>
              <a class="doclist__entry" href="/work/${d.slug}/">
                <p class="mono doclist__meta">${d.meta}</p>
                <p class="doclist__title">${d.title}</p>
                <p class="doclist__body">${d.body}</p>
              </a>
            </li>`,
            )
            .join('')}
        </ul>
      </div>`;
  }

  function applyRoom(index: number, platformController: PlatformController | undefined) {
    const room = rooms[index];
    roomEl.style.background = `var(${room.bgVar})`;
    roomEl.style.color = `var(${room.inkVar})`;
    labelEl.textContent = room.label;
    metaEl.textContent = room.meta;
    titleEl.textContent = room.title;
    focusEl.textContent = room.focusAreas.join(' · ');
    renderDocs(room);
    pips.forEach((p, i) => p.classList.toggle('is-active', i === index));
    platformController?.setScrollActive(ROOM_TO_OBJECT[room.id]);
    history.replaceState(null, '', `#${ROOM_TO_HASH[room.id]}`);
  }

  function setRoom(index: number, platformController: PlatformController | undefined) {
    if (index === currentIndex) return;
    const first = currentIndex === -1;
    currentIndex = index;

    if (first) {
      applyRoom(index, platformController);
      return;
    }

    // Out (180ms) → swap content → in (350–500ms, list +60ms). README §A2.
    textblockEl.classList.add('is-swapping');
    docsEl.classList.add('is-swapping');
    if (swapTimer) clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      applyRoom(index, platformController);
      textblockEl.classList.remove('is-swapping');
      docsEl.classList.remove('is-swapping');
    }, 180);
  }

  function onScroll(platformController: PlatformController | undefined) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const rect = enhancedEl.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const index = Math.min(rooms.length - 1, Math.floor(p * rooms.length));
      setRoom(index, platformController);
      progressEl.textContent = `${rooms[index].label} of ${String(rooms.length).padStart(2, '0')} · ${Math.round(p * 100)}%`;
    });
  }

  let scrollHandler: (() => void) | null = null;
  let pickHandler: ((e: Event) => void) | null = null;

  function activateEnhanced() {
    if (active) return;
    active = true;
    staticEl.hidden = true;
    enhancedEl.hidden = false;

    const controller = platformEl?._platformController;
    setRoom(0, controller);

    scrollHandler = () => onScroll(controller);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler);
    scrollHandler();

    pickHandler = (e: Event) => {
      const detail = (e as CustomEvent<PlatformPickDetail>).detail;
      if (detail.action.kind === 'about') {
        window.location.href = '/about';
        return;
      }
      const roomIndex = rooms.findIndex((r) => r.id === detail.action.room);
      if (roomIndex < 0) return;
      const rect = enhancedEl.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const targetP = (roomIndex + 0.15) / rooms.length;
      const top = window.scrollY + rect.top + targetP * total;
      window.scrollTo({ top, behavior: 'smooth' });
    };
    platformEl?.addEventListener('platform:pick', pickHandler);
  }

  function deactivateEnhanced() {
    if (!active) return;
    active = false;
    staticEl.hidden = false;
    enhancedEl.hidden = true;
    currentIndex = -1;
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
    }
    if (pickHandler) platformEl?.removeEventListener('platform:pick', pickHandler);
    if (swapTimer) clearTimeout(swapTimer);
    textblockEl.classList.remove('is-swapping');
    docsEl.classList.remove('is-swapping');
  }

  function reconcile() {
    if (upgradeQuery().matches) activateEnhanced();
    else deactivateEnhanced();
  }

  // Platform.astro's own script initialises on the same 'astro:page-load'
  // tick; wait a frame so [data-platform]._platformController exists.
  requestAnimationFrame(reconcile);

  mql = upgradeQuery();
  mql.addEventListener('change', reconcile);
}
