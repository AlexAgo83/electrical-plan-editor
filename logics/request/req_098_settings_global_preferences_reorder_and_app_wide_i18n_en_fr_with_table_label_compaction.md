## req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction - Settings panel reorder and app-wide i18n EN/FR with table-label compaction safeguards
> From version: 1.2.1
> Status: Draft
> Understanding: 100%
> Confidence: 95%
> Complexity: High
> Theme: UI / Internationalization
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Reorder Settings panels so `Global preferences` appears before `Action bar and shortcuts`.
- Add a language selector inside `Global preferences`.
- Place the language selector as the last control in `Global preferences` before the panel separator.
- Support app-wide language switching between:
  - `English` (current content and default),
  - `Français`.
- Introduce a robust i18n model and deliver a complete French variant of the app UI.
- Prevent French text expansion from degrading table/header readability, especially column labels.

# Context
- The Settings screen currently renders `Action bar and shortcuts` before `Global preferences`.
- There is no centralized i18n layer for app-wide UI copy.
- Current UI uses many dense table surfaces (Modeling/Analysis/Validation/Network Scope) with compact headers and optional mobile short labels.
- A direct literal translation without sizing safeguards can cause column overflow, truncation noise, or reduced scannability in French.

# Objective
- Implement deterministic EN/FR internationalization with English as default.
- Expose language selection in `Global preferences` and persist the user choice.
- Keep the UI ergonomics stable in French by introducing explicit compact-label strategies for constrained table headers.

# Scope
- In:
  - reorder Settings panels so `Global preferences` is placed before `Action bar and shortcuts`;
  - add a language selector in `Global preferences` with exactly two options:
    - `English` (default),
    - `Français`;
  - place the language selector as the last field in `Global preferences`, immediately before the panel separator;
  - introduce a centralized i18n contract for app UI strings;
  - provide French translations for all user-facing UI copy in app surfaces covered by current product scope, except changelog and import/export surfaces;
  - persist/restore language preference with existing UI-preferences persistence flow;
  - add compact-label safeguards for tables/headers where French labels would otherwise overflow or materially hurt readability;
  - add regression coverage for language switching, persistence, and table-label ergonomics.
- Out:
  - additional locales beyond EN/FR;
  - backend/server-driven localization;
  - changelog translation;
  - import/export translation;
  - redesign of table architecture unrelated to label-length mitigation;
  - locale-specific changes to data formats (numbers/CSV/IDs) for this request.

# Locked execution decisions
- Decision 1: `Global preferences` panel is rendered before `Action bar and shortcuts` in Settings.
- Decision 2: Language selector is located in `Global preferences` and not in any other panel.
- Decision 2a: Language selector is rendered as the last `Global preferences` control before the panel separator.
- Decision 3: Language options are exactly `English` and `Français` for this request.
- Decision 4: Default language is `English` for fresh state and fallback scenarios.
- Decision 5: UI language preference is persisted and restored through existing preferences storage.
- Decision 6: i18n integration is key-based (no scattered inline string switches).
- Decision 7: French UI must be complete for all in-scope app surfaces, explicitly excluding changelog and import/export surfaces.
- Decision 8: For dense tables and compact headers, French translations may use validated short labels/abbreviations to preserve layout and scannability.
- Decision 9: Label-compaction strategy must prioritize clarity over literal translation when space constraints require shorter wording.
- Decision 10: Data-format contracts (number formatting, CSV schema/content, IDs) remain unchanged in this request.

# Functional behavior contract
## A. Settings panel ordering and language control
- Settings panel order includes `Global preferences` before `Action bar and shortcuts`.
- `Global preferences` contains a language selector with:
  - `English`
  - `Français`
- The language selector is rendered as the last field in `Global preferences`, immediately before the panel separator.
- Changing language updates visible UI copy without requiring app restart.

## B. i18n model and fallback
- App copy is resolved through a centralized i18n layer using stable translation keys.
- Default locale is `en`.
- If a key is missing in `fr`, fallback is deterministic to English key value.
- Existing semantic attributes (`aria-label`, `aria-description`, button labels, panel headings, status text) follow active locale.

## C. Coverage expectation
- Translation coverage includes, at minimum:
  - workspace navigation/header/actions,
  - screen/panel headings and helper copy,
  - forms, dialogs, onboarding, validation, settings,
  - table headers/filter labels/action labels.
- Explicit exclusions for this request:
  - changelog content,
  - import/export surfaces and related messaging.
- No intentional mixed EN/FR strings remain in normal UI paths after rollout.

## D. Table-label compaction safeguards for French
- For constrained surfaces (table headers, chips, compact toggles), French labels can use short approved variants.
- Compaction rules are deterministic and testable (for example: explicit short-label keys or responsive variants).
- French mode must not cause critical column overlap, unreadable truncation, or action-cell displacement in standard desktop/mobile layouts.

# Acceptance criteria
- AC1: In Settings, `Global preferences` is rendered before `Action bar and shortcuts`.
- AC2: `Global preferences` includes a locale selector with `English` and `Français`.
- AC2a: The locale selector is the last control in `Global preferences`, before the panel separator.
- AC3: `English` is the default locale for fresh state.
- AC4: Locale selection persists across reload/relaunch.
- AC5: Switching locale updates app UI text across all major screens without restart.
- AC6: French translation coverage is complete for shipped app UI surfaces in scope, excluding changelog and import/export surfaces.
- AC7: Dense table/header surfaces remain readable in French via compact-label strategy where needed.
- AC8: Existing interaction/accessibility semantics are non-regressed after i18n integration.
- AC9: Data-format contracts (number formatting, CSV behavior/schema, IDs) remain unchanged.
- AC10: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - Settings panel ordering and language selector placement;
  - EN default + persistence restore;
  - runtime language switching on Home/Modeling/Analysis/Validation/Settings;
  - dialogs/onboarding/navigation/header translated semantics;
  - French table header readability in dense panels and mobile compact states;
  - explicit confirmation that changelog/import-export are unchanged in this request.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Translation rollout touches a wide UI surface and can introduce missing-key drift if key governance is weak.
- Existing tests that assert English literals may become brittle and require i18n-aware assertions.
- French label expansion can cause layout regressions in tables if compact-label policy is not consistently applied.
- Partial translation in low-traffic paths can create mixed-language UX and support confusion.

# Backlog
- `logics/backlog/item_479_settings_panel_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction_safeguards.md`
# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/AppController.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.validation.spec.tsx`
- `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
- `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
