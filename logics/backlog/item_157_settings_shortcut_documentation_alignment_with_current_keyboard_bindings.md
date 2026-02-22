## item_157_settings_shortcut_documentation_alignment_with_current_keyboard_bindings - Settings Shortcut Documentation Alignment with Current Keyboard Bindings
> From version: 0.6.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: Low
> Theme: Remove Obsolete Shortcut Hints and Keep Settings Docs in Sync with Implemented Bindings
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`Settings` still documents keyboard shortcuts that are no longer implemented (notably legacy interaction-mode shortcuts), which creates UX confusion and reduces trust in in-app documentation.

# Scope
- In:
  - Remove or update obsolete shortcut hints in `Settings`.
  - Align displayed shortcuts with actual `useKeyboardShortcuts` bindings.
  - Preserve currently valid shortcut groups (top-level navigation, issue navigation, etc.).
- Out:
  - Introducing new keyboard shortcuts.
  - Broad redesign of the Settings shortcuts section.

# Acceptance criteria
- `Settings` shortcut list reflects only implemented keyboard shortcuts.
- No obsolete legacy interaction-mode shortcut hints remain (unless re-implemented in code).
- Any touched shortcut-related tests are updated and pass.

# Priority
- Impact: Medium (UX/docs correctness).
- Urgency: Medium.

# Notes
- Dependencies: `req_027`.
- Blocks: item_160.
- Related AC: AC2, AC5.
- References:
  - `logics/request/req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useKeyboardShortcuts.ts`
  - `src/tests/app.ui.settings.spec.tsx`

