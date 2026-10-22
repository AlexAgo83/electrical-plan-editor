## task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility - Deliver plan issue metadata routing drift checks and workspace copy visibility
> From version: 1.19.3
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-22 11:56:37

# AI Context
- Deliver metadata/export parity, pure routing diagnostics with measured cadence, standalone snapshot Copy and reactive header identity. Request AC1-AC10 require implementation evidence before closeout; scaffolding alone does not complete this task.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Wave 1: implement the per-network issue metadata contract, persistence/import compatibility and cartouche propagation (backlog 1); record AC1-AC3 evidence.
- [ ] 2. Wave 2: establish pure recompute parity and report completeness, then lifecycle-scoped warnings, scheduling and representative performance evidence (backlog 2). Choose and document the measured cadence/fallback before claiming AC4-AC6 complete.
- [ ] 3. Wave 3: implement standalone Copy snapshot download and its source/session invariants (backlog 3), then bind current workspace identity into the persistent header (backlog 4); cover AC7-AC9.
- [ ] 4. Wave 4: complete AC10 with EN/FR, responsive/historical, importer/exporter and browser regression evidence; update workspace/export guidance and run repository-required delivery gates. Record limitations explicitly.
- [ ] 5. Keep this chain ready for development. Use Logics lifecycle commands to start, record progress and close only after runtime delivery and AC evidence; the scoping commit is not implementation completion.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`
- `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`
- `item_695_download_the_current_workspace_snapshot_from_a_copy_action`
- `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`

# Definition of Done (DoD)
- [ ] Implement all four linked backlog slices and attach request AC1-AC10 evidence to this task.
- [ ] Verify legacy/new metadata roundtrips, export rendering, pure recompute parity, warning lifecycle, Copy source invariants and header state transitions.
- [ ] Record routing diagnostic performance measurements and the selected cadence or documented fallback from AC6.
- [ ] Complete EN/FR, responsive, read-only and browser regressions; update workspace/export guidance.
- [ ] Pass applicable repository delivery gates plus Logics lint, audit and request validation; no deferred implementation evidence remains at closeout.
- [ ] Refresh the context pack and affected workflow docs with actual delivery outcomes.

# AC Traceability
- request-AC1 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC2 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC3 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC10 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC4 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof deferred to slice closeout.
- request-AC5 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof deferred to slice closeout.
- request-AC6 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof deferred to slice closeout.
- request-AC10 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof deferred to slice closeout.
- request-AC7 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof deferred to slice closeout.
- request-AC8 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof deferred to slice closeout.
- request-AC10 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof deferred to slice closeout.
- request-AC9 -> `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`. Proof deferred to slice closeout.
- request-AC10 -> `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_171_add_plan_issue_metadata_proactive_routing_drift_warnings_and_visible_portable_workspace_controls`
- Product brief(s): `prod_022_plan_issue_traceability_and_everyday_workspace_confidence`
- Architecture decision(s): (none yet)
