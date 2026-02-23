## req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill - Wire Creation Endpoint Occupancy Validation and Next-Free Way/Port Prefill
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Complexity: Medium-High
> Theme: Wire Creation Ergonomics with Endpoint Occupancy Awareness and Smart Slot Prefill
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Indicate when a selected connector `way` or splice `port` is already occupied while creating a new wire.
- Provide a suggestion for the next available `way` / `port`.
- Use that suggestion as a prefill during new wire creation to reduce manual trial-and-error.
- Preserve existing wire validation and save behavior (no regressions in endpoint validation, routing, or occupancy consistency).

# Context
The wire creation form currently lets users choose endpoint types (`Connector way` / `Splice port`) and manually input `way`/`port` indices for endpoints A and B.

Today:
- occupancy consistency is validated at save/store/validation layers,
- but the form UX does not proactively indicate that a chosen `way` / `port` is already taken,
- and it does not prefill the next available endpoint slot when creating a new wire.

This creates friction during wire creation, especially in dense connectors/splices where users may repeatedly hit occupied slots.

## Implementation decisions (confirmed)
- The "suggest next" behavior is primarily for **new wire creation** and should be used as a **prefill** in create mode.
- The feature must include an occupancy-aware validator/indicator in the wire form so users can see when a chosen `way` / `port` is already taken before submit.
- Scope is the wire creation/edit form endpoint UX (A/B endpoints), not manual occupancy tools in connector/splice analysis panels.
- The behavior applies to **both endpoints A and B** with the same UX rules.
- Auto-prefill applies in **create mode only** (not wire edit mode).
- Occupancy indication should be available in create mode and edit mode; in edit mode, the current wire being edited must be excluded from occupancy checks to avoid false positives on its own endpoint(s).
- The form must **not auto-correct silently on submit**; it should indicate occupancy and suggest a next free slot, while save/store validation remains the final guard.
- Auto-prefill must not fight manual input: use endpoint-local "user touched index" guards and only repopulate automatically when endpoint type/target changes reset the context.

## Objectives
- Improve wire creation speed by pre-filling next available `way`/`port` values when endpoint target entity/type is selected in create mode.
- Surface endpoint occupancy conflicts in the wire form before submit.
- Reuse existing occupancy sources (`connectorCavityOccupancy`, `splicePortOccupancy`, and/or endpoint-derived occupancy logic) rather than duplicating rules.
- Keep create/edit behavior understandable and avoid surprising overwrites of manual user input.

## Functional Scope
### A. Wire-form endpoint occupancy awareness (high priority)
- Add form-level occupancy checks for wire endpoints A and B in the wire form.
- For each endpoint (`Connector way` or `Splice port`), indicate when the currently selected index is already occupied.
- Validation/indicator behavior should be visible before submit (inline help/error/warning near the affected endpoint input).
- The occupancy indicator should be consistent with current terminology:
  - connector `way` (`C{index}`)
  - splice `port` (`P{index}`)
- Occupancy indicator behavior applies in both create and edit modes.
- In edit mode, occupancy checks must exclude the currently edited wire endpoint assignments (no false-positive "occupied" warning caused by the wire itself).

### B. Next-free way/port suggestion and create-mode prefill (high priority)
- When creating a new wire (`wireFormMode === "create"`), prefill endpoint indices using the next available slot for the selected endpoint target:
  - connector endpoint -> next free `way`
  - splice endpoint -> next free `port`
- Trigger points (to confirm in implementation):
  - entering create mode (initial defaults if target already selected)
  - changing endpoint type (connector/splice)
  - selecting connector/splice for an endpoint
- Suggestion behavior requirements:
  - prefill should help the user without causing silent overwrites after manual editing
  - if all slots are occupied, show a clear message (e.g. no available `way`/`port`) and keep behavior safe
- Symmetry requirement:
  - endpoint A and endpoint B follow the same prefill/suggestion rules

### C. Manual input preservation / overwrite rules (high priority)
- Define and implement explicit rules so prefill does not fight the user while typing:
  - maintain endpoint-local flags (recommended): `endpointAIndexTouchedByUser` / `endpointBIndexTouchedByUser` (or equivalent)
  - only auto-prefill when entering create mode or when endpoint target/type changes **and** the endpoint index has not been manually edited in the current endpoint context
  - changing endpoint type or selected connector/splice resets the endpoint's touched flag (new context -> suggestion becomes relevant again)
  - if a user manually enters an occupied index, keep the value and show occupancy warning + suggestion rather than forcing a replacement
- Document the chosen behavior in implementation notes/tests.

### D. Edit-mode behavior compatibility (medium priority)
- Preserve current wire edit flow.
- No auto-prefill in edit mode (confirmed behavior).
- Occupancy indicator remains available in edit mode (with current-wire exclusion) to aid endpoint edits without changing existing form semantics.

### E. Shared helper(s) for next-free slot suggestion (medium-high priority)
- Introduce shared pure helper(s) (recommended) to compute next available connector `way` / splice `port` given:
  - selected connector/splice
  - capacity (`cavityCount` / `portCount`)
  - current occupancy map
  - optional exclusion for the current wire endpoint in edit mode (if implemented)
- Keep logic deterministic and unit-testable.
- Recommended helper responsibilities:
  - `isConnectorWayOccupied(...)`
  - `isSplicePortOccupied(...)`
  - `findNextAvailableConnectorWay(...)`
  - `findNextAvailableSplicePort(...)`

### F. Regression tests for wire endpoint occupancy UX and prefill (high priority)
- Add targeted tests covering:
  - create-mode prefill of next free connector `way`
  - create-mode prefill of next free splice `port`
  - occupied endpoint index indicator before submit
  - occupied endpoint indicator in edit mode with current-wire exclusion (no false positive on unchanged endpoint)
  - manual input preservation (no unwanted overwrite after user edit)
  - touched-flag reset behavior on endpoint type/target change (prefill becomes available again)
  - no-available-slot behavior messaging/safe handling
- Add/extend unit tests for pure helper(s) if introduced.

## Non-functional requirements
- Avoid regressions in wire save, route computation, and occupancy consistency logic.
- Keep occupancy checks performant and localized to the wire form UX (no heavy recomputation on every keystroke beyond reasonable form state).
- Reuse existing domain terminology and error messaging style where practical.
- Keep behavior deterministic and testable.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - wire form UI regression tests in relevant app UI specs
  - helper unit tests (if new next-free slot helper(s) are added)
  - `src/tests/store.reducer.entities.spec.ts` if occupancy/store interactions are adjusted
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: In wire creation form, endpoint A/B displays a user-visible indication when the selected connector `way` or splice `port` is already occupied.
- AC2: In wire creation mode, selecting a connector/splice for an endpoint pre-fills the endpoint index with the next available `way`/`port` when one exists.
- AC3: If no slot is available for the selected connector/splice, the form indicates that no `way`/`port` is available and behaves safely (no misleading prefill).
- AC4: Manual endpoint index edits are not silently overwritten during the same create session except under explicitly defined type/target-change rules.
- AC4a: Endpoint A and endpoint B follow the same prefill and overwrite-guard rules.
- AC5: Existing wire creation/edit submission behavior remains functional and occupancy consistency is not regressed.
- AC5a: In wire edit mode, occupancy indication excludes the current wire assignment to avoid false-positive occupied warnings on unchanged endpoints.
- AC6: Regression tests cover create-mode prefill, occupied-slot indication (create + edit exclusion path), and manual-input preservation behavior.

## Out of scope
- Automatic reassignment of endpoint index at submit time without user visibility.
- Changes to connector/splice manual occupancy management panels beyond what is required for wire form UX.
- Generalized slot-suggestion UX rollout to non-wire forms in this request.
- Connector/splice capacity model changes (`cavityCount` / `portCount` semantics).

# Backlog
- `logics/backlog/item_225_wire_form_endpoint_occupancy_indicator_for_connector_ways_and_splice_ports.md`
- `logics/backlog/item_226_wire_create_mode_next_free_way_port_prefill_with_manual_edit_guards.md`
- `logics/backlog/item_227_shared_next_free_endpoint_slot_helpers_for_wire_form_prefill.md`
- `logics/backlog/item_228_wire_endpoint_occupancy_and_prefill_regression_tests.md`
- `logics/backlog/item_229_req_037_wire_endpoint_prefill_and_occupancy_validation_closure_ci_build_and_ac_traceability.md`

# References
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/hooks/useEntityFormsState.ts`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/store/types.ts`
- `src/store/reducer/wireReducer.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/store.reducer.entities.spec.ts`
