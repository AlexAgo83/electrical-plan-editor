# Changelog (`1.16.1 -> 1.16.2`)

## Major Highlights

- Restored blocking CI by updating the Playwright smoke flow to the canonical floating-splice modeling workflow introduced in `1.16.1`.
- The end-to-end route recomputation scenario now places a splice on a host segment before wiring to it, instead of relying on a legacy structural splice node that is no longer auto-created.

## Patch Notes

- Updated `tests/e2e/smoke.spec.ts` so the `create -> route -> recompute` flow creates a real downstream node, builds `SEG-B` between routing nodes, then creates `Splice 1` with a `Host segment`, `Reference node`, and `Offset from reference (mm)` before attaching the wire.
- This keeps the smoke test aligned with the floating-splice model where segments connect only to persisted nodes and splices become connectable once a segment-offset placement exists.
- Aligned release metadata to `1.16.2` across `VERSION`, `package.json`, `package-lock.json`, and `README.md`.

## Version 1.16.2 - CI Smoke Alignment For Floating Splice Placement

### CI / E2E

- The Playwright smoke path now exercises the shipped splice-placement UI contract rather than the pre-ADR structural splice-node flow.
- The wire recompute assertion remains unchanged: editing `SEG-A` still propagates through the routed wire length as a release gate.

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test -- --run src/tests/app.ui.creation-flow-ergonomics.spec.tsx src/tests/app.ui.analysis-go-to-wire.spec.tsx --testTimeout=15000`
- `npx playwright test tests/e2e/smoke.spec.ts --grep "create -> route -> recompute flow works end-to-end" --list`

### Notes

- Full Playwright execution could not run locally here because the required browser binary is not installed in this environment; the CI-failing spec parses cleanly and has been updated directly against the current UI contract.
