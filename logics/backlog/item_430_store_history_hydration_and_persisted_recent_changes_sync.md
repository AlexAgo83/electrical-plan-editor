## item_430_store_history_hydration_and_persisted_recent_changes_sync - Store history hydration and persisted recent-changes sync
> From version: 0.9.18
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Runtime hydration of persisted recent-change metadata
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Even with schema persistence, recent changes will remain missing after reload unless in-session history state hydrates deterministically from persisted metadata.

# Scope
- In:
  - hydrate `useStoreHistory` recent-change entries from persisted data on bootstrap;
  - merge hydration with runtime mutation tracking without ordering drift;
  - preserve active-network filtering semantics.
- Out:
  - restoring full undo/redo stacks across sessions.

# Acceptance criteria
- AC1: Recent changes are restored after reload for active network.
- AC2: Ordering remains deterministic (newest first in panel).
- AC3: Network-scoped filtering remains correct after reload and switch.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `item_429`.
- Blocks: `item_431`, `item_432`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/AppController.tsx`

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
