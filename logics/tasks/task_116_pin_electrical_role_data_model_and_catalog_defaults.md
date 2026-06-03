## task_116_pin_electrical_role_data_model_and_catalog_defaults - Pin electrical role data model and catalog defaults

> From version: 1.13.1
> Schema version: 1.0
> Status: Ready
> Understanding: 80%
> Confidence: 80%
> Progress: 0%
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] `Connector.pinElectricalRoles?: Record<number, PinElectricalRole>` and `CatalogItem.connectorDefaults.pinElectricalRoles?` declared in `src/core/entities.ts`, additive and optional.
- [ ] `PinElectricalRole` fields: `role` (`"source" | "consumer" | "passive" | "bidirectional"`, default `passive`), `currentA?` (non-negative finite number), `label?`, `notes?`. No mode / duty / peak / RMS field.
- [ ] New helper module `src/core/pinElectricalRole.ts` exposing `normalizePinElectricalRole`, `normalizePinElectricalRolesMap`, and `resolvePinElectricalRole(connector, catalogItem, cavityIndex)`.
- [ ] Per-pin merge precedence: per-connector override wins for each declared field; absent fields fall back to the catalog default; absent on both sides resolves to `{ role: "passive" }`.
- [ ] Normalization rejects negative / non-finite `currentA` and entries whose cavity index is out of the connector's `cavityCount`. Rejected entries are dropped at persistence and surfaced through the existing import warning channel.
- [ ] Persistence round-trip: `localStorage` save/load and network file export/import preserve `pinElectricalRoles` exactly. No `schemaVersion` bump.
- [ ] No new validation issue is emitted by this task (diagnostics are deferred to `item_611`).
- [ ] No UI surface is introduced (editing surfaces are deferred to `item_612`).
- [ ] Tests cover: type defaults, normalization (valid / negative / NaN / out-of-range), merge precedence (override wins, catalog falls back, both absent), persistence round-trip, import warning for out-of-range entries, and a fixture-based regression asserting `src/store/sampleNetwork.ts` is unchanged.
- [ ] Validation suite passes (`npm run -s lint`, `npm run -s typecheck`, focused vitest, `npm run ci:blocking`).

# Backlog
- `item_608_pin_electrical_role_data_model_and_catalog_defaults`

```mermaid
%% logics-kind: task
flowchart LR
    Types[entities.ts adds PinElectricalRole + connector/catalog fields] --> Normalize[pinElectricalRole.ts normalization]
    Normalize --> Merge[resolvePinElectricalRole catalog merge]
    Merge --> Persistence[Store hydration + portability round-trip]
    Persistence --> Tests[Unit + persistence + import-warning tests]
```

# Acceptance criteria
- AC1: `Connector.pinElectricalRoles` and `CatalogItem.connectorDefaults.pinElectricalRoles` are optional; loading a payload without them leaves the entity byte-for-byte equivalent after a round-trip.
- AC2: A `PinElectricalRole` with `role` only is valid; default magnitude resolves to `undefined` (unknown).
- AC3: A `PinElectricalRole` with negative or non-finite `currentA` is rejected at normalization and dropped from persistence; the offending entry is surfaced through the existing import warning channel.
- AC4: A cavity index larger than the connector's `cavityCount` or smaller than 1 is dropped at normalization with a warning.
- AC5: `resolvePinElectricalRole(connector, catalogItem, cavityIndex)` returns the per-connector override when present; otherwise the catalog default; otherwise `{ role: "passive" }`.
- AC6: Per-pin merge is field-level: an override with only `role` set inherits `currentA` and `label` from the catalog default for that cavity.
- AC7: Save / load cycle through `localStorage` preserves `pinElectricalRoles` for every connector and every catalog item.
- AC8: Network file export / import round-trip preserves `pinElectricalRoles` without any `schemaVersion` change.
- AC9: `sampleNetwork.ts`, `sampleNetworkAdditionalDemos.ts`, and `sampleNetworkAdvancedDemos.ts` load unchanged (no new field appears on serialized output).
- AC10: Tests cover AC1–AC9.

# Implementation Plan

## Step 1 — Types and constants
- File: `src/core/entities.ts`.
- Add the `PinElectricalRole` interface and the `PinElectricalRoleKind` union:
  ```ts
  export type PinElectricalRoleKind = "source" | "consumer" | "passive" | "bidirectional";

  export interface PinElectricalRole {
    role: PinElectricalRoleKind;
    currentA?: number;
    label?: string;
    notes?: string;
  }
  ```
- Extend `Connector` with `pinElectricalRoles?: Record<number, PinElectricalRole>`.
- Extend `ConnectorCatalogDefaults` with `pinElectricalRoles?: Record<number, PinElectricalRole>`.
- Re-export from `src/core/index.ts`.

## Step 2 — Normalization helper
- File: `src/core/pinElectricalRole.ts` (new).
- Public functions:
  - `normalizePinElectricalRole(value: unknown): PinElectricalRole | undefined` — rejects invalid `role`, negative or non-finite `currentA`, and non-string `label` / `notes`.
  - `normalizePinElectricalRolesMap(value: unknown, options: { cavityCount?: number }): { value: Record<number, PinElectricalRole>; warnings: string[] }` — drops out-of-range cavities and returns warnings for each drop.
  - `resolvePinElectricalRole(connector: Connector, catalogItem: CatalogItem | undefined, cavityIndex: number): PinElectricalRole` — applies the per-pin merge with field-level fallback to the catalog defaults, and falls back to `{ role: "passive" }` when both are absent.
- Keep the helper free of store dependencies; mirror `wireSizing.ts` conventions.

## Step 3 — Persistence hydration
- File: `src/adapters/persistence/migrations.ts` (or the active hydration helpers).
- Call `normalizePinElectricalRolesMap` when hydrating each connector and each catalog item. Pass `cavityCount` from the surrounding entity to enable the out-of-range drop.
- Collect normalization warnings into the existing hydration warning channel so they reach the import-warnings UI without introducing a new surface.
- No `schemaVersion` bump. The field is additive and tolerated by older builds via existing additive-field policy.

## Step 4 — Portability round-trip
- File: `src/adapters/portability/networkFile.ts`.
- Ensure the export serializer includes `pinElectricalRoles` on connectors and catalog defaults when present, and omits the field when absent.
- Ensure the import parser calls the normalization helper and surfaces drops through the import warnings path.
- No change to the schema version.

## Step 5 — Tests
- New: `src/tests/core.pin-electrical-role.spec.ts` — normalization (valid, negative, NaN, missing role, unknown role), `resolvePinElectricalRole` merge precedence (override wins, catalog falls back, both absent, field-level merge).
- New: `src/tests/persistence.pin-electrical-role.spec.ts` — local-storage save/load round-trip; export/import round-trip; out-of-range warning surfaced.
- Update: a regression test asserting `sampleNetwork.ts` serializes identically after the type additions (no spurious `pinElectricalRoles: {}` keys).
- Update: the existing import-warning UI test to cover an out-of-range cavity entry (smoke check; no UI for editing yet).

# Validation
- `python3 -m logics_manager lint --require-status`
- `npm run -s lint`
- `npm run -s typecheck`
- Focused vitest scope:
  - `npx vitest run src/tests/core.pin-electrical-role.spec.ts`
  - `npx vitest run src/tests/persistence.pin-electrical-role.spec.ts`
  - `npx vitest run src/tests/portability.network-file.spec.ts` (regression of the round-trip)
- Full pipeline before close: `npm run ci:blocking`
- `python3 -m logics_manager flow finish task task_116_pin_electrical_role_data_model_and_catalog_defaults.md` after implementation.

# Report
- TBD on completion.

# AI Context
- Summary: Implement the pin-level electrical role data model — types, normalization, catalog merge, persistence round-trip — without diagnostics, UI, or aggregation. Foundation for `req_133`.
- Keywords: task, pin role, source, consumer, passive, bidirectional, currentA, catalog defaults, merge, normalization, persistence round-trip
- Use when: Implementing the bounded task derived from `item_608_pin_electrical_role_data_model_and_catalog_defaults`.
- Skip when: Work targets aggregation, diagnostics, UI surfaces, or multi-network propagation.

# Links
- Request: `req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics`
- Product brief(s): `docs/pin-level-source-consumer-currents-product-brief.md`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics` (downstream — informs the engine API surface but not this task directly)
