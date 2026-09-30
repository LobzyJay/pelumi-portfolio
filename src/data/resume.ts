// Résumé content. Source of truth is her résumé PDF; the design trimmed some
// bullets, and where the trimmed wording changed the claim (the design said
// "Led outreach" and "Handled intake" where the PDF says "Conducted" and
// "Assisted with") the PDF's verb is used here.

export interface Role {
  dates: string;
  title: string;
  org: string;
  place: string;
  bullets: string[];
}

export const education = [
  {
    dates: 'May 2026',
    title: 'Master of Global Policy',
    detail: 'LBJ School of Public Affairs, The University of Texas at Austin · Austin, TX',
  },
  {
    dates: 'June 2022',
    title: 'B.Sc. International Law and Diplomacy',
    detail: 'Babcock University · Ogun, Nigeria',
  },
];

export const experience: Role[] = [
  {
    dates: 'May 2026',
    title: 'Anti-Human Trafficking Intern',
    org: 'International Rescue Committee',
    place: 'Silver Spring, Maryland',
    bullets: [
      'Supported anti-trafficking case management for survivors and people at risk of exploitation.',
      'Conducted outreach and education on trafficking indicators, prevention and community resources.',
      'Assisted with client intake, referrals and confidential case files using trauma-informed practice.',
    ],
  },
  {
    dates: 'Jan – May 2026',
    title: 'Policy, Advocacy & Program Intern',
    org: 'Shared Hope International',
    place: 'Washington, D.C.',
    bullets: [
      'Monitored federal and state anti-trafficking legislation, hearings and markups.',
      'Drafted policy memoranda, briefings and legislative summaries for leadership.',
      'Developed an AI-based child sex trafficking prevention proposal, adopted into advocacy with policymakers.',
      'Designed and launched a youth anti-trafficking ambassador initiative.',
    ],
  },
  {
    dates: 'May – Aug 2025',
    title: 'Program & Research Intern',
    org: 'Enda Graf Sahel',
    place: 'Dakar, Senegal',
    bullets: [
      'Co-designed and delivered a workshop with IOM supporting migrant and trafficking-survivor reintegration.',
      'Wrote a policy proposal on school leadership, adopted by local administrators.',
      'Worked with NGO staff and French-speaking communities on programme delivery.',
    ],
  },
  {
    dates: 'Aug – Dec 2024',
    title: 'Teaching Assistant, Advertising & Public Relations',
    org: 'Moody School of Communications, UT Austin',
    place: 'Austin, TX',
    bullets: ['Managed a cohort of 58 students and supported accessibility compliance.'],
  },
  {
    dates: 'Nov 2023 – Jun 2024',
    title: 'Assistant Human Resources Manager',
    org: 'Nuclear Associates and Consultancy Limited',
    place: 'Lagos, Nigeria',
    bullets: [
      'Coordinated recruitment, onboarding and confidential personnel records.',
      'Recommended process improvements for onboarding and internal communications.',
    ],
  },
  {
    dates: 'Nov 2022 – Dec 2023',
    title: 'Associate Mediator',
    org: 'Citizen Mediation Center, Lagos State Ministry of Justice',
    place: 'Lagos, Nigeria',
    bullets: ['Facilitated dispute resolution using ADR techniques and managed sensitive case files.'],
  },
];

export const certifications = [
  { name: 'Cybersecurity', issuer: 'IBM' },
  { name: 'Open-Source Intelligence', issuer: 'Coursera' },
  // The PDF lists the credential with no issuer; the design tagged it
  // "Certified", which the PDF does not say — so no tag is invented.
  { name: 'Fraud Audit Examiner', issuer: '' },
];

export const languages = [
  { name: 'English', level: 'Native' },
  { name: 'Yoruba', level: 'Native' },
  { name: 'French', level: 'Intermediate' },
  { name: 'Japanese', level: 'Beginner' },
];

export const skills = [
  { group: 'Policy', items: ['Policy analysis', 'Legislative tracking', 'Briefing memos', 'Stakeholder engagement'] },
  { group: 'Research & data', items: ['OSINT', 'SQL', 'R', 'Excel'] },
  { group: 'Operations', items: ['Case documentation', 'Report preparation'] },
];

// About timeline: a condensed view of the above, in the design's own wording.
// The design dated the IRC role "May 2026 – now"; the résumé gives only
// "May 2026", so no end state is asserted.
export const timeline = [
  {
    dates: 'May 2026',
    title: 'Anti-Human Trafficking Intern, International Rescue Committee',
    detail: 'Silver Spring, Maryland. Case management, outreach and referrals for survivors and people at risk.',
  },
  {
    dates: 'May 2026',
    title: 'Master of Global Policy, LBJ School of Public Affairs',
    detail: 'The University of Texas at Austin.',
  },
  {
    dates: 'Jan – May 2026',
    title: 'Policy, Advocacy & Program Intern, Shared Hope International',
    detail: 'Washington, D.C. Legislative tracking, policy memoranda, and an AI-based prevention proposal adopted into advocacy.',
  },
  {
    dates: 'May – Aug 2025',
    title: 'Program & Research Intern, Enda Graf Sahel',
    detail: 'Dakar, Senegal. Co-delivered a reintegration workshop with IOM for migrants and trafficking survivors.',
  },
  {
    dates: 'Nov 2022 – Jun 2024',
    title: 'Mediation and HR roles, Lagos',
    detail:
      'Associate Mediator, Citizen Mediation Center (Lagos State Ministry of Justice); Assistant HR Manager, Nuclear Associates and Consultancy.',
  },
  {
    dates: 'June 2022',
    title: 'B.Sc. International Law and Diplomacy, Babcock University',
    detail: 'Ogun, Nigeria.',
  },
];
