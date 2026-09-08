// Fixed site copy. Source: design_handoff_pelumi_site/content/content-model.md
// "Fixed site copy" + PRD v0.2 §3, §13. Anything flagged PENDING is an open
// question for Pelumi (PRD §13) and ships with an honest placeholder, never
// an invented fact.

export const site = {
  name: 'Pelumi Igbalajobi',
  legalName: 'Oluwapelumi Adeola Igbalajobi',
  kicker: 'Global policy analyst · Washington, D.C.',
  positioning: 'Technology, human security, and the institutions that govern both.',
  // PRD §3.5 recommends option 3 for the hero and option 4 as the metadata line.
  metaLine: 'MGPS, LBJ School of Public Affairs · Washington, D.C.', // PENDING: confirm exact degree title (PRD §13.2)
  degree: {
    school: 'LBJ School of Public Affairs, UT Austin',
    program: 'Master of Global Policy Studies', // PENDING: confirm exact title/specialisation
  },
  experience: {
    org: 'Shared Hope International',
    role: 'Spring intern',
    location: 'Washington, D.C.',
    workstreams: [
      {
        title: 'Policy research & analysis',
        body: 'Researching digital-trafficking trends and briefing findings to inform organisational strategy.',
      },
      {
        title: 'Advocacy & legislative engagement',
        body: 'Supporting legislative affairs and government-relations work on anti-trafficking policy.',
      },
      {
        title: 'Training & prevention programmes',
        body: 'Contributing to prevention-education programming, including youth-ambassador outreach materials.',
      },
    ],
  },
  quote:
    'I want to contribute to ensuring that, as technology continues to evolve, it is used responsibly and in ways that protect vulnerable populations.',
  // Two-sentence background, shared by both designs so they can't drift.
  // PENDING: the full ~300-word first-person narrative (PRD §5.2, §6.5).
  backgroundShort:
    'A global-policy analyst working where emerging technology, human security and governance meet. Across every piece of work the same question returns: who is protected, who is accountable, and what institution has to change when a new technology or shock arrives.',
  // Compact facts for the Signal hero dossier; plain enough for Atlas to adopt.
  dossier: [
    { label: 'Degree', value: 'MGPS · LBJ School of Public Affairs, UT Austin' },
    { label: 'Based', value: 'Washington, D.C.' },
    { label: 'Currently', value: 'Policy-analyst and research-associate roles' },
  ],
  proofStrip: [
    'Master of Global Policy Studies, UT Austin',
    'Spring intern, Shared Hope International (Washington, D.C.)',
    'Co-author, Sri Lanka National Development Plan 2026–2031 (academic)',
  ],
  honestyLabel:
    'Academic policy exercise, LBJ School of Public Affairs. Addressee and author role are part of the assignment.',
  contact: {
    // PENDING: which public professional email to publish (PRD §13.3) — not the
    // personal Gmail. Placeholder only; do not treat as a real address.
    email: 'hello@pelumiigbalajobi.com',
    emailSubject: 'Hello from your site',
    linkedin: 'https://www.linkedin.com/in/oluwapelumiigbalajobi/',
    resumeHref: '/documents/resume-pending.pdf', // PENDING: résumé PDF not yet supplied
    // A grounded, concrete personality signal for the contact room — not a
    // vanity line, just what's actually true right now.
    availability: 'Currently: policy-analyst and research-associate roles, Washington, D.C.',
  },
  ctaEnterRooms: 'Enter the rooms ↓',
  ctaResume: 'Résumé',
  ctaWork: 'Selected work',
  notFoundLine: 'This memo could not be located.',
  colophon: '© 2026 · Colophon',
  // PRD §5.2 About: a human line Pelumi offered, to be confirmed (PRD §13.10).
  shyLine: 'Shows up to the room, even when shy.',
  places: ['United States', 'United Kingdom', 'Senegal', 'Benin Republic', 'South Africa', 'Ghana'],
  interests: [
    'Emerging technologies, especially AI and cybersecurity',
    'Public policy, international affairs and global development',
    'Volunteering with vulnerable communities',
    'Languages — improving French and Japanese',
    'Travel and cultures',
    'Policy discussions and workshops',
  ],
  hobbies: [
    'Travelling',
    'Films',
    'Reading',
    'Researching new topics',
    'Exploring cultures and cuisines',
    'Online courses',
    'Documentaries on world affairs, technology and history',
  ],
} as const;
