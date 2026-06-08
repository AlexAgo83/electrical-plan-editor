## item_479_settings_panel_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction_safeguards - Settings panel reorder and app-wide i18n EN/FR with table-label compaction safeguards
> From version: 1.2.1
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: UI / Internationalization
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Settings ordering and language support do not meet requested UX expectations:
- `Global preferences` placement must move before `Action bar and shortcuts`;
- language switching (EN/FR) must be app-wide and persistent;
- French copy expansion must not degrade dense table readability.

# Scope
- In:
  - reorder Settings panels so `Global preferences` appears before `Action bar and shortcuts`;
  - add EN/FR language selector in `Global preferences` as the last field before the panel separator;
  - introduce centralized i18n key-based contract with English default and French variant;
  - persist locale selection in existing UI preference storage;
  - translate all in-scope UI surfaces (excluding changelog and import/export);
  - implement compact French label strategy for constrained table headers and dense controls.
- Out:
  - additional locales beyond EN/FR;
  - changelog/import-export translation;
  - locale-specific changes to data formats (numbers/CSV/IDs).

# Acceptance criteria
- AC1: `Global preferences` is rendered before `Action bar and shortcuts` in Settings.
- AC2: Locale selector exists in `Global preferences` with `English` and `Français`.
- AC3: Locale selector is placed as the last control in `Global preferences` before the separator.
- AC4: English is default locale and locale preference persists across reload.
- AC5: App UI switches between EN/FR on major screens without restart.
- AC6: French translation is complete for in-scope surfaces, with changelog/import-export excluded.
- AC7: French compact-label safeguards keep dense table headers readable and non-regressed.

# AC Traceability
- AC1 -> Settings panel ordering update.
- AC2 -> Locale selector options contract.
- AC3 -> Locale selector placement contract.
- AC4 -> Default + persistence behavior.
- AC5 -> Runtime locale switch behavior.
- AC6 -> Translation coverage boundaries.
- AC7 -> Table-label ergonomics safeguards.
- request-AC1 -> This backlog slice. Evidence needed: In Settings, `Global preferences` is rendered before `Action bar and shortcuts`.
- request-AC2 -> This backlog slice. Evidence needed: `Global preferences` includes a locale selector with `English` and `Français`.
- request-AC3 -> This backlog slice. Evidence needed: `English` is the default locale for fresh state.
- request-AC4 -> This backlog slice. Evidence needed: Locale selection persists across reload/relaunch.
- request-AC5 -> This backlog slice. Evidence needed: Switching locale updates app UI text across all major screens without restart.
- request-AC6 -> This backlog slice. Evidence needed: French translation coverage is complete for shipped app UI surfaces in scope, excluding changelog and import/export surfaces.
- request-AC7 -> This backlog slice. Evidence needed: Dense table/header surfaces remain readable in French via compact-label strategy where needed.
- request-AC8 -> This backlog slice. Evidence needed: Existing interaction/accessibility semantics are non-regressed after i18n integration.
- request-AC9 -> This backlog slice. Evidence needed: Data-format contracts (number formatting, CSV behavior/schema, IDs) remain unchanged.
- request-AC10 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (cross-app copy system and major UX surface).
- Urgency: High (explicit product request and broad regression surface).

# Notes
- Derived from `logics/request/req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction.md`.
- Orchestrated by `logics/tasks/task_077_super_orchestration_delivery_execution_for_req_097_and_req_098_with_validation_gates.md`.
