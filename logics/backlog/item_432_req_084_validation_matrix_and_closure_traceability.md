## item_432_req_084_validation_matrix_and_closure_traceability - Req 084 validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Closure governance for recent-changes persistence across relaunch
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Req_084 modifies persistence plus runtime history integration; closure needs explicit AC evidence and doc synchronization to avoid drift.

# Scope
- In:
  - produce req_084 AC matrix linked to implementation/tests;
  - capture required validation command evidence;
  - sync request/backlog/task statuses at closure.
- Out:
  - scope expansion beyond req_084 closure.

# Acceptance criteria
- AC1: Req_084 AC matrix is complete and auditable.
- AC2: Validation matrix includes targeted recent-change and persistence suites.
- AC3: Request/backlog/task status and links are aligned at closure.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `item_429`, `item_430`, `item_431`.
- Blocks: `task_073` completion.
- Related AC: `AC1`, `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
  - `src/app/hooks/useStoreHistory.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: After creating/updating entities and remounting/reloading, `Recent changes` remains visible for the active network with restored entries.
- request-AC2 -> This backlog slice. Evidence needed: Restored entries keep deterministic ordering (newest first in panel) and existing label/time rendering semantics.
- request-AC3 -> This backlog slice. Evidence needed: Persisted recent-change metadata remains bounded by configured history retention policy.
- request-AC4 -> This backlog slice. Evidence needed: Network-scoped filtering remains correct after reload and network switch.
- request-AC5 -> This backlog slice. Evidence needed: Existing `req_075` panel hide behavior remains unchanged when active-network history is empty.
- request-AC6 -> This backlog slice. Evidence needed: Recent-change metadata is persisted locally only and is not added to network file import/export payload contracts.
- request-AC7 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant tests pass with new persistence coverage.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
