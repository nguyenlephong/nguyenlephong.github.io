<h1 align="center">Nguyen Le Phong</h1>
<h3 align="center">Lead Software Engineer · Zalo PC · Co-founder of BonBon Mobility · Tech Lead of LogiUP</h3>

<p align="center">
  <a href="https://nguyenlephong.github.io"><img src="https://img.shields.io/badge/Portfolio-nguyenlephong.github.io-0E81F7?style=flat&logo=google-chrome&logoColor=white" alt="Portfolio" /></a>
  <a href="https://www.linkedin.com/in/phongnguyen-it/"><img src="https://img.shields.io/badge/LinkedIn-phongnguyen--it-0A66C2?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="mailto:phongnguyen.itengineer@gmail.com"><img src="https://img.shields.io/badge/Email-phongnguyen.itengineer%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white" alt="Email" /></a>
  <a href="https://wakatime.com/@59b42694-26d5-4035-8d80-267d68314570"><img src="https://wakatime.com/badge/user/59b42694-26d5-4035-8d80-267d68314570.svg" alt="WakaTime" /></a>
</p>

## Profile

Lead Software Engineer at Zalo PC with 8+ years shipping production software across consumer-scale messaging, CDP, fintech, logistics, car-care, education, and real-estate domains. Co-founder of [BonBon Mobility](https://bonbon.com.vn/) ([$500K pre-seed led by Tasco](https://www.tasco.com.vn/post/tasco-dan-dat-vong-dau-tu-500-000-usd-vao-bonbon-nen-tang-o2o-ket-noi-chu-xe-voi-mang-luoi-garage-va-trung-tam-cham-soc-xe), Sep 2026) and Tech Lead of LogiUP, a multi-tenant logistics SaaS.

I work best where cross-platform product delivery, data safety, platform reliability, and team clarity need to move together: desktop and mobile clients, backend services, rollout workflows, observability, CI/CD, secure integrations, and production operations.

```text
Lead Software Engineer @ Zalo PC   PC message backup → mobile restore · 80M+ MAU platform
Co-founder @ BonBon Mobility      $500K pre-seed led by Tasco · VETC Mini App (4.3M-user ecosystem)
Tech Lead @ LogiUP                 Multi-tenant logistics SaaS · 9 repos · team of 4
React / Electron / Node.js / Go / NestJS / Kotlin / Kubernetes
```

## Recruiter Snapshot

- Co-founded [BonBon Mobility](https://bonbon.com.vn/): MVP to live field pilot in 3 months, Top 3 then winner of Tasco × GenAI Fund's Wash3000, and a $500K pre-seed round led by Tasco (Sep 2026) with GenAI Fund co-investing.
- Architected BonBon's 12-screen Mini App inside VETC's 4.3M-user app ecosystem, and authored 4,000+ commits across the Go API and the web/Mini App monorepo, backed by about 90 specs and 425 Go test files.
- Tech Lead and system architect of LogiUP: 4-person team, 9 split repositories, tenant isolation, a self-owned OAuth 2.1/OIDC provider, Electron desktop, and an AI-assisted customs workflow now extending to export declarations.
- Led an 11-person delivery team across development and QC.
- Engineered a multi-tenant feature-flag platform for 30+ tenants and ~40k users.
- Built secure Gtel and Napas integrations with RSA-4096, AES-256, mTLS, certificate pinning, idempotent contracts, and retry queues.
- Returned to Zalo PC as Lead Software Engineer on March 2, 2026.
- Shipped PC message backup with restore on mobile for device-change, lost-phone, and reinstall recovery paths; the July 2026 launch was [covered by VnExpress](https://vnexpress.net/ba-tinh-nang-moi-cua-zalo-5097444.html).
- Hardened Zalo's sync v2 for unreliable mobile links (retry, grouped re-prepare, failure accounting, fault-injection devtool) and cut one hot-path session lookup from 1.8 s to 4 ms on a 37-session test.
- Shipped 700+ commits across 55+ tickets in seven months at Zalo PC, with 340+ test files touched and risky changes defaulted off behind remote configs and kill switches.
- Led front-end delivery for PrimeData CDxP, including 360 profiles, campaign builders, SDKs, analytics, and testing coverage.

## Operating Range

| Area | Evidence |
|---|---|
| Product engineering | React, Next.js, TypeScript, React Native, design systems, Micro-Frontends |
| Backend and integration | Node.js, Java Spring, .NET Core, REST/GraphQL, auth, encryption, third-party contracts |
| Platform and delivery | Docker, Kubernetes, AKS, EKS, FKE, K3S, ArgoCD, CI/CD, domain/SSL operations |
| Quality and release | Jest, Cucumber, Puppeteer, Testing Library, BDD/E2E, release checklists, rollback readiness |
| Leadership | Hiring, onboarding, coaching, RFCs, runbooks, ownership boundaries, delivery playbooks |

## Portfolio Site

This repository powers [nguyenlephong.github.io](https://nguyenlephong.github.io), a multilingual portfolio and CV built with Next.js, next-intl, static export, custom OpenGraph images, analytics, and a recruiter-focused CV surface.

Core routes:

- Main CV: [nguyenlephong.github.io/en](https://nguyenlephong.github.io/en)
- PDF CV: [NguyenLePhong_Lead_Software_Engineer.pdf](https://nguyenlephong.github.io/NguyenLePhong_Lead_Software_Engineer.pdf)
- Sitemap: [nguyenlephong.github.io/en/sitemap](https://nguyenlephong.github.io/en/sitemap) · RSS: [blog](https://nguyenlephong.github.io/en/blog/feed.xml), [notes](https://nguyenlephong.github.io/en/notes/feed.xml)
- Gallery: [nguyenlephong.github.io/en/gallery](https://nguyenlephong.github.io/en/gallery)
- Blog: [nguyenlephong.github.io/en/blog](https://nguyenlephong.github.io/en/blog)

## Selected Impact

### Zalo PC, VNG - Lead Software Engineer

- Returned to Zalo PC as Lead Software Engineer on March 2, 2026, beginning a new chapter focused on cross-device message continuity.
- Shipped PC message backup with restoration on mobile: payload contract, cross-environment file hardening for Web and Electron workers, upload telemetry, and mutual exclusion with sync.
- Hardened sync v2 for unreliable mobile links and added a daily log-health probe on every device (8 to 18 ms CPU per probe, remote kill switch), so client-storage and sync issues are diagnosed from QoS data instead of guessed.
- Improved zCloud offload reliability and observability.

### BonBon Mobility - Co-founder

- Took [BonBon Mobility](https://bonbon.com.vn/), a car-care O2O platform, from MVP to a live field pilot in 3 months and into Tasco × GenAI Fund's Wash3000, where it was a Top 3 finalist and went on to win the program.
- Raised a $500K pre-seed round led by Tasco with GenAI Fund participating (announced September 21, 2026).
- Architected the 12-screen VETC Mini App with silent partner-code login, memory-only sessions, deep links, and privacy allow-listed analytics.
- Authored most of the platform: 4,000+ commits across the Go API and the web, Mini App, and design-system monorepo, with 800+ unit tests and kill-switch feature flags for safe releases.

### LogiUP - Tech Lead and System Architect

- Led a 4-person team across 9 split repositories; authored 737 of 738 commits in the NestJS platform.
- Designed the multi-tenant SaaS: customer subdomains, tenant-scoped RBAC, wildcard TLS, a self-owned OAuth 2.1/OIDC provider, one Next.js UI for web and Electron, a NestJS control plane, and a FastAPI AI data plane.
- Shipped the AI-assisted customs workflow (31 typed API endpoints, 6 least-privilege runtime roles), then extended it to export declarations and a rule-based document classification engine.

### NDSVN - Senior Software Engineer Lead

- Took technical ownership after a CTO transition, aligning architecture, delivery, rollout systems, enterprise integrations, and team execution.
- Stabilized inherited infrastructure across ArgoCD, CI/CD, domains/SSL, and Kubernetes clusters into systems that were diagnosable and recoverable.
- Built internal AI-assisted engineering agents for code review, deployment support, service-quota checks, API health monitoring, and release analysis.

### PrimeData - Senior Full-stack Software Engineer

- Led a 4-person front-end team delivering 10+ projects across CDxP, SDKs, demos, and mobile work.
- Built a lightweight JS SDK under 200KB with sub-150ms loading before deeper bundle optimization.
- Established BDD/E2E coverage with 100+ scenarios and 1,000+ test cases.

## Local Development

```bash
npm install
npm run dev
```

Build and static export:

```bash
npm run build
```
