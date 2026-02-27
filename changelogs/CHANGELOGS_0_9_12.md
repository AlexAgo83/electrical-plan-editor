# Changelog (since version `0.9.6` to version `0.9.12`)

This changelog summarizes delivered changes since commit `407d071b5919c2c908dfa7a3350693a972f1db64` (version `0.9.6` baseline), up to the current repository state (`0.9.12` / `55f9515`).

## Major Highlights

- Added **catalog and BOM pricing settings** with currency/tax controls and tax-aware BOM export behavior.
- Hardened **accessibility** across onboarding, tables, validation flows, and network summary SVG interactions.
- Delivered the full **req_062 -> req_066 feature queue**:
  - Catalog CSV import/export,
  - wire endpoint swap in edit mode,
  - segment node swap in edit mode,
  - split segment-analysis endpoint columns (`Endpoint A` / `Endpoint B`),
  - global undo/redo history and shortcuts.
- Added **wire fuse mode** with catalog linkage (`protection.kind = fuse` + required catalog reference).
- Completed broad **quality and CI hardening** (coverage visibility, bundle metrics, slow-test observability, segmented test lanes, CI diagnostics order).
- Improved 2D label rendering with:
  - label layer above geometry,
  - centered segment labels when length is hidden,
  - new settings toggle for auto segment label rotation.

## Product and UX Changes

### Pricing, Catalog, and BOM

- Added settings for catalog/BOM pricing defaults and tax/VAT behavior.
- BOM CSV export now respects pricing/tax settings in a deterministic way.
- Added a settings control to recreate a **catalog validation issues** sample.
- Catalog CSV actions were polished for layout/styling consistency.

### Modeling and Analysis Ergonomics

- Added wire edit action to **swap Endpoint A/B** between `Save` and `Cancel edit`.
- Added segment edit action to **swap Node A/B** between `Save` and `Cancel edit`.
- Segment analysis table now splits endpoints into two dedicated columns:
  - `Endpoint A`
  - `Endpoint B`
- Added global **Undo/Redo** support for modeling/catalog mutations with keyboard shortcuts.

### Wire Fuse Support (V1)

- Added wire protection metadata support for fuse mode with catalog linkage.
- Fuse-mode form and validation behavior were refined:
  - required catalog association for fuse wires,
  - clearer checkbox/form semantics,
  - visibility in wire-related UI surfaces.

### Network Summary and 2D Rendering

- Reworked network summary layering so labels paint above geometry.
- Hardened segment keyboard interaction and SVG accessibility semantics.
- Fixed segment label centering when segment length display is hidden.
- Added settings option for **auto segment label rotation** (enabled/disabled preference).

### Themes

- Added **Circle Mobility** presets:
  - light theme
  - dark theme
- Centralized Circle theme tokens and aligned quality-gate compatibility.

### Samples and Baseline Data

- Seeded sample catalog data for demos/smoke reliability.
- Updated sample network fixtures and related tests.

## Accessibility Improvements

- Added onboarding modal focus management (focus trap and restoration behavior).
- Improved table semantics and keyboard behavior in validation and workspace tables.
- Improved network summary accessibility and keyboard segment activation.

## Engineering Quality, CI, and Observability

### req_068 Quality Follow-Ups

- Added non-blocking quality observability scripts:
  - `coverage:ui:report`
  - `bundle:metrics:report`
  - slow-test reporting
- Added bundle metrics and baseline reporting utilities.
- Improved README guidance for CI/quality workflows.

### req_069 CI Reliability and Segmentation

- Hardened CI diagnostic execution order (`always-run` non-blocking observability signals where relevant).
- Added explicit Vitest segmentation tooling and scripts:
  - `test:ci:fast`
  - `test:ci:ui`
  - segmentation contract checks
- Improved UI test reliability through targeted stabilization work.
- Kept canonical `test:ci` as the full aggregate suite.

## Documentation and Repo Hygiene

- Added and synchronized request/task/backlog planning artifacts for req_057 through req_069.
- Refreshed README notes for CI and onboarding/fuse guidance.
- Updated README media/image asset.
- Split oversized settings UI integration test coverage into modular files to satisfy UI modularization quality gates.

