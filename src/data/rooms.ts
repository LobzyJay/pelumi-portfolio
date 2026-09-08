// Rooms → documents mapping and colour tokens.
// Source: design_handoff_pelumi_site/content/content-model.md "Rooms → documents"
// and design_handoff_pelumi_site/design/Atlas 04 - The Stage.dc.html.

export type RoomId = 'technology' | 'people' | 'institutions';

export interface Room {
  id: RoomId;
  number: '01' | '02' | '03';
  label: string; // "Room 01"
  title: string;
  meta: string; // "3 documents · 2025–2026"
  bg: string; // css var
  ink: string; // css var
  focusAreas: string[];
  /** work collection slugs in this room's display order; the last is the room's featured/hi doc */
  docs: string[];
  isoAsset: string;
}

export const rooms: Room[] = [
  {
    id: 'technology',
    number: '01',
    label: 'Room 01',
    title: 'Technology & governance',
    meta: '3 documents · 2025–2026',
    bg: 'var(--room-sage)',
    ink: 'var(--room-sage-ink)',
    focusAreas: ['AI policy', 'AI governance & responsible AI', 'Research & data-driven policy'],
    docs: ['ai-governance-divergence', 'critical-minerals', 'autonomous-targeting'],
    isoAsset: 'iso-ministack',
  },
  {
    id: 'people',
    number: '02',
    label: 'Room 02',
    title: 'People & protection',
    meta: '2 documents · 2026',
    bg: 'var(--room-clay)',
    ink: 'var(--room-clay-ink)',
    focusAreas: [
      'Migration & human rights',
      'Human trafficking prevention & survivor advocacy',
      'Gender equality & social justice',
    ],
    docs: ['cyber-enabled-trafficking', 'shared-hope-field-report'],
    isoAsset: 'iso-bracket',
  },
  {
    id: 'institutions',
    number: '03',
    label: 'Room 03',
    title: 'Institutions & practice',
    meta: '2 entries · 2025–2026',
    bg: 'var(--room-sky)',
    ink: 'var(--room-sky-ink)',
    focusAreas: [
      'International development',
      'Legislative affairs & government relations',
      'Community outreach & stakeholder engagement',
    ],
    docs: ['sri-lanka-ndp', 'shared-hope-field-report'],
    isoAsset: 'iso-steps',
  },
];

export const roomById = (id: RoomId) => rooms.find((r) => r.id === id)!;

/** Display-length labels for the focus areas, for places where all nine are
 *  set as one continuous line (Signal's focus band). The canonical names
 *  above stay the source of truth everywhere else — filters, case studies,
 *  the Atlas rooms — so shortening here never changes the data. */
const SHORT_FOCUS: Record<string, string> = {
  'AI governance & responsible AI': 'Responsible AI',
  'Research & data-driven policy': 'Data-driven policy',
  'Human trafficking prevention & survivor advocacy': 'Trafficking prevention',
  'Gender equality & social justice': 'Gender equality',
  'Legislative affairs & government relations': 'Legislative affairs',
  'Community outreach & stakeholder engagement': 'Stakeholder engagement',
};

export const focusAreasShort = () =>
  rooms.flatMap((r) => r.focusAreas).map((area) => SHORT_FOCUS[area] ?? area);

/** The Platform's five isometric objects and what each opens. */
export type PlatformObjectId = 'platform' | 'stack' | 'tower' | 'plan' | 'block';

export interface PlatformObject {
  id: PlatformObjectId;
  tag: string;
  ariaLabel: string;
  /** [left%, top%] of the tag anchor within the platform viewBox, from the prototype. */
  pos: [string, string];
  /** what selecting this object does */
  action:
    | { kind: 'room'; room: RoomId }
    | { kind: 'about' };
}

// Keyboard/reading order per README §A3: stack → tower → plan → block → platform.
export const platformObjects: PlatformObject[] = [
  {
    id: 'stack',
    tag: 'Six documents',
    ariaLabel: 'Six documents',
    pos: ['44%', '6%'],
    action: { kind: 'room', room: 'technology' },
  },
  {
    id: 'tower',
    tag: 'Institutions',
    ariaLabel: 'Institutions',
    pos: ['76%', '2%'],
    action: { kind: 'room', room: 'institutions' },
  },
  {
    id: 'plan',
    tag: 'A five-year plan',
    ariaLabel: 'A five-year plan',
    pos: ['25%', '35%'],
    action: { kind: 'room', room: 'institutions' },
  },
  {
    id: 'block',
    tag: 'Fieldwork',
    ariaLabel: 'Fieldwork',
    pos: ['51%', '50%'],
    action: { kind: 'room', room: 'people' },
  },
  {
    id: 'platform',
    tag: 'About Pelumi',
    ariaLabel: 'About Pelumi',
    pos: ['50%', '97%'],
    action: { kind: 'about' },
  },
];
