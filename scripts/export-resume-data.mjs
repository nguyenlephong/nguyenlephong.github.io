import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

const [{ experience }, { contact, education }, { email, social }, { projects }] = await Promise.all([
  import(pathToFileURL(path.join(projectRoot, 'src/content/experience.ts'))),
  import(pathToFileURL(path.join(projectRoot, 'src/content/profile.ts'))),
  import(pathToFileURL(path.join(projectRoot, 'src/content/social.ts'))),
  import(pathToFileURL(path.join(projectRoot, 'src/content/projects.ts'))),
])

const messages = JSON.parse(
  await readFile(path.join(projectRoot, 'messages/en.json'), 'utf8'),
)

const decodeEntities = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")

const toAscii = (value) =>
  value
    .replace(/[\u2010-\u2015]/g, ' - ')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')

const plainText = (value) =>
  toAscii(
    decodeEntities(
      value
        .replace(/<(?=\d)/g, '&lt;')
        .replace(/<[^>]+>/g, ''),
    ),
  )
    .replace(/\s+/g, ' ')
    .trim()

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const formatMonth = (ym) => {
  const [year, month] = ym.split('-').map(Number)
  return `${MONTHS[month - 1]} ${year}`
}

// Copy comes from the same messages the site renders (Experience.roles.<id>),
// so the PDF and the page cannot drift. Top three contributions per role, as on the site.
const roleCopy = messages.Experience.roles
const roles = experience.map((role) => {
  const copy = roleCopy[role.id]
  if (!copy) throw new Error(`messages/en.json is missing Experience.roles.${role.id}`)
  return {
    company: plainText(role.company),
    location: plainText(role.location),
    title: plainText(role.title),
    duration: `${formatMonth(role.start)} - ${role.end ? formatMonth(role.end) : 'Present'}`,
    summary: role.earlier ? '' : plainText(copy.scope),
    contributions: (role.earlier ? [copy.line] : copy.contributions.slice(0, 3)).map(plainText),
    technologies: role.techs.map(plainText),
  }
})

const selectedProjectIndexes = new Map([
  ['LogiUP - Multi-tenant Logistics SaaS', [0, 1, 2, 3, 4]],
  ['BonBon Mobility - VETC Mini App & Automotive Platform', [0, 1, 2, 3]],
])

const selectedProjects = projects
  .filter((project) => selectedProjectIndexes.has(project.name))
  .map((project) => ({
    name: plainText(project.name),
    duration: plainText(project.duration),
    technologies: project.technologies.map(plainText),
    accomplishments: selectedProjectIndexes
      .get(project.name)
      .map((index) => project.accomplishment[index])
      .filter(Boolean)
      .map(plainText),
  }))

const data = {
  name: 'Nguyen Le Phong',
  headline: 'Lead Software Engineer | Technical Lead',
  location: messages.Hero.location,
  contact: {
    phone: plainText(contact.phone),
    email: plainText(email),
    github: plainText(social.github),
    linkedin: plainText(social.linkedin),
    portfolio: 'https://nguyenlephong.github.io',
  },
  // The homepage lede now sets up the capability map and no longer reads as a résumé summary.
  summary: [
    'Lead Software Engineer at Zalo PC with 8+ years building production products across large-scale messaging, CDP, fintech, education, and real estate.',
    'I turn ambiguous problems into dependable systems through hands-on engineering, technical leadership, and end-to-end ownership from architecture to production.',
  ],
  strengths: [
    {
      label: 'Leadership & Delivery',
      value: 'Technical direction, code review, delivery coordination, hiring, coaching, RFCs, and runbooks',
    },
    {
      label: 'Architecture',
      value: 'Multi-tenant SaaS, Electron desktop, AI-assisted document workflows, partner Mini Apps, feature flags, and progressive delivery',
    },
    {
      label: 'Front-end & Desktop',
      value: 'React, Next.js, TypeScript, Electron, React Native, and Storybook',
    },
    {
      label: 'Back-end & Integration',
      value: 'Go, Python, Node.js, .NET Core, Java Spring, mTLS, and idempotent APIs',
    },
    {
      label: 'Platform & Observability',
      value: 'PostgreSQL, Redis, R2, Docker, Kubernetes, CI/CD, PostHog, and production diagnostics',
    },
    {
      label: 'Quality Engineering',
      value: 'Playwright, Vitest, Pytest, Jest, BDD/E2E, deterministic packaging, and release readiness',
    },
  ],
  experience: roles,
  projects: selectedProjects,
  education: education.map((item) => ({
    school: plainText(item.school),
    degree: plainText(item.description.join(' ')),
    gpa: item.GPA,
    duration: plainText(item.duration),
  })),
}

process.stdout.write(JSON.stringify(data))
