## req_046_wire_free_color_mode_without_label_as_deliberate_unspecified_color_placeholder - Wire Free Color Mode Without Label as Deliberate Unspecified Color Placeholder
> From version: 0.8.1
> Understanding: 98%
> Confidence: 96%
> Complexity: Medium-High
> Theme: Distinguishing “No Color” from “Free Color (Unspecified)” in Wire/Cable Identification
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Allow `Free color` mode to be used **without entering a label**.
- Interpret `Free color` + empty label as:
  - color intentionally left free / unspecified,
  - to be decided later by whoever uses the plan.
- Preserve a clear distinction between:
  - `No color` (explicitly no color),
  - `Free color` with empty label (color left open),
  - `Free color` with label,
  - `Catalog color` (mono/bi-color).

# Context
`req_045` introduced `Free color` support via `freeColorLabel` and an explicit UI mode selector. However, the validated baseline in `req_045` required a non-empty label in `Free color` mode.

This blocks a real workflow:
- the designer wants to indicate that the cable color is **not fixed yet**
- the plan should preserve that intent
- the downstream user/technician can choose an actual color later

This is not equivalent to `No color`:
- `No color` means there is no color identification on purpose
- `Free color` (empty) means the color is intentionally left open/flexible

## Important design implication
With only `freeColorLabel` + catalog IDs, an empty free-color label collapses to the same storage shape as `No color` unless an explicit persisted mode is introduced.

To support this need safely, the model should persist an explicit wire color mode (recommended name examples):
- `colorMode: "none" | "catalog" | "free"`
or equivalent finalized field.

# Context (follow-up positioning)
This request is a **follow-up corrective extension** to `req_045` after implementation/usage feedback.
- `req_045` delivered free-color labels and explicit UI mode selection.
- `req_046` refines the semantics so `Free color` may be intentionally empty and remains distinguishable from `No color`.

## Implementation decisions (recommended baseline)
- Introduce a persisted explicit wire color mode field (recommended: `colorMode`) as source-of-truth for semantic intent.
- Keep `freeColorLabel` optional in `Free color` mode:
  - `Free color` + label => free color annotated
  - `Free color` + empty label => free color unspecified (valid state)
- Preserve existing catalog color invariants from `req_039` / `req_045`.
- Mode semantics (recommended baseline):
  - `none`: no catalog colors, no free label (explicit no color)
  - `catalog`: catalog colors allowed, free label cleared
  - `free`: catalog colors cleared, free label optional
- `freeColorLabel` trimming rules still apply when provided:
  - trim whitespace
  - max length remains `32`
  - empty-after-trim is valid **only** when `colorMode === "free"`
- UI should continue to expose explicit `Color mode` and no longer block save when `Free color` label is empty.
- Display semantics for `Free color` empty:
  - show a clear neutral label (examples: `Free color`, `Free color (unspecified)`, `Couleur libre`)
  - do not render a colored swatch
- Sorting/filtering/search behavior must remain deterministic and should distinguish:
  - `No color`
  - `Free color` (unspecified)
  - `Free color: <label>`
  - catalog colors
- Backward compatibility / migration:
  - existing `req_045` data (without persisted mode) must normalize deterministically
  - legacy no-color and catalog wires remain valid

## Objectives
- Support “free color left unspecified” as a first-class, persisted semantic state.
- Preserve user intent across save/load/import/export and not collapse it into `No color`.
- Keep UI clarity and avoid ambiguity between “no color” and “free color not yet specified”.
- Minimize regressions by building on `req_045` flows and tests.

## Functional Scope
### A. Wire color model upgrade with explicit persisted mode (high priority)
- Add a persisted wire color mode field (finalized name to be decided during implementation).
- Normalize wire color state using explicit mode as source-of-truth.
- Preserve valid states:
  - no color
  - catalog mono-color
  - catalog bi-color
  - free color unspecified
  - free color with label
- Enforce invalid-state normalization:
  - `catalog` mode clears free label
  - `free` mode clears catalog colors
  - `none` mode clears catalog colors and free label

### B. Wire form UX update: free mode label becomes optional (high priority)
- In `Free color` mode:
  - free-color text input remains available
  - empty label is allowed (save must succeed)
- Replace validation copy that currently requires a label in free mode.
- Add clear UI cue that empty free mode means “left free / unspecified”.
- Preserve mode-switch clearing behavior introduced by `req_045`.

### C. Read-only display semantics for free unspecified color (high priority)
- Update read-only surfaces (tables, analysis, inspector, callouts where applicable) to distinguish:
  - `No color`
  - `Free color` (unspecified)
  - `Free color: <label>`
- Use neutral badge/tag for free mode in both empty and labeled cases.
- Keep existing catalog swatches for catalog mode unchanged.

### D. Sorting/filtering/search behavior refinement (medium-high priority)
- Update color sort keys / search text / CSV-export representations to distinguish free unspecified from no-color.
- Ensure deterministic ordering for mixed datasets across:
  - no color
  - free unspecified
  - free labeled
  - catalog colors
- Ensure free unspecified entries are discoverable with meaningful terms (e.g. `free`).

### E. Persistence/import/export migration and compatibility (high priority)
- Add persisted mode field to storage and portability contracts.
- Migrate/normalize data produced by `req_045` implementation (where mode may be implicit):
  - infer mode from stored fields when explicit mode is absent
  - document inference rules
- Normalize imported mixed/invalid states deterministically using explicit mode semantics.
- Preserve existing compatibility guarantees for `req_039` / `req_045` data.

### F. Regression tests for semantic distinction (high priority)
- Add/extend tests covering:
  - `Free color` empty label save/load behavior
  - distinction between `No color` and `Free color` empty in reducer and persistence/import
  - form UX copy/validation changes
  - read-only rendering labels for free unspecified vs no-color
  - sorting/filter/search behavior on mixed datasets including free unspecified

## Non-functional requirements
- Preserve semantic clarity in storage and UI (no accidental collapsing of states).
- Keep migration behavior deterministic and documented.
- Minimize churn by reusing `req_045` components/helpers where possible.
- Maintain backward compatibility for existing saved/imported workspaces.

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/store.reducer.entities.spec.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/app.ui.wire-free-color-mode.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - `npm run -s test:ci`
  - `npm run -s build`

## Acceptance criteria
- AC1: `Free color` mode can be saved with an empty label and remains a valid distinct state.
- AC2: The app persists a wire color mode (or equivalent explicit semantic marker) so `No color` and `Free color` empty are distinguishable after save/load/import/export.
- AC3: Wire create/edit UX no longer blocks save for empty free-color labels and communicates the “free/unspecified” meaning clearly.
- AC4: Read-only wire color displays distinguish `No color` from `Free color` unspecified and from `Free color` labeled.
- AC5: Sorting/filter/search logic for wire colors remains deterministic and supports free unspecified entries.
- AC6: Existing catalog/no-color behavior from `req_039` and free-color labeled behavior from `req_045` remain functional and non-regressed.
- AC7: Existing data without explicit persisted color mode is normalized/migrated deterministically.
- AC8: Regression tests cover the semantic distinction and compatibility/migration behavior.

## Out of scope
- User-defined custom color catalogs or color pickers.
- Regulatory/electrical semantics derived from “free color”.
- Reworking all color-related UI copy across the whole app beyond touched wire color surfaces.

# Backlog
- `logics/backlog/item_287_wire_color_mode_persisted_semantic_state_for_none_catalog_and_free.md`
- `logics/backlog/item_288_wire_form_free_color_optional_empty_label_and_unspecified_copy.md`
- `logics/backlog/item_289_wire_color_display_sort_filter_and_export_semantics_for_free_unspecified_vs_no_color.md`
- `logics/backlog/item_290_wire_color_mode_persistence_import_export_migration_from_req_045_implicit_state.md`
- `logics/backlog/item_291_req_046_free_color_unspecified_semantics_closure_ci_build_and_ac_traceability.md`

# References
- `logics/request/req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states.md`
- `logics/tasks/task_046_req_045_wire_cable_free_color_label_support_orchestration_and_delivery_control.md`
- `src/core/cableColors.ts`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/lib/wireColorPresentation.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.wire-free-color-mode.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
