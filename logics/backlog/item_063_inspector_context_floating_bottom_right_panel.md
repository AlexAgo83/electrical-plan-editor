## item_063_inspector_context_floating_bottom_right_panel - Inspector Context Floating Bottom-Right Panel
> From version: 0.3.0
> Understanding: 100%
> Confidence: 99%
> Progress: 100% (floating panel + visibility matrix delivered)
> Complexity: Medium
> Theme: Contextual Inspector Placement
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Inspector context` currently participates in static layout flow, reducing workspace flexibility and conflicting with the new floating-shell interaction model.

# Scope
- In:
  - Render `Inspector context` as a floating panel anchored to bottom-right of the viewport when displayed.
  - Implement contextual visibility states:
    - `open` on `Modeling`/`Analysis`/`Validation` with an inspectable selection.
    - `collapsed` on those screens without selection, and on narrow viewports to avoid workspace occlusion.
    - `hidden` on `Network Scope`, on `Settings`, when no active network exists, and while modal/dialog focus is active.
  - Keep anchored behavior stable while underlying screen content scrolls.
  - Preserve existing inspector actions, selection-driven content, and empty-state behavior.
  - Ensure layering compatibility with drawer and operations/health floating panel.
- Out:
  - Draggable/resizable inspector behavior.
  - Inspector content redesign beyond placement and shell integration.

# Acceptance criteria
- `Inspector context` is anchored bottom-right whenever it is rendered.
- Visibility behavior matches the defined `open`/`collapsed`/`hidden` context matrix.
- Panel/collapsed trigger remains stable during content scroll and viewport changes.
- Existing inspector interactions continue to work without regressions.
- Overlay/focus behavior remains accessible and does not break other shell controls.

# Priority
- Impact: Medium-high (constant context visibility with less layout pressure).
- Urgency: High (explicit req_010 requirement).

# Notes
- Dependencies: item_056.
- Blocks: item_059.
- Related AC: AC12, AC13, AC7.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/InspectorContextPanel.tsx`
  - `src/app/AppController.tsx`
  - `src/app/styles/workspace.css`
  - `src/app/styles/base.css`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/tests/app.ui.inspector-shell.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
