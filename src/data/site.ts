// Fixed site copy. Anything flagged PENDING is an open question for Pelumi
// (PRD §13) and ships as an honest placeholder, never an invented fact.

// The public name is set once, here, and everything derives from it: the nav,
// the hero, page titles, meta descriptions, alt text. She goes by her full
// first name, Oluwapelumi.
const firstName = 'Oluwapelumi';
const lastName = 'Igbalajobi';

export const site = {
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  legalName: 'Oluwapelumi Adeola Igbalajobi',
  /** How the home hero sets her name. One line to change:
   *    'regular' — the artboard: mixed case, regular weight
   *    'caps'    — the heavy version: condensed, black weight, all caps
   *  (Both fit any name length; see src/scripts/fit.ts. Append ?nameStyle=caps
   *  or ?nameStyle=regular to any page URL to preview without a rebuild.) */
  heroNameStyle: 'regular' as 'regular' | 'caps',
  positioning: 'Technology, human security, and the institutions that govern both.',
  city: 'Washington, D.C.',

  // Confirmed against her résumé (2026-09): degree title and date, which closes
  // PRD §13.2 — earlier drafts carried "Master of Global Policy Studies".
  degree: {
    title: 'Master of Global Policy',
    school: 'LBJ School of Public Affairs',
    university: 'The University of Texas at Austin',
    date: 'May 2026',
  },
  heroMeta: ['Master of Global Policy, LBJ School', 'Washington, D.C.'],

  // Home ledger: three facts, not vanity numbers (PRD §11.4).
  proof: [
    { kind: 'Degree', title: 'Master of Global Policy', detail: 'UT Austin · LBJ School · May 2026' },
    {
      kind: 'Fieldwork',
      title: 'Policy, Advocacy & Program Intern',
      detail: 'Shared Hope International · Washington, D.C.',
    },
    {
      kind: 'Co-authorship',
      title: 'Sri Lanka National Development Plan 2026–2031',
      detail: 'Co-author · academic',
    },
  ],

  honestyLabel:
    'Academic policy exercise, LBJ School of Public Affairs. Addressee and author role are part of the assignment.',

  contact: {
    // PENDING: which public professional email to publish (PRD §13.3) — not the
    // personal Gmail. Placeholder only; domain ownership is unverified.
    email: 'hello@pelumiigbalajobi.com',
    emailSubject: 'Hello from your site',
    linkedin: 'https://www.linkedin.com/in/oluwapelumiigbalajobi/',
    linkedinLabel: 'linkedin.com/in/oluwapelumiigbalajobi',
    // The résumé PDF, published as supplied (owner's decision).
    resumePdf: '/documents/Igbalajobi-Oluwapelumi-Resume.pdf',
    // "Résumé" in the nav, menu and footer goes here; the PDF is downloaded from this page.
    resumePage: '/resume/',
  },

  // About
  // PENDING: the full ~300-word first-person narrative (PRD §5.2, §6.5), and
  // Pelumi's confirmation of the "shy" line (PRD §13.10).
  shyLine: 'Shows up to the room, even when shy.',
  backgroundShort:
    'A global-policy analyst working where emerging technology, human security and governance meet. Across every piece of work the same question returns: who is protected, who is accountable, and what institution has to change when a new technology or shock arrives.',
  backgroundNote: `Full first-person narrative pending — to be written with ${firstName}.`,
  places: ['United States', 'United Kingdom', 'Senegal', 'Benin Republic', 'South Africa', 'Ghana'],
  interests:
    'Emerging tech (AI, cybersecurity), public policy, international affairs, global development, volunteering with vulnerable communities.',
  offTheClock:
    'Travel, films, documentaries, reading, cuisines, online courses. French (intermediate) and Japanese (beginner).',

  // Footer credit: who made the site, and the year. The studio is Layout Studio
  // (it was in the design all along; an earlier pass mistook it for a leftover).
  studio: 'Layout Studio',
  year: 2026,
  notFoundLine: 'That page does not exist.',
} as const;
