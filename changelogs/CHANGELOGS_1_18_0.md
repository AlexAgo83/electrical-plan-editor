# Changelog (`1.17.2 -> 1.18.0`)

## Major Highlights

- Canvas and network summary rendering now stay within the modularization gates while preserving selected wire route highlighting, callout selection, export, PWA, and e2e coverage.

## Patch Notes

- Moved selected-wire partial segment coverage into the network summary graph model so the main panel stays below its locked line budget.
- Moved stored-node lookup and zoom view math into the existing canvas interaction geometry helper so the canvas interaction hook stays below its locked line budget.
- Updated UI regression tests to use the active panel after sub-screen remounts and to trigger connector/callout selection through `click`, matching the rendered controls.

## Verification

- `npm run ci:local`

## Notes

- Builds on `1.17.2`.
