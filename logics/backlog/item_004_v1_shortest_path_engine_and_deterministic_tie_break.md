## item_004_v1_shortest_path_engine_and_deterministic_tie_break - V1 Shortest Path Engine and Deterministic Tie Break
> From version: 0.1.0
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
V1 requires automatic routing to the shortest path with deterministic behavior. Without a formal engine and tie-break policy, wire lengths and route choices become inconsistent.

# Scope
- In:
  - Implement weighted shortest-path computation (Dijkstra).
  - Deterministic tie-break by fewer segments when total length is equal.
  - Stable fallback ordering when ties persist.
  - Expose route computation API for wire lifecycle.
- Out:
  - Heuristic geometric routing.
  - User preference optimization layers.

# Acceptance criteria
- Route engine returns minimum total length path for valid node pairs.
- Equal-length candidates are resolved by segment-count tie-break.
- Results are deterministic across repeated runs with unchanged graph.
- Test coverage validates shortest-path and tie-break behavior.

# Priority
- Impact: Very high (directly tied to AC2).
- Urgency: High.

# Notes
- Dependencies: item_003.
- Blocks: item_005.
- Related AC: AC2.
- References:
  - `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
