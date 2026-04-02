## item_559_audit_and_enforce_sync_invariant_between_global_and_network_scoped_state - Audit and enforce sync invariant between global and network-scoped state
> From version: 1.4.4
> Schema version: 1.0
> Status: Done
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture quality / state consistency
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`AppState` maintains entity collections both at the root level and inside `networkStates[NetworkId]`. A manual `syncCurrentScopeToNetworkMap()` call is required after every domain mutation to keep them coherent. Any reducer that forgets this call silently introduces stale state. There is no type-level or runtime enforcement of this invariant.

# Scope
- In:
  - audit all domain reducers in `src/store/reducer/` and document which ones call `syncCurrentScopeToNetworkMap()` and which ones do not;
  - add the missing sync calls for any reducer that is found to omit them;
  - introduce a wrapper function or type-level mechanism that makes it structurally harder to forget the sync call in future reducers;
  - add an explicit invariant comment block in `src/store/reducer.ts` describing the dual-state contract and the sync requirement;
  - add a test that verifies global-level and network-scoped entity state remain identical after a representative domain mutation.
- Out:
  - full consolidation of the dual-state into a single source of truth (deferred follow-up, too invasive for V1).

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|audit-and-enforce-sync-invariant-between|req-113-technical-debt-hardening-persist|appstate-maintains-entity-collections-bo|ac1-all-domain-reducers-that-perform
flowchart LR
    Audit[Audit all domain reducers] --> Missing[Identify missing sync calls]
    Missing --> Fix[Add missing sync calls]
    Fix --> Wrapper[Type-level or wrapper enforcement]
    Wrapper --> Test[Test: global and network-scoped state match after mutation]
```

# Acceptance criteria
- AC1: All domain reducers that perform entity mutations call `syncCurrentScopeToNetworkMap()` or its enforced equivalent; the audit list is documented in a comment or companion doc.
- AC2: A wrapper function or lint rule is in place that makes it structurally harder to add a new domain reducer without including the sync call.
- AC3: An explicit invariant comment describes the dual-state contract and sync requirement in `reducer.ts` or a shared module.
- AC4: A test asserts that root-level entity state and `networkStates[activeNetworkId]` entity state are structurally identical after a representative mutation.

# AC Traceability
- AC1 → completeness. Proof: audit document or comment listing all reducers and their sync status.
- AC2 → enforcement. Proof: wrapper or ESLint rule visible in diff.
- AC3 → documentation. Proof: invariant comment block in `reducer.ts`.
- AC4 → runtime coherence. Proof: new test in `store.reducer.*.spec.ts`.

# Decision framing
- Product framing: Not needed
- Architecture framing: A follow-up ADR may be warranted for the long-term consolidation strategy.

# Links
- Request: `logics/request/req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality.md`
- Primary task(s): `logics/tasks/task_091_orchestration_delivery_execution_for_req_113_technical_debt_hardening.md`

# AI Context
- Summary: Audit all domain reducers for missing syncCurrentScopeToNetworkMap calls, fix gaps, and add a structural enforcement mechanism to prevent future omissions.
- Keywords: syncCurrentScopeToNetworkMap, dual state, network-scoped state, reducer, invariant, state consistency
- Use when: Adding a new domain reducer or reviewing store mutation paths.
- Skip when: Working on read-only selectors, UI components, or features unrelated to the store mutation layer.

# Priority
- Impact: High.
- Urgency: Soon.

# Notes
- Derived from `logics/request/req_113_...` audit item C2.
- Depends on: none.
- References:
  - `src/store/reducer.ts`
  - `src/store/reducer/` (all domain reducers)
  - `src/store/types.ts`
  - `src/tests/store.reducer.sync-invariant.spec.ts`

# Validation
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/store.reducer`
- `npm run -s build`
