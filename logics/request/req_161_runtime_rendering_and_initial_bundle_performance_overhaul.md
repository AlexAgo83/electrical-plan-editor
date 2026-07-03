## req_161_runtime_rendering_and_initial_bundle_performance_overhaul - Runtime rendering and initial bundle performance overhaul
> From version: 1.17.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Runtime performance and bundle efficiency
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Dragging a node or panning the network canvas must stay smooth on large networks: pointer-move interactions must not re-render the whole application tree on every mouse event.
- Typing in modeling or catalog form fields must not trigger reconciliation of unrelated workspace panels (tables, network summary, statistics).
- The locale DOM-translation MutationObserver must not add a full-subtree scan cost after every render when the active locale is the base locale (en), and attribute mutations must not re-walk entire subtrees in any locale.
- First-load JavaScript must respect the bundle budgets already enforced informationally by scripts/quality/report-bundle-metrics.mjs: today the largest initial chunk (app-controller-domain, 722 KiB raw / 177 KiB gzip) exceeds the 500 KiB raw budget and total JS gzip (817 KiB) exceeds the 220 KiB budget.
- Persisting the workspace must not block the main thread with a synchronous full-state JSON serialization on every edit; the existing synchronous flush on pagehide/visibilitychange must be preserved so no data is lost.

# Context
- AppController.tsx is the single store subscriber via useAppSnapshot, which returns the full immutable state without selectors; all transient UI state (form fields, canvas offset/scale, manual node positions) lives in useState hooks called from AppController, so every keystroke and every pointer-move during drag/pan re-renders the entire component tree.
- No component under src/app/components uses React.memo today; heavy panels rely on internal useMemo which limits recomputation but not reconciliation.
- useCanvasInteractionHandlers.handleNetworkMouseMove calls setManualNodePositions/setNetworkOffset once per raw mouse event with no requestAnimationFrame coalescing.
- useAppLocaleDomTranslation attaches a MutationObserver on document.body (subtree + childList + characterData + attributes) and walks changed subtrees with a TreeWalker doing per-text-node dictionary lookups; in locale en the walk is a near-no-op restore pass, and an attribute mutation triggers a full translateSubtree of the mutated element.
- vite.config.ts manualChunks forces all of src/app/hooks/controller and src/app/hook-impl/controller into one app-controller-domain chunk that is loaded initially, defeating the route-level code splitting provided by the lazy workspace screens in appUiModules.tsx.
- src/adapters/persistence/localStorage.ts serializes the entire multi-network state with JSON.stringify and writes it synchronously to localStorage on every store change (200 ms debounce in attachPersistenceSync); flushPendingSaveSync on pagehide is deliberate and documented and must survive any refactor.
- The bundle budget report is informational (non-blocking) today; exceljs is already lazy-only and excluded from service-worker precache and must remain so (quality:exceljs-boundary gate).

# Acceptance criteria
- AC1: During node drag and canvas pan, canvas view state updates are coalesced to at most one React commit per animation frame, and the commit is contained below a memo boundary so workspace panels outside the canvas (tables, forms columns, statistics) do not re-render per frame.
- AC2: Typing into a modeling or catalog form field re-renders only the owning form column; memoized boundaries around the other workspace containers keep their render counts flat, proven by a render-count regression test.
- AC3: When the active locale is the base locale (en), the DOM-translation MutationObserver is not attached (or is disconnected) and locale switching to/from fr still restores and translates all text and translatable attributes correctly.
- AC4: In locale fr, an attribute-only mutation translates only the affected element's translatable attributes without re-walking the element's entire subtree.
- AC5: The production build has no app-controller-domain initial mega-chunk: controller hook code loads with the workspace screens that use it, the largest initial JS chunk is under the 500 KiB raw budget, and initial JS gzip decreases by at least 30% versus the 317 KiB baseline recorded by report-bundle-metrics.mjs.
- AC6: Bundle budgets in report-bundle-metrics.mjs are re-baselined to values the new build actually meets (including a distinct initial-JS budget), and the report clearly fails those budgets on regression.
- AC7: Steady-state persistence writes happen off the critical input path (async scheduling of serialization) while the synchronous flush on pagehide/visibilitychange and on detach is preserved, with existing persistence quota/failure feedback messages unchanged.
- AC8: Existing unit, UI, and e2e suites pass unchanged in behavior; new regression coverage exists for render containment, locale-observer gating, and persistence flush semantics.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)

# References
- src/app/AppController.tsx
- src/app/hooks/useAppSnapshot.ts
- src/app/hooks/useCanvasState.ts
- src/app/hooks/useCanvasInteractionHandlers.ts
- src/app/hooks/useAppLocaleDomTranslation.ts
- src/app/store.ts
- src/adapters/persistence/localStorage.ts
- vite.config.ts
- scripts/quality/report-bundle-metrics.mjs

# AI Context
- Summary: Runtime rendering and initial bundle performance overhaul
- Keywords: request-chain-scaffold, runtime rendering and initial bundle performance overhaul, development-ready
- Use when: You need to implement or review the scaffolded workflow for Runtime rendering and initial bundle performance overhaul.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_647_contain_canvas_drag_pan_and_form_re_renders_with_raf_coalescing_and_memo_boundaries`
- `item_648_gate_the_locale_dom_translation_observer_in_base_locale_and_scope_attribute_re_walks`
- `item_649_restore_route_level_code_splitting_and_re_baseline_bundle_budgets`
- `item_650_move_steady_state_persistence_serialization_off_the_critical_input_path`
