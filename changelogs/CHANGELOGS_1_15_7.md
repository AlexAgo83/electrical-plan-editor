# Changelog (`1.15.6 -> 1.15.7`)

## Major Highlights

- Fixed grouped XLSX wire export pin labels so connector cavities now match the solo wire export format.
- Connector pins in grouped export `Wires` sheets now render as `C1`, `C2`, `C9`, etc. instead of shifted numeric values such as `2`, `3`, or `10`.

## Patch Notes

- Updated `buildWireListSheet(...)` to format connector endpoints with the `C${cavityIndex}` label contract.
- Added regression coverage for `CT1`-style connector pin labels on `C1` and `C9`.
- Aligned local CI runner settings for UI-heavy release gates by applying the established 15s Vitest timeout and layout responsiveness budget where they were missing.

## Verification

- `npm run -s test -- --run src/tests/wire-list-export.spec.ts`
- `npm run -s ci:local`
- `npm run -s build:vite`
- `npm run -s quality:pwa`

Note: local `ci:local` reached Playwright e2e but Chromium could not launch in this machine because the system library `libnspr4.so` is missing. All non-e2e gates, fast tests, UI chunks, Vite build, and PWA artifact checks passed locally.
