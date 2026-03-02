## item_450_canvas_tools_preference_toggle_for_callout_wire_name_visibility - canvas tools preference toggle for callout wire name visibility
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Users need to hide wire names in callouts for dense/long-name datasets. This requires a dedicated setting in Canvas tools with a clear default and wiring.

# Scope
- In:
  - add `Show wire names in callouts` setting in Canvas tools preferences.
  - default this preference to `false`.
  - wire preference through controller/settings slice and callout renderer inputs.
  - include setting in persistence payload contract.
- Out:
  - changing baseline non-name callout columns.
  - changing callout grouping model.

# Acceptance criteria
- AC1: Canvas tools shows `Show wire names in callouts` control.
- AC2: Default state is off with missing legacy preference value.
- AC3: Toggling control updates runtime rendering behavior immediately.
- AC4: Preference value is available to callout render path and persisted.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx`.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts` + normalization in `useUiPreferences`.
- AC3/AC4 -> `src/app/AppController.tsx`, `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`, `src/app/components/NetworkSummaryPanel.tsx`.

# Priority
- Impact: High (explicit user control requirement).
- Urgency: High (paired with item_449).

# Notes
- Risks:
  - preference key drift may cause non-persistent behavior.
  - naming ambiguity could confuse users if label is not explicit.
- References:
  - `logics/request/req_089_network_summary_callout_tabular_layout_with_optional_wire_name_visibility_setting.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useUiPreferences.ts`
