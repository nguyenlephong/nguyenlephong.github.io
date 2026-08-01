import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')

const [{ experience }, { contact, education }, { projects }] = await Promise.all([
  import(pathToFileURL(path.join(projectRoot, 'src/content/experience.ts'))),
  import(pathToFileURL(path.join(projectRoot, 'src/content/profile.ts'))),
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

const contributionSelection = new Map([
  ['Zalo PC - VNG Corp|Lead Software Engineer', [0, 1, 2]],
  ['Zalo PC - VNG Corp|Senior Software Engineer', [0, 1, 2]],
  ['NDSVN JSC|Senior Software Engineer Lead', [0, 1, 2, 7]],
  ['PrimeData VN|Senior Full-stack Software Engineer', [0, 1, 2]],
  ['Splus-Software JSC|Java Developer', [0, 2]],
  ['Propman Guru|Fresher Front-end Developer', [0]],
])

const roles = experience.flatMap((company) =>
  company.jobs.map((job) => {
    const key = `${company.company}|${job.title}`
    const indexes = contributionSelection.get(key) ?? [0, 1, 2]

    return {
      company: plainText(company.company),
      location: plainText(company.location),
      title: plainText(job.title),
      duration: plainText(job.duration),
      summary: job.summaries.map(plainText).join(' '),
      contributions: indexes
        .map((index) => job.key_contribution[index])
        .filter(Boolean)
        .map(plainText),
      technologies: job.key_techs.map(plainText),
    }
  }),
)

const selectedProjectIndexes = new Map([
  ['Digital SAT Math', [0, 2]],
  ['Event Tracking - Web SDK', [0, 1]],
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
    email: plainText(contact.email),
    github: plainText(contact.github),
    linkedin: plainText(contact.linkedin),
    portfolio: 'https://nguyenlephong.github.io',
  },
  summary: [
    plainText(messages.Summary.intro1),
    plainText(messages.Summary.intro2),
  ],
  strengths: [
    {
      label: 'Leadership & Delivery',
      value: 'Technical direction, code review, delivery coordination, hiring, coaching, RFCs, and runbooks',
    },
    {
      label: 'Architecture',
      value: 'System design, multi-tenant platforms, feature flags, Micro-Frontends, and progressive delivery',
    },
    {
      label: 'Front-end & Desktop',
      value: 'React, Next.js, TypeScript, Electron, React Native, and Storybook',
    },
    {
      label: 'Back-end & Integration',
      value: 'Node.js, .NET Core, Java Spring, REST/GraphQL, mTLS, and idempotent APIs',
    },
    {
      label: 'Platform & Observability',
      value: 'Docker, Kubernetes, ArgoCD, CI/CD, PostHog, and production diagnostics',
    },
    {
      label: 'Quality Engineering',
      value: 'Jest, Cucumber, Puppeteer, Testing Library, BDD/E2E, and release readiness',
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
