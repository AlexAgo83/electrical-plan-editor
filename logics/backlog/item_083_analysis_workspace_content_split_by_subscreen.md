## item_083_analysis_workspace_content_split_by_subscreen - Analysis Workspace Content Split by Sub-screen
> From version: 0.5.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Analysis Workspace Modularization
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AnalysisWorkspaceContent.tsx` aggregates connector, splice, and wire analysis UIs into a single large component, making changes risky and slowing iteration on analysis-specific features.

# Scope
- In:
  - Split analysis content by sub-screen (`connector`, `splice`, `wire`) into dedicated components.
  - Extract shared list headers/filter chips/CSV actions/empty states when it improves clarity.
  - Preserve current layout behavior (list-first + detail panel(s) + network summary row).
  - Preserve analysis interaction behavior and labels.
- Out:
  - New analysis features beyond current scope.
  - Visual redesign of analysis screens.

# Acceptance criteria
- `AnalysisWorkspaceContent.tsx` is reduced to routing/composition logic or equivalent lightweight shell.
- Connector/splice/wire analysis screens are implemented in separate modules.
- Current analysis behaviors (filters, CSV, wire route control, focus selection) remain stable.
- Relevant integration and E2E tests pass.

# Priority
- Impact: Very high (major UI surface and ongoing change hotspot).
- Urgency: High (paired with wave-2 modularization goals).

# Notes
- Dependencies: item_082 (recommended), item_081 (optional parallel).
- Blocks: item_088.
- Related AC: AC3, AC8, AC9.
- References:
  - `logics/request/req_014_ui_modularization_wave_2_controller_analysis_canvas_and_bundle_optimization.md`
  - `src/app/components/workspace/AnalysisWorkspaceContent.tsx`
  - `src/app/components/workspace/AnalysisWorkspaceContent.types.ts`
  - `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `tests/e2e/smoke.spec.ts`
