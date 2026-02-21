## item_009_v1_workspace_navigation_and_layout_refactor - V1 Workspace Navigation and Layout Refactor
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: UX/UI Information Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The current UX relies on dropdown selectors and fragmented panels, which slows down operator workflows and increases context-switching costs during modeling and analysis.

# Scope
- In:
  - Replace screen/sub-screen dropdown navigation with a persistent left navigation.
  - Introduce top-level sections: `Modeling`, `Analysis`, `Validation`, `Settings`.
  - Implement a stable 3-column workspace layout (left list, center canvas, right inspector).
  - Preserve current entity workflows (`Connector`, `Splice`, `Node`, `Segment`, `Wire`) in the new layout.
- Out:
  - Changes to routing algorithms or domain invariants.
  - Collaborative/multi-user workspace behavior.

# Acceptance criteria
- Users can access all major workflows from persistent left navigation without screen dropdown selectors.
- Workspace is rendered as a 3-column layout on desktop/laptop viewports.
- Existing selection state remains coherent when moving between top-level sections.
- Canvas zone remains available in both modeling and analysis workflows.

# Priority
- Impact: High (foundation for all UX/UI follow-up items).
- Urgency: High (must precede inspector and validation UX work).

# Notes
- Dependencies: item_006, item_008.
- Related AC: AC1, AC2.
- Status update:
  - Persistent left navigation rail is active with top-level workspace tabs (`Modeling`, `Analysis`, `Validation`, `Settings`).
  - Entity sub-navigation is available from the same rail for modeling/analysis contexts.
  - Navigation now displays live counters (entity counts for sub-screens and model issue count on `Validation`).
  - Canvas panel is now visible in both modeling and analysis contexts.
  - Responsive workspace behavior keeps sidebar + content split on desktop and stacked flow on narrower viewports.
- References:
  - `logics/request/req_001_v1_ux_ui_operator_workspace.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`
