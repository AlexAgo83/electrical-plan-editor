## req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth - Wire List Filter Bar: Field Selector and Full-Width Input Without Panel Growth
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Complexity: Medium
> Theme: Wire List Filtering UX Upgrade with Field-Scoped Search and Responsive Layout Stability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve the `Wires` filter UI so the text input uses all available width **without enlarging the panel**.
- Rename the current label `Endpoint filter` to `Filter`.
- Add a field selector between the label and the text input to choose what the filter applies to.
- Make this filter-bar pattern reusable and applicable to other panels that contain tables (not only `Wires`).
- Include `Network Scope` as an explicit target for this filtering UX pattern (not just a future possibility).

# Context
The `Wires` panels (Modeling and Analysis) currently expose a text field labeled `Endpoint filter`, which filters based on endpoint-related text. The current UX is functional but limited:
- the label becomes inaccurate if filtering expands beyond endpoints,
- the text field does not fully communicate filter scope,
- the filter row can be improved to use horizontal space more efficiently without changing panel width.

The codebase already appears to contain both:
- an endpoint-specific filter query in UI flows (`wireEndpointFilterQuery`),
- and a more general wire search query state in list modeling (`wireSearchQuery`),
which suggests a good opportunity to unify/clarify the filtering UX.

There is also a broader UX goal: standardize this filter-bar pattern across table-based panels (not just `Wires`) so users encounter consistent filtering controls (`Filter` label + field selector + full-width input) throughout the workspace. `Network Scope` is now explicitly in-scope as a target for the shared pattern rollout.

## Implementation decisions (recommended baseline)
- Apply the UX upgrade to both `Wires` panels:
  - Modeling (`ModelingSecondaryTables`)
  - Analysis (`AnalysisWireWorkspacePanels`)
- Include `Network Scope` in the same request scope as a prioritized non-wire adoption target.
- Treat the `Wires` implementation as the pilot/baseline pattern for a broader rollout to other table-based panels.
- Replace label `Endpoint filter` with `Filter`.
- Add a field selector between the label and the text input in the filter row.
- Keep panel dimensions unchanged; improve only the **internal layout** of the filter row.
- Make the text input consume remaining horizontal space (responsive full-width within available row space).
- Preserve current endpoint-filter behavior as the default selected filter field for backward UX compatibility.
- Prefer a reusable UI/layout pattern (and shared logic where practical) so the same filter-bar UX can be adopted by other table panels with minimal duplication.

## Broader rollout prioritization (recommended)
- Priority scope in this request:
  - `Wires` (Modeling + Analysis)
  - `Network Scope`
- Recommended next wave (follow-up or optional if implementation capacity allows):
  - Modeling tables: `Connectors`, `Splices`, `Nodes`, `Segments`
- Lower priority / separate handling:
  - `Validation` issue lists (often has specialized filters already)
  - non-tabular screens/panels (`Home`, `Settings`, etc.)

## Recommended filter field selector options (baseline)
- `Endpoints` (default; preserves current behavior)
- `Wire name`
- `Technical ID`
- Optional (if trivial and low-risk in implementation): `Any`

## Objectives
- Make wire filtering clearer by explicitly showing the active filter target.
- Improve horizontal space usage in the filter row without changing panel width.
- Preserve current filter behavior by default while enabling more flexible filtering.
- Keep Modeling and Analysis wire panels consistent.
- Establish a reusable filter-bar UX pattern that can be rolled out to other table-based panels.
- Apply the pattern to `Network Scope` as an early second target to validate reusability beyond `Wires`.

## Functional Scope
### A. Wire filter row layout update (high priority)
- Update the filter row layout in both wire panels so the row supports:
  - `Filter` label
  - field selector (`select`)
  - text input
- The text input must expand to the remaining row width without increasing the panel width.
- Responsive behavior requirements:
  - no panel growth caused by the new selector
  - input remains usable at smaller widths
  - layout degrades gracefully if space becomes constrained
- Recommended CSS/layout strategy:
  - flex row or grid row
  - input configured to grow/shrink correctly (`flex: 1`, `min-width: 0` or equivalent)

### B. Label and wording update (high priority)
- Replace `Endpoint filter` label text with `Filter`.
- Update placeholders as needed to reflect selected field:
  - endpoint mode placeholder can remain `Connector/Splice or ID`
  - other modes should use mode-appropriate placeholder text
- If dynamic placeholder behavior is implemented, ensure it is consistent across Modeling and Analysis panels.

### C. Field selector behavior and filtering logic (high priority)
- Add a field selector for wire filtering with baseline options:
  - `Endpoints` (default)
  - `Wire name`
  - `Technical ID`
- Filtering behavior must follow the selected field.
- Preserve current endpoint filtering behavior when `Endpoints` is selected.
- Reuse existing wire list model/search state where practical rather than duplicating logic.
- If an `Any` option is added:
  - define which fields are included
  - keep behavior deterministic and documented

### D. State model alignment and compatibility (medium-high priority)
- Align wire filter state between UI and list model logic:
  - avoid redundant competing query states for the same visible input if possible
  - preserve current behavior on first load (default to endpoint filtering)
- Ensure both Modeling and Analysis screens share consistent filter state semantics where intended by current architecture.
- Avoid regressions in existing route-mode filtering and sorting controls.

### E. Regression tests (high priority)
- Add targeted tests covering:
  - label changed to `Filter`
  - field selector is rendered between label and input
  - default field selector value preserves endpoint filtering behavior
  - filtering by `Wire name` works
  - filtering by `Technical ID` works
  - layout behavior does not regress basic usability (at least render/interaction smoke in both panels)
- If `Any` mode is added, include tests for its matching behavior.

### F. Reusable pattern / broader rollout readiness (medium priority)
- Define the filter-bar pattern in a way that is reusable for other panels with tables:
  - shared styling/layout utility and/or component (recommended)
  - predictable prop/state contract for field selector + query input
- This request baseline requires wire panels delivery.
- This request baseline requires:
  - wire panels delivery
  - `Network Scope` adoption (or a documented reason why it must be deferred)
- Additional rollout beyond `Wires` + `Network Scope` is optional unless explicitly included during implementation, but the implementation should avoid wire-only hardcoding that blocks generalization.
- If other table panels are included in the same implementation pass, document:
  - which panels were upgraded
  - any entity-specific field-selector options
  - any exceptions to the shared pattern

### G. Panel-specific filter option sets (medium priority)
- Allow field-selector options to vary by panel/entity (recommended), rather than forcing one global option set.
- Minimum expectations:
  - `Wires`: `Endpoints` (default), `Wire name`, `Technical ID` (optional `Any`)
  - `Network Scope`: panel-appropriate fields (recommended examples: `Name`, `Technical ID`, `Description`, optional `Any`) depending on the actual table/row data exposed
- If a shared component is introduced, it should support panel-specific option configuration.

## Non-functional requirements
- Do not increase the width of the wire panel as part of this change.
- Keep Modeling and Analysis wire filter UX visually and behaviorally consistent.
- Design the filter-bar implementation so it can be reused across other table-based panels with low duplication.
- Support panel-specific field options without forking layout/interaction behavior.
- Preserve accessibility of filter controls (labeling, keyboard navigation, focus behavior).
- Keep filtering behavior performant and deterministic.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - wire panel UI/integration tests (`Modeling` and/or `Analysis`)
  - list-model filtering tests if filter logic is extracted/changed materially
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: In both Modeling and Analysis `Wires` panels, the filter label is `Filter`.
- AC2: A field selector is displayed between the label and the text input in the wire filter row.
- AC3: The text input expands to use the available width in the row without increasing panel width.
- AC4: `Endpoints` remains the default filter target and preserves current endpoint filter behavior.
- AC5: Users can switch filtering to at least `Wire name` and `Technical ID`, and filtering behaves accordingly.
- AC6: Existing wire route-mode filters, sorting, and wire list interactions remain functional.
- AC7: Regression tests cover label/selector rendering and field-specific filter behavior.
- AC8: The implemented filter-bar pattern is reusable/extensible for other table-based panels (shared layout/component or equivalent low-duplication approach), and any broader rollout completed in the same change is documented.
- AC9: `Network Scope` adopts the same filter-bar pattern (label + field selector + full-width input) with panel-appropriate filter fields, or the implementation documents a concrete defer rationale.

## Out of scope
- Mandatory full rollout to every table-based panel in one implementation pass (recommended as follow-up after the wire pilot, unless explicitly included).
- Advanced query syntax (AND/OR expressions, regex, fuzzy search operators).
- Multi-field filtering with multiple simultaneous text inputs.

# Backlog
- `logics/backlog/item_250_wire_panels_filter_row_layout_full_width_input_without_panel_growth.md`
- `logics/backlog/item_251_wire_filter_field_selector_state_and_field_specific_filtering_logic.md`
- `logics/backlog/item_252_network_scope_filter_bar_adoption_with_panel_specific_field_options.md`
- `logics/backlog/item_253_filter_bar_regression_tests_for_wire_and_network_scope_panels.md`
- `logics/backlog/item_254_req_042_wire_filter_bar_field_selector_and_layout_closure_ci_build_and_ac_traceability.md`

# References
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/hooks/useEntityListModel.ts`
- `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
- `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
- `src/app/components/workspace/AnalysisWorkspaceContent.types.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
