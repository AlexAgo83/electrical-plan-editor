## task_047_req_046_wire_free_color_unspecified_semantics_orchestration_and_delivery_control - req_046 Orchestration: Wire Free Color Unspecified Semantics Delivery Control
> From version: 0.8.1
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Delivery orchestration for explicit wire color mode semantics and free-color unspecified intent preservation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_046`, a semantic follow-up to `req_045`. The goal is to support `Free color` mode with an empty label as a valid “unspecified / to be decided later” state, while keeping it distinct from `No color` across reducer normalization, UI form behavior, read-only rendering, sorting/filter/search/export, and persistence/import/export compatibility.

Key follow-up decisions from `req_046`:
- `Free color` mode may be saved with an empty label.
- `Free color` empty is semantically distinct from `No color`.
- This distinction requires a persisted explicit wire color mode field (recommended `colorMode`).
- `freeColorLabel` remains optional in free mode and keeps trim/max-length rules (`32`) when provided.
- Read-only UI must distinguish:
  - no color
  - free color unspecified
  - free color labeled
  - catalog colors

# Objective
- Deliver `req_046` in controlled waves with minimal regression risk on top of the `req_045` delivery.
- Preserve backward compatibility and deterministic migration/inference for data without explicit color mode.
- Finish with full validation and AC traceability synchronized in `logics`.

# Scope
- In:
  - Wave-based orchestration for `req_046` backlog items (`item_287`..`item_291`)
  - Validation/commit discipline between waves
  - Cross-surface coordination (store/reducer, form, display helpers, persistence/import/export, tests)
  - Final AC traceability and docs synchronization
- Out:
  - Features beyond `req_046`
  - User-defined color catalogs/pickers
  - Git history rewrite/squashing strategy (unless explicitly requested)

# Backlog scope covered
- `logics/backlog/item_287_wire_color_mode_persisted_semantic_state_for_none_catalog_and_free.md`
- `logics/backlog/item_288_wire_form_free_color_optional_empty_label_and_unspecified_copy.md`
- `logics/backlog/item_289_wire_color_display_sort_filter_and_export_semantics_for_free_unspecified_vs_no_color.md`
- `logics/backlog/item_290_wire_color_mode_persistence_import_export_migration_from_req_045_implicit_state.md`
- `logics/backlog/item_291_req_046_free_color_unspecified_semantics_closure_ci_build_and_ac_traceability.md`

# Attention points (mandatory delivery discipline)
- **Persisted semantic distinction is mandatory:** do not fake the feature with UI-only behavior.
- **Compatibility inference is mandatory:** existing `req_045` and earlier data must remain loadable and deterministic.
- **Wave-based delivery + commits required:** checkpoint after each wave once validations pass.
- **Final docs sync required:** request/task/backlog progress and closure notes must be updated.

# Recommended execution strategy (wave order)
Rationale:
- Land the explicit persisted mode and normalization first.
- Then adjust the form to allow empty free labels.
- Next, patch read-only semantics and helper-based sorting/filter/search/export.
- Add compatibility migration/inference coverage across persistence and portability.
- Finish with validation and closure documentation.

# Plan
- [ ] Wave 0. Persisted wire color mode semantics + reducer/store normalization (`item_287`)
- [ ] Wave 1. Wire form free-color optional empty-label UX and copy (`item_288`)
- [ ] Wave 2. Read-only display + sort/filter/export semantics for free unspecified vs no-color (`item_289`)
- [ ] Wave 3. Persistence/import/export migration and compatibility inference from implicit state (`item_290`)
- [ ] Wave 4. Closure: final validation, AC traceability, and `logics` synchronization (`item_291`)
- [ ] FINAL. Update related `.md` files to final state (request/task/backlog progress + delivery summary + defer notes)

# Validation gates
## A. Minimum wave gate (apply after Waves 0-3)
- Documentation / Logics (when `.md` changed):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
- Tests/build:
  - Targeted tests for touched surfaces
  - `npm run -s build`

## B. Final closure gate (mandatory at Wave 4)
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s test:ci`
- `npm run -s build`

## C. Targeted test guidance (recommended during Waves 0-3)
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.wire-free-color-mode.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`

## D. Commit gate (apply after each Wave 0-4 and FINAL docs sync if separate)
- Commit only after the wave validation gate passes (green checkpoint preferred).
- Commit messages should reference `req_046` wave/scope.
- Update this task after each wave with wave status, validation snapshot, commit SHA, and any blocker/defer.

# Cross-feature dependency / collision watchlist
- **Reducer/store semantics vs existing req_045 UI state**:
  - Risk: local UI mode and persisted mode diverge unless normalization rules are centralized.
- **Compatibility inference across persistence/import**:
  - Risk: `req_045` data without explicit mode infers differently in local storage vs portability import.
- **Display/search/export semantics**:
  - Risk: helper paths collapse free unspecified into no-color or reuse old free-label-only assumptions.
- **Regression risk on catalog/no-color flows**:
  - Risk: semantics refactor regresses `req_039` and `req_045` delivered paths.

# Mitigation strategy
- Make explicit color mode normalization a shared source-of-truth helper used by reducer and adapters.
- Infer missing mode deterministically in one shared path/rule and mirror it in tests.
- Reuse wire color presentation helpers to patch semantics centrally across read-only surfaces.
- Add targeted UI + persistence/import tests for all four visible states (no-color, free unspecified, free labeled, catalog).

# Report
- Wave status:
  - Wave 0 (persisted color mode semantics): pending
  - Wave 1 (form UX optional empty free label): pending
  - Wave 2 (display/sort/filter/export semantics): pending
  - Wave 3 (persistence/import/export compatibility inference): pending
  - Wave 4 (closure + AC traceability): pending
  - FINAL (`.md` synchronization): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Introducing explicit color mode may require schema/fixture updates across many tests and sample states.
  - Existing free-color helpers may assume `freeColorLabel` presence and need semantic fallback paths for empty free mode.
  - Backward compatibility inference from `req_045` implicit state must be documented and tested to avoid ambiguous migration behavior.
- Validation snapshot (kickoff):
  - Not run yet for this orchestration artifact set.
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_046`) target mapping:
  - AC1 -> `item_287`, `item_288`, `item_291`
  - AC2 -> `item_287`, `item_290`, `item_291`
  - AC3 -> `item_288`, `item_291`
  - AC4 -> `item_289`, `item_291`
  - AC5 -> `item_289`, `item_291`
  - AC6 -> `item_287`, `item_288`, `item_289`, `item_290`, `item_291`
  - AC7 -> `item_290`, `item_291`
  - AC8 -> `item_287`, `item_288`, `item_289`, `item_290`, `item_291`

# References
- `logics/request/req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder.md`
- `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
- `logics/backlog/item_287_wire_color_mode_persisted_semantic_state_for_none_catalog_and_free.md`
- `logics/backlog/item_288_wire_form_free_color_optional_empty_label_and_unspecified_copy.md`
- `logics/backlog/item_289_wire_color_display_sort_filter_and_export_semantics_for_free_unspecified_vs_no_color.md`
- `logics/backlog/item_290_wire_color_mode_persistence_import_export_migration_from_req_045_implicit_state.md`
- `logics/backlog/item_291_req_046_free_color_unspecified_semantics_closure_ci_build_and_ac_traceability.md`
- `src/core/cableColors.ts`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/lib/wireColorPresentation.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.wire-free-color-mode.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `package.json`
- `.github/workflows/ci.yml`
