## item_417_canvas_tools_selected_callout_only_preference_state_and_persistence - Canvas tools selected-callout-only preference state and persistence
> From version: 0.9.18
> Status: Draft
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Preference contract extension for focused callout mode
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The selected-callout-only mode needs a first-class preference contract (default off + persistence), otherwise runtime behavior will drift across reloads.

# Scope
- In:
  - add preference field for selected-callout-only behavior;
  - default value `false` and reset/apply-defaults integration;
  - restore value on app bootstrap.
- Out:
  - rendering filter behavior itself;
  - callout visual redesign.

# Acceptance criteria
- AC1: New settings toggle exists and defaults to unchecked.
- AC2: Preference persists and restores across remount/reload.
- AC3: Apply-defaults/reset flows include this preference deterministically.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_081`.
- Blocks: `item_418`, `item_420`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC6`.
- References:
  - `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
