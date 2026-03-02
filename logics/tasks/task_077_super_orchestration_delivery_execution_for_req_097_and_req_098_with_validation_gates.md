## task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates - Super orchestration delivery execution for req_097 and req_098 with validation gates
> From version: 1.2.1
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: UI / Internationalization
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Super-orchestration task to deliver:
  - `req_097_hover_descriptions_for_buttons_selects_and_options`
  - `req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction`
- Backlog execution scope:
  - `item_478_hover_descriptions_for_buttons_selects_and_options`
  - `item_479_settings_panel_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction_safeguards`
- Hard constraints carried from requests:
  - include disabled controls in hover-description coverage for `button`/`select`/`option`;
  - locale selector in `Global preferences` must be the last field before the separator;
  - EN default, FR variant app-wide except changelog/import-export;
  - no changes to data-format/save contracts (numbers/CSV/IDs behavior unchanged).
- Execution discipline:
  - update progress indicators regularly in linked Logics docs (`req_097`, `req_098`, `item_478`, `item_479`, `task_077`);
  - create regular commits during delivery (avoid one-shot end commit);
  - update `README.md` at the end with delivered behavior and scope notes.

# Plan
- [ ] 1. Finalize implementation strategy and shared contracts
  - define global hover-description source-priority resolution and explicit title precedence;
  - define i18n key structure, EN baseline, FR catalog boundaries, and fallback rules.
- [ ] 2. Deliver request `req_097` scope (`item_478`)
  - implement global hover-description behavior for `button`/`select`/`option` including disabled controls;
  - add regression coverage for representative static + dynamic UI surfaces.
- [ ] 3. Deliver request `req_098` scope (`item_479`)
  - reorder Settings panels and place locale selector at required position;
  - integrate i18n EN/FR app-wide in-scope surfaces and persistence wiring;
  - apply French compact-label safeguards on constrained table/header surfaces.
- [ ] 4. Validate cross-request non-regression matrix
  - confirm no regression on accessibility semantics and keyboard behavior;
  - confirm changelog/import-export remain out-of-scope for translation;
  - confirm save/data-format contracts remain unchanged.
- [ ] 5. Keep delivery hygiene up to date during execution
  - update Logics indicators (`Status`, `Progress`, and where relevant `Understanding` / `Confidence`) at each meaningful milestone;
  - produce regular, coherent commits tied to completed increments.
- [ ] FINAL: Update related Logics docs and `README.md`

# AC Traceability
- AC1 (`item_478`) -> Hover descriptions are deterministic and complete for in-scope controls.
- AC2 (`item_479`) -> Settings order + locale selector placement + EN/FR i18n contract delivered.
- AC3 (`item_479`) -> French compact labels preserve dense-table readability without data-contract regressions.

# Validation
- python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
- npm run -s lint
- npm run -s typecheck
- npm run -s test:ci:ui

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Progress indicators are up to date across linked request/backlog/task docs.
- [ ] Delivery history includes regular incremental commits.
- [ ] `README.md` updated to reflect the delivered changes and boundaries.
- [ ] Status is `Done` and progress is `100%`.

# Report
