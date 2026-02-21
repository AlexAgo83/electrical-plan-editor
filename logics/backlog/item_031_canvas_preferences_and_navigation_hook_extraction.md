## item_031_canvas_preferences_and_navigation_hook_extraction - Canvas Preferences and Navigation Hook Extraction
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: UI Logic Extraction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Canvas interactions, preferences persistence, shortcuts, and navigation states are intermixed inside `App.tsx`, making the UI logic hard to reason about and test in isolation.

# Scope
- In:
  - Extract hooks for canvas interactions (zoom/pan/drag/select).
  - Extract hooks for UI preferences persistence and restoration.
  - Extract hooks for screen/sub-screen state and keyboard shortcuts.
  - Keep hook APIs explicit and side-effect boundaries controlled.
- Out:
  - Store/reducer refactoring.
  - New interaction features beyond current behavior.

# Acceptance criteria
- Cross-cutting UI logic is moved into dedicated hooks with stable APIs.
- Hooks are reusable and independently testable.
- Existing canvas and navigation behavior remains unchanged.
- No circular dependency between extracted hooks and UI components.

# Priority
- Impact: High (maintainability and testing leverage).
- Urgency: High after component split baseline.

# Notes
- Dependencies: item_030.
- Blocks: item_033, item_034.
- Related AC: AC2, AC3.
- References:
  - `logics/request/req_005_large_ui_files_split_and_hook_extraction.md`
  - `src/app/App.tsx`

