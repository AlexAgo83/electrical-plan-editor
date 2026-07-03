## task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul - Orchestrate runtime rendering and initial bundle performance overhaul
> From version: 1.17.2
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 65
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Land the locale-observer gating slice first (lowest risk, immediate win multiplied by every render): implemented, i18n suites passed, backlog closed.
- [x] 2. Land the bundle code-splitting slice: removed app manualChunks, moved app bootstrap behind dynamic entry import, verified exceljs/PWA/e2e, re-baselined budgets.
- [ ] 3. Land the render-containment slice: rAF coalescing in useCanvasInteractionHandlers, memo boundaries on workspace containers with stabilized props at the AppController seam, render-count regression harness; validate drag/pan feel via the built app on the sample networks.
- [ ] 4. Land the persistence idle-scheduling slice last: idle-scheduled steady-state writes, unchanged sync flush semantics, duration instrumentation.
- [ ] 5. Run the full ci:blocking pipeline; capture final bundle metrics and render-count evidence in the task closeout; validate and close the request chain.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Implementation notes (solution paths and known pitfalls)

## Slice item_648 — locale observer gating (do first)
- Everything lives in `src/app/hooks/useAppLocaleDomTranslation.ts`. Base (English) values are cached in module-level WeakMaps (`textNodeBaseContent`, `elementAttributeBaseContent`); the fr->en restore depends on them, so when locale becomes `en` run one `translateSubtree(document, "en")` restore pass BEFORE skipping observer attachment — nodes translated while `fr` was active must be restored.
- Nodes added while locale is `en` need no work at all (they are already base language); that is why the observer is safe to omit entirely in `en`.
- Attribute-mutation fix: in the observer callback, replace `translateSubtree(mutation.target, locale)` for `attributes` mutations with `translateElementAttributes(mutation.target, locale)` — a mutated attribute cannot change descendant text.
- Existing locale test to mirror for style: `src/tests/app.ui.settings-locale.spec.tsx`. Test the hook against a jsdom DOM; MutationObserver exists in jsdom.

## Slice item_649 — bundle code splitting (do second)
- In `vite.config.ts` `build.rollupOptions.output.manualChunks`, DELETE the rules returning `domain-core`, `domain-store`, `app-adapters`, `app-controller-domain`, `app-hooks`, `app-i18n`. KEEP `vendor-react`, `vendor-pwa`, `feature-ai-agent`. Route-level lazy imports already exist in `src/app/components/appUiModules.tsx` — Rollup splits along them once the manual grouping stops merging everything reachable from AppController into initial chunks.
- exceljs safety: dynamically imported only behind the boundary checked by `npm run quality:exceljs-boundary`, excluded from SW precache via `workbox.globIgnores: ["**/exceljs*.js"]`. Do not touch either; re-run both gates after the split.
- Budgets are the constants `MAIN_CHUNK_WARN_BYTES` and `TOTAL_GZIP_WARN_BYTES` in `scripts/quality/report-bundle-metrics.mjs` (report is informational/non-blocking today). Add a dedicated initial-JS-gzip budget for the index.html module-chunk set, then re-baseline. Pre-slice baseline: initial 317 KiB gzip / largest initial chunk 722 KiB raw / total 817 KiB gzip. Measure with `npm run build:bundle:report`.
- Watch for Rollup circular-chunk warnings after removing the groupings; odd shared chunks between `src/core` and `src/store` are acceptable as long as no initial chunk exceeds budget.

## Slice item_647 — render containment (do third, biggest slice)
- Root cause map: `src/app/AppController.tsx:72` subscribes to the FULL store snapshot via `useAppSnapshot`; ALL form state (`useEntityFormsState.ts`) and canvas state (`useCanvasState.ts`) are `useState` hooks executed inside AppController's render; there is currently ZERO `React.memo` under `src/app/components`.
- rAF coalescing: in `src/app/hooks/useCanvasInteractionHandlers.ts` (`handleNetworkMouseMove` ~line 342 and the pan branch below it), store the latest pointer payload in a ref and schedule one `requestAnimationFrame` that applies `setManualNodePositions`/`setNetworkOffset`; cancel/flush the pending frame in mouse-up/leave handlers so final positions are exact and snap-to-grid unchanged. `requestAnimationFrame` does not trip `scripts/quality/check-ui-timeout-governance.mjs` (it gates `setTimeout`).
- Memo boundaries will NOT hold if props are rebuilt objects: AppController passes namespaced bundles rebuilt per render (`buildAppControllerNamespacedFormsState`, `buildAppControllerNamespacedCanvasState`, and the giant `appShellLayoutProps` object at `AppController.tsx:1086`). Split props per container and stabilize each group with `useMemo`/`useCallback` keyed on the underlying slices BEFORE wrapping `src/app/components/containers/*`, `NetworkSummaryPanel`, `ModelingPrimaryTables`, `ModelingSecondaryTables`, `ModelingFormsColumn` in `React.memo`. Wrapping without prop stabilization is a silent no-op — verify with the render-count harness, not by eye.
- Render-count harness: React `<Profiler>` or module-level render counters via test-only wrappers; drive a keystroke into a catalog form field and synthetic mouse-move bursts, assert flat counts for non-canvas containers. Specs live in `src/tests/` (vitest + jsdom, mirror existing `app.ui.*.spec.tsx`).
- Mind the size gates: `quality:ui-modularization` and `quality:hooks-modularization` cap file sizes — add helpers in new files rather than growing AppController.tsx.
- Scope out is explicit: do NOT convert `useAppSnapshot` to selector subscriptions in this slice.

## Slice item_650 — persistence idle scheduling (do last)
- Targets: `attachPersistenceSync` in `src/app/store.ts` and the write path in `src/adapters/persistence/localStorage.ts` (full-state `JSON.stringify` ~line 384, synchronous `setItem`).
- Keep the debounce + `saveSequence` invalidation exactly as-is; only move the `flushPendingSave` body into `requestIdleCallback` (with `setTimeout(fn, 0)` fallback — jsdom has no `requestIdleCallback`, tests will exercise the fallback). The idle callback must be cancelable and must be flushed by `flushPendingSaveSync` (pagehide / visibilitychange-hidden / detach), which stays fully synchronous — that guard is deliberate and documented in store.ts; do not weaken it.
- Persistence feedback messages (`PERSISTENCE_WRITE_FAILURE_MESSAGE`, quota, near-quota) and their set/clear logic must remain unchanged; existing tests cover them.
- The adapters layer is outside the UI timeout-governance gate; if fallback `setTimeout` code lands under `src/app`, check the allowlist in `scripts/quality/check-ui-timeout-governance.mjs`.

## Global
- Full gate: `npm run ci:blocking`. Fast inner loops: `npm test`, `npm run test:ci:ui`, `npm run build:bundle:report`.
- Manual drag/pan validation: build then `npm run preview`, load the demo sample networks (seeded from `src/store/sampleNetwork*.ts`) and drag/pan on the largest one.

# Backlog
- `item_647_contain_canvas_drag_pan_and_form_re_renders_with_raf_coalescing_and_memo_boundaries`
- `item_648_gate_the_locale_dom_translation_observer_in_base_locale_and_scope_attribute_re_walks`
- `item_649_restore_route_level_code_splitting_and_re_baseline_bundle_budgets`
- `item_650_move_steady_state_persistence_serialization_off_the_critical_input_path`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `npm run ci:blocking` after each slice lands; capture `npm run build:bundle:report` output before/after the bundle slice.

# Report
- Slice `item_648` delivered: base locale now restores once without attaching the DOM translation observer; attribute-only mutations translate only the mutated element attributes.
- Validation: `npx vitest run src/tests/app.locale-dom-translation.spec.tsx src/tests/app.ui.settings-locale.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`; `npm run -s lint`; `npm run -s typecheck`.
- Slice `item_649` delivered: app-code manual chunks removed, app bootstrap moved behind dynamic import from `main.tsx`, and bundle metrics now fail on budget regression.
- Bundle metrics: baseline initial JS gzip 317 KiB; post-slice initial JS gzip 121.75 KiB across 4 index modules; largest initial chunk 258.07 KiB raw; total JS gzip 824.30 KiB across 136 chunks.
- Validation: `npm run -s build:bundle:report`; `npm run -s typecheck`; `npm run -s lint`; `npm run -s quality:exceljs-boundary`; `npm run -s quality:pwa`; `npx vitest run src/tests/app.ui.settings-locale.spec.tsx src/tests/app.ui.persistence-feedback.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`; `npm run -s test:e2e`.
- Slice `item_647` partial: canvas drag/pan state updates now coalesce through one requestAnimationFrame scheduler and flush on interaction stop.
- Validation: `npx vitest run src/tests/canvas-interaction-handlers.hook.spec.ts src/tests/app.ui.navigation-canvas-interactions.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`; `npm run -s quality:hooks-modularization`; `npm run -s typecheck`; `npm run -s lint`.
- Slice `item_647` partial: memo boundaries added for NetworkSummaryPanel and modeling table/form columns; render-count coverage proves non-canvas modeling panels stay flat during a coalesced pan frame.
- Validation: `npx vitest run src/tests/app.ui.render-containment.spec.tsx src/tests/canvas-interaction-handlers.hook.spec.ts src/tests/app.ui.navigation-canvas-interactions.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`; `npm run -s quality:ui-modularization`; `npm run -s quality:hooks-modularization`; `npm run -s typecheck`; `npm run -s lint`.

# AI Context
- Summary: Orchestrate runtime rendering and initial bundle performance overhaul
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)
