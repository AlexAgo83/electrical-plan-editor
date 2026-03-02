## item_453_canvas_setting_for_zoom_invariant_node_shapes_preference_and_defaults - canvas setting for zoom invariant node shapes preference and defaults
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_090` requires a user-facing setting for zoom-invariant node shapes. Without explicit preference wiring/defaults, runtime behavior cannot be controlled predictably.

# Scope
- In:
  - add Canvas setting for zoom-invariant node shapes.
  - default setting to disabled (`false`).
  - wire setting into controller preference model and settings screen.
  - ensure preference can be persisted/restored in downstream item.
- Out:
  - shape rendering algorithm implementation (handled by item_454).
  - interaction/hitbox behavior hardening (handled by item_455).

# Acceptance criteria
- AC1: Canvas settings contains zoom-invariant node-shapes control.
- AC2: Default is disabled for missing preference value.
- AC3: Toggle updates runtime preference state immediately.
- AC4: Setting wiring is available across all screens through shared preference model.

# AC Traceability
- AC1 -> `src/app/components/workspace/SettingsWorkspaceContent.tsx`.
- AC2 -> `src/app/hooks/useAppControllerPreferencesState.ts`.
- AC3/AC4 -> `src/app/hooks/controller/useAppControllerAuxScreenContentDomains.tsx`, `src/app/AppController.tsx`.

# Priority
- Impact: High (entrypoint for req_090).
- Urgency: High (blocks rendering work).

# Notes
- Risks:
  - ambiguous control wording can cause misconfiguration.
  - missing preference field can break persistence/hydration later.
- References:
  - `logics/request/req_090_network_summary_zoom_invariant_node_shapes_option_for_connectors_splices_and_nodes.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useAppControllerPreferencesState.ts`
