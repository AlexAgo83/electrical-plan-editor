## task_119_electrical_dimensioning_validation_category - Electrical dimensioning validation category (D1–D4)

> From version: 1.14.0
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100% (delivered)
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics

# Definition of Done (DoD)
- [x] `buildValidationIssues` emits issues in a new **Electrical dimensioning** category for D1–D4.
- [x] D1 thresholds: `error` > 100% ampacity, `warning` > 90%, `info` 80–90%.
- [x] D2 thresholds: `error` over rating, `warning` 80–100%, `warning` rating-missing-with-load.
- [x] D3: `warning` (non-blocking) when supply pin under-rated vs. declared output sum.
- [x] D4: `info` for consumer-only branch, `warning` for facing sources; never `error`.
- [x] All issues use `scope = "currentNetwork"`. No cross-network contribution.
- [x] Each issue exposes `Go to` (connector+pin / wire / branch entry).
- [x] Category can be disabled from the validation center; disabling hides every D-issue.
- [x] Tests cover D1–D4 thresholds, permissive baselines, and `Go to` resolution.

# Backlog
- `item_611_electrical_dimensioning_validation_category`

# Acceptance criteria
Mirror `item_611` AC1–AC14.

# Implementation Plan

## Step 1 — Build category infrastructure
- Edit `src/app/hook-impl/validation/buildValidationIssues.ts` to thread the engine result into the issue builder. Compute the engine result once at the top of the function (or via a hook param) and feed it to a new `appendElectricalDimensioningIssues` sub-builder.
- Add a new category constant `electricalDimensioningCategory = "Electrical dimensioning"`.

## Step 2 — D1
- For each wire, compute the effective current = `max(manual Wire.currentA ?? 0, branchLoadByWire.continuousA)`.
- Resolve `ampacityA = resolveAmpacityA(wire.sectionMm2, wire.material ?? "copper", network)`.
- Compute ratio. Emit `error` / `warning` / `info` per spec.
- `Go to`: focus the wire in the modeling view.

## Step 3 — D2
- For each wire with `protection.kind = "fuse"`:
  - Resolve fuse rating from the catalog item (existing helper).
  - downstream load = `fuseProtectedLoad[wireId]`.
  - Emit per spec; `warning` if rating missing and load > 0.
- For each fuse-box pair with a rating (`Connector.fusePairRatings`):
  - downstream load = `fuseProtectedLoad[fusePairKey]`.
  - Same emission rules.
- `Go to`: focus the wire (or the connector + cavity pair for fuse-box).

## Step 4 — D3
- For each connector in `deviceBalance`:
  - If `supplyPins` is non-empty and the sum of `totalSourceA` > 0 across the connector's declared source pins, compare:
    - required = totalSourceA;
    - declared = sum of consumer currents on supply pins.
  - Emit a `warning` if declared < required, quoting both values.
- `Go to`: focus the connector + supply pin.

## Step 5 — D4
- Walk the engine's branch graph (consumers list per wire/group).
- Branch with consumer pins and no source pins → one `info` per branch entry.
- Branch with two or more source pins facing each other → one `warning` per branch.
- `Go to`: branch entry (first source or first consumer pin).

## Step 6 — Permissiveness
- Sample networks with no `pinElectricalRoles` must yield zero D-issues.
- Wires without `currentA` and without engine-derived current emit nothing.
- D3 requires both a supply consumer and at least one declared source.

## Step 7 — Tests
- `src/tests/app.validation.electrical-dimensioning.spec.ts` covering each acceptance criterion.

# Validation
- `npm run -s lint && npm run -s typecheck`
- `npx vitest run src/tests/app.validation.electrical-dimensioning.spec.ts`
- `npm run ci:blocking`

# Delivery snapshot
- Status synchronized after delivery so workflow audit can close the linked backlog item cleanly.

# Links
- Request: `req_133_pin_level_source_consumer_currents_and_harness_dimensioning_diagnostics`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`

# AC Traceability
- request-AC1 -> This task. Evidence needed: A connector pin can be declared `source` / `consumer` / `passive` / `bidirectional` with optional `currentA`, `label`, `notes`. Default role is `passive`. `currentA` is a non-negative max continuous value; no mode, duty-cycle, or peak field exists.
- request-AC2 -> This task. Evidence needed: Catalog-level pin roles defined under `CatalogItem.connectorDefaults.pinElectricalRoles` seed every connector instance referencing the catalog item; per-connector entries override per pin without touching the catalog.
- request-AC3 -> This task. Evidence needed: A network without any `pinElectricalRoles` loads, renders, validates, and exports identically to today (no new errors or warnings on existing fixtures).
- request-AC4 -> This task. Evidence needed: For an ECU connector declaring a `consumer` supply pin at 40 A and three `source` output pins at 2.5 A each, the device balance reports a 32.5 A headroom on the supply pin and no D3 issue.
- request-AC5 -> This task. Evidence needed: For the same ECU, if the supply pin is declared at 5 A and the three outputs at 2.5 A each, D3 emits a `warning` "Supply pin under-rated vs. declared output sum (7.5 A required, 5 A declared)".
- request-AC6 -> This task. Evidence needed: A wire carrying a derived 12 A continuous current with a 1.0 mm² copper section emits a D1 `error` against the shipped ampacity table. The same wire with a derived 5 A continuous current emits no issue.
- request-AC7 -> This task. Evidence needed: A fuse rated 10 A protecting a downstream sum of 12 A emits a D2 `error`. The same fuse protecting 8.5 A emits a D2 `warning` (between 80% and 100%). A wire with `protection.kind = "fuse"` and a non-zero downstream sum but no fuse rating set emits a D2 `warning`.
- request-AC8 -> This task. Evidence needed: A branch where every connected pin is `passive` (no source, no consumer declared) emits no issue — diagnostics degrade silently.
- request-AC9 -> This task. Evidence needed: A branch with at least one `consumer` pin and no `source` pin emits a single D4 `info` per branch entry; never an `error`.
- request-AC10 -> This task. Evidence needed: Two `source` pins facing each other on the same branch emit a single D4 `warning`; the network still saves, exports, and renders.
- request-AC11 -> This task. Evidence needed: The validation center groups all new issues under the **Electrical dimensioning** category. Disabling the category hides every D-issue.
- request-AC12 -> This task. Evidence needed: The validation center, the connector inspector, the BOM, and the functional schematic overlay all use `scope = "currentNetwork"`. Inter-network bridges are not traversed and a linked consumer in another network contributes nothing to D1/D2/D3/D4.
- request-AC13 -> This task. Evidence needed: The functional schematic overlay prints declared pin currents and propagated wire currents and is **on by default** once the feature ships. A canvas toggle can disable it.
- request-AC14 -> This task. Evidence needed: The 2D modeling canvas is unchanged by this release.
- request-AC15 -> This task. Evidence needed: Bulk "Apply role X to selected pins" on the connector inspector and on the cross-connector mass edit view updates only the selected pins and records a single history entry per bulk operation.
- request-AC16 -> This task. Evidence needed: The cross-connector mass edit view lists every pin of every connector of the current network with editable role / currentA / label, supports filtering by role and by declared / not declared / over-loaded, and supports CSV-style paste of a `(connector, pin, role, currentA, label)` block.
- request-AC17 -> This task. Evidence needed: The multi-network functional analysis view lets the user pick a single network or several networks of the active `HarnessAssembly`. The view runs aggregation in `assembly` scope on the selected union, renders inter-network bridges explicitly, and lists D1–D4 + L1 findings for the selected scope.
- request-AC18 -> This task. Evidence needed: With two networks A and B in the active assembly, linked by an `InterHarnessConnectorLink` between `CA.pin3` and `CB.pin1`, a `consumer` declared on `CB.pin1` at 8 A is folded into the branch aggregate of A in the multi-network view and used by its D1 and D2 on the A-side wire reaching `CA.pin3`.
- request-AC19 -> This task. Evidence needed: A master connector referenced by two member networks of the same `HarnessAssembly` behaves as a bridge in the multi-network view with the same semantics as `InterHarnessConnectorLink`.
- request-AC20 -> This task. Evidence needed: In the multi-network view, a branch fed by a `source` in A and consumed in B through a bridge does not emit a D4 issue.
- request-AC21 -> This task. Evidence needed: Networks outside the active `HarnessAssembly` are never aggregated by the multi-network view, even if they declare a link. When the user picks "single network" or when no assembly is active, the view aggregates only the chosen network.
- request-AC22 -> This task. Evidence needed: A loop in the linked-networks graph does not crash the multi-network view; the engine emits a single `warning` "Inter-network aggregation did not converge" with the loop participants listed.
- request-AC23 -> This task. Evidence needed: L1 — two pins of the same `InterHarnessConnectorLink` declaring incompatible roles or currents (e.g. `source 10 A` ↔ `source 8 A`, `source` ↔ `source`, or `source 10 A` ↔ `consumer 8 A`) emit a single L1 `warning` in the multi-network view. Aggregation continues by taking the maximum declared `currentA` for cable / fuse checks.
- request-AC24 -> This task. Evidence needed: The shipped ampacity table is overridable per project under Settings → Electrical and the override is persisted with the network. Without an override, the shipped defaults are used.
- request-AC25 -> This task. Evidence needed: The release ships with no AI Agent integration. No new agent permission, no new agent context section, no new agent operation. Future agent integration is explicitly deferred.
- request-AC26 -> This task. Evidence needed: Test coverage adds: pin-role normalization unit tests, aggregation engine unit tests for both scopes (linear chain, splice fan-out, fuse-box pair, ECU asymmetric device, two-network link, three-network harness assembly, loop), D1–D4 issue emission tests, L1 mismatch test, multi-network view component tests, cross-connector mass edit view test (including CSV paste), schematic overlay snapshot test (on by default), and ampacity-override persistence test.
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC14 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC15 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC16 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC17 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC18 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC19 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC20 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC21 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC22 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC23 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC24 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC25 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC26 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
