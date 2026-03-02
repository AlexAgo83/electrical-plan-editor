## item_454_network_summary_node_shape_render_scaling_mode_for_connector_splice_node_geometries - network summary node shape render scaling mode for connector splice node geometries
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Node shapes currently scale with zoom. `req_090` requires optional screen-space-stable rendering for connector/splice/node geometries.

# Scope
- In:
  - implement rendering mode switch for node shapes based on setting.
  - apply to connector square, splice diamond, and intermediate node circle.
  - keep default behavior unchanged when setting is off.
  - add safe size clamping for extreme zoom levels.
- Out:
  - topology coordinate changes.
  - label rendering mode changes.

# Acceptance criteria
- AC1: Enabled mode keeps node shapes visually stable on screen through zoom changes.
- AC2: Disabled mode preserves existing zoom-coupled sizing.
- AC3: Mode applies uniformly across square/diamond/circle node families.
- AC4: Size clamping prevents unusable extremes at high zoom in/out.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/NetworkSummaryPanel.tsx` node shape rendering logic.
- AC4 -> rendering constants/helpers in the same module and targeted visual assertions.

# Priority
- Impact: High (primary UX requirement).
- Urgency: High (depends on item_453, blocks interaction hardening).

# Notes
- Risks:
  - transform math errors can desync shape and label anchors.
  - clamping values may require tuning for dense diagrams.
- References:
  - `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
