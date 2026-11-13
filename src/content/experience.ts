// Career roles, newest first, in the order the career graph draws them.
// The copy (scope, contributions, earlier lines) lives in messages `Experience.roles.<id>`
// so every locale and the resume PDF (scripts/export-resume-data.mjs) read one source.
import type { ExperienceRole } from "@/app/app.type";

export const experience: ExperienceRole[] = [
  {
    id: "zaloLead",
    company: "Zalo PC, VNG",
    title: "Lead Software Engineer",
    start: "2026-03",
    env: "bigTech",
    location: "Ho Chi Minh City",
    techs: ["TypeScript", "React", "Electron", "Node.js", "Kotlin"],
    evidence: {
      href: "https://vnexpress.net/ba-tinh-nang-moi-cua-zalo-5097444.html",
      publisher: "VnExpress",
      publishedAt: "2026-07-15"
    }
  },
  {
    id: "ndsvn",
    company: "NDSVN JSC",
    title: "Senior Software Engineer Lead",
    start: "2025-08",
    end: "2026-03",
    env: "enterprise",
    location: "Ho Chi Minh City",
    techs: [".NET Core", "Angular", "React", "Kubernetes", "ArgoCD"]
  },
  {
    id: "zaloSenior",
    company: "Zalo PC, VNG",
    title: "Senior Software Engineer",
    start: "2024-05",
    end: "2025-08",
    env: "bigTech",
    location: "Ho Chi Minh City",
    techs: ["React", "TypeScript", "Electron", "Storybook", "Kotlin"]
  },
  {
    id: "primedata",
    company: "PrimeData VN",
    title: "Senior Full-stack Software Engineer",
    start: "2020-07",
    end: "2024-04",
    env: "b2b",
    location: "Ho Chi Minh City",
    techs: ["React", "Next.js", "TypeScript", "React Native", "Node.js"]
  },
  {
    id: "splus",
    company: "Splus Software",
    title: "Java Developer",
    start: "2019-03",
    end: "2020-07",
    env: "outsourcing",
    location: "Ho Chi Minh City",
    techs: ["Java", "Spring", "React", "React Native", "MySQL"],
    earlier: true
  },
  {
    id: "propman",
    company: "Propman Guru",
    title: "Fresher Front-end Developer",
    start: "2018-05",
    end: "2019-01",
    env: "startup",
    location: "Ho Chi Minh City",
    techs: ["React", "JavaScript", "WordPress", "Material UI"],
    earlier: true
  }
];
