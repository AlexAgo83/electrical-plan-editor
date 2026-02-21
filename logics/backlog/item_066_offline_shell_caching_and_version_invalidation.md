## item_066_offline_shell_caching_and_version_invalidation - Offline Shell Caching and Version Invalidation
> From version: 0.3.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Offline Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
PWA support without a robust cache/invalidation strategy can either fail offline expectations or serve stale bundles across deployments.

# Scope
- In:
  - Cache app shell/static assets required to reopen the app offline after first successful load.
  - Define deterministic cache versioning/invalidation across releases.
  - Validate that core local-first workspace remains usable offline.
  - Prevent cache behavior that masks newly deployed bundles.
- Out:
  - Remote data sync while offline.
  - Large-scale performance benchmarking infrastructure.

# Acceptance criteria
- App reopens offline after first online load on supported browsers.
- Cache invalidation/update behavior is deterministic between versions.
- Core local-first editing workflow remains usable offline.
- No regression in startup reliability when transitioning online/offline.

# Priority
- Impact: Very high (main end-user value of PWA in this project).
- Urgency: High once service worker lifecycle is controlled.

# Notes
- Dependencies: item_064, item_065.
- Blocks: item_068.
- Related AC: AC3, AC4, AC6.
- References:
  - `logics/request/req_011_pwa_enablement_installability_and_offline_reliability.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `tests/e2e/smoke.spec.ts`

