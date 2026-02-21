## item_037_connector_splice_node_segment_handler_split - Connector Splice Node Segment Handler Split
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Domain Handler Decomposition
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Lifecycle handling for connectors, splices, nodes, and segments is currently intertwined in a single reducer file, increasing complexity and risk of cross-domain side effects.

# Scope
- In:
  - Split lifecycle handlers for connectors/splices/nodes/segments into dedicated modules.
  - Isolate referential cleanup rules per domain area.
  - Keep integration via composed reducer entrypoint.
  - Preserve validation-critical invariants and error semantics.
- Out:
  - Wire-specific transition redesign (covered in dedicated helper item).
  - New entity types.

# Acceptance criteria
- Domain lifecycle handlers are isolated by concern and easier to trace.
- Referential integrity rules remain enforced after handler split.
- Existing actions for these domains remain behaviorally equivalent.
- Store tests for lifecycle paths continue to pass.

# Priority
- Impact: High (safer change surface).
- Urgency: High after helper extraction baseline.

# Notes
- Dependencies: item_035, item_036.
- Blocks: item_038, item_039.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_006_large_store_files_split_and_reducer_modularization.md`
  - `src/store/reducer.ts`
  - `src/store/types.ts`

