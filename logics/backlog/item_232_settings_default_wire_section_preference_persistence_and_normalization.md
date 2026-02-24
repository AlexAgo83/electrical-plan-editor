## item_232_settings_default_wire_section_preference_persistence_and_normalization - Settings Default Wire Section Preference Persistence and Normalization
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Global User Preference for Default Wire Cable Section (mm²)
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app has no configurable default wire section preference, so new wires cannot consistently prefill `sectionMm2` from user settings and the default remains hardcoded in form logic.

# Scope
- In:
  - Add a global UI/user preference for default wire cable section (recommended key/name aligned with `sectionMm2` semantics).
  - Initial default value `0.5`.
  - Persist preference via existing UI preferences persistence mechanism.
  - Add Settings UI field to edit the default wire section (`mm²`).
  - Normalize persisted preference on load:
    - invalid/missing values fallback to `0.5`
    - finite positive numeric validation (`> 0`)
  - Wire form integration contract support so create-mode prefill can consume the preference (full create prefill UX finalization may land in item_231).
  - Ensure changing the preference affects future wire creation only (no mutation of existing wires).
- Out:
  - Legacy wire data patching in saved/imported workspace snapshots (handled in item_233).
  - Bulk updates of current wire entities when preference changes.

# Acceptance criteria
- Settings exposes an editable default wire section preference (`mm²`) with initial value `0.5`.
- Preference persists across reloads and invalid persisted values normalize back to `0.5`.
- Changing the preference affects future wire create prefill only and does not change existing wires.
- Preference is treated as global user/UI scope (not per-network).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_038`.
- Blocks: item_231, item_234.
- Related AC: AC3, AC4, AC5, AC8.
- References:
  - `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`

