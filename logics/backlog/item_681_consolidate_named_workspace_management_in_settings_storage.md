## item_681_consolidate_named_workspace_management_in_settings_storage - Consolidate named workspace management in Settings storage
> From version: 1.19.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: High
> Theme: Workspace storage settings
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# AI Context
- Release 1.19.0 management is scattered between the shell, Home and History instead of the existing storage settings.
- Follow the parent request action disposition and storage-mode contracts. Preserve lineage recovery and history semantics.

# Problem
- Release 1.19.0 management is scattered between the shell, Home and History instead of the existing storage settings.

# Scope
- In:
  - Extract a dedicated Settings storage section and pass the existing WorkspaceLineageModel through controller/settings bindings. Implement the three groups and action disposition in the request.
  - Replace global management toolbar with compact context and safe historical warning; reduce Home to resume cards and a section-focus shortcut. Expose Rename and Export package directly in their Settings groups.
  - Decouple the sole dialog host from WorkspaceLineageBar; mount it once at a stable app level. Preserve keyboard save and contextual recovery entry points, including preserved legacy snapshot actions.
- Out:
  - New persistence formats, cloud sync, network import/export redesign and deletion of user history.

# Acceptance criteria
- AC1: Every inventoried lineage action is reachable from Settings in its appropriate state; no removed toolbar or Home management cluster remains.
- AC2: Home and context shortcuts activate Settings and focus the storage heading; historical Return to working remains available outside Settings.
- AC3: Opening a dialog from Settings, navigating and invoking Ctrl/Cmd+S uses the same active model without duplicate dialogs, listeners, operations or a lost session.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every inventoried lineage action is reachable from Settings in its appropriate state; no removed toolbar or Home management cluster remains.
- request-AC2 -> This backlog slice. Proof: AC2: Home and context shortcuts activate Settings and focus the storage heading; historical Return to working remains available outside Settings.
- request-AC4 -> This backlog slice. Proof: AC3: Opening a dialog from Settings, navigating and invoking Ctrl/Cmd+S uses the same active model without duplicate dialogs, listeners, operations or a lost session.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)
- Request: `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`
- Primary task(s): `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
