## req_103_export_security_reliability_and_post_release_review_hardening - Export security, reliability, and post-release hardening
> From version: 1.3.1
> Status: Done
> Understanding: 100% (review points delivered and synchronized with backlog/task closure)
> Confidence: 97%
> Complexity: High
> Theme: Security / Export / Reliability / Maintainability
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Address high/medium-risk findings from the large project review after 1.3.1.
- Harden SVG/PNG export security around logo handling.
- Improve export robustness under slow/unreachable logo endpoints.
- Reduce PNG export memory pressure.
- Align migration behavior with current defaults for network summary segment-name visibility.
- Add missing regression coverage for export frame color semantics.
- Reduce maintenance risk around oversized export/callout code paths.

# Context
- The 1.3.1 cycle introduced major export/cartouche/callout capabilities and passed CI.
- Review identified concrete hardening gaps:
  - permissive `data:image/*` acceptance allows `data:image/svg+xml` in export logo input;
  - export logo fetch has no timeout/abort and can stall user-perceived export responsiveness;
  - PNG export currently uses `canvas.toDataURL()` (higher memory overhead on large outputs);
  - migration fallback for `showSegmentNames` can diverge from current defaults;
  - no dedicated regression assertion yet for "export frame uses base segment style, never highlight/selection style";
  - `NetworkSummaryPanel.tsx` remains very large and mixes multiple concerns.

# Objective
- Deliver a post-release hardening pass with zero behavior regression on validated 1.3.1 features.
- Close security/reliability gaps in export without redesigning product workflows.
- Improve code maintainability through scoped decomposition where risk is highest.

# Scope
- In:
  - enforce export-safe logo policy (no active content through logo source in exported artifacts);
  - add bounded timeout/abort behavior for remote logo fetch in export flow;
  - switch PNG download path to `canvas.toBlob()` (with safe fallback only when needed);
  - align migration default behavior for `showSegmentNames` with current product defaults;
  - add regression tests for export frame color independence from selection/highlight state;
  - remove/deprecate stale callout text-size legacy branching that is no longer user-reachable;
  - extract export-specific helpers out of `NetworkSummaryPanel.tsx` as phase-1 modularization.
- Out:
  - redesign of export UI/controls;
  - backend/logo upload service work;
  - full decomposition of `AppController.tsx` and all workspace screens in this request.

# Locked execution decisions
- Decision 1: Export logo handling must reject active SVG payloads (`data:image/svg+xml`) in exported artifact paths.
- Decision 2: Allowed logo schemes remain `http`, `https`, and raster `data:image/*` subsets (png/jpeg/webp/gif/bmp), with explicit fallback on unsupported types.
- Decision 3: Logo network resolution in export path must be bounded by timeout and cancellation-safe fallback behavior.
- Decision 4: PNG export must use blob-based generation (`toBlob`) by default to avoid avoidable base64 memory inflation.
- Decision 5: Migration fallback for `showSegmentNames` absent values must follow current default (`false`), not legacy assumptions.
- Decision 6: Export frame stroke color must always derive from base segment style tokens, independent of selected/highlighted segment state.
- Decision 7: Callout text-size runtime model must match exposed settings options and remove unreachable "extraLarge" branches where possible.
- Decision 8: `NetworkSummaryPanel` hardening includes extraction of export-specific helper logic into dedicated module(s) while preserving behavior.

# Recommended implementation by review point
## Point 1 - Logo export security
- Implement strict rejection of active SVG payloads for export logos (`data:image/svg+xml` and equivalent MIME aliases).
- Keep accepted sources to:
  - `http` / `https` URLs returning raster image MIME types;
  - raster `data:image/*` MIME families only (`png`, `jpeg`, `jpg`, `webp`, `gif`, `bmp`).
- On rejection or parse ambiguity, force deterministic fallback (`Logo indisponible`) and continue export.

## Point 2 - Remote logo fetch reliability
- Wrap logo `fetch()` in `AbortController` with bounded timeout (`3000-5000 ms` target window).
- Treat timeout/abort/network/CORS failures as non-fatal and route to fallback logo behavior.
- Keep identical behavior across SVG and PNG export paths.

## Point 3 - PNG export memory profile
- Replace `canvas.toDataURL()` with `canvas.toBlob()` + object URL download flow.
- Keep filename/timestamp behavior unchanged.
- Provide minimal fallback path only when `toBlob` is unavailable.

## Point 4 - Migration/default consistency
- Update migration fallback for missing `showSegmentNames` to align with current defaults (`false`).
- Ensure local-storage and file-import normalization paths stay aligned with this decision.

## Point 5 - Missing regression coverage (export frame color)
- Add a dedicated UI regression asserting export frame stroke derives from base segment style, not from selected/highlighted segment state.
- Reuse existing export SVG assertions and extend with color-source verification.

## Point 6 - Callout text-size legacy cleanup
- Keep user-facing options at `small`, `normal`, `large`.
- Remove unreachable runtime branches where possible.
- Keep compatibility remap for legacy persisted `extraLarge` values to `large` until cleanup rollout is complete.

## Point 7 - Maintainability hardening
- Extract export helpers from `NetworkSummaryPanel` into dedicated module(s):
  - style cloning helper,
  - frame/cartouche overlay builders,
  - logo resolution helper.
- Keep external behavior and props contract unchanged in phase 1.

# Recommended delivery order
- Order 1: Point 1 (security gating for logos)
- Order 2: Point 2 (fetch timeout/abort fallback)
- Order 3: Point 5 (regression safety net for frame color)
- Order 4: Point 3 (PNG blob pipeline)
- Order 5: Point 4 (migration/default alignment)
- Order 6: Point 6 (callout runtime cleanup)
- Order 7: Point 7 (export helper modularization phase 1)

# Functional behavior contract
## A. Export logo security
- Export flow must not embed active SVG logo payloads.
- Unsupported/unsafe logo inputs must degrade to cartouche fallback text (`Logo indisponible`) without failing export.

## B. Export runtime robustness
- Logo fetch in export path must stop waiting after timeout and proceed with fallback.
- SVG and PNG export must remain successful when logo host is slow, unavailable, or CORS-restricted.

## C. PNG memory behavior
- PNG generation must use blob-based serialization.
- Download behavior remains unchanged for users (`network-plan-<timestamp>.png`).

## D. Migration/default consistency
- Persisted state normalization for missing `showSegmentNames` must align with app defaults (`false`).
- Legacy payloads still load successfully with deterministic normalization.

## E. Regression safety
- Dedicated test must prove export frame style is not contaminated by selected/highlighted segment styling.
- Existing export/cartouche tests remain green.

## F. Maintainability hardening
- Export/cartouche/frame helper code is moved from `NetworkSummaryPanel.tsx` into narrower modules/hooks.
- Public behavior and existing settings contracts remain unchanged.

# Acceptance criteria
- AC1: `data:image/svg+xml` logo input does not get embedded as export image and falls back safely.
- AC2: Remote logo fetch has timeout/abort guard; export completes with fallback when timeout occurs.
- AC3: PNG export path uses `toBlob` (or equivalent blob-first strategy) and still downloads correctly.
- AC4: Migration logic for missing `showSegmentNames` now resolves to `false`, with compatibility tests updated.
- AC5: Export frame color regression test asserts base segment color usage regardless of selected/highlighted segments.
- AC6: Callout text-size runtime model is consistent with exposed settings options (`small`, `normal`, `large`).
- AC7: `NetworkSummaryPanel` export helper extraction is completed without behavior regression.
- AC8: `logics_lint`, `lint`, `typecheck`, `test:ci:ui`, and `test:e2e` pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- `npm run -s test:e2e`
- targeted checks around:
  - unsafe logo payload rejection in SVG/PNG export;
  - timeout fallback behavior for slow/unreachable logo URL;
  - PNG blob export path correctness;
  - migration alignment for `showSegmentNames` default;
  - export frame color non-regression under selected/highlighted segment state.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and actionable.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Risks and fallback behavior are identified.

# Risks
- Over-hardening of logo validation can break legitimate existing workflows if compatibility path is not explicit.
- Timeout thresholds that are too strict may reduce successful remote-logo loads on slow networks.
- Partial extraction from `NetworkSummaryPanel` can introduce subtle regressions if dependency boundaries are unclear.

# Backlog
- To create from this request:
  - `item_498_export_logo_data_uri_security_policy_and_svg_rejection.md`
  - `item_499_export_logo_fetch_timeout_abort_and_non_blocking_fallback.md`
  - `item_500_png_export_blob_pipeline_memory_optimization.md`
  - `item_501_persistence_migration_alignment_for_network_summary_segment_name_default.md`
  - `item_502_ui_export_regression_for_frame_color_independence_from_selection_highlight.md`
  - `item_503_callout_text_size_runtime_model_cleanup_without_exposed_extralarge_option.md`
  - `item_504_network_summary_panel_export_module_extraction_phase_1.md`

# Orchestration task
- `logics/tasks/task_084_req_103_export_security_reliability_and_post_release_hardening_orchestration_and_delivery_control.md`

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/core/networkMetadata.ts`
- `src/adapters/persistence/migrations.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/canvas/canvas-diagram-and-overlays/network-callouts.css`
- `src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/portability.network-file.spec.ts`
