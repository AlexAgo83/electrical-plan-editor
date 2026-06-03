# Pin-Level Source / Consumer Currents and Harness Dimensioning Diagnostics — Release Brief

## Objective

Move electrical-current declarations from the wire level to the **pin** (cavity) level, distinguish **sources** from **consumers**, and use this richer model to drive a deeper diagnostic pass on the harness: cable sections, fuse ratings, device supply vs. output sums, and branch source/consumer coherence.

The release unlocks realistic device models — an ECU with low-side outputs emitting 2.5 A on several pins while absorbing 40 A on its supply pin — and feeds the validation center, BOM, functional schematic overlay, and a new multi-network functional analysis view with a single coherent electrical truth.

## User Problem

Today, currents live on wires (`Wire.currentA`) and protection lives on wires (`Wire.protection` of kind `fuse`). The user can fill them manually, but:

- The app cannot tell whether a pin **emits** or **absorbs** current. A low-side ECU output is indistinguishable from its supply pin.
- A connector with one supply pin and many output pins cannot be balanced. There is no way to say "the supply pin must carry the sum of the outputs".
- A fuse rating cannot be checked against the **sum** of downstream consumers — only against the single wire it protects.
- A branch with no declared source silently passes validation, or only emits issues if the user manually pre-filled wire currents.
- A consumer declared in network B is invisible to the dimensioning of a wire in network A that feeds it through an inter-harness link.

The current data model is wire-centric and assumes the user pre-computes carried currents. Real harness work is the opposite: the engineer knows the consumers and the source, and wants the app to dimension the path between them.

## Scope

### Pin electrical role model
- Add `Connector.pinElectricalRoles: Record<cavityIndex, PinElectricalRole>` (optional).
- `PinElectricalRole` fields: `role` (`source` / `consumer` / `passive` / `bidirectional`, default `passive`), `currentA?` (non-negative max continuous current), `label?`, `notes?`.
- Static role per pin. A given pin does not oscillate between source and consumer.
- Add catalog-level defaults under `CatalogItem.connectorDefaults.pinElectricalRoles`. Per-connector entries override per pin.
- Networks without any pin roles keep working exactly as today.

### Current model
- Continuous worst-case only. No mode toggle, no duty cycle, no RMS derivation, no inrush modeling. `currentA` is the value used for every check.
- 12 V harness dimensioning only. 5 V signal lines (e.g. accelerator-pedal signal) are out of scope and should be declared `passive` or left undeclared.
- Default automotive copper ampacity table shipped with the release, overridable per project under Settings → Electrical. Defaults (mm² → max continuous A): `0.5 → 11`, `0.75 → 15`, `1 → 19`, `1.5 → 24`, `2.5 → 32`, `4 → 42`, `6 → 54`, `10 → 73`, `16 → 98`, `25 → 129`, `35 → 158`, `50 → 198`, `70 → 245`, `95 → 292`, `120 → 344`. Aluminum scaled by the existing material-resistivity ratio.

### Aggregation engine
- A new pure module derives, given a network and a scope:
  - the resolved role per pin (catalog merged with per-connector override);
  - the current carried by each wire, propagated through splices and fuse-box pairs (and inter-network bridges when the scope includes them);
  - the device-level balance per connector (total declared source current vs. total declared consumer current);
  - the downstream load protected by each fuse and each fuse-box pair.
- Two scopes:
  - **`currentNetwork`** — used by validation center, connector inspector, BOM, and functional schematic overlay. Inter-network bridges are **not** traversed.
  - **`assembly`** — used by the new multi-network functional analysis view. Inter-network bridges (links + shared master connector references) are traversed across the user-selected union of networks of the active `HarnessAssembly`.
- Splices, fuse-box pairs, and inter-network bridges are modeled as current-conserving pass-through nodes; the engine never invents currents.
- Cycle-safe: each connector pin is visited at most once per pass; non-convergent loops emit a single warning.

### Diagnostic surfacing — new "Electrical dimensioning" category
- **D1** Wire section vs. carried current (uses the manual `Wire.currentA` first, then the engine-derived current). `error` over 100% of ampacity, `warning` over 90%, `info` between 80% and 90%.
- **D2** Fuse rating vs. downstream load. `error` over rating, `warning` between 80% and 100%, `warning` when rating is missing and load is non-zero.
- **D3** Device supply pin vs. declared output sum. **`warning`** (non-blocking) if the supply is under-rated.
- **D4** Branch source / consumer coherence. `info` for no-source branches, `warning` for facing sources — never `error`.
- All four are computed against the **current network**. They never silently aggregate a sibling network.
- The category can be disabled from the validation center to mute every D-issue.

### Inter-network analysis — multi-network functional view
- New top-level view, read-only with respect to network data.
- The user picks a scope: a single network, or several networks of the active `HarnessAssembly`.
- The view renders the union functional schematic, draws inter-network bridges (`InterHarnessConnectorLink` + shared master connector references) explicitly, and runs the aggregation in `assembly` scope on the selected union.
- D1–D4 are recomputed for the selected scope and listed inside the view.
- Plus a new finding family scoped to the view:
  - **L1 Link declaration mismatch** — the two pins of an inter-network bridge declare incompatible roles or currents (e.g. `source 10 A` ↔ `source 8 A`, `source` ↔ `source`, or `source 10 A` ↔ `consumer 8 A`). `warning`. Aggregation continues by taking the maximum declared `currentA` for downstream checks.
- Networks outside the active assembly are never aggregated.

### Editing surfaces
- A **Pin electrical roles** section on the connector inspector with per-pin `role`, `currentA`, `label`. Bulk "Apply role to selected pins". Catalog-vs-override badge per pin.
- The same table inside the catalog item editor.
- A new **cross-connector mass edit view** accessible from Modeling, listing every pin of every connector of the current network with editable role / currentA / label, filtering (by connector, role, declared / not declared, over-loaded), bulk apply, and CSV-style copy/paste for spreadsheet workflows. One history entry per bulk operation.
- A **functional schematic overlay** that prints declared pin currents and propagated wire currents. **On by default** once the feature ships; a canvas toggle can disable it.
- The new multi-network functional analysis view (described above).
- One optional BOM column "Computed downstream load (A)" on fuse rows (off by default).
- **No change to the 2D modeling canvas.**
- **No AI Agent integration in this release.**

## Permissiveness Contract (Explicit)

This is a diagnostic-friendly model. Partial data must never block work:

- All new fields are optional.
- Missing data never raises `error`-level issues; it raises `info` at most.
- Only contradictions in **declared** data become `warning` or `error`. D3, D4, L1 are all `warning` only.
- Disabling the new category hides every D-issue; closing the multi-network view hides L1.
- Pre-existing fixtures load without any new issue.

## Out Of Scope

- Persistence schema migrations beyond additive optional fields.
- Frequency / harmonic analysis, inrush modeling, duty-cycle modeling, RMS derivation. Continuous worst-case only.
- 5 V signal lines (e.g. accelerator-pedal signal).
- Voltage-drop revisions beyond what `wireSizing.ts` already supports.
- Thermal bundling derating per conductor harness (follow-up).
- Catalog-drift diagnostics. Catalog defaults still seed per-connector overrides, but the divergence is not flagged.
- Aggregation across networks that are not members of the **active** `HarnessAssembly`. Inter-network propagation is bounded to the active assembly and only available inside the multi-network view.
- AI Agent integration (context extension, permissions, mutating operations). Explicitly deferred.
- Any change to the 2D modeling canvas.
- Backend, cloud sync, or import/export file format changes beyond the additive optional fields.
- Release version bump, changelog, or Logics workflow updates.

## Acceptance Criteria

- A connector pin can be declared `source` / `consumer` / `passive` / `bidirectional` with optional `currentA`, `label`, `notes`. Default role is `passive`. No mode / duty / peak fields.
- Catalog-level pin roles seed every connector instance referencing the catalog; per-connector entries override per pin without touching the catalog.
- A network without any `pinElectricalRoles` loads, validates, and exports identically to today.
- For an ECU with a 40 A supply pin and three 2.5 A output pins, the device balance reports 32.5 A headroom and no D3 issue.
- For the same ECU with a 5 A supply pin, D3 emits a `warning` quoting the required 7.5 A and the declared 5 A.
- A wire carrying a derived 12 A at 1.0 mm² copper emits a D1 `error` against the shipped ampacity table; at 5 A emits no issue.
- A 10 A fuse protecting a 12 A downstream sum emits a D2 `error`; at 8.5 A emits a D2 `warning`. A fuse-protected wire with no rating and a non-zero downstream sum emits a D2 `warning`.
- A branch with no declared role emits no issue. A branch with consumers but no source emits one D4 `info`. Two facing sources emit one D4 `warning`.
- The validation center, connector inspector, BOM, and functional schematic overlay all use `currentNetwork` scope. A consumer in a linked network does not contribute to D1/D2/D3/D4 here.
- The functional schematic overlay is on by default after this release ships.
- The 2D modeling canvas is unchanged.
- The cross-connector mass edit view supports search/filter/bulk apply/CSV paste over the current network's pins.
- The multi-network functional analysis view lets the user pick one or several networks of the active `HarnessAssembly`, propagates currents across inter-network bridges in that union, and lists D1–D4 + L1 findings for the selected scope.
- Given networks A and B linked by an `InterHarnessConnectorLink`, an 8 A consumer in B is folded into A's branch aggregate in the multi-network view, driving D1 and D2 on the A-side wire.
- A master connector referenced by two member networks of the same assembly behaves as a bridge in the multi-network view.
- A branch fed by a source in A and consumed in B through a bridge emits no D4 in the multi-network view.
- Networks outside the active assembly are excluded from aggregation; with no active assembly, only the current network is aggregated.
- A loop in the linked-networks graph emits a single `warning` "Inter-network aggregation did not converge" and does not crash the view.
- L1 — incompatible declarations at the two ends of a bridge emit a `warning` in the multi-network view; aggregation continues with the max declared `currentA`.
- The shipped ampacity table is overridable per project under Settings → Electrical and the override is persisted with the network.
- No AI Agent permission, context section, or operation is introduced in this release.
- Bulk "Apply role to selected pins" (inspector and mass-edit view) records a single history entry per operation.

## Resolved Decisions

- The role enum is `source` / `consumer` / `passive` / `bidirectional`. Roles are static; `currentA` is a non-negative max continuous magnitude.
- No mode, duty cycle, peak, or RMS. The release ships continuous worst-case only.
- Default ampacity table shipped with the release, overridable per project. Aluminum derived from copper via the existing resistivity ratio.
- Splices, fuse-box pairs, and inter-network bridges are current-conserving pass-through nodes.
- Catalog defaults merged pin by pin; the per-connector override is the source of truth where present.
- D3 is `warning` (non-blocking) for permissiveness. D4 is `info` / `warning`. L1 is `warning`.
- Catalog drift (former D5) is dropped from this release.
- In-network aggregation is the default. Inter-network propagation only happens inside the new multi-network functional analysis view; the validation center, inspector, BOM, and schematic overlay stay scoped to the current network.
- Networks outside the active `HarnessAssembly` are never aggregated.
- The functional schematic overlay is on by default once the feature ships.
- No AI Agent integration in this release; explicitly deferred to a follow-up.
- No change to the 2D modeling canvas.
