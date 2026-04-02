# Changelog (`1.4.4 -> 1.5.0`)

## Major Highlights

- Modeling is faster for repeated work: create flows are more fluid, catalog selectors are easier to scan, and destructive batch operations are now explicit and keyboard-friendly.
- The 2D canvas now supports shift-click multi-selection and grouped movement, with follow-up fixes that keep unrelated layout state intact.
- Undo/redo, persistence, migration safety, and storage-failure surfacing were hardened substantially to make the app safer under real-world reload and recovery conditions.
- Internal controller, store, and pathfinding layers were refactored and covered more deeply, reducing fragility while keeping release behavior stable.

## Version 1.5.0 - Req_113 Delivery

### Persistence, Recovery, And Safety Hardening

- Local persistence now handles corrupted payloads, write failures, and quota issues more explicitly instead of failing silently.
- Migration coverage was expanded so older saved workspaces and malformed payloads are safer to load and diagnose.
- Recent runtime and storage safety improvements now surface clearer feedback when the persisted state needs recovery or cannot be written reliably.

### Performance, Architecture, And History Hardening

- Pathfinding and graph construction were hardened, including a min-heap-backed queue and selector-level performance improvements.
- Controller and reducer domains were split and tightened to reduce implicit coupling and improve testability.
- Undo/redo now supports a `Restore network viewport on undo/redo` preference so operators can choose whether history restores the canvas viewport.

## Version 1.5.0 - Req_114 To Req_117 Delivery

### Modeling Create Ergonomics

- Connector and splice catalog selectors now show the catalog name alongside the manufacturer reference for faster recognition.
- Modeling create forms gained a chained `New` action flow to speed up repeated entry work.
- Repeated creation and form-entry ergonomics were reinforced with targeted workflow coverage.

### Destructive Actions And Batch Delete

- Delete and cascade-delete dialogs now support `Enter` confirmation while still keeping `Cancel` visually focused on open.
- Modeling tables now expose an explicit `Select multiple` mode with checkboxes, `Select all visible`, a batch context panel, and one-operation batch deletion.
- Batch delete remains conservative: mixed selections that include blocked entities are refused rather than partially applied.

### 2D Canvas Multi-Selection And Group Move

- The 2D modeling canvas now supports `Shift+click` multi-selection on nodes.
- Dragging one selected node can move the full selected group while preserving relative offsets.
- Canvas multi-selection now has visible context and clear-selection affordances so grouped movement is easier to understand during use.

## Version 1.5.0 - Req_118 Post-Release Corrections

### Modeling UX Corrections

- The bottom `New` action was corrected so it appears only in the post-create edit state, not as a duplicated create-mode footer action.
- `Select multiple` was moved onto the same main action row as `New`, `Edit`, and `Delete`, and now includes an explicit icon.
- The desktop modeling action row was adjusted to keep the four primary actions on one line.

### Grouped Drag Persistence Fix

- Grouped drag on the canvas no longer drops persisted positions for unrelated nodes.
- Follow-up regression coverage now locks the localized grouped-move contract so grouped drag does not mutate unrelated parts of the plan.

## Validation and Regression Evidence

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- `npm run -s build`
- `npx playwright test`
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
