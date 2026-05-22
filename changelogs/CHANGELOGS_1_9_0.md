# Changelog (`1.8.3 -> 1.9.0`)

## Major Highlights

- Promoted **Harness Assembly** into a fuller workflow with an explicit picker modal, docked scope navigation, saved functional graph behavior, current-network graph shortcuts, and contextual onboarding help.
- Added a toast notification system for key workspace actions, including undo/redo and connector/splice occupancy changes.
- Reworked Home and header ergonomics: recent changes moved to Home, import and PWA update actions were polished, Quick start was reorganized, and sticky/header behavior was stabilized across compact breakpoints.
- Improved catalog, analysis, and connector-layout workflows with cleaner panel states, navigation shortcuts, CSV import/export hardening, and physical layout readability improvements.
- Tightened network summary interactions with auto-switching callout/entity views, an inspector toggle, grouped edit controls, wire-linked pin highlighting, and lazy preloading for the summary workspace.

## Version 1.9.0 - Harness Assembly Workflow, Notifications, and Workspace Polish

### Harness Assembly Workflow

- Added a dedicated harness assembly picker modal for selecting saved assemblies or starting a new draft.
- Docked the harness functional scope navigation into the sticky header so `Harness assembly` and `Current network functional` remain reachable while scrolling.
- Added functional navigation shortcuts from the network summary into the current-network functional graph.
- Hid the harness assembly manager when users are viewing the current-network functional graph, keeping the screen focused on the selected scope.
- Decoupled harness assembly edits from graph updates until `Save assembly`, including draft edits for interconnector link names.
- Added repeated `Save assembly` actions in the manager, master connector, and interconnector sections.
- Added unsaved-change messaging so users know when draft edits are not reflected in the visualization yet.
- Added contextual onboarding help for Harness Assembly and exposed it beside `Export SVG` on both saved assembly graphs and current-network functional graphs in the Harness workspace.
- Moved Harness Assembly help back into the Harness panel when the workflow is active so the help action stays scoped to the assembly surface.
- Extended regression coverage for persisted assembly selection, picker behavior, graph-scope switching, and harness-specific onboarding entry points.

### Network Summary and Functional Graphs

- Grouped network summary edit controls into a dedicated edit menu.
- Added a network summary inspector toggle with persisted view state and regression coverage.
- Auto-switched summary entity and callout views when selection context changes.
- Batched summary selection view updates to reduce redundant render churn.
- Preloaded network summary workspace modules to smooth first entry into the summary experience.
- Added an `Active network` shortcut from functional graphs back into the modeling context.
- Preserved graph export behavior while adding contextual help entry points to functional graph action bars.
- Extended selected-wire highlighting to visible connector and splice pins in drawn plans, including network summary drawings, while keeping the effect on the pin circles only so labels remain readable.
- Fixed canvas entity navigation so clicking a connector, splice, node, segment, or wire from another modeling subpage opens the target subpage and selects the item in one interaction.

### Toast Notifications and Action Feedback

- Added a themed toast notification viewport and action-to-toast mapping layer.
- Surfaced undo and redo actions with visible notifications.
- Added feedback for connector cavity and splice port occupancy changes.
- Kept toast styling theme-aware and isolated from core workspace layout.
- Added store-history and UI regression coverage around global undo/redo feedback.

### Home, Header, and PWA Polish

- Moved recent changes into the Home workspace and refined the recent-change panel layout.
- Replaced the generic Home `Active` chip with the active network name when available and removed the redundant active-network summary line.
- Enriched recent-change rows with action/type context, stronger visual hierarchy, fixed timestamp placement, and optional circular quick-navigation actions for changes that can reopen the edited object.
- Constrained the Workspace recent-changes panel to align with the `What's new` panel bottom on desktop, keeping the footer visible and making only the recent-change list scroll internally.
- Polished Home import actions and workspace resume/action layout, including the Quick start two-column arrangement where the left column contains `Resume`, `Load network`, and `Help`.
- Moved the Home `Help` action between `Load network` and `Create empty workspace` so onboarding help sits with the startup flow.
- Refined the Home changelog display for the larger release feed.
- Stabilized sticky header compaction and dock thresholds across responsive states.
- Kept the Circle Mobility header sticky behavior aligned with the broader header changes.
- Finalized PWA header action behavior and update affordances.

### Catalog, CSV, and Editor Panels

- Split catalog item editor panels so idle editor surfaces no longer occupy space unnecessarily.
- Hid idle catalog editor panels to reduce visual noise in catalog workflows.
- Improved catalog CSV import/export parsing, diagnostics, and test coverage.
- Added analysis navigation paths and catalog CSV export polish.
- Preserved catalog and analysis view selections across navigation.
- Refined connector layout editor panels and spacing for a cleaner physical-layout editing flow.

### Analysis and Physical Views

- Added targeted analysis navigation coverage, including `Go to wire` workflows.
- Aligned connector and splice port layouts for more consistent physical/analysis presentation.
- Capped directional splice analysis port rendering to keep large splices readable.
- Limited connector physical view height to avoid oversized analysis cards.
- Fixed node and segment analysis mobile tables.
- Fixed catalog mobile table overflow.

### Persistence and Portability

- Extended network-file portability support for harness assembly content.
- Added regression coverage for harness assembly network-file handling.
- Preserved recent-change navigation metadata across persisted history entries while remaining compatible with older saved records.
- Preserved catalog and analysis selections through workspace navigation changes.
- Kept release changes backward-compatible with existing persistence and export contracts.

### Tests and Quality Coverage

- Added or updated UI integration coverage for:
  - harness assembly picker and functional workflow polish,
  - onboarding Harness help,
  - analysis `Go to wire` navigation,
  - navigation/canvas behavior,
  - catalog layout and catalog panel behavior,
  - catalog CSV import/export,
  - inspector shell interactions,
  - undo/redo global notifications,
  - recent-change navigation from Home,
  - selected-wire pin highlighting in rendered drawings,
  - direct first-click modeling entity navigation across subpages,
  - network summary workflow behavior,
  - mobile table regressions.
- Added core regression coverage for catalog CSV handling and harness assembly portability.

## Validation and Regression Evidence

- `npm test -- --run src/tests/app.ui.onboarding.spec.tsx`
- `npm test -- --run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run -s typecheck`
- `npx vitest run src/tests/app.ui.home.spec.tsx src/tests/app.ui.networks.spec.tsx src/tests/app.ui.undo-redo-global.spec.tsx src/tests/persistence.localStorage.spec.ts src/tests/recent-change-labels.spec.ts --pool=forks --maxWorkers=2 --testTimeout=15000`
- `npx vitest run src/tests/app.ui.home.spec.tsx --pool=forks --maxWorkers=2 --testTimeout=15000`
