## item_217_onboarding_modal_visual_design_assets_bold_emphasis_responsive_and_accessibility_polish - Onboarding Modal Visual Design, Assets, Bold Emphasis, Responsive, and Accessibility Polish
> From version: 0.7.3
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: High-Quality Onboarding Presentation and Accessibility Fit
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding modal needs a clear, polished presentation (title, icon/asset, readable content with bold emphasis) and must remain usable across themes and device sizes.

# Scope
- In:
  - Implement modal visual presentation requirements (title, icon/asset, description, actions, progress, checkbox) for full-flow and single-step variants.
  - Support bold emphasis in descriptions for key terms.
  - Ensure responsive layout on desktop/mobile.
  - Ensure accessibility baseline (focus order, close action discoverability, semantics consistent with modal/dialog pattern).
  - Keep styling coherent with theme system.
  - Ensure onboarding UI chrome labels are English-only (progress/actions/checkbox wording).
  - Ensure opt-out checkbox presentation remains coherent in single-step contextual modal mode.
- Out:
  - Rich animation system or complex tutorial illustrations beyond practical UI assets.
  - Full design system overhaul.

# Acceptance criteria
- Onboarding modal renders all required visual elements with readable layout.
- Important terms can be emphasized in bold within descriptions.
- Modal remains usable on mobile and desktop and follows baseline modal accessibility expectations.
- UI chrome labels render in English-only across onboarding variants.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_035`, item_211, item_212.
- Blocks: item_218, item_219.
- Related AC: AC7, AC8, AC9, AC10, AC13.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/styles.css`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
