## item_321_validation_catalog_target_selection_kind_and_go_to_navigation_support - Validation Catalog Target Selection Kind and Go-to Navigation Support
> From version: 0.9.5
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Extend validation issue target typing/navigation to support catalog items and preserve correct go-to behavior for connector/splice catalog-link issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Validation cannot currently target `Catalog` items, so catalog integrity issues cannot use native `Go to` navigation. Catalog-link issues also need explicit go-to semantics to avoid opening the wrong screen.

# Scope
- In:
  - Extend validation issue target typing to support `catalog`.
  - Add catalog selection navigation support for Validation `Go to`.
  - Route catalog-targeted issues to `Catalog` modeling sub-screen and select the matching item.
  - Preserve connector/splice-targeted catalog-link issue behavior (open affected connector/splice record).
  - Keep drawer/desktop navigation behavior consistent.
- Out:
  - Validation rule generation for catalog integrity (handled in item_322).

# Acceptance criteria
- Validation issues can target catalog items.
- `Go to` on catalog-targeted issues opens `Catalog` and selects the item.
- `Go to` on connector/splice catalog-link issues opens the affected connector/splice (not `Catalog`).
- Existing non-catalog validation `Go to` flows remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_053`, `req_051`.
- Blocks: item_322, item_323, item_332.
- Related AC: AC2, AC4, AC5.
- References:
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/app/types/app-controller.ts`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`

