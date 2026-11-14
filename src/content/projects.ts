// Profile content data, imported directly by the pages that render it.
// The homepage renders copy from messages/*.json (Projects.*); the English
// accomplishments below feed the résumé PDF (scripts/export-resume-data.mjs).

import type { ProjectType } from "@/app/app.type";

function defineProject(
  name: string,
  technologies: string[],
  duration: string,
  accomplishment: string[],
  evidence?: ProjectType["evidence"],
  brand?: ProjectType["brand"]
): ProjectType {
  return { name, technologies, duration, description: [], accomplishment, evidence, brand };
}

export const projects = [
  defineProject(
    "LogiUP - Multi-tenant Logistics SaaS",
    [
      "Next.js",
      "Electron",
      "NestJS",
      "TypeScript",
      "Python",
      "PostgreSQL",
      "Redis",
      "Cloudflare R2",
      "Docker",
      "GitHub Actions"
    ],
    "Mar 2026 - Present",
    [
      `As <b>Tech Lead and system architect</b>, lead a <b>4-person engineering team</b> across 9 repos: one Next.js UI for web and Electron desktop, a NestJS control plane, a FastAPI data plane for AI.`,
      `Scoped every token and RBAC check to the tenant, over trusting the subdomain alone, so one mis-routed request cannot read another customer's data.`,
      `Built our own OAuth 2.1/OIDC provider (RS256, JWKS, PKCE) so the Electron desktop app signs in the same way as the web, through a logiup:// deep link.`,
      `Shipped the AI-assisted customs workflow: AI suggests values and a person confirms each of the 8 declaration sections, with <b>6 least-privilege runtime roles</b> and <b>31 typed API endpoints</b>.`,
      `Took export declarations to UAT in Oct 2026 with a rule-based document classifier.`
    ]
  ),
  defineProject(
    "BonBon Mobility - VETC Mini App & Automotive Platform",
    [
      "Go",
      "React",
      "Next.js",
      "React Native",
      "PostgreSQL",
      "Redis",
      "PostHog",
      "Playwright"
    ],
    "Apr 2026 - Present",
    [
      `Co-founded BonBon Mobility, which won Tasco Foundry Wash3000 out of about 100 applicants and closed a <b>$500K pre-seed round led by Tasco</b>, with GenAI Fund co-investing (Sep 2026).`,
      `Built the product as a <b>12-screen Mini App</b> inside the VETC app (<b>4.3M users</b> as of Apr 2026, per Tasco) and shipped through VETC's change approval and security process (OWASP review, independent pentest).`,
      `Signed car owners in silently with their VETC session instead of a second OTP, and kept sessions in memory only, with no browser token storage.`,
      `Shipped new features behind default-off kill-switch flags, and went from MVP to a field pilot in 3 months, the length of the Wash3000 program.`
    ],
    [
      {
        href: "https://www.tasco.com.vn/post/tasco-dan-dat-vong-dau-tu-500-000-usd-vao-bonbon-nen-tang-o2o-ket-noi-chu-xe-voi-mang-luoi-garage-va-trung-tam-cham-soc-xe",
        publisher: "Tasco",
        publishedAt: "2026-09-21"
      },
      {
        href: "https://genaifund.ai/2026/09/23/genai-fund-backs-bonbon-500k/",
        publisher: "GenAI Fund",
        publishedAt: "2026-09-23"
      }
    ],
    {
      href: "https://bonbon.com.vn/",
      label: "bonbon.com.vn",
      logo: "/brand/bonbon-mark.png"
    }
  ),
  {
    name: "Digital SAT Math",
    technologies: ["Next.js", "React", "React Native", "Docker", "GCP", "Directus", "Stripe"],
    duration: "Oct 2023 - Apr 2025",
    description: [],
    accomplishment: [
      `Owned it end to end: <b>10,000+</b> visits and <b>3,000+</b> signups in the first two months.`
    ]
  },
  {
    name: "Vietnam Australia Center",
    technologies: ["React", "Firebase", "Next.js"],
    duration: "May 2023",
    description: [],
    accomplishment: [
      `Taught a front-end project course to <b>12 students</b>, from requirements to working React apps.`
    ]
  }
]
