## item_650_move_steady_state_persistence_serialization_off_the_critical_input_path - Move steady-state persistence serialization off the critical input path
> From version: 1.17.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Runtime performance and bundle efficiency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Every store change schedules (200 ms debounce) a JSON.stringify of the entire multi-network state followed by a synchronous localStorage.setItem on the main thread; on large workspaces this causes a per-edit jank spike right after the user stops typing or dragging.
- The synchronous flush on pagehide/visibilitychange/detach is a deliberate data-loss guard and must not be weakened.

# Scope
- In:
  - Schedule the debounced steady-state serialization+write during idle time (requestIdleCallback with a setTimeout fallback) so it does not compete with input handling, keeping the existing debounce and save-sequence invalidation logic.
  - Preserve flushPendingSaveSync exactly: synchronous serialize+write on pagehide, visibilitychange-hidden, and detach, including invalidation of in-flight async saves.
  - Keep the persistence feedback messages (write failure, quota exceeded, near-quota warning) and their set/clear semantics unchanged.
  - Add a lightweight duration measurement (dev-only or debug-gated) around the serialize+write so future regressions are observable.
- Out:
  - IndexedDB or any storage backend migration.
  - Per-network delta serialization or state schema changes.
  - Web worker offloading of serialization.

# Acceptance criteria
- AC1: Steady-state saves run via idle scheduling and never execute synchronously inside the store-subscription callback, verified by unit test on attachPersistenceSync.
- AC2: pagehide, visibilitychange-hidden, and detach still perform a synchronous flush that wins over any in-flight async save (existing sequence-invalidation tests still pass).
- AC3: Quota/failure/near-quota feedback messages behave exactly as before, covered by the existing persistence feedback tests.
- AC4: A rapid burst of edits results in a bounded number of writes (debounce preserved), verified by test.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Steady-state saves run via idle scheduling and never execute synchronously inside the store-subscription callback, verified by unit test on attachPersistenceSync.
- request-AC8 -> This backlog slice. Proof: AC2: pagehide, visibilitychange-hidden, and detach still perform a synchronous flush that wins over any in-flight async save (existing sequence-invalidation tests still pass).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Primary task(s): `task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul`

# AI Context
- Summary: Move steady-state persistence serialization off the critical input path
- Keywords: scaffolded-backlog, move steady-state persistence serialization off the critical input path, implementation-ready
- Use when: Implementing the scaffolded slice for Move steady-state persistence serialization off the critical input path.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
