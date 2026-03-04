## req_100_settings_language_subpanel_theme_contrast_and_token_alignment - Settings Language subpanel theme contrast and token alignment
> From version: 1.3.0
> Status: Done
> Understanding: 100% (scope delivered and synchronized with backlog/task closure)
> Confidence: 97%
> Complexity: Medium
> Theme: UI / Theming / Accessibility
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Fix readability issues in `Settings > Global preferences > Language` subpanel for dark/custom themes.
- Ensure the Language subpanel visual contract is theme-safe and consistent with other themed subpanels (for example `Entity navigation`).
- Keep locale behavior unchanged while hardening presentation quality and accessibility.

# Context
- The Language subpanel currently uses a dedicated style block (`.settings-locale-field`) with a background relying on `color-mix(..., canvas, ...)`.
- In several dark/custom themes, label text and hint text become too close to the subpanel background (low perceived contrast), making the section look washed out or disabled.
- Other subpanels (notably `Entity navigation`) already rely on explicit per-theme overrides and/or custom theme tokens and render consistently across theme families.
- Functional locale behavior (`English` / `Français`, persistence, selector placement in `Global preferences`) is already delivered and should not be altered.

# Objective
- Make the Language subpanel visually robust across all shipped theme families (legacy + custom light + custom midrange).
- Align the Language subpanel styling strategy with existing theme token practices used by stable UI subpanels.
- Preserve current interaction flow and data behavior while improving contrast and consistency.

# Scope
- In:
  - adjust Language subpanel styling contract to remove fragile system-color dependency;
  - apply token-driven/themed background-border-text strategy for the Language subpanel;
  - verify default/hover/focus/disabled states in representative themes;
  - add or update regression coverage (UI test and/or deterministic style assertions) for non-regression.
- Out:
  - language feature redesign (no new locales, no locale behavior changes);
  - settings information architecture changes;
  - unrelated theme redesign outside this subpanel contract;
  - import/export/changelog localization scope changes.

# Locked execution decisions
- Decision 1: Keep the Language selector location and semantics unchanged (`Global preferences`, last field before action separator).
- Decision 2: Replace direct `canvas`-based mixing in the subpanel background with theme token-driven values.
- Decision 3: Reuse existing settings/theme override architecture instead of adding one-off inline style logic.
- Decision 4: Keep locale options and persistence behavior unchanged (`en` default, `fr` optional).
- Decision 5: Ensure the hint/label/icon/select remain visually readable in both dark and light themes.

# Functional behavior contract
## A. Language subpanel readability
- The Language subpanel title, icon, select value, and hint remain readable in all supported themes.
- The subpanel must not visually appear disabled when it is enabled.
- Hover/focus styling must preserve contrast and clear affordance.

## B. Theme token and override alignment
- `.settings-locale-field` background and border styling must be based on theme-compatible tokens/overrides.
- Direct dependence on system `canvas` color in this subpanel styling is removed.
- Legacy and custom theme families receive coherent behavior without ad hoc per-theme hacks.

## C. Consistency with existing subpanel patterns
- Language subpanel visuals should be consistent with existing themed subsection patterns used elsewhere (for example `workspace-nav-subsection` in navigation).
- The subpanel should keep existing spacing/layout rhythm in Settings grids.

## D. Non-regression
- Locale switching and persistence remain unchanged.
- Existing i18n text contract for this section remains unchanged unless explicitly required by translation scope.
- Onboarding target selector (`settings-global-preferences`) and related behavior remain unchanged.

# Acceptance criteria
- AC1: In representative dark themes, Language subpanel label/select/hint contrast is readable and no longer appears washed out.
- AC2: In representative light themes, Language subpanel remains visually coherent with existing settings panels.
- AC3: Language subpanel no longer depends on `canvas` system color for background composition.
- AC4: Hover/focus states of the Language subpanel and select are clearly perceivable across theme families.
- AC5: Locale functionality remains unchanged (`en`/`fr` switching + persistence).
- AC6: No regression is introduced in `Entity navigation` visual behavior.
- AC7: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - `Settings > Global preferences > Language` readability in representative themes (`dark`, `burgundyNoir`, `steelBlue`, `warmBrown`);
  - visual state checks (default/hover/focus);
  - no behavior regression for locale switch/persistence;
  - no visual regression for `Entity navigation` subpanel.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Theme coverage can drift if new presets are added without token reuse.
- Over-specific selector changes can accidentally alter adjacent settings fields.
- Visual assertions may be fragile if test coverage depends on exact color literals instead of contract-level signals.

# Backlog
- To create from this request:
  - `item_483_settings_language_subpanel_contrast_issue_reproduction_and_theme_contract_definition.md`
  - `item_484_settings_language_subpanel_tokenized_styling_and_canvas_dependency_removal.md`
  - `item_485_theme_override_alignment_for_language_subpanel_across_legacy_and_custom_families.md`
  - `item_486_req_100_validation_matrix_and_regression_traceability_for_language_subpanel_readability.md`

# References
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/styles/validation-settings/validation-and-settings-layout.css`
- `src/app/styles/workspace/workspace-shell-and-nav/navigation-and-analysis-route.css`
- `src/app/styles/base/base-theme-overrides/standalone-custom-themes-shared-coverage-fixes.css`
- `src/app/styles/base/base-theme-overrides/standalone-custom-light-themes-shared-c.css`
- `src/app/styles/base/base-theme-overrides/standalone-custom-midrange-themes-shared-c.css`
- `src/app/styles/base/base-theme-overrides/legacy-themes-components-and-forms.css`
- `src/tests/app.ui.settings.spec.tsx`
- `logics/request/req_098_settings_global_preferences_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction.md`

# Orchestration task
- `task_082_req_100_settings_language_subpanel_theme_contrast_and_token_alignment_orchestration_and_delivery_control`
