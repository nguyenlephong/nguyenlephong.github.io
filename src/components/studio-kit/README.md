# Studio Kit

Reusable admin/workspace components for the `/studio` surface.

## Boundary

- Keep reusable admin primitives in this folder.
- Keep reusable isolation helpers, such as `ShadowIsland`, in this folder.
- Keep route-specific data, copy, analytics, and SEO outside this folder.
- Keep this package static-site friendly: no runtime API dependency is required for the Studio surface.
- Update package primitives in isolation before touching route-specific Studio pages.

## Why This Shape

The public site has its own layout, SEO, locale handling, and reader tools. Studio needs a dashboard-like surface without leaking those global styles into the admin shell.

This package keeps the dashboard primitives small, local, and reusable. The `/studio` route consumes them through a shadow-root island so future admin screens can evolve without competing with the public site shell.
