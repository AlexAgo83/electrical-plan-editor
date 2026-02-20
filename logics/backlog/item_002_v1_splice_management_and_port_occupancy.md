## item_002_v1_splice_management_and_port_occupancy - V1 Splice Management and Port Occupancy
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Splices are first-class electrical nodes in V1. The product needs indexed ports, branching support, and occupancy constraints to route wires through junctions correctly.

# Scope
- In:
  - Create/edit splice (`name`, `technicalId`, indexed ports).
  - Port-level addressing (for example `S1-P1`) for wire endpoints.
  - Enforce single occupancy rule per splice port.
  - Distinct splice visual marker with branch count.
- Out:
  - Splice-specific electrical calculations beyond connectivity.
  - Multi-wire port occupancy exceptions.

# Acceptance criteria
- Users can create and edit splices with unique IDs and indexed ports.
- Splice ports are individually selectable as wire endpoints.
- Port occupancy is reflected and blocks invalid assignments.
- Splice nodes are usable by network routing graph.

# Priority
- Impact: High (required for routing through junctions and AC5).
- Urgency: High.

# Notes
- Dependencies: item_000.
- Related AC: AC5.
- References:
  - `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
  - `src/app/App.tsx`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`
  - `src/tests/store.reducer.spec.ts`
