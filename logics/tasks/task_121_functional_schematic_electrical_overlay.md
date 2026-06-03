## task_121_functional_schematic_electrical_overlay - Functional schematic electrical overlay

> From version: 1.13.1
> Schema version: 1.0
> Status: Ready
> Understanding: 75%
> Confidence: 75%
> Progress: 0%
> Complexity: Small
> Theme: Electrical analysis / Diagnostics

# Definition of Done (DoD)
- [ ] Functional schematic renders directional pin markers (`→` source, `←` consumer) + declared `currentA` when set.
- [ ] Wire labels include the engine-derived continuous current when non-zero.
- [ ] Fuse-box pairs show protected-side downstream sum when non-zero.
- [ ] Canvas toggle "Show electrical roles", on by default for new and existing workspaces (preference default `true`).
- [ ] Theme tokens only; no inline color literals.
- [ ] Snapshot tests for overlay on / off / no-pin-roles network.

# Backlog
- `item_613_functional_schematic_electrical_overlay`

# Acceptance criteria
Mirror `item_613` AC1–AC8.

# Implementation Plan

## Step 1 — Data plumbing
- Engine result threaded into the functional schematic renderer (re-use `computePinElectricalLoad` with `currentNetwork` scope).

## Step 2 — Renderer
- Edit `src/core/functionalSchematic.ts` (data) and the app-layer SVG/Canvas painter.
- For each declared pin, paint the arrow + value next to the pin position.
- For each wire, paint the resolved current.
- For each fuse-box pair, paint the protected sum next to the fuse symbol.

## Step 3 — Toggle + preference
- Add `showElectricalRoles` boolean to canvas preferences.
- Default `true` when absent (covers existing workspaces).
- Wire the canvas toggle button.

## Step 4 — Tests
- Vitest snapshot of three scenarios.
- Toggle persistence test.

# Links
- Request: `req_133`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`
