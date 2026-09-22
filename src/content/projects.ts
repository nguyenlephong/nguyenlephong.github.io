// Extracted from app.const.ts — profile content data. Re-assembled into
// `profileInfo` by app.const.ts so existing imports keep working.

import type { ProjectType } from "@/app/app.type";

function defineProject(
  name: string,
  technologies: string[],
  duration: string,
  accomplishment: string[],
  evidence?: ProjectType["evidence"]
): ProjectType {
  return { name, technologies, duration, description: [], accomplishment, evidence };
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
        `Led a <b>4-person engineering team</b> as <b>Tech Lead and system architect</b>, owning technical direction, architecture decisions, review standards, onboarding, and cross-repository delivery across <b>9 split repositories</b>.`,
        `Designed LogiUP as a <b>multi-tenant logistics SaaS</b>: one Next.js UI codebase for web and Electron desktop, a NestJS control plane, FastAPI AI data plane, PostgreSQL, Redis/BullMQ, Cloudflare R2, and isolated staging/production GitOps environments.`,
        `Engineered tenant isolation end to end with customer subdomains, database-backed host resolution, tenant-scoped RBAC and tokens, wildcard/on-demand TLS, and a self-owned OAuth 2.1/OIDC provider using RS256/JWKS plus PKCE/deep-link authentication for Electron.`,
        `Shipped the AI-assisted customs workflow with <b>6 least-privilege runtime roles</b>, resumable private-object uploads, human-confirmed AI suggestions, and <b>31 typed API endpoints</b> across 8 independently confirmed declaration sections.`
    ]
  ),
  defineProject(
    "BonBon - VETC Mini App & Automotive Platform",
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
        `Built the product integration that helped BonBon advance from MVP to a live field pilot in <b>3 months</b>, get selected as a <b>Top 3 finalist</b> at Tasco × GenAI Fund's Wash3000 MVP Demo Day, and help secure a <b>$500K seed round led by Tasco</b>, with GenAI Fund participating.`,
        `Architected and integrated a <b>12-screen Mini App</b> into VETC's <b>4.3M-user app ecosystem</b>, with silent partner-code login, memory-only sessions, deep links, serialized foreground polling, and privacy allow-listed analytics.`,
        `Made releases safe across Go API, Backoffice, web, and mobile using kill-switch feature flags, deterministic rollout, transactional audit, checksum/CSP gates, Playwright flows, and <b>800+ unit tests</b>.`
    ],
    {
      href: "https://www.tasco.com.vn/post/tasco-dan-dat-vong-dau-tu-500-000-usd-vao-bonbon-nen-tang-o2o-ket-noi-chu-xe-voi-mang-luoi-garage-va-trung-tam-cham-soc-xe",
      publisher: "Tasco",
      publishedAt: "2026-09-21"
    }
  ),
    {
      name: "Digital SAT Math",
      technologies: [
        "Next.js",
        "React",
        "React Native",
        "Antdesign",
        "Docker",
        "GCP",
        "Directus",
        "Google Ads",
        "Stripe"
      ],
      duration: "Oct 2023 - Apr 2025",
      description: [],
      accomplishment: [
        `Orchestrated product development spanning UI/UX design, product engineering, and user behavior analysis, resulting in a global user base exceeding <b>10,000</b> visits and <b>3,000</b> signups within two months.`,
        `Elevated Google search rankings through strategic SEO initiatives, including proficiency in <b>parasite SEO</b> techniques. These efforts led to significant performance enhancements and effective positioning of the product in alignment with industry peers.`,
        `Demonstrated efficiency and resource optimization in front-end application development by leveraging a single Cloud Run instance with <b>1 CPU</b> and a memory limit of <b>256 MiB</b>.`,
        `Spearheaded the development of a mobile app with a <b>mobile-first</b> approach, enabling rapid deployment to app stores within <b>two days</b>. Additionally, ensured seamless <b>PWA</b> installation across all devices, enhancing accessibility and user experience.`,
        `Developed <b>monetization features</b>, including the integration of <b>Google Ads</b> and the implementation of the <b>Stripe</b> payment flow, to enhance revenue generation. `
      ]
    },
    {
      name: "CDP",
      technologies: [
        "React",
        "Next.js",
        "Antdesign",
        "React Native",
        "WordPress",
        "Docker"
      ],
      duration: "July 2020 - Apr 2024",
      description: [],
      accomplishment: [
        `Led the architecture and implementation of the CDxP project, focusing on <b>UI/UX</b> features, which enhanced the overall user experience and increased user engagement.`,
        `Configured nested routers, maintained a <b>scalable</b> project structure and demonstrated strong knowledge of ES6, Typescript, and data types, which <b>improved code maintainability</b> and reduced code-related issues.`,
        `Effectively <b>tracked errors</b>, and enhancements, and provided support for bug fixes, ensuring the project’s <b>stability</b>, which improved system reliability and reduced system downtime.`,
        `Implemented <b>RBAC</b> hooks to verify authorization for accessing components in adaptive client configurations. Additionally, I have built over <b>20 reusable utility features</b> that can be shared across different projects thanks to their modular design.`,
        `Engineered <b>10+ advanced features</b> such as profiles, campaigns, analytics, and more.`,
        `Established robust testing flow, covering core CDP features with <b>100+ scenarios</b> and <b>1000+ test cases</b>.`,
        `Acquired domain expertise and excelled in testing methodologies, including BDD, unit testing, and <b>E2E testing</b>, which improved test coverage and reduced software bugs by <b>30%</b>.`,
        `Developed a <b>feature flag</b> for runtime toggling, enabling A/B testing and feature grouping based on customer segments, which optimized feature delivery and increased feature adoption.`,
        `<b>Documented</b> components for clarity and ease of maintenance, which improved code readability and reduced maintenance time.`
      ]
    },
    {
      name: "Event Tracking - Web SDK",
      technologies: ["Vanilla JS", "WebSocket", "Web Worker", "Firebase"],
      duration: "May 2021 - Jan 2024",
      description: [],
      accomplishment: [
        `Successfully developed over <b>5 modules</b>, incorporating more than <b>10 advanced features</b> using <b>vanilla JS</b>. Achieved an impressive bundle size of <b><200kb and a load time of <150ms</b> (metrics measured prior to employing all optimization techniques for the bundle).`,
        `Utilized <b>web workers and service workers</b> to facilitate multitasking in the background, effectively managing complex functionalities and handling <b>multiple edge cases</b>, such as simultaneous multi-tab usage.`,
        `Additionally, designed and implemented a <b>personalized recommendation feature</b> using a <b>micro-frontend</b> architecture, specifically a carousel block showcasing products users may love, thereby enhancing user experience and engagement.`,
        `Among the various advanced features built are web pop-ups, web push notifications, <b>web component embedding</b>, WebSocket integration, and management of annoying pop-ups across multiple tabs.`,
        `Furthermore, leveraged <b>JS Closure</b> to organize module structures, enabling seamless feature export or <b>data encapsulation</b>, thereby <b>avoid conflicts</b> within the global scope.`
      ]
    },
    {
      name: "Vietnam Australia Center",
      technologies: ["React", "Firebase", "Next.js"],
      duration: "May 2023",
      description: [],
      accomplishment: [
        `Took on the responsibility of <b>teaching</b> a <b>Front-end Project</b> course at Vietnam Australia Center.`,
        `Designed and delivered <b>engaging lectures</b>, providing hands-on guidance to students on front-end development projects.`,
        `Focused on fostering a <b>collaborative</b> learning environment, encouraging <b>teamwork</b> for <b>12 students</b>, and aligning coursework with industry best practices.`,
        `Provided personalized <b>feedback</b> and <b>mentoring</b>, supporting students in <b>overcoming challenges</b> and ensuring a comprehensive understanding of the course material.`
      ]
    },
    {
      name: "House Management - Mona House",
      technologies: ["React Native", "Realm DB", "Figma"],
      duration: "Feb 2020 - May 2020",
      description: [],
      accomplishment: [
        `Developed a comprehensive mobile application, Mona House, using <b>React Native</b> and Realm DB for efficient house management.`,
        `Specialized in creating cross-platform apps with a focus on <b>reusable components</b>, smooth animations, and seamless integration with native modules.`,
        `Demonstrated strong <b>problem-solving</b> and <b>troubleshooting</b> skills, swiftly identifying and resolving complex issues through advanced debugging tools and performance profiling.`,
        `Exhibited <b>adaptability</b> and a <b>quick learning curve</b> for new technologies, allowing seamless implementation of new frameworks, programming languages, or tools to ensure project completion.`
      ]
    },
    {
      name: "Bank tool - Mobivi",
      technologies: ["React", "Java", "Spring Boot", "MySQL", "Redux"],
      duration: "Dec 2019",
      description: [],
      accomplishment: [
        "Developed a <b>full-stack web application</b> at Mobivi, focusing on ingesting and processing data over <b>20 Excel files</b>, each containing over <b>20,000 records</b>.",
        "The application was designed to efficiently handle progressively calculated transactional data from users, <b>ensuring accurate and reliable reporting</b>."
      ]
    },
    {
      name: "Savyu - Synova Solutions",
      technologies: ["React Native", "React", "Node.js", "Firebase", "Redux"],
      duration: "May 2019",
      description: [],
      accomplishment: [
        "Played a pivotal role in the development of <b>two mobile</b> applications at Synova - one catering to merchants and the other targeting consumers.",
        "Contributed to the creation of a <b>web application</b> empowering administrators to efficiently manage user data.",
        "Demonstrated <b>proficiency in mobile app</b> development, collaborating with cross-functional teams to ensure the successful delivery of <b>intuitive</b> and <b>high-performing</b> applications."
      ]
    }
]
