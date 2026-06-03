# Changelog (`1.13.1 -> 1.14.0`)

## Major Highlights

- Introduced a first-class **pin electrical role** model at the connector cavity level: a pin can now be declared `source`, `consumer`, `passive`, or `bidirectional`, with an optional maximum continuous current in Amps, a label, and free-form notes. Default role is `passive`; every field is optional.
- Shipped two pure aggregation engines on top of that model — an in-network engine and an assembly-scoped engine traversing `InterHarnessConnectorLink`s and shared master connector references — feeding the validation center, BOM, schematic overlay, and the upcoming multi-network functional analysis view.
- Added a new **Electrical dimensioning** validation category covering D1 wire section vs. carried current, D2 fuse rating vs. protected load, D3 device supply vs. output sum, and D4 branch source/consumer coherence — all bounded to the current network and emitted with explicit severity ladders.
- Surfaced the new data model in the connector inspector and the catalog item editor with a collapsible "Pin electrical roles" section: per-pin role / currentA / label edits, an override / catalog / default badge, bulk "Apply role to selected pins", and "Reset to catalog default".
- Persistence is fully additive: networks without `pinElectricalRoles` load, render, validate, and export identically to 1.13.x.

## Version 1.14.0 - Pin Electrical Roles, Aggregation Engines, and Electrical Dimensioning Diagnostics

### Logics planning (req_133)

- Promoted request `req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics` with companion product brief `docs/pin-level-source-consumer-currents-product-brief.md`.
- Added eight backlog items (`item_608` through `item_615`) and eight tasks (`task_116` through `task_123`).
- Added ADR `adr_010_inter_network_current_bridge_semantics` covering inter-network propagation rules and loop safety.

### Data model (item_608, task_116)

- New `PinElectricalRoleKind` (`source` / `consumer` / `passive` / `bidirectional`) and `PinElectricalRole` interface (`role`, optional `currentA`, `label`, `notes`).
- `Connector.pinElectricalRoles?: Record<number, PinElectricalRole>` and `CatalogItem.connectorDefaults.pinElectricalRoles?` are additive, optional, and non-breaking.
- `connector/upsert` and `catalog/upsert` normalize the field through the shared `normalizePinElectricalRolesMap` helper: out-of-range cavity indexes and invalid payloads are dropped silently; empty maps collapse to `undefined`.

### Resolution and ampacity (item_608, item_609, task_117)

- `src/core/pinElectricalRole.ts` exposes `PIN_ELECTRICAL_ROLE_KINDS`, `resolvePinElectricalRoleDescriptor`, and `resolvePinElectricalRole` with the override / catalog / default precedence.
- `src/core/wireAmpacity.ts` ships the automotive copper ampacity table per `STANDARD_WIRE_SECTION_MM2_VALUES` (0.5 mm² → 11 A, 0.75 → 15, 1 → 19, 1.5 → 24, 2.5 → 32, 4 → 42, 6 → 54, 10 → 73, 16 → 98, 25 → 129, 35 → 158, 50 → 198, 70 → 245, 95 → 292, 120 → 344), scaled by the existing material-resistivity ratio for aluminum, and exposes a project-level override API via `Network.ampacityOverrides`.

### Aggregation engines (item_610, item_614, task_118, task_122)

- `src/core/pinElectricalLoad.ts` aggregates per `(connectorId, cavityIndex)` the resolved `PinElectricalRole`, branch loads per wire (Kirchhoff-conserving across splices and fuse-box pairs), per-device source / consumer totals, and fuse-protected loads.
- `src/core/pinElectricalLoadAssembly.ts` runs the same aggregation in `assembly` scope: traverses `InterHarnessConnectorLink`s and shared master connector references inside the active `HarnessAssembly`, with cycle-safe traversal and a single warning on non-convergent loops.
- Bidirectional pins contribute to both totals but are excluded from "no source on branch" detection.

### Validation (item_611, task_119)

- New **Electrical dimensioning** category emitted by `src/app/hook-impl/validation/appendElectricalDimensioningIssues.ts`, wired into `buildValidationIssues` for the active network only:
  - **D1** — wire section vs. carried current: `error` when ratio > 1.0, `warning` when > 0.9, `info` between 0.8 and 0.9.
  - **D2** — fuse rating vs. protected load: `error` over rating, `warning` at 80–100 %, `warning` when rating missing while protected load is non-zero.
  - **D3** — device supply vs. output sum: `warning`, non-blocking; quotes the required vs. declared values.
  - **D4** — branch source / consumer coherence: `info` when no source on a fed branch, `warning` when two sources face each other.
- Validation, inspector and BOM consumers stay in `currentNetwork` scope; linked pins from sibling networks never contribute to D1–D4.

### Editing surfaces (item_612, task_120 — partial)

- Connector inspector form: new collapsible **Pin electrical roles** section under `PinElectricalRolesEditor.tsx`, with per-pin role dropdown, optional max current input, label input, an override / catalog / default badge, and bulk "Apply role to selected pins" plus "Reset to catalog default". State is hoisted through `useEntityFormsState`, `useConnectorHandlers`, the modeling orchestrator and the screen-domain controllers; one save per bulk operation lands as a single history entry.
- Catalog item editor: same table for `CatalogItem.connectorDefaults.pinElectricalRoles`. Saving propagates the new defaults to every consuming connector through the existing merge logic.
- Drafts, serialization, and validation helpers live in `src/app/hooks/connectorPinElectricalRoles.ts`.

### Tests

- Core: `core.pin-electrical-role`, `core.wire-ampacity`, `core.pin-electrical-load`, `core.pin-electrical-load-assembly` (49 tests including the linear chain, splice fan-out, fuse-box pair, ECU asymmetric device, two-network link, three-network harness assembly, and loop fixtures).
- Validation: `app.validation.electrical-dimensioning` (9 tests covering D1–D4 emission and severity ladders, including the AC6–AC10 fixtures).
- UI: `app.ui.inspector-pin-roles` (single edit, override / catalog / default badge, bulk apply, reset to catalog default) and `app.ui.catalog-pin-roles` (catalog defaults editing).

### Deferred to next release

The remainder of req_133 is scoped to follow-up work and explicitly out of 1.14.0:

- Cross-connector mass-edit view with filters and CSV paste (`item_612` AC5–AC7).
- BOM "Computed downstream load (A)" column on fuse rows (`item_612` AC9, off by default).
- 2D-canvas regression assertion (`item_612` AC10).
- Functional schematic overlay, on by default (`item_613`, `task_121`).
- Multi-network functional analysis view (`item_614` view, `task_122` view, plus L1 link-mismatch warning).
- Release validation and permissiveness gate (`item_615`, `task_123`).

### Verification

- `npm run typecheck`
- `npm run lint`
- `npx vitest run src/tests/core.pin-electrical-role.spec.ts src/tests/core.wire-ampacity.spec.ts src/tests/core.pin-electrical-load.spec.ts src/tests/core.pin-electrical-load-assembly.spec.ts src/tests/app.validation.electrical-dimensioning.spec.ts src/tests/app.ui.inspector-pin-roles.spec.tsx src/tests/app.ui.catalog-pin-roles.spec.tsx` (7 files, 54 tests passed)
