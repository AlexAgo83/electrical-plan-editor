## item_036_occupancy_and_wire_transition_helper_extraction - Occupancy and Wire Transition Helper Extraction
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Deterministic Transition Helpers
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Occupancy and wire transition rules are deeply embedded in reducer branches, which makes correctness hard to validate and reuse.

# Scope
- In:
  - Extract pure helpers for occupancy set/release/validation logic.
  - Extract wire lifecycle transition helpers (route recompute, lock/reset behavior).
  - Keep helper interfaces deterministic and side-effect free.
  - Reuse helpers from reducer modules with explicit contracts.
- Out:
  - New routing algorithms.
  - UI-level behavior changes.

# Acceptance criteria
- Occupancy and wire transition helpers are isolated in testable modules.
- Reducer modules consume extracted helpers without changing expected behavior.
- Helper behavior is covered by targeted tests for edge cases.
- No hidden mutation side effects are introduced.

# Priority
- Impact: High (correctness and maintainability).
- Urgency: High after reducer boundary definition.

# Notes
- Dependencies: item_035.
- Blocks: item_037, item_038, item_039.
- Related AC: AC2, AC3.
- References:
  - `logics/request/req_006_large_store_files_split_and_reducer_modularization.md`
  - `src/store/reducer.ts`
  - `src/core/pathfinding.ts`

