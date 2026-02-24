## req_049_global_review_follow_up_test_hardening_for_unified_modeling_navigation_e2e_selector_resilience_and_table_filter_clear_regression_coverage - Global Review Follow-up: Test Hardening for Unified Modeling Navigation, E2E Selector Resilience, and Table Filter Clear Regression Coverage
> From version: 0.9.2
> Understanding: 95%
> Confidence: 94%
> Complexity: Medium
> Theme: Post-merge Test Reliability and Regression Safety Hardening
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Convert the global review findings into a focused hardening wave.
- Stabilize test helpers and selectors after the `Modeling` / `Analysis` merge.
- Add explicit regression coverage for the shared table filter clear (`×`) control introduced in the shared filter bar.

# Context
A global project review was performed after the recent workspace unification (`Modeling` + migrated `Analysis` panels), table readability changes, and shared table filter UX improvements.

The review confirmed the project is in a strong delivery state (full validation matrix green after fixes), but identified several test-architecture and regression-safety weaknesses that should be formalized and addressed as a dedicated follow-up request:

- e2e helper semantics drifted after the `Analysis` top-level menu entry was removed (helper contract no longer matched actual behavior),
- e2e smoke assertions relied on brittle table column indexes (`td.nth(...)`) and broke when `Endpoints` was split into `Endpoint A` / `Endpoint B`,
- the new shared table filter clear button (`×`) lacks explicit regression tests despite impacting multiple tables through a shared component.

This request converts those review findings into a coherent hardening request so the project remains robust as UI structure evolves.

## Objectives
- Keep e2e navigation helpers semantically aligned with the unified `Modeling` workspace behavior.
- Reduce false failures caused by presentation-level table structure changes.
- Improve confidence in shared table filtering UX by adding direct regression coverage for the clear action.
- Preserve the current green validation matrix while making future changes less fragile.

## Scope clarification (important)
- This request is a **test and regression-hardening** follow-up, not a functional UX redesign request.
- It may include **small testability-oriented refactors** in test helpers/selectors and minor UI/test hooks if needed.
- It does **not** introduce new product features beyond validating/stabilizing already delivered behavior.
- It does **not** reopen the `Modeling` / `Analysis` merge UX decisions (single menu entry remains `Modeling`).

## Functional Scope
### A. E2E helper contract hardening for unified Modeling navigation (high priority)
- Align e2e navigation helpers with the post-merge workspace semantics:
  - top-level navigation target for modeling and analysis workflows is now `Modeling`,
  - `Analysis` is no longer a primary menu entry.
- Remove ambiguous helper contracts that pretend to switch to `Analysis` while always clicking `Modeling`.
- Prefer explicit naming that matches current UX behavior (for example: "open modeling workspace", "open modeling analysis panels", or equivalent semantics).
- Ensure smoke flows remain readable and intentionally document the compatibility behavior when analysis-oriented flows are exercised through `Modeling`.

### B. E2E selector resilience for data tables (high priority)
- Reduce reliance on brittle table cell indexes (`td.nth(...)`) in e2e scenarios where column layouts may evolve.
- Introduce more resilient row/cell targeting patterns for table assertions (recommended strategies):
  - header-driven column lookup,
  - helper utilities that resolve a cell by column label,
  - table-specific stable selectors only where justified.
- Apply the hardening at least to the smoke flow(s) already known to have broken due to the `Endpoint A/B` split.
- Avoid overfitting e2e tests to transient UI structure while preserving user-visible assertions.

### C. Regression coverage for shared table filter clear action (high priority)
- Add explicit tests for the shared `TableFilterBar` clear button (`×`) behavior.
- Cover baseline behavior expectations:
  - clear action is present in the filter text field UI,
  - clear action is disabled when the query is empty,
  - clear action resets the query text when the field is non-empty,
  - filtered table rows update accordingly after clear,
  - entry count footer updates accordingly after clear (where applicable).
- Validate the behavior through at least one representative table and preferably through the shared component usage path (not a duplicated one-off implementation).

### D. Test suite modularization hygiene follow-up (medium priority)
- Preserve or improve `quality:ui-modularization` compliance after adding new regression tests.
- When moving/splitting tests, keep suite intent clear (for example by extracting focused sub-suites rather than creating catch-all files).
- Maintain discoverability of related coverage across split files (naming and references).

### E. Documentation and traceability (medium priority)
- Document the review findings addressed by this request in backlog/task closure notes.
- Record why the hardened selectors/helpers were chosen (to avoid future accidental regressions back to brittle patterns).
- Ensure references are updated when test files are split or renamed.

## Non-functional requirements
- Keep tests deterministic and fast enough for CI.
- Avoid introducing hidden coupling between tests and implementation details unless explicitly justified.
- Prefer readable helper abstractions over opaque selector indirection.
- Maintain full validation matrix operability (`lint`, `typecheck`, quality gates, `test:ci`, `test:e2e`).

## Validation and regression safety
- Minimum targeted tests/checks:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s test -- src/tests/app.ui.list-ergonomics.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.navigation-canvas.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.navigation-canvas-validation-bridge.spec.tsx` (or equivalent split suite if renamed)
  - `npm run -s test:e2e`
- Recommended full closure validation:
  - `npm run -s quality:store-modularization`
  - `npm run -s quality:pwa`
  - `npm run -s build`
  - `npm run -s test:ci`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: e2e navigation helpers used by smoke flows match current unified workspace semantics and do not depend on a non-existent `Analysis` top-level menu button.
- AC2: e2e smoke assertions no longer rely on brittle wire-table cell indexes for critical length assertions impacted by column layout changes.
- AC3: The shared table filter clear button (`×`) has explicit regression coverage validating disabled/active/reset behavior and visible filtering outcome.
- AC4: UI test modularization gate remains green after test hardening and any necessary test file split(s).
- AC5: `test:e2e` passes for the smoke suite after helper/selector hardening.
- AC6: Full CI-facing validation matrix remains green after the hardening wave.

## Out of scope
- New workspace navigation features or reintroduction of an `Analysis` top-level menu entry.
- New table filter features beyond the already delivered clear action (for example debounce, persistent filters, advanced query syntax).
- Broad redesign of the e2e architecture unrelated to the identified review findings.
- Functional changes to analysis logic, modeling logic, or table rendering semantics (outside minor testability hooks if required).

# Backlog
- `logics/backlog/item_302_e2e_smoke_navigation_helpers_align_with_unified_modeling_workspace_semantics.md`
- `logics/backlog/item_303_e2e_table_assertions_use_resilient_column_targeting_instead_of_brittle_cell_indexes.md`
- `logics/backlog/item_304_shared_table_filter_bar_clear_action_regression_coverage_for_query_reset_and_row_restore.md`
- `logics/backlog/item_305_req_049_review_follow_up_test_hardening_closure_ci_build_and_ac_traceability.md`

# References
- Global review findings captured from recent validation and code review (assistant review output, current session)
- `logics/request/req_047_table_readability_endpoint_column_split_analysis_wire_name_subrows_and_filtered_entry_count_footers.md`
- `logics/request/req_048_merge_modeling_and_analysis_by_migrating_analysis_panels_into_modeling_workspace.md`
- `src/app/components/workspace/TableFilterBar.tsx`
- `src/app/styles/tables.css`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.navigation-canvas-validation-bridge.spec.tsx`
- `tests/e2e/smoke.spec.ts`
- `playwright.config.ts`
