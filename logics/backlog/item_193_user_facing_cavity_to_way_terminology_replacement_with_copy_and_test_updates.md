## item_193_user_facing_cavity_to_way_terminology_replacement_with_copy_and_test_updates - User-Facing Cavity→Way Terminology Replacement with Copy and Test Updates
> From version: 0.7.2
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Product Terminology Cleanup Across UI Copy and Tests
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Product terminology has changed and user-facing UI should use `Way / Ways` instead of `Cavity / Cavities`. Current UI strings, labels, and tests still reference the old terminology.

# Scope
- In:
  - Replace visible UI copy `Cavity/Cavities` with `Way/Ways` across impacted screens/components.
  - Update related validation/help text/messages where terminology appears.
  - Update tests asserting visible copy.
  - Preserve internal model/property names (`cavityCount`, occupancy maps, etc.) unless a broader refactor is explicitly requested.
- Out:
  - Internal schema/domain renaming (`cavity*` identifiers) and migration changes.
  - API/export contract terminology changes unless required by a separate request.

# Acceptance criteria
- User-facing UI uses `Way / Ways` consistently in impacted areas.
- Tests asserting UI copy are updated and pass.
- Internal model naming remains stable unless explicitly changed and documented.

# Priority
- Impact: Medium-High.
- Urgency: High.

# Notes
- Dependencies: `req_032`.
- Blocks: item_194.
- Related AC: AC7, AC8.
- References:
  - `logics/request/req_032_user_feedback_followup_network_scope_focus_minimum_numeric_constraints_empty_callout_suppression_settings_persistence_and_cavity_to_way_terminology.md`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

