## item_050_layout_state_schema_and_persistence_migration - Layout State Schema and Persistence Migration
> From version: 0.2.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Layout Persistence Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
2D coordinates are currently derived at runtime and are not guaranteed as an explicit persisted contract in network-scoped state, which causes layout resets and migration risks after reloads or schema evolution.

# Scope
- In:
  - Extend network-scoped state with explicit persisted 2D layout coordinates.
  - Add persistence migration path for legacy snapshots without layout state.
  - Ensure save/load flows keep deterministic serialization and backward compatibility.
  - Preserve safe fallback behavior for missing/invalid coordinates.
- Out:
  - Crossing-minimization algorithm improvements.
  - Layout regeneration UI controls.

# Acceptance criteria
- Network-scoped state includes explicit 2D coordinate storage for rendered entities.
- Legacy persisted payloads load safely and are migrated without data loss.
- Manual layout changes persist across app reload.
- Schema migration and persistence tests cover valid, legacy, and corrupted payload scenarios.

# Priority
- Impact: Very high (foundation for all layout persistence and regeneration behavior).
- Urgency: Immediate before layout algorithm and UI control waves.

# Notes
- Dependencies: item_017.
- Blocks: item_051, item_052, item_053, item_054.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_009_2d_layout_persistence_and_crossing_minimization.md`
  - `src/store/types.ts`
  - `src/store/networking.ts`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`
