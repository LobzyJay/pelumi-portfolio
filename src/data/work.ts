// How the six documents are grouped, labelled and illustrated.
//
// Themes are the three groups the work is organised into. Document 06 belongs
// to two of them (people & institutions), which is why a theme is a list of
// slugs rather than a field on the document.

import type { CollectionEntry } from 'astro:content';

export type ThemeId = 'technology' | 'people' | 'institutions';
export type Doc = CollectionEntry<'work'>;

export interface Theme {
  id: ThemeId;
  title: string;
  focusAreas: string[];
  /** work-collection slugs, in display order */
  docs: string[];
}

export const themes: Theme[] = [
  {
    id: 'technology',
    title: 'Technology & governance',
    focusAreas: ['AI policy', 'AI governance & responsible AI', 'Research & data-driven policy'],
    docs: ['ai-governance-divergence', 'critical-minerals', 'autonomous-targeting'],
  },
  {
    id: 'people',
    title: 'People & protection',
    focusAreas: [
      'Migration & human rights',
      'Human trafficking prevention & survivor advocacy',
      'Gender equality & social justice',
    ],
    docs: ['cyber-enabled-trafficking', 'shared-hope-field-report'],
  },
  {
    id: 'institutions',
    title: 'Institutions & practice',
    focusAreas: [
      'International development',
      'Legislative affairs & government relations',
      'Community outreach & stakeholder engagement',
    ],
    docs: ['sri-lanka-ndp', 'shared-hope-field-report'],
  },
];

/** Display-length labels for the nine focus areas, set as one continuous line.
 *  The canonical names above stay the source of truth everywhere else. */
const SHORT_FOCUS: Record<string, string> = {
  'AI governance & responsible AI': 'Responsible AI',
  'Research & data-driven policy': 'Data-driven policy',
  'Human trafficking prevention & survivor advocacy': 'Trafficking prevention',
  'Gender equality & social justice': 'Gender equality',
  'Legislative affairs & government relations': 'Legislative affairs',
  'Community outreach & stakeholder engagement': 'Stakeholder engagement',
};
export const focusAreasShort = () =>
  themes.flatMap((t) => t.focusAreas).map((area) => SHORT_FOCUS[area] ?? area);

/** Themes a document belongs to, e.g. for highlighting matches. */
export const themesOf = (slug: string): ThemeId[] =>
  themes.filter((t) => t.docs.includes(slug)).map((t) => t.id);

/** "01 · 03 · 04" for a theme, using each document's own order number. */
export const themeNumbers = (theme: Theme, docs: Doc[]) =>
  theme.docs
    .map((slug) => docs.find((d) => d.id === slug)?.data.order)
    .filter((n): n is number => typeof n === 'number')
    .sort((a, b) => a - b)
    .map((n) => String(n).padStart(2, '0'))
    .join(' · ');

export const pad = (n: number) => String(n).padStart(2, '0');

/** Icon shown beside a document's format on its header. */
export const formatIcon: Record<Doc['data']['format'], string> = {
  'Decision memo': 'decision',
  'Policy memo': 'intercept',
  'Advisory memo': 'advisory',
  'Research paper': 'research',
  'Development plan': 'plan',
  // Only the first six icons were drawn for formats; a field report is the
  // one document type without its own, so it takes the neutral document mark.
  'Field report': 'document',
};

/** Card illustrations drawn for the three homepage highlights. */
export const cardGraphic: Record<string, 'pi-options' | 'pi-intercept' | 'pi-plan'> = {
  'autonomous-targeting': 'pi-options',
  'cyber-enabled-trafficking': 'pi-intercept',
  'shared-hope-field-report': 'pi-plan',
};

/** Right-hand tag on a document's meta line: academic exercises say so, and
 *  the one real deliverable names the organisation it was for. */
export const provenance: Record<Doc['data']['label'], string> = {
  academic: 'Academic',
  real: 'Shared Hope',
};
