# Studio Kit

Reusable admin/workspace components adapted from the open-source `next-shadcn-admin-dashboard-main` project.

## Boundary

- Keep upstream-inspired primitives in this folder.
- Keep reusable isolation helpers, such as `ShadowIsland`, in this folder.
- Keep route-specific data, copy, analytics, and SEO outside this folder.
- Do not import directly from the upstream download into app routes.
- When upstream changes, compare against `upstream.json`, then update this folder in isolation before touching any route.

## Why This Shape

The source project uses Tailwind, shadcn, Radix, and several dashboard dependencies. This site does not currently use that build chain, so the copied component layer mirrors the reusable component contracts and slot structure without forcing a global Tailwind migration.

That keeps future updates practical: upstream changes can be reviewed component by component, while `/studio` stays a thin consumer of stable local primitives. For larger dashboard-style surfaces, render the route as a same-repo micro-frontend island with `ShadowIsland` so its CSS does not compete with the public site shell.
