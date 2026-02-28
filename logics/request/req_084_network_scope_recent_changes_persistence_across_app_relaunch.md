## req_084_network_scope_recent_changes_persistence_across_app_relaunch - Persist Network Scope recent changes across app relaunch
> From version: 0.9.18
> Status: Draft
> Understanding: 98%
> Confidence: 95%
> Complexity: Medium
> Theme: Network-level observability and persistence
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- After relaunching the app, `Network Scope > Recent changes` is currently empty even when the user had visible recent changes before closing.
- Users need recent changes visibility to survive app restart for continuity and traceability.

# Context
- `Recent changes` was delivered by `req_075` and is fed from `undoHistoryEntries`.
- Current source is in-memory history state managed by `useStoreHistory`, so entries are reset on reload.
- Workspace persistence (`saveState/loadState`) stores `AppState`, but does not currently persist recent-change history metadata from `useStoreHistory`.

# Objective
- Persist lightweight recent-change metadata so `Recent changes` in Network Scope remains available after app relaunch.
- Keep current UX contract (ordering, labels, per-network scope, panel hide rules) unchanged.

# Scope
- In:
  - add persistence for recent-change metadata used by `Network Scope` recent changes panel;
  - restore persisted metadata on app bootstrap/reload;
  - keep bounded retention aligned with history limits (no unbounded growth);
  - keep active-network filtering and newest-first rendering behavior.
- Out:
  - full cross-session Undo/Redo snapshot restoration;
  - server-side audit log architecture;
  - cross-device sync of local history metadata.

# Locked execution decisions
- Decision 1: Persist only the lightweight recent-change metadata entries, not full undo/redo snapshot stacks.
- Decision 2: Keep panel rendering contract from `req_075` (last 10 displayed, newest first, active-network scoped).
- Decision 3: Apply bounded retention to persisted metadata (same cap policy as history limit contract).
- Decision 4: Maintain backward-compatible persistence migration behavior for existing local payloads.

# Functional behavior contract
- On normal usage:
  - tracked business mutations keep producing recent-change entries as today.
- On app relaunch:
  - recent-change metadata is restored from persisted workspace state;
  - `Recent changes` panel reflects restored entries for active network.
- Network isolation:
  - each entry remains associated to its network;
  - switching active network shows only that network's entries.
- Empty behavior:
  - if active-network recent entries are empty, panel remains hidden (unchanged contract).

# Acceptance criteria
- AC1: After creating/updating entities and remounting/reloading, `Recent changes` remains visible for the active network with restored entries.
- AC2: Restored entries keep deterministic ordering (newest first in panel) and existing label/time rendering semantics.
- AC3: Persisted recent-change metadata remains bounded by configured history retention policy.
- AC4: Network-scoped filtering remains correct after reload and network switch.
- AC5: Existing `req_075` panel hide behavior remains unchanged when active-network history is empty.
- AC6: `lint`, `typecheck`, and relevant tests pass with new persistence coverage.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
- `npm run -s test -- src/tests/app.ui.undo-redo-global.spec.tsx`
- `npm run -s test -- src/tests/persistence.localStorage.spec.ts`
- `npm run -s test:ci`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Persisting history metadata without clear migration rules can break load behavior for existing local snapshots.
- Entry ordering/sequence continuity can drift if hydration and in-session generation are not merged deterministically.
- Regression risk on network-scoped filtering if restored entries are not correctly associated with network IDs.

# Backlog
- To create from this request:
  - `item_429_recent_changes_metadata_persistence_schema_and_migration_contract.md`
  - `item_430_store_history_hydration_and_persisted_recent_changes_sync.md`
  - `item_431_recent_changes_reload_and_network_scope_regression_test_coverage.md`
  - `item_432_req_084_validation_matrix_and_closure_traceability.md`

# References
- `logics/request/req_075_network_scope_recent_changes_panel_from_undo_history.md`
- `src/app/hooks/useStoreHistory.ts`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/store.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.undo-redo-global.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
