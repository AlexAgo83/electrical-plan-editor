## item_454_network_summary_node_shape_render_scaling_mode_for_connector_splice_node_geometries - network summary node shape render scaling mode for connector splice node geometries
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: A new Canvas setting exists to enable/disable zoom-invariant node shapes.
- request-AC2 -> This backlog slice. Evidence needed: Default value is disabled when no prior preference exists.
- request-AC3 -> This backlog slice. Evidence needed: When enabled, connector/splice/node shapes remain visually stable during zoom in/out compared to current behavior.
- request-AC4 -> This backlog slice. Evidence needed: When disabled, current zoom-coupled shape scaling behavior is unchanged.
- request-AC5 -> This backlog slice. Evidence needed: Enabled mode applies to squares (connectors), diamonds (splices), and circles (nodes).
- request-AC6 -> This backlog slice. Evidence needed: Selection/drag/hit interactions remain non-regressed in both modes, with hitboxes aligned to displayed shape size.
- request-AC7 -> This backlog slice. Evidence needed: Preference persists/restores correctly across reload/relaunch.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after implementation.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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
