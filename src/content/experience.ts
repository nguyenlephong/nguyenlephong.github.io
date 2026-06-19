// Extracted from app.const.ts — profile content data. Re-assembled into
// `profileInfo` by app.const.ts so existing imports keep working.

export const experience = [
    {
      company: "NDSVN JSC",
      location: "Ho Chi Minh City, Vietnam",
      jobs: [
        {
          title: "Senior Software Engineer Lead",
          duration: "Aug 2025 - Present",
          summaries: [
            "Owned product delivery and technical direction post-CTO transition, leading architecture decisions, rollout systems, enterprise-grade integrations, and cross-team alignment while managing a delivery team of 8 developers (including 4 seniors) and 3 QC engineers."
          ],
          key_contribution: [
            "Engineered a .NET Core multi-tenant feature flag system <b>(30+ tenants, ~40k users)</b> with a priority rule engine, percentage rollout (tenant/segment/env), JSON-config values, and stateless runtime evaluation—powering mobile/web apps and enabling controlled, progressive production releases across high-traffic tenants.",
            "Built secure integrations with <b>Gtel & Napas</b>: RSA-4096 handshake, AES-256 payload encryption, <b>mTLS</b> mutual authentication, certificate pinning, retry queues, idempotent API contracts, and ACK-driven monitoring for unstable third-party services.",
            "Implemented <b>Micro-Frontend</b> architecture (Angular host + React modules) enabling independent deploy cycles and feature isolation—reducing regression surface and deployment coupling across teams.",
            "Introduced observability stack (PostHog + metrics pipeline + workflow) for rollout impact, feature adoption, anomaly detection, and regression tracing—cut debugging/analysis time significantly across release cycles.",
            "Assumed ownership of inherited infrastructure and kept the organization moving—quietly absorbing production fires, pipeline failures, cluster quirks, and integration instability so the product and teams never stalled; shaping ArgoCD, CI/CD, domains/SSL, and <b>AKS/FKE/K3S/EKS</b> clusters into systems that are <b>diagnosable, recoverable, and stable instead of recurring unknowns</b>.",
            "Built <b>AI agents</b> supporting code review, deployment assistant, service-quota validation, API health monitoring, and release analysis; shortened decision & delivery loops across product teams.",
            "Developed integration simulations and sandbox/demo modules to handle unstable partners and secure pre-contract validation with third-party ecosystems.",
            "<b>Re-structured engineering organization</b> after leadership transition: defined org chart, competency matrix, workload routing, and ownership boundaries—unlocking autonomy and reducing lead-time on technical decisions.",
            "Established a unified engineering playbook: branch strategy, commit convention, release tagging, rollout criteria, API/integration rules, and technical spec repository (RFCs, runbooks, troubleshooting guides).",
            "Led hiring and capability growth loops: structured interviews (QC/Fullstack), onboarding path, 1:1 coaching, performance review cycles, and cross-team conflict resolution to keep delivery collaborative and output-focused.",
            "Maintained delivery quality through documentation-first culture and process guardrails (checklists, handover rules, rollback readiness), ensuring predictable release cadences during scaling."
          ],
          key_techs: [
            "React.js",
            "Angular",
            "Node.js",
            "Flutter",
            ".NET",
            "AKS/FKE/K3S/EKS"
          ]
        }
      ]
    },
    {
      company: "Zalo PC - VNG Corp",
      location: "VNG Campus - District 7",
      jobs: [
        {
          title: "Senior Software Engineer",
          duration: "May 2024 - Aug 2025",
          summaries: [
            "Core developer for the cross-platform <b>Zalo PC</b> (Web, macOS, Windows), serving <b>15M+ MAU</b>. Delivered key features such as dark mode, dynamic theming, and user behavior tracking. Spearheaded the development of a promotion flow and a scalable <b>design system</b> for <b>50+ developers</b>. Optimized performance, enhanced maintainability, and contributed to business growth through robust and efficient solutions.",
            "Actively maintained and improved <b>Zalo’s Android</b> mobile app, ensuring the <b>stability</b> and <b>performance</b> of critical features for nearly <b>80 million users</b>."
          ],
          key_contribution: [
            "Delivered over <b>10 features</b>, including dark mode, a download module, kiki bot, log tracking, and more, improving UX and engagement.",
            "Developed a <b>promotion flow</b> with integrated tracking and monitoring systems, driving activation success across <b>15M+ MAU</b>.",
            "Led the development of a scalable <b>design system</b> using Storybook, ensuring UI consistency and efficiency for <b>50+ developers</b>.",
            "Proactively supported <b>50+ client users</b>, swiftly resolving issues with <b>dedication</b> and <b>effective problem-solving</b>, earning strong positive feedback.",
            "Maintained and improved <b>3+</b> features in <b>Zalo’s Android</b> app, focusing on <b>stability</b>, <b>performance</b>, and seamless user experience for nearly <b>80 million users</b>."
          ],
          key_techs: ["ReactJs", "Node.js", "Electron", "Typescript", "Kotlin"]
        }
      ]
    },
    {
      company: "PrimeData VN",
      location: "Binh Thanh",
      jobs: [
        {
          title: "Senior Full-stack Software Engineer",
          duration: "July 2020 - Apr. 2024",
          summaries: [
            `Built CDxP, a customer data platform for identifying, unifying, and activating customer profiles from heterogeneous schemas across disconnected systems.`
          ],
          key_contribution: [
            `Led Front-end team, delivering <b>10+ projects</b> including CDxP app, Magento & WordPress demos, JS SDKs, mobile SDKs, and more.`,
            `Managed team of <b>4 members</b>, aligning with product roadmap to satisfy multiple major partners, enhancing UI/UX and implementing advanced features like 360 profiles and campaign builders.`,
            `Developed lightweight JS SDK with full functionalities (<b><200kb, <150ms</b> load time), facilitating seamless integration across projects.`,
            `Demonstrated rapid <b>problem-solving</b>, ensuring swift feature demonstrations to impress clients and investors.`
          ],
          key_techs: [
            "ReactJs",
            "Next.js",
            "Typescript",
            "WordPress",
            "SDK",
            "Antdesign",
            "Team Leadership",
            "React Native",
            "Node.js"
          ]
        }
      ]
    },
    {
      company: "Splus-Software JSC",
      location: "Tan Binh",
      jobs: [
        {
          title: "Java Developer",
          duration: "Mar 2019 - July 2020",
          summaries: [
            `An out-sourcing company. Most projects revolve around <b>mobile and web apps</b>.`
          ],
          key_contribution: [
            `With expertise in the <b>end-to-end software production process</b>, I <b>led a small team</b>, mastering the phases from requirements gathering to project security, laying the groundwork for future leadership roles.`,
            `Engaging in <b>8+</b> diverse projects across <b>education, food and drink, banking,</b> and <b>e-commerce</b> domains, I gained invaluable insights into both web and mobile application development.`,
            `Helped secure and deliver key projects such as Savyu and Bank Tool, generating over <b>$20,000</b> in revenue and earning <b>Best Rookie of the Year</b> recognition.`
          ],
          key_techs: [
            "Java",
            "Spring Framework",
            "ReactJs",
            "Next.js",
            "Typescript",
            "React Native",
            "My SQL",
            "Antdesign",
            "Realm DB",
            "Wordpress",
            "Node.js"
          ]
        }
      ]
    },
    {
      company: "Propman Guru",
      location: "District 2",
      jobs: [
        {
          title: "Fresher Front-end Developer",
          duration: "May 2018 - Jan 2019",
          summaries: [
            `A <b>real estate-domain</b> startup. I was one of the founding engineers.`
          ],
          key_contribution: [
            `Initiated involvement in primary web app development as a Front-end Developer. Obtained foundational web development skills, with a specialization in <b>React JS</b> and related technologies. Collaborated on responsive design projects, prioritizing enhancements for user experience.`
          ],
          key_techs: ["ReactJs", "Javascript", "Wordpress", "Material UI"]
        }
      ]
    }
]
