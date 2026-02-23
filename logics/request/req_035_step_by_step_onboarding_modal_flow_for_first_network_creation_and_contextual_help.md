## req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help - Step-by-Step Onboarding Modal Flow for First Network Creation and Contextual Help
> From version: 0.7.3
> Understanding: 100%
> Confidence: 98%
> Complexity: High
> Theme: Guided First-Time User Onboarding and Contextual In-App Learning
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add a step-by-step onboarding flow to guide users through creating their first network.
- The onboarding must be a sequence of modals with progress indication (`Etape X sur X`) and next-step navigation.
- The onboarding modal can be closed at any time.
- The onboarding should auto-open on every app load by default, with a persisted checkbox option to disable future auto-open behavior.
- Each onboarding step must also be openable independently (single-step modal) from contextual info/help buttons inside the relevant panel/screen.
- The onboarding flow must be relaunchable from a `Help` button on the Home screen.
- Each step modal should include a CTA to open the relevant screen and scroll to the corresponding panel when the user is not already there.
- The modal visual design should include a title, an asset/icon, clear description text, and actions; important words in descriptions should be bold.

# Context
The app has grown into a rich modeling/analysis tool with multiple screens and entity workflows (`Network Scope`, `Connectors`, `Splices`, `Nodes`, `Segments`, `Wires`). New users can struggle to understand the expected order of operations to build their first harness/network model.

This request introduces a guided onboarding flow that:
- teaches the modeling sequence,
- reduces confusion about what each panel is for,
- remains optional (dismissable and disableable),
- and supports contextual just-in-time help per step after the initial onboarding.

## Objectives
- Provide an onboarding flow that explains the recommended creation sequence for first-time users.
- Make onboarding persistent and user-controlled (auto-open by default, but can be disabled).
- Support both full guided flow and independent step help modals.
- Help users navigate directly to the relevant screen/panel from each step.
- Deliver a clear, concrete, visually structured modal UI with strong emphasis on key concepts.

## Functional Scope
### A. Step-by-step onboarding flow (full flow) as modal sequence (high priority)
- Implement a full onboarding flow composed of a sequence of modals (or one modal with step pagination) with `5` steps.
- Each step must show:
  - progress label in French style: `Etape X sur 5`
  - a `Suivant` button (except last step, which may use a finish/close action)
  - a close action (X and/or button) so the user can exit anytime
- Flow behavior:
  - next/previous navigation design can be chosen, but `Suivant` is required
  - closing early must be safe and not corrupt app state
  - re-opening should resume from step 1 unless otherwise specified

### B. Auto-open on app load with persisted opt-out (high priority)
- By default, the onboarding flow should open automatically when the app loads.
- Add a checkbox in the onboarding modal UI to disable automatic future opening (persisted value).
- Persistence requirements:
  - value must survive reloads (local persistence)
  - default behavior for existing users should be explicitly defined (recommended: auto-open enabled until user opts out)
- Ensure the user can still manually relaunch onboarding later even if auto-open is disabled.

### C. Onboarding content (5 steps) with domain-specific explanations (high priority)
- The flow must include the following 5 steps.
- Important clarification:
  - the user-provided wording below is semantic guidance only (intent/meaning)
  - final in-app step titles and descriptions must be authored by implementation/product copy work
  - final business/domain copy must be written in English
- Copywriting requirements for authored content:
  - preserve the meaning/order of the 5 steps
  - use clear, concrete onboarding wording for first-time users
  - avoid literal translation if a clearer onboarding phrasing exists

1. `Etape 1` - Créer un nouveau réseau
   - Meaning guidance: this is the harness plan / wiring plan

2. `Etape 2` - Créer sa banque de connecteurs et splices
   - Meaning guidance: this is the hardware toolbox; define connectors/splices and the ways/ports available to use in a network

3. `Etape 3` - Créer des nodes représentant et associant connecteurs / splices / hubs intermédiaires dans le réseau
   - Meaning guidance: create nodes to represent and link connectors / splices / intermediate hubs in the network

4. `Etape 4` - Créer les segments entre les différents nodes
   - Meaning guidance: create segments between nodes to define physical links and lengths

5. `Etape 5` - Créer les câbles
   - Meaning guidance: create cables that travel across segments from element A to element B

- Content requirements:
  - descriptions must be clear and pedagogical
  - important words must be emphasized in bold
  - domain/business content in modal titles and descriptions must be English (not French)
  - UI chrome labels (e.g. progress pattern) may remain aligned with product language decisions

### D. Independent single-step help modals (contextual info buttons) (high priority)
- Each onboarding step must be openable independently via an info/help button in the corresponding UI context.
- Examples:
  - `Connectors` panel info button opens only the connector/splice step content
  - `Nodes` panel info button opens only the nodes step content
- Single-step modal behavior:
  - shows only the relevant step (not the full sequence)
  - can still be closed freely
  - should visually match the full onboarding modal style

### E. Relaunch onboarding from Home screen (high priority)
- Add a `Help` button (or similar CTA) on the Home screen to relaunch the full onboarding flow at any time.
- This manual relaunch must work even when auto-open has been disabled.

### F. Step CTA to open target screen and scroll to target panel (high priority)
- For each onboarding step, if the user is not already on the corresponding screen, include a button in the modal to:
  - open the relevant screen
  - scroll to the relevant panel
- Example mappings (to confirm during implementation):
  - Step 1 -> `Network Scope` screen / network panel
  - Step 2 -> `Modeling > Connector` (and/or splice panel in the same area)
  - Step 3 -> `Modeling > Node`
  - Step 4 -> `Modeling > Segment`
  - Step 5 -> `Modeling > Wire`
- Scrolling behavior must be reliable and accessible (focus/scroll timing with lazy-loaded content considered).

### G. Modal appearance and UX presentation (medium-high priority)
- Modal UI requirements:
  - title
  - asset/icon (preferably topic-specific icon already used in UI if available)
  - description text
  - step progress label (`Etape X sur 5`)
  - actions (close, next, open target screen/panel as applicable)
  - persisted checkbox (`Ne plus ouvrir automatiquement` or equivalent wording)
- Styling expectations:
  - descriptions are concrete and readable
  - important terms in bold
  - responsive layout (desktop + mobile)
  - coherent with current theme system
- Content language expectation:
  - business/domain explanatory text is EN
  - avoid FR-only domain copy in step descriptions

## Non-functional requirements
- Do not block users from using the app (onboarding must always be dismissable).
- Persist onboarding auto-open preference reliably across reloads.
- Keep onboarding flow and contextual step help maintainable (shared content model to avoid duplication).
- Preserve keyboard accessibility (focus trap, ESC close if modal system supports it, logical button order).
- Avoid regressions in screen navigation and panel focus/scroll behavior.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - onboarding auto-open behavior on app load
  - persisted opt-out behavior (reload retains disabled auto-open)
  - Home `Help` button relaunch
  - contextual step-info button opens only the relevant step
  - step CTA navigates to correct screen and scrolls to target panel
- Likely touched test areas:
  - `src/tests/app.ui.home.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx` (if onboarding preference is surfaced in settings)
  - `src/tests/persistence.localStorage.spec.ts` (if persistence wiring is added via local storage helpers)
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`

## Acceptance criteria
- AC1: A 5-step onboarding flow is available as a sequence of modals with `Etape X sur 5` and `Suivant`.
- AC2: The onboarding modal can be closed at any time without breaking app state.
- AC3: The onboarding auto-opens on app load by default, with a persisted checkbox allowing users to disable future auto-open.
- AC4: Each onboarding step can be opened independently via a contextual info/help button in the relevant UI panel.
- AC5: A `Help` button on the Home screen can relaunch the full onboarding flow even when auto-open is disabled.
- AC6: Each step includes a CTA that opens the corresponding screen and scrolls to the relevant panel when needed.
- AC7: Modal UI includes title, asset/icon, clear description, and actions; important words are bold in descriptions.
- AC8: Onboarding behavior (auto-open, opt-out, relaunch, contextual steps, navigation CTA) is covered by regression tests.

## Out of scope
- Full interactive tutorial validation (e.g., checking that the user completed each real modeling action before proceeding).
- Video/tutorial media uploads or remote CMS-driven onboarding content.
- Multi-language localization framework rollout (copy can be French-first for this feature).
- Advanced analytics/telemetry tracking for onboarding completion.

# Backlog
- `logics/backlog/item_211_onboarding_modal_flow_shell_step_state_and_dismissable_sequence_controller.md`
- `logics/backlog/item_212_onboarding_step_content_model_authored_en_copy_and_shared_single_step_full_flow_rendering.md`
- `logics/backlog/item_213_onboarding_auto_open_on_app_load_with_persisted_opt_out_preference.md`
- `logics/backlog/item_214_home_help_button_relaunches_full_onboarding_flow_independent_of_auto_open_setting.md`
- `logics/backlog/item_215_contextual_info_buttons_open_independent_single_step_onboarding_modals_in_relevant_panels.md`
- `logics/backlog/item_216_onboarding_step_cta_opens_target_screen_and_scrolls_to_relevant_panel.md`
- `logics/backlog/item_217_onboarding_modal_visual_design_assets_bold_emphasis_responsive_and_accessibility_polish.md`
- `logics/backlog/item_218_onboarding_flow_regression_tests_for_auto_open_opt_out_contextual_steps_and_navigation_cta.md`
- `logics/backlog/item_219_req_035_onboarding_flow_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# References
- `src/app/AppController.tsx`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
