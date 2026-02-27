## req_071_connector_and_splice_analysis_add_go_to_wire_action_before_release - Connector/Splice analysis: add `Go to` wire action before `Release`
> From version: 0.9.12
> Understanding: 99% (request is UI/analysis-only: add a `Go to` button before `Release` in both connector and splice occupancy cards, and open the related wire when it exists)
> Confidence: 96% (scope is localized and uses existing occupancy/wire-selection primitives)
> Complexity: Low-Medium
> Theme: Analysis navigation ergonomics between occupancy and wire detail
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- In `Connectors analysis` and `Splices analysis`, users want a quick action to jump directly to the linked wire from an occupied slot.
- The requested UI change is explicit:
  - add a `Go to` button **before** `Release`,
  - only meaningful when a wire exists behind the occupancy reference.

# Context
Current behavior in occupancy cards:
- Connector side (`cavity-grid`): occupied cards show `Release`.
- Splice side (`cavity-grid` / ports): occupied cards show `Release`.

Occupancy values are stored as occupant references (ex: `wire:<wireId>:A|B`) and already parsed/displayed with shared helpers:
- `parseWireOccupantRef(...)`
- `formatOccupantRefForDisplay(...)`

The app already has wire navigation primitives (`onSelectWire`, wire sub-screen) that can be reused.

# Objective
- Add a `Go to` action before `Release` on occupied connector/splice slot cards.
- `Go to` should open/select the linked wire when resolvable.
- Keep `Release` semantics unchanged.

# Default decisions (V1)
- Button label: `Go to`.
- Position: first action button in occupied slot card action row, immediately before `Release`.
- Navigation behavior:
  - parse slot `occupantRef` via `parseWireOccupantRef(...)`,
  - if parsed wire exists, select/open that wire in analysis context,
  - and automatically switch to Analysis `Wire` sub-screen.
- Missing/unresolvable wire behavior:
  - `Go to` remains visible but disabled, while `Release` remains available.
  - no additional hint/tooltip is required in V1 beyond disabled state.
- Scope:
  - applies to connector cavity cards and splice port cards in analysis occupancy mode only,
  - does not apply to synthesis tables in V1.
- Button style:
  - reuse the same visual pattern as the existing Validation `Go to` action (icon + text, same affordance level).

# Functional scope
## A. Connector analysis occupancy cards (high priority)
- In occupied connector cavity cards:
  - add `Go to` before `Release`.
- On click:
  - resolve wire from cavity `occupantRef`,
  - if wire exists, navigate/select wire in analysis flow.
- Keep reserve/release validation and existing copy unchanged.

## B. Splice analysis occupancy cards (high priority)
- In occupied splice port cards:
  - add `Go to` before `Release`.
- On click:
  - resolve wire from port `occupantRef`,
  - if wire exists, navigate/select wire in analysis flow.
- Keep reserve/release behavior unchanged.

## C. Navigation and selection semantics (medium-high priority)
- Reuse existing wire-selection/navigation flow rather than introducing a new navigation mechanism.
- Ensure deterministic target behavior:
  - selected wire becomes the parsed wire,
  - analysis `Wire` sub-screen becomes active on success.
- No-op guard for stale occupancy references:
  - if parsed wire does not exist, do not crash; `Go to` is disabled and `Release` stays functional.

## D. UI consistency and accessibility (medium priority)
- `Go to` uses existing button style family (`button-with-icon` or current action style equivalent).
- Prefer the exact same style contract as Validation `Go to` for consistency.
- Keyboard activation and focus order remain coherent.
- Action order in occupied cards must be:
  1. `Go to`
  2. `Release`

# Non-functional requirements
- No regression to occupancy management (`Reserve`/`Release`) behavior.
- No new data-model changes required.
- Minimal UI churn outside the targeted analysis cards.

# Validation and regression safety
- Add/extend UI integration tests for:
  - connector occupancy card shows `Go to` before `Release` when wire exists,
  - splice occupancy card shows `Go to` before `Release` when wire exists,
  - clicking `Go to` selects/opens the expected wire and switches to Analysis `Wire`,
  - stale/unresolvable occupant reference keeps `Go to` disabled and does not break `Release`.
- Run quality/test matrix after implementation:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - `npm run -s quality:pwa`
  - `npm run -s test:ci`
  - `npm run -s test:e2e`

# Acceptance criteria
- AC1: In connector analysis occupancy cards, occupied slots show `Go to` before `Release`.
- AC2: In splice analysis occupancy cards, occupied slots show `Go to` before `Release`.
- AC3: `Go to` opens/selects the linked wire when the occupant reference resolves to an existing wire.
- AC4: If linked wire is missing/unresolvable, `Go to` is visible but disabled, the UI remains stable, and `Release` remains functional.
- AC4a: V1 disabled-state feedback is button-disabled only (no extra tooltip/hint copy required).
- AC5: Existing reserve/release workflows remain non-regressed.

# Out of scope
- Adding `Go to` actions in synthesis tables (outside occupancy cards) in this request.
- New occupant-reference formats or store-level schema changes.
- Reworking broader analysis navigation UX beyond this targeted shortcut.

# References
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.types.ts`
- `src/app/lib/app-utils-networking.ts`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
