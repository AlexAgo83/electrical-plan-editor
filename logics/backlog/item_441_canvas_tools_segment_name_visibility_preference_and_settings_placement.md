## item_441_canvas_tools_segment_name_visibility_preference_and_settings_placement - canvas tools segment name visibility preference and settings placement
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_087` requires a new setting to control segment-name visibility, positioned above `Show segment lengths by default`. Without a precise placement/wiring item, UI consistency and discoverability can regress.

# Scope
- In:
  - add `Show segment names by default` control in `Canvas tools preferences`.
  - place control directly above `Show segment lengths by default`.
  - define preference default (`true`) and wire setter.
  - pass preference through settings slice assembly.
- Out:
  - segment rendering logic changes (handled by item_442).
  - persistence/apply-defaults behavior (handled by item_443).

# Acceptance criteria
- AC1: Settings contains `Show segment names by default` above segment-length default control.
- AC2: Default value is enabled for missing preference state.
- AC3: Toggle updates controller preference state immediately.
- AC4: Existing canvas tools settings controls remain non-regressed.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx` control order.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts` default contract.
- AC3 -> `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx` settings prefs mapping.
- AC4 -> `src/tests/app.ui.settings-canvas-render.spec.tsx`.
- request-AC1 -> This backlog slice. Evidence needed: `Canvas tools preferences` includes a new segment-name visibility option above `Show segment lengths by default`.
- request-AC2 -> This backlog slice. Evidence needed: The new segment-name preference default is `enabled` when no prior stored value exists.
- request-AC3 -> This backlog slice. Evidence needed: Disabling segment names hides segment name/ID labels in the 2D `Network summary`.
- request-AC4 -> This backlog slice. Evidence needed: Disabling segment names does not disable or alter segment-length visibility behavior.
- request-AC5 -> This backlog slice. Evidence needed: Enabling segment lengths while segment names are disabled renders lengths without rendering names.
- request-AC6 -> This backlog slice. Evidence needed: The new segment-name preference is persisted and restored across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: `Apply canvas defaults now` applies the segment-name default consistently with other canvas defaults.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (primary UX entrypoint).
- Urgency: High (blocks rendering and persistence items).

# Notes
- Risks:
  - wrong placement can violate explicit request wording.
  - missing preference field can create runtime no-op toggle.
- References:
  - `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
