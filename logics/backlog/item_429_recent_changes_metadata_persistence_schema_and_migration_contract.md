## item_429_recent_changes_metadata_persistence_schema_and_migration_contract - Recent changes metadata persistence schema and migration contract
> From version: 0.9.18
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Persistence schema extension for network-scoped recent changes
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Recent changes are currently in-memory only; persistence requires a schema extension and backward-compatible migration rules.

# Scope
- In:
  - define persisted metadata shape for recent changes (bounded and network-scoped);
  - implement migration-safe load behavior for existing persisted payloads;
  - keep retention aligned with history-limit policy.
- Out:
  - full undo/redo snapshot persistence;
  - server-side logging/sync.

# Acceptance criteria
- AC1: Persisted schema includes bounded recent-change metadata.
- AC2: Existing payloads load safely through migration path.
- AC3: Retention cap is deterministic and aligned with history policy.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_084`, `req_075` history contracts.
- Blocks: `item_430`, `item_432`, `task_073`.
- Related AC: `AC1`, `AC3`, `AC6`.
- References:
  - `logics/request/req_084_network_scope_recent_changes_persistence_across_app_relaunch.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/app/store.ts`

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
