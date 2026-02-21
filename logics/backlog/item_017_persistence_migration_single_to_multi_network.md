## item_017_persistence_migration_single_to_multi_network - Persistence Migration Single to Multi-Network
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Local-First Persistence Migration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Existing saved snapshots are single-network. Without a safe migration path, enabling multi-network mode would break current users or lose historical model data.

# Scope
- In:
  - Introduce new persisted schema supporting `networks[]` and `activeNetworkId`.
  - Add deterministic migration from legacy single-network state into a default network container.
  - Preserve entities, route locks, and computed constraints during migration.
  - Version persisted schema and keep backward-compatible load behavior.
- Out:
  - Remote/cloud migration workflows.
  - Multiple historical schema jumps beyond current baseline and one legacy version.

# Acceptance criteria
- Legacy saved data loads into multi-network schema without data loss.
- Migrated state contains one valid network and a valid `activeNetworkId`.
- Route lock and occupancy-critical fields are preserved after migration.
- Invalid/partial persisted payloads fail gracefully with deterministic fallback state.

# Priority
- Impact: Very high (protects existing user data).
- Urgency: High before release of multi-network runtime behavior.

# Notes
- Dependencies: item_007, item_014.
- Blocks: item_018, item_019.
- Related AC: AC5, AC6.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/store/reducer.ts`
  - `src/tests/store.reducer.spec.ts`

