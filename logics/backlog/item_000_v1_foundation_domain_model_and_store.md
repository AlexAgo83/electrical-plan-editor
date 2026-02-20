## item_000_v1_foundation_domain_model_and_store - V1 Foundation Domain Model and Store
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
V1 needs a stable technical foundation to avoid fragmented implementations of connectors, splices, segments, and wires. Without a shared domain model and store contract, routing, occupancy, and views will diverge.

# Scope
- In:
  - Define V1 domain entities and IDs (`Connector`, `Splice`, `Node`, `Segment`, `Wire`).
  - Define normalized app state shape and selector conventions.
  - Define core actions/reducer contracts for create/update/delete and selection.
  - Create module skeleton (`src/core`, `src/store`, `src/app`, `src/adapters/persistence`).
- Out:
  - Final UI rendering details.
  - Advanced persistence migrations beyond V1 baseline.

# Acceptance criteria
- Domain entities and state contracts are documented and implemented in TypeScript strict mode.
- Store supports deterministic updates for all V1 entities.
- Project structure matches the target reference architecture.
- Baseline tests validate reducer/store invariants.

# Priority
- Impact: Very high (foundation for all other V1 items).
- Urgency: Immediate (must be completed first).

# Notes
- Dependencies: none.
- Blocks: item_001, item_002, item_003, item_005, item_007.
- References:
  - `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
  - `logics/architecture/target_reference_v1_frontend_local_first.md`
