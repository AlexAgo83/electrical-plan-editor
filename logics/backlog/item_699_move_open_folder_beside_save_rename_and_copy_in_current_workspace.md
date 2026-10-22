## item_699_move_open_folder_beside_save_rename_and_copy_in_current_workspace - Move Open folder beside Save Rename and Copy in Current workspace
> From version: 1.20.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Workspace action discoverability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 19:56:02

# AI Context
- Summary: Relocate the existing directory picker into Current workspace, retain explicit selector activation and show exactly one primary Open folder action.
- Keywords: SettingsWorkspaceStorageSection, model.openFolder, directoryAccessSupported, selector
- Use when: Moving the workspace action and testing empty, busy, unsupported and picker outcome states.
- Skip when: Building OS file-manager reveal or redesigning folder reconciliation.

# Problem
- Open folder is separated from the workspace selector and Save/Rename/Copy actions under Transfer and recovery.

# Scope
- In:
  - Relocate the existing directory-picker control into Current workspace with the specified action order and no-active-workspace access. Reuse model.openFolder and existing supported API visibility, add ready/busy disablement and preserve unsupported guidance.
  - Remove the redundant Transfer action; keep reconnect/import/Copy behavior intact. Preserve existing folder discovery, reconciliation and explicit selector activation semantics.
  - Update Settings search/help and workspace guide; add focused UI regressions for exact placement, one primary action, keyboard/localized labels, responsive wrapping and picker outcomes. Reuse folder tests for controller semantics; record evidence and applicable request AC9 gates.
- Out:
  - OS file-manager reveal, redesigning folder import/reconnect, new storage architecture or automatic activation.

# Acceptance criteria
- AC1: Current workspace contains the relocated action beside the specified controls, including no-active state, satisfying request AC7.
- AC2: Existing picker/session behavior, localization, search and responsive states satisfy request AC8 without data loss or false success.
- AC3: Workspace docs and focused regressions satisfy the workspace portion of request AC9.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Current workspace contains the relocated action beside the specified controls, including no-active state, satisfying request AC7.
- request-AC8 -> This backlog slice. Proof: AC2: Existing picker/session behavior, localization, search and responsive states satisfy request AC8 without data loss or false success.
- request-AC9 -> This backlog slice. Proof: AC3: Workspace docs and focused regressions satisfy the workspace portion of request AC9.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_configurable_endpoint_material_references_on_plans_and_direct_workspace_folder_access`
- Architecture decision(s): (none yet)
- Request: `req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions`
- Primary task(s): `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access`

# Priority
- Priority: Medium
- Rationale: Requested additive usability improvement; no blocking defect reported. Deliver the endpoint-model prerequisite before its display consumer.
