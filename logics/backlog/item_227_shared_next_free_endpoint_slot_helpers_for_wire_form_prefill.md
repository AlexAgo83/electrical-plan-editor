## item_227_shared_next_free_endpoint_slot_helpers_for_wire_form_prefill - Shared Next-Free Endpoint Slot Helpers for Wire Form Prefill
> From version: 0.7.3
> Understanding: 98%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Deterministic, Testable Slot Availability Helpers for Wire Endpoint UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire endpoint occupancy/prefill feature needs consistent availability logic for connector `ways` and splice `ports`. Embedding this logic directly in UI handlers risks duplication, drift, and weak test coverage.

# Scope
- In:
  - Add shared pure helper(s) for endpoint occupancy and next-free slot lookup:
    - `isConnectorWayOccupied(...)`
    - `isSplicePortOccupied(...)`
    - `findNextAvailableConnectorWay(...)`
    - `findNextAvailableSplicePort(...)`
    - (or equivalent names with same responsibilities)
  - Support deterministic behavior using:
    - connector/splice capacity (`cavityCount` / `portCount`)
    - occupancy maps
    - optional current-wire exclusion for edit-mode occupancy checks
  - Keep helper API convenient for use by wire form handlers/selectors.
  - Add unit tests if helper extraction is introduced in a testable module.
- Out:
  - Wire form UI rendering changes.
  - Touched-guard state management in wire form handlers.
  - Store/reducer occupancy model refactor.

# Acceptance criteria
- Shared pure helpers provide deterministic occupancy checks and next-free slot suggestions for connector/splice endpoints.
- Helpers support optional exclusion for current wire edit occupancy checks (or an equivalent mechanism).
- Helper behavior is unit-testable and documented by tests if new helpers are introduced.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_037`.
- Blocks: item_225, item_226, item_228, item_229.
- Related AC: AC1, AC2, AC3, AC5a, AC6.
- References:
  - `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/store/types.ts`
  - `src/app/hooks/validation/buildValidationIssues.ts`
  - `src/app/lib/technical-id-suggestions.ts`

