## item_179_connector_splice_callout_position_persistence_in_network_model_and_schema_normalization - Connector/Splice Callout Position Persistence in Network Model and Schema Normalization
> From version: 0.6.4
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Persist Draggable Callout Positions on Business Entities with Safe Model Evolution
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Callout frames must be draggable and retain their positions across reload/export/import. Without explicit model persistence on connector/splice entities, user-arranged callout layouts would be lost and the feature would feel unreliable in real workflows.

# Scope
- In:
  - Define and implement persistent callout position fields on connector/splice entities in the network model.
  - Load/apply persisted positions into the 2D renderer.
  - Define normalization/fallback behavior for missing/invalid/stale coordinates.
  - Document any schema compatibility implications for import/export.
  - Ensure runtime behavior remains stable if some entities have positions and others do not.
- Out:
  - Versioned migration framework redesign beyond what is needed for this field addition.
  - Persisting positions on `NetworkNode` instead of connector/splice entities.

# Acceptance criteria
- Connector/splice callout positions are persisted in the network model (not only UI runtime state).
- Persisted positions survive reload/export/import cycles.
- Invalid/missing callout positions fall back safely to default placement logic.
- Schema/normalization behavior is documented in implementation notes/tests where applicable.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_031`.
- Blocks: item_183, item_186.
- Related AC: AC6, AC10.
- References:
  - `logics/request/req_031_network_summary_2d_connector_and_splice_cable_info_frames_with_draggable_callouts.md`
  - `src/store/types.ts`
  - `src/store/index.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/portability.network-file.spec.ts`

