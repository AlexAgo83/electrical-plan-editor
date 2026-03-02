## req_099_onboarding_final_slide_for_key_settings_overview - Onboarding final slide for key settings overview
> From version: 1.2.1
> Status: Done
> Understanding: 100% (implementation and validation completed)
> Confidence: 98%
> Complexity: Medium
> Theme: Onboarding / UX guidance
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add a new final onboarding slide that explains the main settings users should configure.
- Keep onboarding sequence clear by ending with a practical “what to configure next” step.
- Include a direct path to the `Settings` screen from this final slide.
- Keep this Settings slide in full-flow onboarding only (no contextual single-step entrypoint).

# Context
- Current onboarding content in `ONBOARDING_STEPS` focuses on modeling flow (`Network Scope` -> `Catalog` -> `Connectors/Splices` -> `Nodes` -> `Segments` -> `Wires`).
- The flow currently ends after wire creation guidance and does not summarize operational settings that strongly impact day-to-day usage.
- Users can miss important configuration options (theme, shortcuts, workspace defaults, canvas behavior, and global preferences), especially on first run.

# Objective
- Extend onboarding with one additional final step dedicated to high-value Settings guidance.
- Improve first-run usability by making key Settings discoverable at the end of the initial guided flow.
- Keep the step concise, actionable, and consistent with existing onboarding modal behavior.

# Scope
- In:
  - add one new final onboarding step after the current last step (`wires`);
  - define final-step content that highlights principal Settings areas users should review;
  - add a single primary CTA from this step to open the `Settings` workspace;
  - keep onboarding modal progression and step count accurate after insertion;
  - add/update regression tests for the new final step behavior.
- Out:
  - contextual single-step onboarding entrypoint for the new Settings slide;
  - redesign of Settings screen layout itself;
  - changes to underlying settings data contracts;
  - broad onboarding copy rewrite outside the new final step.

# Locked execution decisions
- Decision 1: The new Settings overview slide is appended as the last onboarding step.
- Decision 2: The final step remains concise and focuses on “main settings to configure first” rather than exhaustive documentation.
- Decision 3: The final step includes one explicit primary CTA only: `Open Settings`.
- Decision 4: Existing onboarding behaviors remain unchanged (auto-open/opt-out/close/focus/navigation), with only step sequence extended.
- Decision 5: This request introduces guidance only; no settings behavior or persistence logic is modified.
- Decision 6: The Settings final slide is available in full onboarding flow only, not as a contextual single-step help card.
- Decision 7: Final-step key settings shortlist is fixed to:
  - `Language`
  - `Theme`
  - `Keyboard shortcuts`
  - `Canvas render preferences`
  - `Global preferences`
- Decision 8: Onboarding copy for this request remains English-only; French onboarding copy is handled under `req_098`.

# Functional behavior contract
## A. Onboarding sequence extension
- Add a new `OnboardingStepId` entry for Settings overview.
- Place the new step after `wires`.
- Progress label updates accordingly (for example `Step 7 of 7` after insertion).

## B. Final slide content contract
- The final slide text identifies the most important settings categories users should review first.
- The content should stay short and practical, with emphasized key terms consistent with existing onboarding text style.
- Required key areas to mention:
  - `Language`
  - `Theme`
  - `Keyboard shortcuts`
  - `Canvas render preferences`
  - `Global preferences`
- Copy language for this step is English in this request.

## C. Navigation behavior
- Final slide exposes a single primary CTA: `Open Settings`.
- `Open Settings` opens `Settings` workspace directly.
- CTA follows the same best-effort non-blocking navigation principle used by existing onboarding target actions.

## D. Non-regression constraints
- No regression in onboarding modal accessibility and focus management.
- No regression in contextual onboarding behavior for existing steps.
- No settings state mutation occurs from reading this guidance step alone.
- No new contextual single-step help trigger is introduced for the Settings final slide.

# Acceptance criteria
- AC1: Onboarding includes a new final step dedicated to key Settings guidance.
- AC2: The new Settings step is positioned after the current final step (`wires`).
- AC3: Full-flow progress/count reflects the added step accurately.
- AC4: The final step includes one primary CTA (`Open Settings`) that opens the `Settings` screen.
- AC5: Final-step content covers the fixed shortlist (`Language`, `Theme`, `Keyboard shortcuts`, `Canvas render preferences`, `Global preferences`) in concise onboarding wording.
- AC6: The Settings final slide is part of full flow only and has no contextual single-step entrypoint.
- AC7: Existing onboarding behaviors (auto-open/opt-out/contextual help/focus handling) remain non-regressed.
- AC8: Onboarding copy for this request remains English-only (FR handled by `req_098`).
- AC9: `logics_lint`, `lint`, `typecheck`, and relevant onboarding/UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - final-step presence and order;
  - onboarding progress labels with new total;
  - single CTA (`Open Settings`) navigation from onboarding;
  - absence of contextual single-step trigger for the new Settings slide;
  - non-regression for existing onboarding tests.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Additional step may increase onboarding completion time if content is too verbose.
- Step-order assumptions in existing tests may require careful updates.
- If Settings copy evolves quickly, this final-step guidance can drift and require periodic refresh.

# Backlog
- `logics/backlog/item_480_onboarding_step_registry_extension_with_final_settings_overview_step.md`
- `logics/backlog/item_481_final_onboarding_settings_guidance_copy_and_settings_navigation_cta.md`
- `logics/backlog/item_482_req_099_onboarding_final_settings_step_validation_and_traceability.md`

# References
- `src/app/lib/onboarding.ts`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/AppController.tsx`
- `src/tests/app.ui.onboarding.spec.tsx`
- `src/tests/app.ui.home.spec.tsx`
- `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
- `logics/request/req_043_post_req_035_to_req_042_phase_2_rollout_optional_metadata_surfacing_test_hardening_and_delivery_closure.md`
- `logics/request/req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction.md`
