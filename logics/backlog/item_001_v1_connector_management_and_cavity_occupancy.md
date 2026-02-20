## item_001_v1_connector_management_and_cavity_occupancy - V1 Connector Management and Cavity Occupancy
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Connector data must be editable and reliable at cavity level. V1 requires cavity addressing and single-occupancy visibility to build valid wire endpoints and connector synthesis views.

# Scope
- In:
  - Create/edit connector (`functionalName`, `technicalId`, `cavityCount`).
  - Cavity indexing and addressing for endpoint selection.
  - Enforce single occupancy rule per cavity.
  - Provide simplified connector cavity grid/table visualization.
- Out:
  - Multi-wire cavity occupancy exceptions.
  - Manufacturer-specific connector catalogs.

# Acceptance criteria
- Users can create and edit connectors with unique technical IDs.
- Cavity occupancy is visible in real time and prevents invalid second assignment.
- Connector cavities are addressable for wire endpoint A/B creation.
- Connector data is available to connector synthesis view contracts.

# Priority
- Impact: High (required for endpoint modeling and AC4).
- Urgency: High.

# Notes
- Dependencies: item_000.
- Related AC: AC4.
- References:
  - `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
  - `src/app/App.tsx`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`
  - `src/tests/store.reducer.spec.ts`
