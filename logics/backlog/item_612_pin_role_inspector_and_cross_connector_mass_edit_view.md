## item_612_pin_role_inspector_and_cross_connector_mass_edit_view - Pin role inspector section and cross-connector mass edit view

> From version: 1.13.1
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
With the data model and aggregation engine landed, the user needs ergonomic surfaces to declare pin roles. Two editing surfaces are needed: an inspector section per connector (single-connector editing), and a cross-connector mass edit view (spreadsheet-style for engineers populating a full harness). Both must keep the permissiveness contract — partial data must save and validate.

# Scope
- In:
  - Connector inspector: new collapsible **Pin electrical roles** section listing pins 1..N with editable `role`, `currentA`, `label`. Per-pin catalog-vs-override badge. Bulk actions: "Apply role X to selected pins", "Reset to catalog default" (clears the per-connector entry for the selected pins).
  - Same table inside the catalog item editor (editing `CatalogItem.connectorDefaults.pinElectricalRoles`).
  - New cross-connector mass edit view accessible from Modeling:
    - lists every pin of every connector of the current network as one row;
    - editable role / currentA / label inline;
    - filters: by connector, by role, by declared / not declared, by over-loaded (rows where the resolved branch load exceeds the ampacity);
    - bulk apply by selection;
    - CSV-style copy / paste of a `(connector, pin, role, currentA, label)` block (header optional);
    - one history entry per bulk operation, both in the inspector and the mass-edit view.
  - BOM export: new optional column "Computed downstream load (A)" on fuse rows, off by default (gated by a toggle in BOM export preferences).
  - Component tests for the inspector section, the mass-edit view (including CSV paste), and the BOM column.
- Out:
  - Functional schematic overlay (`item_613`).
  - Multi-network analysis view (`item_614`).
  - Any change to the 2D modeling canvas.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|pin-role-inspector-section-and-cross-con|req-133-pin-level-source-consumer-curren|with-the-data-model-and-aggregation|ac1-the-connector-inspector-shows-a
flowchart LR
    Inspector[Connector inspector — Pin electrical roles] --> Store[Reducer set/clear pinElectricalRole]
    CatalogEditor[Catalog item editor — pin roles defaults] --> Store
    MassEdit[Cross-connector mass edit view] --> Store
    MassEdit --> CSV[CSV-style copy/paste]
    Store --> Engine[Aggregation engine + diagnostics]
    Engine --> BOM[BOM optional Computed downstream load A column]
```

# Acceptance criteria
- AC1: The connector inspector shows a collapsible **Pin electrical roles** section. Editing a pin updates the connector entry without touching the catalog.
- AC2: A "Reset to catalog default" button on a pin row clears the per-connector entry; the resolved value falls back to the catalog default afterwards.
- AC3: Bulk "Apply role X to selected pins" updates only the selected pins and records a single history entry.
- AC4: The catalog item editor exposes the same table for `CatalogItem.connectorDefaults.pinElectricalRoles`; saving propagates the new defaults to every consuming connector through the merge logic.
- AC5: The cross-connector mass edit view lists every pin of every connector of the current network with editable role / currentA / label.
- AC6: The mass-edit view supports filtering by connector, role, declared / not declared, and over-loaded.
- AC7: The mass-edit view accepts a CSV paste of a `(connector, pin, role, currentA, label)` block: invalid rows are reported in an inline error panel; valid rows are applied as a single history entry.
- AC8: The catalog-vs-override badge on a pin row reflects the resolved source of the displayed value (override / catalog / default-passive).
- AC9: The BOM export gains an optional column "Computed downstream load (A)" on fuse rows, off by default; toggling it on adds the column to the next export.
- AC10: Tests cover AC1–AC9, including a regression test asserting the modeling canvas is unchanged when only pin roles are edited.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC4 (catalog editor surface).
- request-AC15 -> This backlog slice. Proof: AC3 (single history entry for bulk apply).
- request-AC16 -> This backlog slice. Proof: AC5, AC6, AC7 (mass-edit features).
- request-AC11 -> This backlog slice. Evidence needed: The validation center groups all new issues under the **Electrical dimensioning** category. Disabling the category hides every D-issue.
- request-AC12 -> This backlog slice. Evidence needed: The validation center, the connector inspector, the BOM, and the functional schematic overlay all use `scope = "currentNetwork"`. Inter-network bridges are not traversed and a linked consumer in another network contributes nothing to D1/D2/D3/D4.
- request-AC13 -> This backlog slice. Evidence needed: The functional schematic overlay prints declared pin currents and propagated wire currents and is **on by default** once the feature ships. A canvas toggle can disable it.
- request-AC14 -> This backlog slice. Evidence needed: The 2D modeling canvas is unchanged by this release.
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
- Product framing: Captured in `docs/pin-level-source-consumer-currents-product-brief.md` (Editing surfaces section).
- Product signals: Two complementary surfaces (per-connector vs. cross-connector). Permissiveness: empty fields allowed.
- Architecture framing:
  - The inspector section reuses existing `Connector` inspector controllers / hooks.
  - The cross-connector view follows the existing list-ergonomics patterns documented in `item_013` (search / filter / action consistency).
  - CSV paste: keep parsing strict but errors visible; do not silently drop rows.
  - History entries: piggyback on the existing store transaction helper used by the AI Agent grouped sessions.
- Architecture follow-up: No ADR required.

# Links
- Product brief(s): `docs/pin-level-source-consumer-currents-product-brief.md`
- Architecture decision(s): (none)
- Request: `logics/request/req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics.md`
- Primary task(s): `task_120_pin_role_inspector_and_cross_connector_mass_edit_view`

# Delivery Status
- Partially delivered in 1.14.0.
- Delivered: connector inspector pin-role editor, catalog defaults editor, catalog/override/default badges, inspector bulk apply, reset to catalog default, and focused UI tests for inspector/catalog workflows.
- Real-status audit on 2026-06-09: no implementation or tests were found for a cross-connector pin-role mass-edit view or CSV paste. The 1.14.0 changelog also lists both as deferred.
- Delivered on 2026-06-09: optional BOM "Computed downstream load (A)" column on fuse rows, off by default.
- Delivered on 2026-06-09: cross-connector `Pin role mass edit` panel in the Modeling/Analysis column with connector/role/declaration/overload filters, bulk apply/reset, CSV paste, inline CSV errors, and focused UI coverage.
- Delivery status: done.
- Moved out of this slice for clarity: the 2D-canvas unchanged regression belongs to the release-gate item (`item_615`), not to the editing-surface item.

# AI Context
- Summary: Editing surfaces — pin-role inspector section, catalog-defaults table, cross-connector mass edit view with CSV paste, and an optional BOM fuse column.
- Keywords: inspector, catalog editor, mass edit, CSV paste, bulk apply, history entry, BOM, downstream load
- Use when: Implementing or reviewing the pin-role editing UI or the BOM column.
- Skip when: The change targets aggregation, validation, or multi-network surfaces.

# Priority
- Impact: High; without ergonomic editing the data model is hard to populate.
- Urgency: Medium; can land in parallel with `item_611` once `item_608` and `item_610` are merged.

# Notes
- Created by hand; regenerate signatures with `python3 -m logics_manager lint --require-status` before commit when the tool becomes available.

# Tasks
- `task_120_pin_role_inspector_and_cross_connector_mass_edit_view`
