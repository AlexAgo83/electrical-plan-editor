# Changelog (`1.4.3 -> 1.4.4`)

## Major Highlights

- Recent-changes history labels are now readable and business-facing instead of opaque storage identifiers.
- Modeling dropdowns now sort dynamic options alphabetically by their visible label for faster selection.
- Wires now support assisted section recommendations from current, material, network voltage, and computed wire length.
- Blocked delete attempts now explain why they are blocked, and safe bounded connector/splice cascades are explicitly confirmable.

## Version 1.4.4 - Req_096 Delivery

### Recent Changes Readability

- Recent-changes history labels now prefer human-readable entity references instead of opaque storage identifiers.
- Connectors, splices, wires, catalog items, nodes, segments, and layout events resolve labels from business-facing refs such as `technicalId`, manufacturer reference, linked node names, or endpoint-derived topology text.
- Delete and update history entries preserve readable identity by using previous and next state context during label generation.

### Persistence And Restore Safety

- Existing persisted recent-changes entries remain loadable without migration.
- Newly generated readable labels restore correctly after reload while undo/redo stack semantics stay unchanged.

## Version 1.4.4 - Req_110 Delivery

### Assisted Wire Sizing

- Networks now support optional `Voltage (V)` metadata used by assisted wire sizing.
- Wires now support optional `Current (A)` and `Material`, with `Copper` as the default V1 material in forms.
- The wire form now shows `Recommended section: X mm²` directly below `Section (mm²)` with an explicit `Apply` action.

### Compatibility And Determinism

- Recommendation logic is centralized and normalizes to a locked standard wire-section set.
- Local persistence and network import/export now preserve `voltageV`, `currentA`, and `material`.
- Legacy workspaces and imports that lack the new fields remain loadable without fake default voltage write-back.

## Version 1.4.4 - Req_111 Delivery

### Modeling Dropdown Ordering

- Dynamic dropdowns in `Modeling` are now sorted alphabetically by the visible option label.
- The shared sort contract keeps deterministic tie-breaks and preserves selected missing fallback options at the top when needed.
- Static semantic selects keep their deliberate order and are not forced through the alphabetical policy.

## Version 1.4.4 - Req_112 Delivery

### Delete Feedback And Safe Cascade

- Blocked delete attempts now open a dedicated impact dialog instead of feeling like a silent no-op.
- The dialog summarizes dependency categories with counts and representative references for connectors, splices, nodes, segments, and catalog items.
- Safe cascade delete is now available only for bounded `connector` and `splice` cases where the exact impact set is limited to linked nodes, and the cascade remains one logical undo/redo step.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- `npm run -s build`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
