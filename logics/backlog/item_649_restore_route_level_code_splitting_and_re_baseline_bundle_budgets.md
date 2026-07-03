## item_649_restore_route_level_code_splitting_and_re_baseline_bundle_budgets - Restore route-level code splitting and re-baseline bundle budgets
> From version: 1.17.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Runtime performance and bundle efficiency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- vite.config.ts manualChunks forces all controller hooks (src/app/hooks/controller, src/app/hook-impl/controller) plus other app-wide groupings into named chunks; app-controller-domain (722 KiB raw / 177 KiB gzip) is loaded initially even though most of it belongs to lazily loaded workspace screens.
- Initial JS is 317 KiB gzip across 7 chunks; the informational budget report flags both the largest-initial-chunk budget (500 KiB raw) and the total-JS-gzip budget (220 KiB) as exceeded, and the total budget is currently unattainable, so the report is permanently red and useless as a regression signal.

# Scope
- In:
  - Remove app-code manualChunks rules (domain-core, domain-store, app-adapters, app-controller-domain, app-hooks, app-i18n) and let Rollup split along the existing dynamic imports in appUiModules.tsx; keep vendor-react, vendor-pwa, and the feature-ai-agent isolation.
  - Verify the exceljs boundary still holds (lazy-only, excluded from precache) and quality:exceljs-boundary stays green.
  - Re-baseline scripts/quality/report-bundle-metrics.mjs budgets to post-split reality: add a distinct initial-JS-gzip budget, set the total-JS-gzip budget to an attainable ceiling, and keep the report failing loudly when a budget regresses.
  - Record before/after metrics (initial gzip, largest initial chunk, chunk count) in the task closeout.
- Out:
  - Splitting the monolithic index CSS file per route.
  - Changing the service-worker precache strategy or moving changelogs to runtime caching.
  - Reducing react-markdown/remark-gfm weight.

# Acceptance criteria
- AC1: The production build contains no initial JS chunk above 500 KiB raw, and controller hook code is loaded with the lazy workspace screens that consume it rather than at startup.
- AC2: Initial JS gzip (index.html module chunks) is at least 30% below the 317 KiB baseline, as measured by report-bundle-metrics.mjs.
- AC3: report-bundle-metrics.mjs enforces re-baselined budgets including a dedicated initial-JS-gzip budget, and all budgets pass on the new build.
- AC4: exceljs remains lazy-only and precache-excluded (quality:exceljs-boundary and quality:pwa pass), and all screens still load correctly in the built app (e2e suite green).

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: The production build contains no initial JS chunk above 500 KiB raw, and controller hook code is loaded with the lazy workspace screens that consume it rather than at startup.
- request-AC6 -> This backlog slice. Proof: AC2: Initial JS gzip (index.html module chunks) is at least 30% below the 317 KiB baseline, as measured by report-bundle-metrics.mjs.
- request-AC8 -> This backlog slice. Proof: AC3: report-bundle-metrics.mjs enforces re-baselined budgets including a dedicated initial-JS-gzip budget, and all budgets pass on the new build.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Primary task(s): `task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul`

# AI Context
- Summary: Restore route-level code splitting and re-baseline bundle budgets
- Keywords: scaffolded-backlog, restore route-level code splitting and re-baseline bundle budgets, implementation-ready
- Use when: Implementing the scaffolded slice for Restore route-level code splitting and re-baseline bundle budgets.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul` was finished via `logics-manager flow finish task` on 2026-07-03.
