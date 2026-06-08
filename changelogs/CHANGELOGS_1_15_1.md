# Changelog (`1.15.0 -> 1.15.1`)

## Major Highlights

- Segment sheath callouts in the 2D network summary now merge cleanly across compatible splice-separated segments and render a more reliable leader line.
- The sheath callout leader now targets the actual grouped route, clips correctly against overlapping connector/splice cable callouts, and respects SVG scaling during drag and export.
- Release validation uncovered and fixed a small reducer helper typing issue and forced a modularization pass that extracted network-summary callout dragging into a dedicated hook.

## Patch Notes

- Same-style segment sheath metadata (`sheathType`, `insulation`, `lineStyle`, `internalPartReference`) now merges into one grouped callout when the segments are separated only by a splice node.
- Grouped sheath callouts now display the outer route labels and the summed quantity across the merged segment chain.
- The segment sheath leader no longer overshoots the callout frame, no longer aims at an abstract centroid when a closer route point exists, and no longer renders behind overlapping cable callouts.
- Corrected segment sheath leader scaling inside the SVG callout anchor transform so the visible leader length matches the model coordinates.
- Added regression coverage for grouped sheath callout rendering, dragging persistence, and SVG export content.
- Extracted callout dragging orchestration into `src/app/components/network-summary/useNetworkSummaryCalloutDragging.ts` to keep the network summary panel within the repository UI modularization budget.
- Removed an unnecessary type assertion and dead import in `src/store/reducer/helpers/rearBackshell.ts` surfaced during release validation.

## Version 1.15.1 - Segment Sheath Callout Rendering Refinements

### Grouped Sheath Callouts

- Merged sheath callouts can span two or more contiguous compatible segments when the only intermediate nodes are mergeable splices.
- The displayed route now resolves from the outer boundary nodes instead of the splice node in the middle.
- Quantity reflects the total grouped route length.

### Leader Rendering

- The leader now terminates at the callout frame boundary rather than running through the callout body.
- The route anchor is projected to the closest point on the visible grouped route.
- When a connector or splice cable callout sits between the sheath callout and its route, the leader is clipped to the first visible obstacle instead of visually continuing behind it.
- SVG local/model coordinate conversion is now consistent during normal rendering, drag feedback, and export.

### Release Validation Cleanup

- `NetworkSummaryPanel.tsx` was reduced below the locked UI file budget by extracting callout drag state and event handling into a dedicated hook.
- `rearBackshell.ts` was cleaned up to satisfy lint/typecheck gates discovered during local CI rehearsal.

### Verification

- `logics-manager lint --require-status`
- `logics-manager sync close-eligible-requests`
- `git diff --exit-code -- logics/request`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:dependency-audit`
- `npm run -s test:ci:segmentation:check`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:ui-timeout-governance`
- `npm run -s quality:hooks-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:exceljs-boundary`
- `npm run -s test:ci:fast -- --coverage`
- `npm run -s test:ci:ui`
- `npm run -s build:vite`
- `npm run -s quality:pwa`

### Verification Notes

- `npm run -s test:e2e` could not be completed on this local machine because Playwright could not provision a supported Chromium binary for the host runtime (`ubuntu26.04-x64`).
