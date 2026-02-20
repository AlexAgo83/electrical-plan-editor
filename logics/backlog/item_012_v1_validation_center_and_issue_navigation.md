## item_012_v1_validation_center_and_issue_navigation - V1 Validation Center and Issue Navigation
> From version: 0.1.0
> Understanding: 98%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: UX/UI Validation Workflow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Validation feedback is currently distributed across local errors, making it harder to detect, prioritize, and resolve model integrity issues quickly.

# Scope
- In:
  - Add a dedicated `Validation` screen listing grouped issues.
  - Group issues by category: occupancy conflicts, route lock validity, missing references, incomplete required fields.
  - Provide one-click `go to entity` navigation from each issue.
  - Synchronize validation selection with canvas focus and inspector context.
- Out:
  - Formal compliance export/certification reporting.
  - Historical validation trend dashboards.

# Acceptance criteria
- Validation view lists all current issues with stable grouping and severity labeling.
- Clicking an issue navigates and focuses the corresponding entity context.
- Issue list updates after modeling actions without full page reload.
- Users can resolve an issue and observe immediate list refresh.

# Priority
- Impact: High (error prevention and model quality control).
- Urgency: High before UX/UI wave completion.

# Notes
- Dependencies: item_009, item_010, item_008.
- Related AC: AC6, AC7.
- References:
  - `logics/request/req_001_v1_ux_ui_operator_workspace.md`
  - `src/store/selectors.ts`
  - `src/tests/app.ui.spec.tsx`
