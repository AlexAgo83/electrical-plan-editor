## req_045_wire_cable_free_color_label_support_beyond_catalog_and_no_color_states - Wire/Cable Free Color Label Support Beyond Catalog and No-Color States
> From version: 0.8.1
> Understanding: 97%
> Confidence: 95%
> Complexity: Medium-High
> Theme: Flexible Cable Identification with Free-Form Color Labels While Preserving Canonical Color Catalog Flows
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Allow identifying a wire/cable with a **free color label** (user-entered text), not only:
  - `No color` (`null` color state), or
  - catalog-based mono/bi-color values (`primaryColorId` / `secondaryColorId`).
- Preserve the existing canonical wire color catalog workflow introduced by `req_039`.
- Keep wire color display usable in forms, tables, analysis, and callouts when a free color label is used.
- Maintain backward compatibility for existing saves/imports that only know catalog/no-color states.

# Context
`req_039` introduced a canonical wire color catalog with optional mono/bi-color support using stable 2-character color IDs. This is appropriate for most standardized cable identification, but some real projects need to identify a cable with a color description that is:
- not present in the canonical catalog,
- project/vendor-specific,
- temporary/legacy wording,
- or intentionally descriptive rather than palette-coded.

Today, users must choose between:
- no color, or
- a catalog color value.

This creates a gap for real-world identification workflows where a **free-form color label** is necessary for traceability, especially during modeling, analysis, and cross-referencing with external documentation.

## Implementation decisions (validated baseline)
- Preserve the canonical catalog model (`req_039`) and add a **free-text alternative**, not a replacement.
- Add a new optional wire field (recommended name): `freeColorLabel` (`string | null`).
- `freeColorLabel` is **mutually exclusive** with catalog color IDs:
  - if `freeColorLabel` is set (non-empty after trim), then `primaryColorId = null` and `secondaryColorId = null`
  - if catalog colors are set, then `freeColorLabel = null`
- Resulting valid color states:
  - no color
  - catalog mono-color
  - catalog bi-color
  - free color label
- Free color support is **label-only** in this request (no custom swatch hex input / no user-defined palette entry management / no color picker).
- UI should make the mode explicit (validated baseline: a `Color mode` or equivalent selector/toggle):
  - `No color`
  - `Catalog color`
  - `Free color`
- `freeColorLabel` should be trimmed and validated (validated baseline):
  - non-empty after trim when in free-color mode
  - max length limit: `32` characters
- Display strategy for free color labels:
  - show the label text visibly wherever wire color is surfaced
  - use a neutral marker/badge instead of a catalog swatch when no hex is available
  - no colored swatch is rendered for free-color mode
- Sorting/filtering behavior for wire color columns/views should handle free labels deterministically (text-based comparator/fallback).
- Backward compatibility baseline:
  - older data lacking `freeColorLabel` normalizes to `null`
  - existing catalog/no-color wires remain valid without migration breakage

## Objectives
- Add a third wire/cable color identification mode (`Free color`) while preserving `req_039` catalog and no-color behavior.
- Keep wire color UX understandable and explicit (avoid ambiguous mixed catalog/free states).
- Surface free color labels consistently in forms and read-only views where wire color is already displayed.
- Maintain deterministic persistence/import/export behavior and regression coverage.

## Functional Scope
### A. Wire domain model and invariants for free color labels (high priority)
- Extend `Wire` color metadata with `freeColorLabel` (nullable string).
- Enforce mutual exclusivity between `freeColorLabel` and catalog color IDs:
  - free label set => catalog IDs cleared
  - catalog colors set => free label cleared
- Preserve existing `req_039` invariants for mono/bi-color catalog mode.
- Normalize invalid mixed states safely in reducers/import normalization paths.

### B. Wire form UX: explicit color mode + free-color input (high priority)
- Update wire create/edit form to support selecting color mode:
  - `No color`
  - `Catalog color`
  - `Free color`
- In `Free color` mode:
  - show a text input for the free color label
  - hide/disable catalog color selectors
- In `Catalog color` mode:
  - preserve existing primary/secondary selectors and swatch behavior from `req_039`
  - hide/disable free-color input
- In `No color` mode:
  - clear catalog IDs and free color label
- Edit mode must load existing wires correctly for all valid color states.

### C. Wire color display/readability across tables/analysis/callouts (high priority)
- Wherever wire color is already displayed (table rows, analysis entries, callouts, inspectors), support free color labels without visual ambiguity.
- Requirements:
  - label text remains visible and readable
  - no crash or blank confusing state when `freeColorLabel` is set
  - catalog swatches continue to behave as before for catalog-based colors
- Free-color display baseline (validated):
  - neutral badge/tag plus the free label text (e.g. `Free: Beige/Brown mix`)
  - no colored swatch for free-color labels
  - reuse existing layout spacing where possible to minimize UI churn

### D. Sorting/filtering/search behavior with free color labels (medium-high priority)
- Any table/filter logic that currently reads catalog color display labels must also support `freeColorLabel`.
- Sorting requirements:
  - deterministic ordering for free-color labels
  - stable handling of empty/no-color vs catalog vs free label states
  - no runtime errors on mixed datasets
- Filtering/search requirements (where applicable):
  - free color labels should be searchable in the same user-facing places as catalog color labels

### E. Persistence/import/export compatibility (high priority)
- Update persistence and portability schemas/contracts to include `freeColorLabel`.
- Backward compatibility:
  - missing `freeColorLabel` in legacy data => `null`
  - legacy catalog/no-color wires remain unchanged and valid
- Forward compatibility / normalization:
  - invalid mixed states from imported data (catalog + free label) are normalized deterministically by prioritizing `freeColorLabel` and clearing catalog color IDs
- Export/portability should preserve the free color label as stored text when present.

### F. Regression tests for free color mode (high priority)
- Add/extend targeted tests covering:
  - wire reducer/model invariants for catalog vs free-color exclusivity
  - wire form mode switching and value clearing behavior
  - create/edit save flows for free color labels
  - display rendering paths for free color labels (table and/or analysis/callout where color is rendered)
  - persistence/import normalization for missing or mixed `freeColorLabel`
  - sorting/filter behavior on mixed no-color/catalog/free-color datasets (where applicable)

## Non-functional requirements
- Preserve clarity of the color UX (users should understand whether color comes from catalog or free text).
- Avoid introducing inconsistent storage states across reducer, form handlers, and import normalization.
- Keep UI changes minimal-risk by reusing existing wire color display primitives/layouts when possible.
- Maintain backward compatibility with existing saved/imported workspaces.

## Validation and regression safety
- Targeted tests (minimum, depending on touched surfaces):
  - store/reducer tests for wire color invariants
  - wire form UI tests (mode switching + save/edit flows)
  - persistence/import/portability tests
  - table/analysis rendering tests where wire color is displayed
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: Wire/cable color identification supports a new free-form mode via `freeColorLabel` (or equivalent finalized field) in addition to existing no-color and catalog mono/bi-color states.
- AC2: Wire create/edit UX exposes an explicit way to select/use `Free color` and enter a free color label.
- AC3: Free-color mode and catalog-color mode are mutually exclusive and normalized safely in store/form/import paths.
- AC4: Existing catalog mono/bi-color and no-color behaviors from `req_039` remain functional and non-regressed.
- AC5: Free color labels are displayed correctly in wire color display surfaces (at minimum in wire form witness/display and at least one read-only wire-identification surface already using wire color).
- AC6: Sorting/filter/search logic touching wire color fields handles mixed no-color/catalog/free-color datasets without runtime errors and with deterministic behavior.
- AC7: Legacy saves/imports lacking `freeColorLabel` load successfully with `freeColorLabel = null`.
- AC8: Regression tests cover the new free-color mode, exclusivity invariants, and compatibility normalization.

## Out of scope
- User-defined/custom color catalog management in Settings.
- Custom swatch hex/visual color picker for free color labels.
- Multi-part free color pattern modeling beyond a single free-form label (for example custom striped pattern metadata).
- Replacing canonical catalog IDs with free text across the app.

# Backlog
- `logics/backlog/item_282_wire_entity_free_color_label_and_color_mode_invariant_normalization.md`
- `logics/backlog/item_283_wire_form_explicit_color_mode_selector_and_free_color_label_input.md`
- `logics/backlog/item_284_wire_color_display_support_for_free_color_labels_in_tables_analysis_and_callouts.md`
- `logics/backlog/item_285_wire_free_color_label_persistence_import_export_compatibility_and_mixed_state_normalization.md`
- `logics/backlog/item_286_req_045_wire_cable_free_color_label_support_closure_ci_build_and_ac_traceability.md`

# References
- `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
- `logics/request/req_044_table_sortability_completion_analysis_nodes_segments_views_and_wire_connector_splice_table_analysis_enrichment.md`
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
