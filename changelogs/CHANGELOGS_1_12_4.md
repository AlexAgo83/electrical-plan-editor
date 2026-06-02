## Major Highlights

- Functional schematics now trace across fuse-box pairs, so a protected outgoing wire connected to the paired fuse pin remains visible from either side of the trace.
- Fuse-box links are easier to inspect: fuse-to-fuse interconnections render as explicit labeled edges, and same-pair loops are shown instead of being silently hidden.
- Fuse nodes now use a dedicated cartridge-style schematic symbol with a rating chip, including `?A` for missing ratings.
- Connector fuse ratings now use a structured per-pair editor with pin mapping, quick-pick ratings, clear-all, and apply-to-all controls.

## 1.12.4

- Replaced splice-only functional trace expansion with electrical-link expansion that preserves existing splice behavior and adds fuse-box pair traversal.
- Moved fuse-box cavity lookup earlier in graph construction so trace inclusion can account for configured catalog fuse pairs.
- Added explicit rendering for fuse-to-fuse wires and same-fuse-pair loops in the functional schematic.
- Split fuse node identity and rating display so fuse-box nodes render the connector technical ID separately from the rating chip.
- Added fuse-specific canvas theme tokens and cartridge SVG styling for light and dark themes.
- Replaced the legacy `pairIndex,amps` textarea in connector forms with a structured fuse rating table.
- Kept persisted connector data unchanged: `Connector.fusePairRatings` remains `Record<number, number>`.
- Added regression coverage for fuse-box pair traversal, unrelated-pair isolation, fuse-to-fuse edges, same-pair loops, mixed splice/fuse expansion, and the structured rating editor.
- Added a product brief for the fuse-box functional schematic release scope.

### Verification

- `npm run ci:blocking` reached the Playwright E2E step after passing Logics lint/audit, lint, typecheck, dependency audit, segmentation, modularization, fast tests with coverage, and UI test lanes. Local E2E is blocked in this workspace because Chromium cannot load `libnspr4.so`; `npx playwright install --with-deps chromium` is also blocked by Playwright's unsupported `ubuntu26.04-x64` detection.
- `npx vitest run src/tests/core.layout.spec.ts --pool=forks --maxWorkers=1 --testTimeout=30000`
- `npm run typecheck`
- `npm run lint`
- `npx vitest run src/tests/core.functional-schematic.spec.ts src/tests/app.ui.connector-fuse-rating-editor.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`
- `npm run build:vite`
- `npm run quality:pwa`
