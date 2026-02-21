## item_048_entity_form_controllers_and_canvas_interaction_hook_extraction - Entity Form Controllers and Canvas Interaction Hook Extraction
> From version: 0.2.0
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Interaction and Form Split
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Entity form logic and canvas interaction controller currently co-exist in `App.tsx`, producing high coupling between editing flows, interaction modes, and render concerns.

# Scope
- In:
  - Extract dedicated form controller hooks for connector/splice/node/segment/wire workflows.
  - Extract canvas interaction hook for zoom/pan/drag/focus/coordinate transformations.
  - Preserve interaction mode semantics (select/addNode/addSegment/connect/route).
  - Keep current behavior for selection, anchoring, and canvas focus commands.
- Out:
  - Validation model extraction.
  - Workspace history/import/export orchestration.
  - Final screen JSX split and quality gate closure.

# Acceptance criteria
- Form controller hooks expose explicit create/edit/reset/submit APIs with parity behavior.
- Canvas controller hook preserves current pan/zoom/drag and coordinate behavior.
- Node/segment/wire interaction mode UX remains functionally equivalent.
- No regression in canvas/navigation and list ergonomics test suites.

# Priority
- Impact: Very high (largest remaining state/handler surface reduction).
- Urgency: High after helper/validation extraction.

# Notes
- Dependencies: item_045, item_046.
- Blocks: item_049.
- Related AC: AC2, AC3, AC6.
- References:
  - `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
  - `src/app/App.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
