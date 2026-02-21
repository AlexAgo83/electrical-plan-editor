## item_035_reducer_module_boundary_definition_and_composed_entrypoint - Reducer Module Boundary Definition and Composed Entrypoint
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Store Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/store/reducer.ts` centralizes many responsibilities, making state transition reasoning and ownership boundaries difficult to maintain.

# Scope
- In:
  - Define reducer module boundaries by domain concern.
  - Create a composed top-level reducer entrypoint wiring dedicated handlers.
  - Preserve public action contract and deterministic behavior.
  - Document ownership and module interaction rules.
- Out:
  - Action API redesign.
  - New domain features unrelated to modularization.

# Acceptance criteria
- Reducer responsibilities are split into explicit modules with a composed entrypoint.
- Action behavior remains backward-compatible for existing callers.
- Boundaries are documented and enforceable by code structure.
- No behavior regression on core reducer scenarios.

# Priority
- Impact: Very high (foundation for store modularization).
- Urgency: Immediate.

# Notes
- Dependencies: item_000.
- Blocks: item_036, item_037, item_038, item_039.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_006_large_store_files_split_and_reducer_modularization.md`
  - `src/store/reducer.ts`
  - `src/store/actions.ts`

