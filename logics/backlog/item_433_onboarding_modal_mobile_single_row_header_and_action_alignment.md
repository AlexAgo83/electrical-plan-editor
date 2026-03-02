## item_433_onboarding_modal_mobile_single_row_header_and_action_alignment - Onboarding modal mobile single-row header and action alignment
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Mobile onboarding layout compaction
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
On narrow mobile viewports, onboarding modal controls currently wrap into multiple lines, reducing readability and slowing completion of guided steps.

# Scope
- In:
  - keep onboarding `Close` on the same row as icon/title block in mobile mode;
  - keep onboarding target action buttons (`Open`/`Scroll`) and `Next` on one row in mobile mode;
  - preserve full-flow and contextual-help behavior parity.
- Out:
  - onboarding content rewrite;
  - onboarding step sequencing changes;
  - desktop/tablet layout redesign.

# Acceptance criteria
- AC1: On mobile, onboarding header keeps icon/title/progress and `Close` on one line without clipping.
- AC2: On mobile, onboarding footer keeps target actions and `Next` on one line for normal narrow-phone widths.
- AC3: Keyboard focus trap, Escape close, and close/focus restoration behavior remain unchanged.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC1`, `AC2`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/onboarding/OnboardingModal.tsx`
  - `src/app/styles/onboarding.css`
  - `src/tests/app.ui.onboarding.spec.tsx`
