## task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates - Super orchestration delivery execution for req_097, req_098, and req_099 with validation gates
> From version: 1.2.1
> Status: Done
> Understanding: 100% (scope extended to include req_099 onboarding final-step delivery)
> Confidence: 96% (request and backlog scope now consolidated under one orchestration task)
> Progress: 100% (req_097, req_098, and req_099 implemented, validated, and documented)
> Complexity: High
> Theme: UI / Internationalization / Onboarding
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Super-orchestration task to deliver:
  - `req_097_hover_descriptions_for_buttons_selects_and_options`
  - `req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction`
  - `req_099_onboarding_final_slide_for_key_settings_overview`
- Backlog execution scope:
  - `item_478_hover_descriptions_for_buttons_selects_and_options`
  - `item_479_settings_panel_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction_safeguards`
  - `item_480_onboarding_step_registry_extension_with_final_settings_overview_step`
  - `item_481_final_onboarding_settings_guidance_copy_and_settings_navigation_cta`
  - `item_482_req_099_onboarding_final_settings_step_validation_and_traceability`
- Hard constraints carried from requests:
  - include disabled controls in hover-description coverage for `button`/`select`/`option`;
  - locale selector in `Global preferences` must be the last field before the separator;
  - EN default, FR variant app-wide except changelog/import-export;
  - add onboarding final Settings step in full flow only (no contextual single-step entrypoint);
  - final onboarding Settings step uses one CTA only: `Open Settings`;
  - onboarding Settings step copy remains EN in req_099 scope (FR handled by req_098 i18n rollout);
  - no changes to data-format/save contracts (numbers/CSV/IDs behavior unchanged).
- Execution discipline:
  - update progress indicators regularly in linked Logics docs (`req_097`, `req_098`, `req_099`, `item_478`, `item_479`, `item_480`, `item_481`, `item_482`, `task_077`);
  - create regular commits during delivery (avoid one-shot end commit);
  - update `README.md` at the end with delivered behavior and scope notes.

# Plan
- [x] 1. Finalize implementation strategy and shared contracts
  - define global hover-description source-priority resolution and explicit title precedence;
  - define i18n key structure, EN baseline, FR catalog boundaries, and fallback rules.
- [x] 2. Deliver request `req_097` scope (`item_478`)
  - implement global hover-description behavior for `button`/`select`/`option` including disabled controls;
  - add regression coverage for representative static + dynamic UI surfaces.
- [x] 3. Deliver request `req_098` scope (`item_479`)
  - reorder Settings panels and place locale selector at required position;
  - integrate i18n EN/FR app-wide in-scope surfaces and persistence wiring;
  - apply French compact-label safeguards on constrained table/header surfaces.
- [x] 4. Deliver request `req_099` scope (`item_480`, `item_481`, `item_482`)
  - append final onboarding Settings overview step after `wires`;
  - implement concise EN-only final-step copy covering key settings shortlist;
  - expose single CTA (`Open Settings`) and validate onboarding progression/non-regression.
- [x] 5. Validate cross-request non-regression matrix
  - confirm no regression on accessibility semantics and keyboard behavior;
  - confirm changelog/import-export remain out-of-scope for translation;
  - confirm onboarding final-step constraints (full-flow only, single CTA) are respected;
  - confirm save/data-format contracts remain unchanged.
- [x] 6. Keep delivery hygiene up to date during execution
  - update Logics indicators (`Status`, `Progress`, and where relevant `Understanding` / `Confidence`) at each meaningful milestone;
  - produce regular, coherent commits tied to completed increments.
- [x] FINAL: Update related Logics docs and `README.md`

# AC Traceability
- AC1 (`item_478`) -> Hover descriptions are deterministic and complete for in-scope controls.
- AC2 (`item_479`) -> Settings order + locale selector placement + EN/FR i18n contract delivered.
- AC3 (`item_479`) -> French compact labels preserve dense-table readability without data-contract regressions.
- AC4 (`item_480`) -> Onboarding sequence includes final Settings step with correct ordering/progress.
- AC5 (`item_481`) -> Final onboarding Settings content/CTA contract is delivered.
- AC6 (`item_482`) -> Onboarding validation coverage and Logics traceability for req_099 are complete.
- request-AC1 -> This task. Evidence needed: Every rendered `button` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC2 -> This task. Evidence needed: Every rendered `select` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC3 -> This task. Evidence needed: Every rendered `option` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- request-AC4 -> This task. Evidence needed: Explicitly authored `title` values are never overridden by fallback generation.
- request-AC5 -> This task. Evidence needed: Hover-description coverage holds after dynamic UI transitions (screen switch, modal open/close, drawer open/close, conditional section rendering).
- request-AC6 -> This task. Evidence needed: Existing a11y/interaction semantics are non-regressed.
- request-AC7 -> This task. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.
- request-AC1 -> This task. Evidence needed: In Settings, `Global preferences` is rendered before `Action bar and shortcuts`.
- request-AC2 -> This task. Evidence needed: `Global preferences` includes a locale selector with `English` and `Français`.
- request-AC3 -> This task. Evidence needed: `English` is the default locale for fresh state.
- request-AC4 -> This task. Evidence needed: Locale selection persists across reload/relaunch.
- request-AC5 -> This task. Evidence needed: Switching locale updates app UI text across all major screens without restart.
- request-AC6 -> This task. Evidence needed: French translation coverage is complete for shipped app UI surfaces in scope, excluding changelog and import/export surfaces.
- request-AC7 -> This task. Evidence needed: Dense table/header surfaces remain readable in French via compact-label strategy where needed.
- request-AC8 -> This task. Evidence needed: Existing interaction/accessibility semantics are non-regressed after i18n integration.
- request-AC9 -> This task. Evidence needed: Data-format contracts (number formatting, CSV behavior/schema, IDs) remain unchanged.
- request-AC10 -> This task. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.
- request-AC1 -> This task. Evidence needed: Onboarding includes a new final step dedicated to key Settings guidance.
- request-AC2 -> This task. Evidence needed: The new Settings step is positioned after the current final step (`wires`).
- request-AC3 -> This task. Evidence needed: Full-flow progress/count reflects the added step accurately.
- request-AC4 -> This task. Evidence needed: The final step includes one primary CTA (`Open Settings`) that opens the `Settings` screen.
- request-AC5 -> This task. Evidence needed: Final-step content covers the fixed shortlist (`Language`, `Theme`, `Keyboard shortcuts`, `Canvas render preferences`, `Global preferences`) in concise onboarding wording.
- request-AC6 -> This task. Evidence needed: The Settings final slide is part of full flow only and has no contextual single-step entrypoint.
- request-AC7 -> This task. Evidence needed: Existing onboarding behaviors (auto-open/opt-out/contextual help/focus handling) remain non-regressed.
- request-AC8 -> This task. Evidence needed: Onboarding copy for this request remains English-only (FR handled by `req_098`).
- request-AC9 -> This task. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant onboarding/UI tests pass.
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Validation
- python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
- npm run -s lint
- npm run -s typecheck
- npm run -s test:ci:ui

# Definition of Done (DoD)
- [x] Scope implemented and acceptance criteria covered.
- [x] Validation commands executed and results captured.
- [x] Linked request/backlog/task docs updated.
- [x] Progress indicators are up to date across linked request/backlog/task docs.
- [x] Delivery history includes regular incremental commits.
- [x] `README.md` updated to reflect the delivered changes and boundaries.
- [x] Status is `Done` and progress is `100%`.

# Report
- Implemented global hover-description fallback instrumentation for `button` / `select` / `option`, including disabled controls, while preserving explicit authored titles.
- Implemented persistent locale preference (`en` default, `fr` variant), Settings panel reordering, and `Language` selector placement at the end of `Global preferences`.
- Added app-wide EN/FR DOM translation bridge with deterministic fallback and explicit exclusions for changelog and import/export surfaces.
- Added final onboarding step (`settingsOverview`) after `wires`, with single primary CTA `Open Settings` and full-flow-only behavior.
- Added/updated UI tests:
  - `src/tests/app.ui.hover-descriptions.spec.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/app.ui.home.spec.tsx`
  - `scripts/quality/run-vitest-segmented.mjs` (UI lane contract updated for new app.ui spec).
- Validation results:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` ✅
  - `npm run -s lint` ✅
  - `npm run -s typecheck` ✅
  - `npm run -s test:ci:ui` ✅
