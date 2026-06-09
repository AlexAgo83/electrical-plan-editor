## task_123_pin_role_release_validation_and_permissiveness_gate - Pin role release validation and permissiveness gate

> From version: 1.13.1
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics

# Definition of Done (DoD)
- [x] Playwright "Pin roles full flow" E2E scenario green.
- [x] Shipped sample networks load with zero **Electrical dimensioning** issues.
- [x] Export/import round-trip preserves `pinElectricalRoles`, catalog defaults, `ampacityOverrides`.
- [x] 2D modeling canvas byte-for-byte snapshot unchanged when only pin roles or ampacity overrides are edited.
- [x] Permissiveness gate: partial declarations emit zero error-level findings.
- [x] AI Agent context snapshot unchanged.
- [x] Performance budgets captured (in-network engine + multi-network view open) with ratio ≤ 1.3.
- [x] Onboarding step "Declare pin roles" added.
- [x] One failing assertion blocks the release through existing CI quality gates.

# Backlog
- `item_615_pin_role_release_validation_and_permissiveness_gate`


```mermaid
%% logics-kind: task
%% logics-signature: task|pin-role-release-validation-and-permissi|item-615-pin-role-release-validation-and|1-confirm-scope|2026-06-09-rtk-npm-run-s-quality-pin-rol
flowchart TD
    Backlog[Backlog item] --> Build[Implementation]
    Build --> Validate[Validation]
    Validate --> Close[Finish workflow]
```

# Acceptance criteria
Mirror `item_615` AC1–AC9.

# Implementation Plan

## Step 1 — E2E scenario
- New Playwright test `tests/e2e/pin-roles-full-flow.spec.ts`:
  - declare roles via the mass-edit view;
  - open the multi-network analysis panel on the seeded sample workspace;
  - verify the selected assembly summary renders.
  - Note: inspector editing, D1-D4, L1, and overlay-adjacent assertions are covered by focused Vitest gates; the functional schematic overlay remains owned by `task_121`.

## Step 2 — Regression snapshots
- Vitest snapshot asserting sample networks emit zero electrical-dimensioning issues.
- Export/import round-trip vitest test.
- Modeling-canvas-unchanged snapshot test.
- AI Agent context snapshot test.

## Step 3 — Permissiveness assertions
- Vitest test confirming partial declarations never yield error-level findings.

## Step 4 — Performance budgets
- New script under `scripts/` benchmarking `computePinElectricalLoad` on the largest sample network.
- Multi-network view-open benchmark.
- Assertion captures the baseline once and asserts ratio ≤ 1.3 on subsequent runs.

## Step 5 — Onboarding
- Add the "Declare pin roles" step to the existing onboarding flow data.

# Links
- Request: `req_133`
- Architecture decision(s): `adr_010_inter_network_current_bridge_semantics`

# Progress Report
- Partially covered by 1.14.0 focused validation: data model, ampacity, current-network aggregation, assembly aggregation core, D1-D4 validation, inspector pin roles, and catalog pin roles.
- Delivered after 1.15.0: onboarding step "Declare pin roles" added to the full onboarding flow and covered by `npm run -s test -- src/tests/app.ui.onboarding.spec.tsx --run`.
- Delivered after 1.15.0: AI Agent context snapshot coverage asserts pin electrical roles do not add AI context fields or leak role labels; covered by `npm run -s test -- src/tests/ai-agent-context.spec.ts --run` and `npm run -s typecheck`.
- Delivered after 1.15.0: sample-network silence gate asserts every shipped sample network emits zero `Electrical dimensioning` issues; covered by `npm run -s test -- src/tests/app.validation.electrical-dimensioning.spec.ts --run`.
- Delivered after 1.15.0: network export/import round-trip preserves connector `pinElectricalRoles`, catalog default `pinElectricalRoles`, and network `ampacityOverrides`; covered by `npm run -s test -- src/tests/portability.network-file.spec.ts --run` and `npm run -s typecheck`.
- Real-status audit on 2026-06-09: no Playwright full-flow, performance budget script/gate, or CI release-gate wiring specific to the pin-role release was found.
- Delivered on 2026-06-09: partial pin-role declarations emit zero error-level electrical dimensioning issues; covered by `npm run -s test -- src/tests/app.validation.electrical-dimensioning.spec.ts --run`.
- Delivered on 2026-06-09: 2D network diagram SVG snapshot stays byte-for-byte unchanged when only connector `pinElectricalRoles` and network `ampacityOverrides` change; covered by `npm run -s test -- src/tests/app.ui.navigation-canvas.spec.tsx --run`.
- Delivered on 2026-06-09: `tests/e2e/pin-roles-full-flow.spec.ts` covers the available E2E path for pin-role CSV mass edit plus multi-network analysis opening; covered by `rtk npm run -s test:e2e -- tests/e2e/pin-roles-full-flow.spec.ts`.
- Delivered on 2026-06-09: `src/tests/pin-role-release-gate.spec.ts` captures in-network engine and multi-network analysis model performance ratios against release baselines and asserts both stay ≤ 1.3.
- Delivered on 2026-06-09: `quality:pin-role-release-gate` runs the release-gate Vitest set, `ci:blocking` now includes it, and the UI segmentation contract includes the pin-role mass-edit and multi-network analysis UI tests.
- Delivery status: done for `item_615`. The functional schematic overlay/toggle remains tracked by `task_121`, not by this release-gate wiring task.

# Validation
- 2026-06-09: `rtk npm run -s quality:pin-role-release-gate` passed (8 files, 76 tests). Covers release-gate performance budgets, sample-network silence, export/import preservation, 2D canvas unchanged snapshot, AI Agent context unchanged, onboarding, mass edit, and multi-network analysis UI coverage.
- 2026-06-09: `rtk npm run -s test:e2e -- tests/e2e/pin-roles-full-flow.spec.ts` passed (1 Playwright test).
- 2026-06-09: `rtk npm run -s test:ci:segmentation:check`, `rtk npm run -s lint`, and `rtk npm run -s typecheck` passed.
