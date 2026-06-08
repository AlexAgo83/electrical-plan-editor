## item_539_remove_update_action_history_refinement_using_previous_next_state_context - Remove/update action history refinement using previous/next state context
> From version: 1.2.0
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: UX / History correctness
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.
> Schema version: 1.0

# Problem
Readable reference resolution is weakest on delete/update actions because payloads often carry only internal IDs. Without explicit previous/next state usage, those entries can still fall back to unreadable identifiers after entity mutation/removal.

# Scope
- In:
  - refine history-label generation for remove/update actions using `previousState` and `nextState`;
  - preserve clear target identity for deleted entities after removal;
  - ensure update events keep readable references even when action payloads contain only system IDs;
  - keep wording deterministic across create/update/delete families.
- Out:
  - persistence compatibility of legacy recent-changes snapshots;
  - redesign of history action verbs or panel layout.

# Acceptance criteria
- AC1: Delete actions resolve readable references from pre-delete state instead of raw IDs.
- AC2: Update actions preserve readable target identity even when payloads only carry internal identifiers.
- AC3: Create/update/delete history wording remains coherent and deterministic after refinement.
- AC4: Raw UUID-like identifiers are no longer the primary visible target text for supported remove/update actions.

# AC Traceability
- AC1/AC2/AC3/AC4 -> state-aware history-label refinement for mutation actions.
- request-AC1 -> This backlog slice. Evidence needed: New `Recent changes` entries no longer show raw UUID-like IDs as primary target references.
- request-AC2 -> This backlog slice. Evidence needed: Connector/splice/wire/history labels use readable references (`technicalId`/name-style identifiers) when available.
- request-AC3 -> This backlog slice. Evidence needed: Delete actions keep readable target references (not internal IDs) after deletion.
- request-AC4 -> This backlog slice. Evidence needed: Node/segment/layout history labels are human-readable and not raw storage identifiers.
- request-AC5 -> This backlog slice. Evidence needed: Existing recent-changes snapshots remain loadable after the change.
- request-AC6 -> This backlog slice. Evidence needed: Undo/redo behavior and recent-changes alignment remain non-regressed.
- request-AC7 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_096_recent_changes_human_readable_entity_references_instead_of_system_ids.md`.
- Depends on: `item_538`.
- Orchestrated by `logics/tasks/task_089_req_096_recent_changes_human_readable_entity_references_orchestration_and_delivery_control.md`.
- Risks:
  - mismatch between action timing and state snapshots can label the wrong entity if resolution is not carefully scoped;
  - wording churn can make tests brittle if helper normalization is not shared.
- References:
  - `src/app/hooks/useStoreHistory.ts`
  - `src/store/actions.ts`

# Delivery
- Refined history-label generation so delete actions resolve readable identifiers from `previousState` before entity removal.
- Update-oriented history entries now combine `previousState` and `nextState` context to keep target labels readable even when payloads only carry internal IDs.
