## item_455_zoom_invariant_node_shapes_interaction_hitbox_and_regression_coverage - zoom invariant node shapes interaction hitbox and regression coverage
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Changing node rendering size can break interaction fidelity if hitboxes remain in old scale space. `req_090` explicitly requires hit areas aligned with displayed shapes.

# Scope
- In:
  - align hit-testing region with displayed node shape size in both modes.
  - validate selection, drag, and keyboard activation for connectors/splices/nodes.
  - ensure no regression in lock/snap and node move interactions.
  - add interaction-focused regression tests.
- Out:
  - broader canvas interaction redesign.

# Acceptance criteria
- AC1: Click/selection target matches displayed shape footprint when mode is enabled.
- AC2: Drag interactions remain reliable for all node kinds in both modes.
- AC3: Keyboard activation remains non-regressed.
- AC4: Automated tests cover hitbox and interaction behavior matrix.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/NetworkSummaryPanel.tsx` interaction handlers and rendered shape geometry.
- AC4 -> `src/tests/app.ui.navigation-canvas.spec.tsx` targeted interaction tests.
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
- Impact: High (interaction correctness).
- Urgency: Medium-High (after item_454, before closure).

# Notes
- Risks:
  - mismatch between visual and interactive area can degrade trust.
  - brittle interaction tests under jsdom geometry constraints.
- References:
  - `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
