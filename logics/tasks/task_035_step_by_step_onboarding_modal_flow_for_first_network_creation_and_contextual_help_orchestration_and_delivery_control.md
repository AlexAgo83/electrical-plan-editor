## task_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help_orchestration_and_delivery_control - Step-by-Step Onboarding Modal Flow for First Network Creation and Contextual Help Orchestration and Delivery Control
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Delivery Orchestration for Guided First-Time Onboarding, Contextual Help, and Persisted Opt-Out UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Orchestration task for `req_035`. This task coordinates delivery of a guided onboarding experience for first-time users building their first network, including:
- a 5-step dismissable modal flow with progress and next-step actions,
- authored English business descriptions (based on semantic guidance),
- auto-open on app load with persisted opt-out,
- contextual single-step help modals in relevant panels,
- Home Help relaunch,
- step CTAs that navigate to the right screen/panel and scroll to the target context,
- modal visual/accessibility polish and regression coverage.

Confirmed implementation decisions for this request:
- Onboarding UI chrome labels are English-only (progress/actions/checkbox wording).
- Full-flow re-open resets to step 1 (no resume state).
- Auto-open is enabled by default for both new and existing users until opt-out.
- The auto-open opt-out checkbox is available in both full-flow and single-step contextual modals.
- Step CTA remains available when already in the relevant context and adapts to a context action (recommended: `Scroll to panel`) rather than disappearing.
- Step CTA navigation/scroll is best-effort and non-blocking if a target panel is temporarily unavailable.
- Step 2 contextual help is reachable from both `Connectors` and `Splices` panel headers and opens the same shared step content.
- Contextual info/help buttons use a standardized panel-header placement pattern.

Backlog scope covered:
- `item_211_onboarding_modal_flow_shell_step_state_and_dismissable_sequence_controller.md`
- `item_212_onboarding_step_content_model_authored_en_copy_and_shared_single_step_full_flow_rendering.md`
- `item_213_onboarding_auto_open_on_app_load_with_persisted_opt_out_preference.md`
- `item_214_home_help_button_relaunches_full_onboarding_flow_independent_of_auto_open_setting.md`
- `item_215_contextual_info_buttons_open_independent_single_step_onboarding_modals_in_relevant_panels.md`
- `item_216_onboarding_step_cta_opens_target_screen_and_scrolls_to_relevant_panel.md`
- `item_217_onboarding_modal_visual_design_assets_bold_emphasis_responsive_and_accessibility_polish.md`
- `item_218_onboarding_flow_regression_tests_for_auto_open_opt_out_contextual_steps_and_navigation_cta.md`
- `item_219_req_035_onboarding_flow_closure_ci_e2e_build_pwa_and_ac_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 onboarding modal shell/controller for full 5-step dismissable flow (`item_211`)
- [ ] 2. Deliver Wave 1 shared step content model + authored EN copy for sequence and single-step modes (`item_212`)
- [ ] 3. Deliver Wave 2 auto-open on app load + persisted opt-out checkbox preference (`item_213`)
- [ ] 4. Deliver Wave 3 Home Help button relaunch for full onboarding flow (`item_214`)
- [ ] 5. Deliver Wave 4 contextual info buttons opening independent single-step onboarding modals (`item_215`)
- [ ] 6. Deliver Wave 5 step CTA navigation to target screen + panel scroll behavior (`item_216`)
- [ ] 7. Deliver Wave 6 visual/accessibility polish (icons/assets, bold emphasis, responsive dialog UX) (`item_217`)
- [ ] 8. Deliver Wave 7 regression tests for auto-open/opt-out/relaunch/contextual steps/navigation CTA (`item_218`)
- [ ] 9. Deliver Wave 8 closure: CI-equivalent validation, AC traceability, and Logics updates (`item_219`)
- [ ] FINAL: Update related Logics docs (request/task/backlog progress + delivery summary)

# Validation
- Documentation / Logics:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Static analysis / compile safety:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run quality:ui-modularization`
  - `npm run quality:store-modularization`
- Automated tests:
  - Targeted runs during implementation (recommended):
    - `src/tests/app.ui.home.spec.tsx`
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/persistence.localStorage.spec.ts`
    - `src/tests/app.ui.settings.spec.tsx` (if onboarding preference is exposed there)
  - `npm run test:ci`
- End-to-end tests:
  - `npm run test:e2e`
- Build / delivery checks:
  - `npm run build`
  - `npm run quality:pwa`

# Report
- Wave status:
  - Wave 0 (modal shell/controller): pending
  - Wave 1 (shared content model + authored EN copy): pending
  - Wave 2 (auto-open + persisted opt-out): pending
  - Wave 3 (Home Help relaunch): pending
  - Wave 4 (contextual single-step help buttons): pending
  - Wave 5 (step CTA navigation + panel scroll): pending
  - Wave 6 (visual/accessibility polish): pending
  - Wave 7 (regression tests): pending
  - Wave 8 (closure + AC traceability): pending
- Current blockers:
  - None at kickoff.
- Main risks to track:
  - Modal state orchestration may get duplicated between full-flow and single-step modes unless content/rendering is centralized.
  - Persisted opt-out behavior can race with app-load auto-open timing and lazy UI mounting.
  - Panel scrolling after navigation may be flaky without stable target anchors and timing guards.
  - Contextual info buttons may clutter panel headers if placement is not standardized.
  - EN-only UI chrome labels may drift if action/progress/checkbox text is partially reused from existing localized labels.
  - Step CTA behavior can feel inconsistent if "already on target" mode hides the action instead of adapting it.
  - Onboarding copy/emphasis rendering may become hard to maintain if descriptions are encoded as raw HTML instead of structured content.
- Mitigation strategy:
  - Build a shared onboarding controller + content model before wiring entry points.
  - Treat auto-open decision as an explicit startup gate after preference hydration.
  - Use stable target anchors/refs and deferred scroll sequencing for navigation CTA.
  - Reuse existing icons and dialog patterns for consistency and lower implementation risk.
  - Add targeted UI tests for persistence + entry points + navigation CTA behavior early.
  - Define explicit English label constants/copy for progress/actions/checkbox in the shared onboarding renderer.
  - Standardize contextual info-button placement in panel headers before broad wiring.
- Validation snapshot (kickoff):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅ (request + planning artifacts)
- Delivery snapshot:
  - Pending implementation.
- AC traceability (`req_035`) target mapping:
  - AC1 -> `item_211`, `item_212`, `item_219`
  - AC2 -> `item_211`, `item_219`
  - AC3 -> `item_213`, `item_218`, `item_219`
  - AC4 -> `item_212`, `item_215`, `item_218`, `item_219`
  - AC5 -> `item_214`, `item_218`, `item_219`
  - AC6 -> `item_212`, `item_216`, `item_218`, `item_219`
  - AC7 -> `item_212`, `item_217`, `item_218`, `item_219`
  - AC8 -> `item_213`, `item_214`, `item_215`, `item_216`, `item_217`, `item_218`, `item_219`
  - AC9 -> `item_211`, `item_212`, `item_217`, `item_218`, `item_219`
  - AC10 -> `item_211`, `item_213`, `item_215`, `item_217`, `item_218`, `item_219`
  - AC11 -> `item_216`, `item_218`, `item_219`
  - AC12 -> `item_212`, `item_215`, `item_218`, `item_219`
  - AC13 -> `item_215`, `item_217`, `item_218`, `item_219`

# References
- `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
- `logics/backlog/item_211_onboarding_modal_flow_shell_step_state_and_dismissable_sequence_controller.md`
- `logics/backlog/item_212_onboarding_step_content_model_authored_en_copy_and_shared_single_step_full_flow_rendering.md`
- `logics/backlog/item_213_onboarding_auto_open_on_app_load_with_persisted_opt_out_preference.md`
- `logics/backlog/item_214_home_help_button_relaunches_full_onboarding_flow_independent_of_auto_open_setting.md`
- `logics/backlog/item_215_contextual_info_buttons_open_independent_single_step_onboarding_modals_in_relevant_panels.md`
- `logics/backlog/item_216_onboarding_step_cta_opens_target_screen_and_scrolls_to_relevant_panel.md`
- `logics/backlog/item_217_onboarding_modal_visual_design_assets_bold_emphasis_responsive_and_accessibility_polish.md`
- `logics/backlog/item_218_onboarding_flow_regression_tests_for_auto_open_opt_out_contextual_steps_and_navigation_cta.md`
- `logics/backlog/item_219_req_035_onboarding_flow_closure_ci_e2e_build_pwa_and_ac_traceability.md`
- `src/app/AppController.tsx`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/tests/app.ui.home.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
- `.github/workflows/ci.yml`
- `package.json`
