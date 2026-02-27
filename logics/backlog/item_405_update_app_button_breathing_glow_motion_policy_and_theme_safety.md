## item_405_update_app_button_breathing_glow_motion_policy_and_theme_safety - Update app button breathing glow motion policy and theme safety
> From version: 0.9.16
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Attention-state animation refinement for update-ready action
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Current update-ready visual emphasis can feel blink-like and should be replaced by a smoother breathing glow without accessibility regressions.

# Scope
- In:
  - Replace blink/flicker behavior with continuous breathing glow.
  - Preserve current update-ready visibility/trigger behavior.
  - Enforce reduced-motion fallback with static highlighted state.
  - Validate theme legibility and focus-ring clarity.
- Out:
  - Header action system redesign.
  - PWA lifecycle logic changes.

# Acceptance criteria
- Update-ready action no longer blinks.
- Breathing glow is active only in update-ready state.
- Reduced-motion environments receive non-animated accessible highlight behavior.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_078`.
- Blocks: `item_408`.
- Related AC: AC1, AC2, AC3.
- References:
  - `logics/request/req_078_update_app_button_breathing_glow_and_timestamped_save_filename.md`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/styles/base/base-foundation.css`
  - `src/tests/pwa.header-actions.spec.tsx`

