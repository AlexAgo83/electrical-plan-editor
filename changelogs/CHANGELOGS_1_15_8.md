# Changelog (`1.15.7 -> 1.15.8`)

## Major Highlights

- Added a `Dressings` display toggle to the network summary `View` menu, next to `Length` and `Callouts`.
- Segment dressings can now be hidden from the canvas without hiding segment length labels or cable callouts.

## Patch Notes

- The new display state controls segment sheath callouts and segment mounting labels together.
- The setting is persisted per network summary view state and defaults to visible for existing workspaces.
- Fit-to-content ignores persisted segment sheath callout bounds when segment dressings are hidden.
- Added regression coverage for persistence, migration normalization, and display-toggle restoration.

## Verification

- `npm run -s typecheck`
- `npm run -s test -- --run src/tests/app.ui.network-summary-viewport-persistence.spec.tsx src/tests/persistence.migrations.spec.ts src/tests/persistence.localStorage.recovery.spec.ts`
