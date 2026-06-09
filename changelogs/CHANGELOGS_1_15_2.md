# Changelog (`1.15.1 -> 1.15.2`)

## Major Highlights

- Functional schematic overlays now expose electrical route context directly on the generated schematic, making connector and segment relationships easier to inspect without leaving the workspace.
- Batch selection now opens through an explicit `Open batch` action after multi-select mode is enabled, so operators can build the selection first and inspect or delete it when ready.
- Batch selection dependency summaries and segment callouts now use the same theme-aware surfaces and color tokens as the surrounding workspace, including dark theme rendering.
- AppController workspace runtime code was extracted into focused hook modules, with a follow-up Logics task recorded for the remaining decomposition work.

## Patch Notes

- Added electrical overlay rendering for functional schematic connectors, segments, and routed context.
- Added focused regression coverage for the functional schematic electrical overlay.
- Changed the multi-select toolbar flow so `Select multiple` starts selection mode without opening the batch dialog automatically.
- Added an `Open batch` button next to the delete and cancel-selection actions while a batch selection is active.
- Moved the batch selection detail view into a modal while keeping the selection controls available in the workspace.
- Fixed the `Blocked`, connector, connected segment, wire endpoint, and routed-wire dependency panels in the batch selection dialog so they inherit the active theme instead of rendering white panels with light text.
- Aligned segment callout colors with the existing node callout theme tokens.
- Updated UI test segmentation so the current workspace panel coverage is included in the CI gate.
- Adjusted existing workspace shell, onboarding, inspector, and theme tests to match the now-visible analysis and batch-selection dialog surfaces.
- Recorded `task_136_appcontroller_hook_impl_decomposition_follow_up` for the remaining AppController hook implementation decomposition.

## Version 1.15.2 - Functional Schematic Overlays and Batch Selection Flow

### Functional Schematic Overlays

- Operators can inspect electrical route context directly from the functional schematic overlay.
- The new overlay behavior is covered by a dedicated UI regression test and included in the UI CI segmentation gate.

### Batch Selection Dialog Flow

- Multi-select mode no longer opens the batch selection dialog immediately.
- The toolbar now shows `Open batch` beside delete and cancel selection, letting operators refine the selection before reviewing dependency summaries or confirming destructive actions.
- Blocked connector dependency summaries remain visible before deletion and continue to stop batch delete when blocked connectors are selected.

### Theme Consistency

- Batch selection dependency panels now use themed panel, border, and text styles across light and dark themes.
- Segment callouts now reuse the node callout color treatment so callout categories stay visually consistent.

### App Runtime Decomposition

- AppController workspace runtime responsibilities were moved into focused hook modules.
- A linked Logics follow-up task tracks the remaining hook implementation decomposition so the release does not leave that work implicit.

### Verification

- `logics-manager status`
- `logics-manager health`
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- `npm run -s ci:blocking`
