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
