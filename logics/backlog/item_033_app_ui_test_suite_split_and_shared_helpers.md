## item_033_app_ui_test_suite_split_and_shared_helpers - App UI Test Suite Split and Shared Helpers
> From version: 0.1.0
> Understanding: 99%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Test Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/tests/app.ui.spec.tsx` aggregates many workflows in one file, making tests harder to navigate and diagnose when failures occur.

# Scope
- In:
  - Split UI integration tests by functional areas (navigation, canvas, validation, settings, list ergonomics).
  - Extract shared builders/helpers for store fixtures and UI lookup utilities.
  - Keep existing scenario intent and assertions.
  - Improve failure locality and maintainability.
- Out:
  - E2E scope redesign.
  - New features not already covered by existing UI test suite.

# Acceptance criteria
- UI test suite is separated into multiple focused files.
- Common test setup utilities are centralized and reused.
- Existing critical UI flows remain covered after split.
- Test readability and failure diagnosis improve.

# Priority
- Impact: High (quality and maintainability).
- Urgency: High after component/hook split to keep test alignment.

# Notes
- Dependencies: item_030, item_031.
- Blocks: item_034.
- Related AC: AC5.
- References:
  - `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
  - `src/tests/app.ui.spec.tsx`

