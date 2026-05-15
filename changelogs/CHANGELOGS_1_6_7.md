# Changelog (`1.6.6 -> 1.6.7`)

## Major Highlights

- Decoupled Harness Assembly visualization from the active network selection.
- Added a persistent Harness Assembly selector so the displayed assembly is explicit and stable.
- Added a dedicated current-network functional schematic tab for workflows that still need the active network graph.
- Added UI warning coverage for unsaved local changes that are not yet reflected in the saved visualization.

## Version 1.6.7 - Harness Assembly Display Selection

### Harness Assembly Visualization

- Harness Assembly display now follows the selected assembly instead of implicitly following the active network.
- Empty selection remains supported and can persist until the user chooses another assembly.
- Saved assembly state remains the source of truth for what is visualized, keeping unsaved edits visible as pending changes instead of silently mutating the graph.

### Current Network Functional Schematic

- Current-network functional rendering is available in its own tab.
- Network-scoped functional inspection no longer interferes with assembly-level physical harness visualization.

### Release Scope

- Includes the Logics-backed implementation for the Harness Assembly display selection request.
- Includes the companion Harness Assembly usage report already committed on `main`.

## Validation and Regression Evidence

- User validation: `npm run dev`
- `npm test -- --run src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
- `npm test -- --run src/tests/core.functional-schematic.spec.ts`
- `npm test -- --run src/tests/store.reducer.harness-assemblies.spec.ts`
- `.\\node_modules\\.bin\\tsc.cmd --noEmit`
- `npm run -s lint`
- `npm run -s build`
