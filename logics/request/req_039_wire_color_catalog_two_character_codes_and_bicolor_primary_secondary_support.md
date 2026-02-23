## req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support - Wire Color Catalog (2-Character Codes) and Bi-Color Primary/Secondary Support
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Complexity: High
> Theme: Structured Wire Color Modeling with Canonical Palette and Bi-Color Support
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a wire color concept to cables/wires in the domain model.
- Model colors using a structured catalog with:
  - a stable 2-character code (used as color ID),
  - a human-readable label,
  - a color display code (e.g. hex) for UI swatches/indicators.
- Support single-color and bi-color wires using:
  - `primary` color
  - `secondary` color (optional / can be empty)
- Keep color rendering usable in UI via a visible color swatch/indicator.

# Context
The app currently models wire identity, endpoints, routing, and other attributes, but it does not model cable color in a structured way. A color system is useful for:
- wire identification in forms and tables,
- visual cues in modeling/analysis UIs,
- future export and documentation workflows.

The proposed approach is to store a **color reference** on the wire (via a compact 2-character ID) rather than duplicating color labels/hex values on every wire. This enables:
- stable storage and exports,
- consistent UI display,
- centralized palette maintenance,
- future support for bicolor combinations without inflating wire records with duplicated color metadata.

## Implementation decisions (recommended baseline)
- Introduce a canonical cable color catalog with entries like:
  - `id` (2-character code, e.g. `RD`, `BK`)
  - `label` (e.g. `Red`, `Black`)
  - `hex` (display swatch value)
- Canonical catalog v1 target size is `20` colors (sufficient variety without overcomplicating UX).
- Use the 2-character color code as the stable color identifier stored on wires.
- Add bi-color support directly in the wire model using:
  - `primaryColorId`
  - `secondaryColorId` (nullable/optional)
- Wire color is optional overall:
  - `primaryColorId` may be `null`
  - `secondaryColorId` may be `null`
- `secondaryColorId` may be empty (`null`) to represent a single-color wire.
- Valid color-state combinations:
  - no color: `primaryColorId = null`, `secondaryColorId = null`
  - single-color: `primaryColorId != null`, `secondaryColorId = null`
  - bi-color: `primaryColorId != null`, `secondaryColorId != null`
- Invalid combination to reject/normalize:
  - `primaryColorId = null`, `secondaryColorId != null`
- Duplicate bi-color combination (`primaryColorId === secondaryColorId`) should be normalized to single-color (`secondaryColorId = null`).
- Wire records should store color IDs only; labels/hex are resolved from the canonical catalog for display.
- Catalog should be app-defined/canonical (not user-editable in this request) to preserve portability and deterministic rendering.
- Catalog labels should use English names in v1 (`Red`, `Blue`, etc.), while keeping stable 2-character IDs as the canonical key.
- Backward compatibility for existing wires without color fields should normalize to no color (`primaryColorId: null`, `secondaryColorId: null`) unless a stronger product default is explicitly chosen later.
- New wire creation default color state should be `No color` (`primaryColorId: null`, `secondaryColorId: null`) unless a future request introduces a configurable default.

## Objectives
- Add a structured wire color model compatible with single-color and bi-color cable identification.
- Keep storage compact and portable using 2-character color IDs.
- Provide clear UI selection and swatch display for wire colors.
- Preserve compatibility for legacy saves/imports without wire color fields.
- Add regression coverage for model/form/persistence behavior.

## Functional Scope
### A. Canonical wire color catalog (high priority)
- Add a canonical cable color catalog module with a fixed palette (initial palette size can be defined during implementation; current design target can be ~20 entries).
- Each color entry must include:
  - `id`: 2-character code (stable key)
  - `label`: English display name (v1)
  - `hex`: swatch/display color
- Add lookup helpers/utilities (recommended) to resolve color metadata by ID.
- Validation requirements:
  - color IDs are unique
  - color IDs are exactly 2 characters and stable
  - labels and hex values are non-empty/valid for UI use

### B. Wire domain model: primary/secondary color references (high priority)
- Extend `Wire` with color reference fields:
  - `primaryColorId` (nullable; wire color is optional)
  - `secondaryColorId` (nullable/optional)
- Single-color wire behavior:
  - `primaryColorId` set
  - `secondaryColorId` empty
- Bi-color wire behavior:
  - both `primaryColorId` and `secondaryColorId` set
- No-color wire behavior:
  - `primaryColorId` empty
  - `secondaryColorId` empty
- Update wire save/upsert contracts and reducers to persist the new fields.
- Validate that non-null color IDs exist in the canonical catalog.
- Validate/normalize relational rule: `secondaryColorId` cannot be set when `primaryColorId` is empty.

### C. Wire form UI/handlers: color selection + bicolor support (high priority)
- Add wire color controls to the wire form (create + edit):
  - primary color selector (code + label + swatch, `None` option)
  - secondary color selector (optional, can be empty)
- UI requirements:
  - show color swatch/indicator for selected colors
  - make the secondary selector clearly optional
  - support no-color wires explicitly (`None` / `No color`)
  - disable secondary selector when primary color is empty (`None`)
  - preserve current wire form behavior for unrelated fields
- Create-mode baseline:
  - default to `No color` (`primaryColorId = null`, `secondaryColorId = null`)
- Edit mode:
  - load and allow editing existing color selections
- Validation:
  - invalid/unknown color IDs should be rejected or normalized safely before save
  - if `secondaryColorId` is set, it should be a valid catalog color ID
  - if `primaryColorId === secondaryColorId`, normalize to single-color (`secondaryColorId = null`) or reject with clear UX (normalization recommended and preferred for this request)
- Scope note:
  - this request requires wire form support; broader wire-table/inspector visualization is optional unless trivial

### D. Wire display swatch / indicator (medium-high priority)
- Add at least one visible color indicator path in wire UX (minimum required: form selection witness/swatch).
- Optional but recommended if low-risk:
  - show color swatch(s) in wire list/table rows and/or inspector
- For bi-color wires, define a simple display strategy (e.g. split swatch / dual chip / `primary + secondary` tokens).
- Ensure high-contrast rendering for very light/dark colors (border/outline strategy).
- For no-color wires, provide a neutral "No color" indicator (e.g. neutral swatch/badge).

### E. Persistence/import backward compatibility patch (high priority)
- Patch/migrate persistence and import normalization paths so legacy wires lacking color fields remain valid after feature rollout.
- Compatibility behavior baseline:
  - missing `primaryColorId` -> `null`
  - missing `secondaryColorId` -> `null`
- Legacy no-color wires remain valid and should not be backfilled with an invented default color.
- Requirements:
  - no runtime crashes due to missing wire color fields in old saves/imports
  - portability/import remains deterministic across machines because color metadata is resolved from canonical in-app catalog
- If schema version bump is required, follow existing migration/versioning conventions.

### F. Export/portability considerations (medium priority)
- Ensure exported/imported wire data preserves color references via IDs.
- Prefer storing color IDs on wires rather than denormalized labels/hex in exports, unless existing export format constraints require otherwise.
- If human-readable exports are enhanced, color labels may be derived from catalog without changing canonical stored IDs.

### G. Regression tests for wire color model + form + compatibility (high priority)
- Add targeted tests covering:
  - catalog lookup and color ID validation
  - wire save/upsert persists `primaryColorId` / `secondaryColorId`
  - wire form create/edit color selection behavior
  - secondary color optional/empty path
  - legacy save/import without wire color fields loads successfully with `null` color references
  - invalid color ID handling (if exposed via reducer/form normalization)
- Add/extend persistence/import tests where migrations are touched.

## Non-functional requirements
- Keep color IDs stable and portable across app versions (catalog entries should not be renamed casually once shipped).
- Preserve wire workflow performance and avoid heavy UI rendering overhead for swatches.
- Keep color handling deterministic and centralized (catalog-driven).
- Maintain backward compatibility for existing saved/imported data.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - wire form UI tests
  - store/reducer tests for wire contract updates
  - persistence/import compatibility tests
  - helper/unit tests for catalog lookups/validation
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: A canonical wire color catalog v1 exists with stable 2-character color IDs, English labels, and hex display codes (target palette size: 20).
- AC2: `Wire` entities support color references using `primaryColorId` and optional `secondaryColorId`.
- AC3: The wire form allows selecting a primary color and an optional secondary color (bicolor support) with visible swatch indicators, and defaults new wires to `No color`.
- AC4: Single-color wires are representable with `secondaryColorId` empty/null.
- AC4a: No-color wires are supported (`primaryColorId = null`, `secondaryColorId = null`) in model, form, and display.
- AC4b: Invalid color combinations where `secondaryColorId` is set but `primaryColorId` is empty are rejected or normalized safely, and duplicate bi-color pairs (`primary === secondary`) are normalized to mono-color or rejected safely.
- AC5: Wire save/edit flows persist valid wire color IDs and reject/handle invalid color IDs safely.
- AC6: Legacy saved/imported wires without color fields load/import successfully with `null` color references.
- AC7: Portability/import/export behavior remains deterministic by relying on canonical catalog-resolved color metadata.
- AC8: Regression tests cover catalog behavior, wire form color selection, persistence of color IDs, and legacy compatibility paths.

## Out of scope
- User-defined/custom color catalog editing in Settings.
- Advanced striping patterns beyond one optional secondary color (e.g. triple-color, patterned legends).
- Electrical validation rules derived from color (regulatory semantics).
- Full redesign of all wire displays to emphasize color across every screen.

# Backlog
- `logics/backlog/item_235_canonical_wire_color_catalog_with_two_character_codes_labels_and_hex_swatch_values.md`
- `logics/backlog/item_236_wire_entity_primary_secondary_color_ids_and_wire_save_reducer_contract_updates.md`
- `logics/backlog/item_237_wire_form_primary_secondary_color_selectors_with_swatch_indicators_and_optional_secondary.md`
- `logics/backlog/item_238_legacy_wire_color_backward_compat_patch_for_persistence_import_and_portability_paths.md`
- `logics/backlog/item_239_req_039_wire_color_catalog_bicolor_support_and_compatibility_closure_ci_build_and_ac_traceability.md`

# References
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
- `src/tests/app.ui.navigation-canvas.spec.tsx`
