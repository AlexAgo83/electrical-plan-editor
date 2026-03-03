# Changelog (`1.3.0 → 1.3.1`)

## Major Highlights

- Delivered **req_102** end-to-end: export frame + identity cartouche for SVG/PNG.
- Added network-scoped export identity authoring in `Network Scope`:
  - editable creation date,
  - author,
  - project code,
  - logo URL,
  - multiline export notes.
- Added dedicated export toggles in Settings with explicit defaults:
  - `Include frame in SVG/PNG export`: default `off`,
  - `Include identity cartouche in SVG/PNG export`: default `on`.
- Hardened export reliability with non-blocking logo fallback (`Logo indisponible`) and note-clamp safeguards.
- Completed persistence/import-export schema alignment for new metadata (`schemaVersion` -> `3`).

## Product and UX Changes

### Network Scope Metadata Authoring

- `Edit/Create network` now includes:
  - `Creation date` (`YYYY-MM-DD` input),
  - `Author (optional)`,
  - `Project code (optional)`,
  - `Logo URL (optional)`,
  - `Export notes (optional)` (multiline textarea).
- Validation/constraints enforced in submit flow:
  - project code charset: `[A-Za-z0-9 _./-]`,
  - logo URL scheme: `http`, `https`, `data:image/*`,
  - length limits:
    - author `<=80`,
    - project code `<=40`,
    - logo URL `<=2048`,
    - export notes `<=2000`.

### Export Frame and Cartouche

- Added export frame overlay aligned with segment visual language (stroke/tokens).
- Added export cartouche overlay anchored bottom-right with:
  - network name,
  - author (if present),
  - project code (if present),
  - creation date (`YYYY-MM-DD`, local-time representation from ISO source),
  - logo area,
  - notes section (if present).
- Notes rendering is wrapped and clamped to `8` visible lines with ellipsis.

### Logo Fallback and PNG/SVG Robustness

- Export no longer fails when logo URL is invalid/unreachable/CORS-blocked.
- When logo resolution fails, cartouche renders `Logo indisponible` and keeps remaining metadata.
- Behavior is consistent across SVG and PNG export paths.

## Persistence and Compatibility

- Local persistence migration schema bumped to `v3`.
- Network file portability schema bumped to `v3`.
- Legacy payloads remain accepted and normalized safely (`v0..v3` paths maintained for network files).

## Engineering Quality and Regression Coverage

- Added/updated targeted integration tests:
  - `src/tests/app.ui.networks.spec.tsx`
    - metadata edit/clear workflow coverage.
  - `src/tests/app.ui.settings-canvas-render.spec.tsx`
    - export frame/cartouche toggle defaults and persistence.
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`
    - SVG export overlay assertions (frame/cartouche presence),
    - fallback logo rendering,
    - notes clamp behavior,
    - overlay omission when toggles are disabled.
  - `src/tests/portability.network-file.spec.ts`
    - schema-version expectation update and compatibility checks.
- Validation executed in release closure:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci:ui`

## Post-release 1.3.1 Maintenance Updates

### Visual and Theme Fixes

- Restored proper contrast/styling for the **Language** settings sub-panel across themes.
- Locked/simplified the **Viewport resize behavior** setting presentation in Settings for clearer UX.

### Export Frame/Cartouche Follow-ups

- Refined export identity cartouche sizing to be content-adaptive and avoid unnecessary width.
- Applied compact cartouche width behavior and square info-frame corners for export overlays.
- Ensured export frame color uses the **base segment style** (never selection/highlight color).
- Hardened export stroke parity between live 2D rendering and SVG/PNG output for segments/callout leaders.

### Callout Table and Selection Improvements

- Updated callout column semantics/headers (`Wire ID`, `Node ID`, `PIN`, `Len`, `Sec`) and locale-exempt handling for technical labels.
- Added selected-wire row highlighting directly inside callout tables.
- Added wire color support in callouts:
  - `Color` column between `Wire ID` and `Node ID`,
  - color code text,
  - mono/bi-color swatches,
  - empty cell when no color is defined.
- Kept `Color`, `Len`, and `Sec` labels untranslated in FR locale for consistency with technical notation.

### Callout Typography Scale Update

- Reworked callout text-size tier mapping:
  - `small` now maps to former `normal`,
  - `normal` now maps to former `large`,
  - `large` now maps to former `extraLarge`.
- Removed `extraLarge` from the callout text-size selector.
- Added legacy preference normalization (`extraLarge` persisted value now maps to `large`).

### Additional Validation Runs

- Re-ran targeted UI suites during maintenance iterations:
  - `src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `src/tests/app.ui.settings-canvas-render.spec.tsx`
  - `src/tests/app.ui.settings-locale.spec.tsx`
