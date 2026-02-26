## item_371_catalog_reference_conflict_detection_surfacing_for_load_and_legacy_bootstrap_paths - Catalog reference conflict detection surfacing for load and legacy bootstrap paths
> From version: 0.9.10
> Understanding: 94%
> Confidence: 88%
> Progress: 100%
> Complexity: Medium-High
> Theme: Deterministic non-crashing conflict surfacing for persisted/legacy catalog reference issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Stricter catalog reference policy may reveal conflicts in existing persisted/legacy data. The app should not crash, but conflicts must be surfaced clearly (preferably via validation issues) for user action.

# Scope
- In:
  - Detect catalog manufacturer-reference conflicts under the chosen canonical comparison during workspace load/legacy bootstrap paths.
  - Surface actionable diagnostics via validation issues (preferred) while preserving deterministic runtime behavior.
  - Avoid silent auto-renaming in normal load paths unless explicitly covered by existing legacy normalization rules.
  - Preserve app boot stability (no crash) when conflicts are detected.
- Out:
  - CSV import explicit conflict policy (handled in `item_370`)
  - Full validation taxonomy redesign
  - Broad validation UI redesign

# Acceptance criteria
- Catalog reference conflicts discovered during load/legacy bootstrap do not crash the app.
- Conflicts are surfaced in an actionable way (validation issues preferred).
- Load behavior remains deterministic and documented.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_068`, `item_369`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC2, AC7, AC9.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/store/catalog.ts`
  - `src/store/reducer/catalogReducer.ts`
  - `src/store/reducer.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/sample-network.compat.spec.ts`
