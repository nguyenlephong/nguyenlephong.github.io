# Engagement Provider Boundary

## What and why

Article views, shares, and reactions remain optional client-side enhancements
for the static site. UI code depends on a small `EngagementRepository` port;
Firestore is one replaceable adapter. Provider failure must never block static
content, SEO markup, navigation, or sharing.

Counters are public, unauthenticated, best-effort signals. They are not suitable
for money, access control, ranking integrity, or any other authoritative state.

## Design

```text
React engagement UI
  -> firebase/postStats compatibility facade
    -> EngagementRepository port
      -> FirebaseEngagementRepository
        -> optional App Check -> Firestore
```

- Reads are bounded to the visible static page and fail closed to empty data.
- The caller passes the visible-page read limit explicitly; the Firebase adapter
  has no dependency on content pagination policy.
- Views and shares remain atomic `increment(1)` writes.
- The per-session view marker is written only after `recordView` reports a
  successful increment. A small shared coordinator deduplicates concurrent
  mounts and bounds retries to two separate mount attempts per page runtime.
  It never immediately retries an ambiguous non-idempotent increment result,
  and the stats read does not wait for a pending view write.
- A reaction toggle or switch is one Firestore transaction. The callback reads
  the latest counters and computes document writes only; it never mutates React
  state or browser storage because Firestore may rerun it after contention.
- Rapid reaction intents are serialized from the last committed transition.
  Earlier completions never reconcile newer optimistic UI or local storage.
- Firestore Rules allow only constrained public counter mutations and deny every
  other collection. App Check is defence-in-depth against automated abuse.

## Acceptance criteria

- **ENG-001:** Existing engagement components, analytics, optimistic UI, and
  missing-Firebase fail-soft behavior retain their public contracts.
- **ENG-002:** A reaction switch decrements the previous counter and increments
  the next counter in one transaction; no partial remote state is possible.
- **ENG-003:** Runtime input accepts only `like`, `love`, `insightful`, `clap`,
  never writes negative counters, and keeps transaction callbacks free of UI or
  storage side effects.
- **ENG-004:** Rules constrain post ids, top-level fields, reaction keys/types,
  nonnegative values, changed fields, and per-request deltas. Deletes and all
  unrelated collections are denied.
- **ENG-005:** Emulator tests cover allowed view/share/reaction transitions and
  reject malformed ids, fields, maps, types, negative counters, oversized
  deltas, multi-counter writes, and deletes.
- **ENG-006:** App Check reports explicit configured/active/failure status and
  becomes active only after initial token acquisition. Unknown non-empty modes
  fail closed, and token bootstrap has a bounded timeout. In
  default `optional` mode, missing or failed App Check preserves legacy
  best-effort engagement. In `required` mode, reads remain fail-soft but every
  engagement write is denied unless App Check is active.
- **ENG-007:** Firestore Rules emulator tests run as an unconditional CI job
  with Java; the normal local unit suite may skip them when no emulator exists.
- **ENG-008:** A failed view increment never commits the session marker. Tests
  cover a transient failure followed by a later-mount bounded retry, retry
  exhaustion, pending-write liveness, and concurrent/sequential idempotency.

## App Check rollout runbook

1. Register every production hostname in Firebase App Check and create a public
   reCAPTCHA Enterprise site key. Never add a secret/API credential to a
   `NEXT_PUBLIC_*` variable.
2. Deploy the site key in `optional` mode with enforcement **disabled**. Confirm
   Firestore requests
   include App Check tokens and monitor valid, outdated, and invalid request
   metrics for at least one representative traffic cycle.
3. Investigate invalid legitimate traffic, local development, preview domains,
   blocked scripts, and older cached clients. Configure the official debug
   provider only for local/CI; never ship a debug token in the static artifact.
4. Switch the client to `required` mode only after legitimate traffic is
   consistently valid. This prevents missing/failed App Check bootstrap from
   falling through to engagement writes.
5. Enable Firestore enforcement only after the required-mode rollout is clean.
   This is a separate external Firebase Console operation; client configuration
   cannot enable backend enforcement. Keep monitoring denied requests and usage.
6. Roll back enforcement first if valid readers lose engagement. Static article
   content, metadata, and SEO must remain unaffected throughout.

## Verification

```bash
npm run test:firestore-rules
npm run typecheck
npm run lint
```

References: [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions),
[field-level rules](https://firebase.google.com/docs/firestore/security/rules-fields),
[App Check for web](https://firebase.google.com/docs/app-check/web/recaptcha-enterprise-provider),
and [Rules unit tests](https://firebase.google.com/docs/rules/unit-tests).
