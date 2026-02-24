## item_212_onboarding_step_content_model_authored_en_copy_and_shared_single_step_full_flow_rendering - Onboarding Step Content Model, Authored EN Copy, and Shared Single-Step/Full-Flow Rendering
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Shared Content Source for Guided and Contextual Onboarding Experiences
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding requires authored English step titles/descriptions and must support both full-flow and independent single-step modals without duplicating copy/layout logic.

# Scope
- In:
  - Create a shared onboarding step content model for the 5 steps.
  - Author final in-app English titles and descriptions based on user-provided semantic guidance.
  - Support rendering in both modes:
    - full multi-step sequence
    - single-step contextual help modal
  - Include structure for title, description, asset/icon, and target screen/panel metadata.
  - Ensure descriptions support bold emphasis for important words.
  - Define English UI chrome text used by shared onboarding rendering (progress/actions/checkbox wording) or a shared copy source for it.
- Out:
  - Auto-open preference persistence.
  - Trigger/button wiring in Home or contextual panels.

# Acceptance criteria
- Final onboarding business content is authored in English (not a literal source-copy translation).
- Step content is stored/reused in a shared model for both sequence and single-step modes.
- Step rendering supports title, description, icon/asset, and emphasis formatting needs.
- Shared onboarding rendering supports English-only UI chrome labels.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_035`, item_211.
- Blocks: item_214, item_215, item_216, item_217, item_218, item_219.
- Related AC: AC1, AC4, AC6, AC7, AC9, AC12.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/components/workspace/HomeWorkspaceContent.tsx`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
