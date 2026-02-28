## item_431_recent_changes_reload_and_network_scope_regression_test_coverage - Recent changes reload and network-scope regression test coverage
> From version: 0.9.18
> Status: Draft
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Regression safety for recent-changes persistence behavior
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Recent-changes persistence is cross-cutting; without targeted tests, reload behavior and network filtering can regress unnoticed.

# Scope
- In:
  - add/update tests for reload persistence of recent changes;
  - validate ordering, per-network filtering, and hide rules;
  - validate retention bounds.
- Out:
  - unrelated undo/redo feature expansion.

# Acceptance criteria
- AC1: Tests assert recent changes survive remount/reload for active network.
- AC2: Tests assert deterministic ordering and network isolation after reload.
- AC3: Tests assert panel hide behavior remains unchanged when history is empty.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `item_429`, `item_430`.
- Blocks: `item_432`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.undo-redo-global.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`
