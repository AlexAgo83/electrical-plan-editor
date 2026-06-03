## task_123_pin_role_release_validation_and_permissiveness_gate - Pin role release validation and permissiveness gate

> From version: 1.13.1
> Status: Ready
> Complexity: Medium
> Theme: Electrical analysis / Diagnostics

# Definition of Done (DoD)
- [ ] Playwright "Pin roles full flow" E2E scenario green.
- [ ] Shipped sample networks load with zero **Electrical dimensioning** issues.
- [ ] Export/import round-trip preserves `pinElectricalRoles`, catalog defaults, `ampacityOverrides`.
- [ ] 2D modeling canvas byte-for-byte snapshot unchanged when only pin roles or ampacity overrides are edited.
- [ ] Permissiveness gate: partial declarations emit zero error-level findings.
- [ ] AI Agent context snapshot unchanged.
- [ ] Performance budgets captured (in-network engine + multi-network view open) with ratio ≤ 1.3.
- [ ] Onboarding step "Declare pin roles" added.
- [ ] One failing assertion blocks the release through existing CI quality gates.

# Backlog
- `item_615_pin_role_release_validation_and_permissiveness_gate`

# Acceptance criteria
Mirror `item_615` AC1–AC9.

# Implementation Plan

## Step 1 — E2E scenario
- New Playwright test `tests/e2e/pin-roles-full-flow.spec.ts`:
  - declare roles via inspector + mass-edit view;
  - assert D1–D4 update live;
  - toggle overlay;
  - open multi-network view on seeded two-network assembly;
  - assert L1 fires on contrived mismatch.

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
