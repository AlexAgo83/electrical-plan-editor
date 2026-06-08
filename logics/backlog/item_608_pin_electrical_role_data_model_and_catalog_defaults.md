## item_608_pin_electrical_role_data_model_and_catalog_defaults - Pin electrical role data model and catalog defaults

> From version: 1.13.1
> Schema version: 1.0
> Status: Ready
> Understanding: 80%
> Confidence: 80%
> Progress: 0%
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The app has no representation of which pin of a connector emits versus absorbs current, nor of the expected continuous current value at the pin. Every downstream diagnostic (wire section, fuse rating, supply vs. output balance) depends on this missing primitive. The data model must land first, with catalog defaults so a single calculator definition seeds N connector instances, while staying fully optional so existing networks keep working unchanged.

# Scope
- In:
  - Add optional `Connector.pinElectricalRoles: Record<cavityIndex, PinElectricalRole>`.
  - `PinElectricalRole` fields: `role` (`source` / `consumer` / `passive` / `bidirectional`, default `passive`), `currentA?` (non-negative max continuous), `label?`, `notes?`. No mode / duty / peak fields.
  - Add optional `CatalogItem.connectorDefaults.pinElectricalRoles` and the per-pin merge logic where the per-connector override wins.
  - Persistence: store/reducer hydration, additive schema, no migration step, no `schemaVersion` bump.
  - Export/import: round-trip the new fields through the existing network-file format without format-version change.
  - Unit tests for normalization, merge precedence, hydration, and round-trip.
- Out:
  - Aggregation engine and propagation (`item_610`).
  - Validation diagnostics (`item_611`).
  - Editing UI (`item_612`).
  - Multi-network propagation (`item_614`).
  - Functional schematic overlay (`item_613`).
  - AI Agent integration.
  - Release versioning, changelog, or Logics workflow tooling.

```mermaid
%% logics-kind: backlog
flowchart LR
    Connector[Connector.pinElectricalRoles] --> Merge[Catalog merge per pin]
    Catalog[CatalogItem.connectorDefaults.pinElectricalRoles] --> Merge
    Merge --> Resolved[Resolved PinElectricalRole per pin]
    Resolved --> Consumers[Aggregation engine + UI + diagnostics]
```

# Acceptance criteria
- AC1: `Connector.pinElectricalRoles` is an optional field; a connector loaded without it round-trips without mutation through save/load and export/import.
- AC2: A `PinElectricalRole` accepts `role`, optional non-negative `currentA`, optional `label`, optional `notes`. Default role on a missing entry is `passive`.
- AC3: Negative or non-finite `currentA` values are rejected at normalization with a typed error; the entry is dropped from persistence.
- AC4: `CatalogItem.connectorDefaults.pinElectricalRoles` is hydrated and round-tripped identically.
- AC5: Per-pin merge precedence — for every cavity index, the per-connector entry wins; absent fields fall back to the catalog default; absent on both sides resolves to `{ role: "passive" }`.
- AC6: Importing a payload with `pinElectricalRoles` declared but the connector's `cavityCount` lower than the highest cavity index produces a normalized payload with the out-of-range entries dropped and a warning surfaced through the existing import warning channel.
- AC7: Tests cover normalization (valid, negative, NaN, out-of-range), merge precedence (override wins, catalog falls back, both absent), hydration, persistence round-trip, and import warning for out-of-range entries.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC2 (role + currentA + label + notes; default passive).
- request-AC2 -> This backlog slice. Proof: AC4, AC5 (catalog defaults seed, per-connector override wins).
- request-AC3 -> This backlog slice. Proof: AC1 (no-op load when absent).
- request-AC8 -> This backlog slice. Evidence needed: A branch where every connected pin is `passive` (no source, no consumer declared) emits no issue — diagnostics degrade silently.
- request-AC9 -> This backlog slice. Evidence needed: A branch with at least one `consumer` pin and no `source` pin emits a single D4 `info` per branch entry; never an `error`.
- request-AC10 -> This backlog slice. Evidence needed: Two `source` pins facing each other on the same branch emit a single D4 `warning`; the network still saves, exports, and renders.
- request-AC11 -> This backlog slice. Evidence needed: The validation center groups all new issues under the **Electrical dimensioning** category. Disabling the category hides every D-issue.
- request-AC12 -> This backlog slice. Evidence needed: The validation center, the connector inspector, the BOM, and the functional schematic overlay all use `scope = "currentNetwork"`. Inter-network bridges are not traversed and a linked consumer in another network contributes nothing to D1/D2/D3/D4.
- request-AC13 -> This backlog slice. Evidence needed: The functional schematic overlay prints declared pin currents and propagated wire currents and is **on by default** once the feature ships. A canvas toggle can disable it.
- request-AC14 -> This backlog slice. Evidence needed: The 2D modeling canvas is unchanged by this release.
- request-AC15 -> This backlog slice. Evidence needed: Bulk "Apply role X to selected pins" on the connector inspector and on the cross-connector mass edit view updates only the selected pins and records a single history entry per bulk operation.
- request-AC16 -> This backlog slice. Evidence needed: The cross-connector mass edit view lists every pin of every connector of the current network with editable role / currentA / label, supports filtering by role and by declared / not declared / over-loaded, and supports CSV-style paste of a `(connector, pin, role, currentA, label)` block.
- request-AC17 -> This backlog slice. Evidence needed: The multi-network functional analysis view lets the user pick a single network or several networks of the active `HarnessAssembly`. The view runs aggregation in `assembly` scope on the selected union, renders inter-network bridges explicitly, and lists D1–D4 + L1 findings for the selected scope.
- request-AC18 -> This backlog slice. Evidence needed: With two networks A and B in the active assembly, linked by an `InterHarnessConnectorLink` between `CA.pin3` and `CB.pin1`, a `consumer` declared on `CB.pin1` at 8 A is folded into the branch aggregate of A in the multi-network view and used by its D1 and D2 on the A-side wire reaching `CA.pin3`.
- request-AC19 -> This backlog slice. Evidence needed: A master connector referenced by two member networks of the same `HarnessAssembly` behaves as a bridge in the multi-network view with the same semantics as `InterHarnessConnectorLink`.
- request-AC20 -> This backlog slice. Evidence needed: In the multi-network view, a branch fed by a `source` in A and consumed in B through a bridge does not emit a D4 issue.
- request-AC21 -> This backlog slice. Evidence needed: Networks outside the active `HarnessAssembly` are never aggregated by the multi-network view, even if they declare a link. When the user picks "single network" or when no assembly is active, the view aggregates only the chosen network.
- request-AC22 -> This backlog slice. Evidence needed: A loop in the linked-networks graph does not crash the multi-network view; the engine emits a single `warning` "Inter-network aggregation did not converge" with the loop participants listed.
- request-AC23 -> This backlog slice. Evidence needed: L1 — two pins of the same `InterHarnessConnectorLink` declaring incompatible roles or currents (e.g. `source 10 A` ↔ `source 8 A`, `source` ↔ `source`, or `source 10 A` ↔ `consumer 8 A`) emit a single L1 `warning` in the multi-network view. Aggregation continues by taking the maximum declared `currentA` for cable / fuse checks.
- request-AC24 -> This backlog slice. Evidence needed: The shipped ampacity table is overridable per project under Settings → Electrical and the override is persisted with the network. Without an override, the shipped defaults are used.
- request-AC25 -> This backlog slice. Evidence needed: The release ships with no AI Agent integration. No new agent permission, no new agent context section, no new agent operation. Future agent integration is explicitly deferred.
- request-AC26 -> This backlog slice. Evidence needed: Test coverage adds: pin-role normalization unit tests, aggregation engine unit tests for both scopes (linear chain, splice fan-out, fuse-box pair, ECU asymmetric device, two-network link, three-network harness assembly, loop), D1–D4 issue emission tests, L1 mismatch test, multi-network view component tests, cross-connector mass edit view test (including CSV paste), schematic overlay snapshot test (on by default), and ampacity-override persistence test.

# Decision framing
- Product framing: Captured in `docs/pin-level-source-consumer-currents-product-brief.md` (Pin electrical role model section).
- Product signals: Optional fields, default `passive`, no mode/duty/peak fields. Static role per pin.
- Architecture framing:
  - Pure data-model change. No new module yet — types live in `src/core/entities.ts`, normalization helper next to `wireSizing.ts` (`pinElectricalRole.ts` or extension of an existing helper file).
  - Merge logic exposed as a pure function `resolvePinElectricalRole(connector, catalogItem, cavityIndex)` consumed by all downstream slices.
  - Persistence: piggyback on the existing additive-field policy used by recent connector fields (`fusePairRatings`, `cableCalloutPosition`).
- Architecture follow-up: No ADR required; capture the chosen helper location in the task implementation plan.

# Links
- Product brief(s): `docs/pin-level-source-consumer-currents-product-brief.md`
- Architecture decision(s): (none)
- Request: `logics/request/req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics.md`
- Primary task(s): `task_116_pin_electrical_role_data_model_and_catalog_defaults`

# AI Context
- Summary: Foundation slice — adds the pin electrical role types, catalog defaults, normalization, and merge logic. No diagnostics, no UI, no propagation yet.
- Keywords: pin role, source, consumer, passive, bidirectional, currentA, catalog defaults, merge, normalization, persistence, additive schema
- Use when: Implementing or reviewing the pin-role data model, hydration, or catalog merge logic.
- Skip when: The change targets aggregation, diagnostics, UI surfaces, or multi-network propagation.

# Priority
- Impact: High; every other slice depends on it.
- Urgency: High; blocking for the rest of the release.

# Notes
- Created by hand; regenerate signatures with `python3 -m logics_manager lint --require-status` before commit when the tool becomes available.

# Tasks
- `task_116_pin_electrical_role_data_model_and_catalog_defaults`
