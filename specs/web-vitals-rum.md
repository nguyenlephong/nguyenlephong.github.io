# Shared Web Vitals RUM

## What

The locale root mounts one Web Vitals reporter for both public-site routes and
Studio. It sends the existing `web_vital` event through the privacy-aware
analytics wrapper with the raw metric value, delta, rating, navigation type,
current path, surface, and locale.

## Why

Mounting the reporter only in the public route group left Studio without field
performance data. Rounding every metric also converted fractional CLS values
such as `0.12` to `0`, making layout-shift monitoring unusable.

## Acceptance criteria

1. Exactly one reporter is mounted under the locale provider; nested layouts
   do not mount another reporter.
2. The reporter callback has a stable reference so route-context updates do
   not register duplicate Web Vitals observers.
3. `value` and `delta` retain their original numeric precision. The payload
   also includes `rating`, `navigation_type`, `path`, `surface`, and `locale`.
4. `/[locale]/studio` is reported as the `studio` surface; other localized
   routes are reported as `site`.
5. Reporting continues through `track`, preserving Do Not Track handling,
   failure isolation, the existing event name, and current PostHog privacy
   configuration.
