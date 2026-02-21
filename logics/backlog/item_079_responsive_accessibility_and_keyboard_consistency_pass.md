## item_079_responsive_accessibility_and_keyboard_consistency_pass - Responsive Accessibility and Keyboard Consistency Pass
> From version: 0.4.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: UX Quality Hardening
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
After migrating list actions and selection semantics, responsive breakpoints and keyboard accessibility can diverge between screens unless explicitly harmonized.

# Scope
- In:
  - Validate and adjust responsive behavior for list/action-row/form layouts:
    - wide view side-by-side,
    - narrow stacked layout.
  - Validate keyboard navigation and focus-visible states:
    - row focus,
    - row activation via Enter/Space,
    - tab flow list -> actions -> form.
  - Align accessibility labels for list actions and mode controls.
  - Ensure sticky/floating workspace elements do not interfere with form/list interactions.
- Out:
  - Large visual redesign outside list/form surfaces.
  - New keyboard shortcut features.

# Acceptance criteria
- Migrated screens are usable at narrow and wide breakpoints without layout collapse/regression.
- Keyboard-only workflow is coherent and consistent across migrated entities.
- Focus-visible styling is present and consistent with current app accessibility conventions.
- No new accessibility blockers introduced by action-row migration.

# Priority
- Impact: High (day-to-day usability and accessibility quality).
- Urgency: Medium-High (required before final closure).

# Notes
- Dependencies: item_075, item_076, item_077.
- Blocks: item_080.
- Related AC: AC6, AC7.
- References:
  - `logics/request/req_013_list_form_workspace_harmonization_based_on_network_scope.md`
  - `src/app/styles/workspace.css`
  - `src/app/styles/tables.css`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
