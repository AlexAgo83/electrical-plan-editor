## item_426_mobile_responsive_pass_for_settings_validation_and_import_export_surfaces - Mobile responsive pass for settings, validation, and import/export surfaces
> From version: 0.9.18
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: High
> Theme: Responsive behavior hardening for dense form/panel surfaces
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Settings/validation/import-export panels are desktop-biased and can clip, overflow, or become hard to use below 700px.

# Scope
- In:
  - adapt settings and validation layout patterns for narrow widths;
  - enforce readable one-column collapse when two columns are not viable;
  - keep import/export controls and summaries operable on mobile baseline widths.
- Out:
  - redesign of feature semantics or business rules.

# Acceptance criteria
- AC1: Settings/validation/import-export surfaces are usable at mobile baseline widths.
- AC2: No critical clipping/overlap in targeted screens and themes.
- AC3: Existing desktop/tablet behavior remains intact.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_083`, `item_425`, `req_082` layout contracts.
- Blocks: `item_428`, `task_073`.
- Related AC: `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
  - `src/app/styles/validation-settings/validation-and-settings-layout.css`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.import-export.spec.tsx`
