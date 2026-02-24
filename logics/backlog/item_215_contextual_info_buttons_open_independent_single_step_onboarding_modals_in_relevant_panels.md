## item_215_contextual_info_buttons_open_independent_single_step_onboarding_modals_in_relevant_panels - Contextual Info Buttons Open Independent Single-Step Onboarding Modals in Relevant Panels
> From version: 0.7.3
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Contextual In-App Help Entry Points for Onboarding Steps
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding must be reusable as contextual help: each step should be openable on its own from the relevant panel, not only through the full sequence.

# Scope
- In:
  - Add contextual info/help buttons for the relevant onboarding steps in corresponding panels/screens.
  - Open an independent single-step onboarding modal (not the full sequence).
  - Reuse shared onboarding content and modal rendering style.
  - Ensure contextual help does not interfere with current panel actions/focus.
  - Map the correct step to each relevant panel (Network Scope, Connectors/Splices, Nodes, Segments, Wires).
  - Provide contextual entry points for both `Connectors` and `Splices` panels to the shared Step 2 content.
  - Standardize contextual info/help button placement in panel headers.
  - Keep the auto-open opt-out checkbox visible in single-step modal mode (English wording).
- Out:
  - Step CTA screen/panel navigation behavior (handled separately).
  - Home Help relaunch behavior.

# Acceptance criteria
- Relevant panels expose an info/help action that opens the correct single onboarding step modal.
- Single-step modal shows only the targeted step content while preserving shared styling/content fidelity.
- `Connectors` and `Splices` panels both open the same shared connector/splice onboarding step.
- Contextual info/help buttons follow a standardized panel-header placement pattern.

# Priority
- Impact: High.
- Urgency: Medium.

# Notes
- Dependencies: `req_035`, item_211, item_212.
- Blocks: item_216, item_217, item_218, item_219.
- Related AC: AC4, AC7, AC8, AC10, AC12, AC13.
- References:
  - `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
