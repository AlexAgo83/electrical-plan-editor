## item_156_home_create_empty_workspace_cta_new_workspace_behavior_and_preference_preservation - Home `Create empty workspace` CTA New-Workspace Behavior and Preference Preservation
> From version: 0.6.1
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: Medium
> Theme: Make Home Empty-Workspace CTA Behavior Truthful and Creation-Oriented
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The Home CTA labeled `Create empty workspace` currently behaves like a reset-to-default flow (reloading the sample/default initial state), which is misleading and can reset unrelated UI state/preferences instead of creating a genuinely new empty workspace.

# Scope
- In:
  - Implement a true "new empty workspace" flow for the Home `Create empty workspace` CTA.
  - Preserve unrelated UI preferences (theme, UX toggles, etc.) unless explicitly part of the action contract.
  - Preserve expected confirmation behavior when replacing a non-empty workspace.
  - Keep undo/redo/history integration coherent after the workspace replacement.
- Out:
  - Renaming the CTA to reflect reset/sample semantics (this request explicitly keeps creation semantics).
  - New sample-data workflows or changes to sample network generation.

# Acceptance criteria
- Clicking `Create empty workspace` produces a genuinely empty workspace (no default sample network auto-loaded).
- Unrelated persisted UI preferences are preserved across the action.
- Replacement confirmation behavior remains correct when current workspace contains data.
- Undo/redo/history behavior remains stable after the action.

# Priority
- Impact: High (user-facing behavior mismatch and trust issue).
- Urgency: High (primary Home CTA correctness).

# Notes
- Dependencies: `req_027`.
- Blocks: item_160.
- Related AC: AC1, AC5.
- References:
  - `logics/request/req_027_home_screen_post_review_followup_empty_workspace_cta_truthfulness_shortcut_docs_alignment_lazy_startup_tests_and_logics_scope_sync.md`
  - `src/app/AppController.tsx`
  - `src/store/types.ts`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/tests/app.ui.home.spec.tsx`

