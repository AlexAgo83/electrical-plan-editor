## item_694_detect_full_network_recompute_drift_with_pure_cached_warnings - Detect full-network recompute drift with pure cached warnings
> From version: 1.19.3
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Routing consistency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 12:53:37

# AI Context
- Reuse buildWireRecomputeReport and recomputeAllWiresForNetwork without dispatch. Audit endpoint details and unset splice-side transitions before integrating cached Validation warnings. Frequent checks depend on measured latency.

# Problem
- Manual recompute can reveal stored routing changes only after modifying the design; startup and low-cost reactive diagnostics are missing.

# Scope
- In:
  - Reuse/extract the pure full-network recompute result and audit report completeness: ordered routes, lengths, endpoint detail fields and all inferred directional splice-side transitions. Test actual before/after persisted wire differences against preview, including locked/invalid routes, same-length alternative routes, splice anchors and empty graphs.
  - Integrate stable drift warnings and failed/unavailable diagnostics with Validation counters, filtering and navigation to Network recompute. Preserve manual report behavior and read-only safety.
  - Schedule after hydration/activation/import and relevant edits with scoped cache invalidation, debounce/idle execution, stale-result guards and no UI-only invalidation. Benchmark before deciding frequent checks; apply the AC6 fallback if targets are missed.
  - Test no mutation/history/save/dialog effects, cross-session/network races, warning deduplication, pending/failure states, and resolution after manual recompute. Record fixture dimensions and performance method/results.
- Out:
  - Automatic corrections, new routing rules, unconditional polling and diagnostics for inactive networks on every render.

# Acceptance criteria
- AC1: Preview matches the real manual recompute persisted outputs without dispatching or mutating, including report edge cases (AC4).
- AC2: Warnings, failures and manual recompute lifecycle meet AC5 across EN/FR and historical mode.
- AC3: Measured cadence, cache/race tests and documented performance decision satisfy AC6 and AC10.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: Delivered in 82745ba9; validated by task_168 evidence: pure preview versus manual recompute output parity and activation tests (slice AC1).
- request-AC5 -> This backlog slice. Proof: Delivered in 82745ba9; validated by task_168 evidence: warning lifecycle and absence of model/save/dialog side effects (slice AC2).
- request-AC6 -> This backlog slice. Proof: Delivered in 82745ba9; validated by task_168 evidence: scheduler invalidation/races and measured latency decision (slice AC3).
- request-AC10 -> This backlog slice. Proof: Delivered in 82745ba9; validated by task_168 evidence: recorded benchmark methodology and routing regression results (slice AC3).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_022_plan_issue_traceability_and_everyday_workspace_confidence`
- Architecture decision(s): (none yet)
- Request: `req_171_add_plan_issue_metadata_proactive_routing_drift_warnings_and_visible_portable_workspace_controls`
- Primary task(s): `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility`

# Notes
- Task `task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility` was finished via `logics-manager flow finish task` on 2026-10-22.
