## item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow - Validate workspace storage consolidation and document the updated workflow
> From version: 1.19.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace storage settings
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 10:16:12

# AI Context
- Moving controls and their dialog host can regress persistence safety, accessibility and documented entry points.
- Follow the parent request action disposition and storage-mode contracts. Preserve lineage recovery and history semantics.

# Problem
- Moving controls and their dialog host can regress persistence safety, accessibility and documented entry points.

# Scope
- In:
  - Update app.ui.workspace-lineages, settings/search/locale/theme tests and tests/e2e/workspace-lineages.spec.ts around the new entry points; extend legacy storage hook tests only when relevant wiring or guards change.
  - Cover the request state matrix with focused UI assertions and folder capability stubs; exercise browser fallback, Save versus Create version, history/return/restore, supplier archive access and package/legacy import entry points.
  - Run lint, typecheck, quality:i18n, targeted Vitest/Playwright suites and production build; run repository-required delivery gates at implementation closeout. Record visual/theme/responsive and keyboard checks plus any native-picker limitations.
  - Update docs/workspace-lineages.md and affected help/shortcut copy; record acceptance evidence per request AC before Logics closeout.
- Out:
  - New persistence formats, cloud sync, network import/export redesign and deletion of user history.

# Acceptance criteria
- AC1: Tests assert both successful navigation/actions and absence of obsolete duplicate controls while retaining legacy recovery and historical mutation protection.
- AC2: The documented user path starts at Settings > Workspace storage and accurately describes Home resume, compact status, shortcuts and legacy compatibility.
- AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Tests assert both successful navigation/actions and absence of obsolete duplicate controls while retaining legacy recovery and historical mutation protection.
- request-AC2 -> This backlog slice. Proof: AC2: The documented user path starts at Settings > Workspace storage and accurately describes Home resume, compact status, shortcuts and legacy compatibility.
- request-AC3 -> This backlog slice. Proof: AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.
- request-AC4 -> This backlog slice. Proof: AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.
- request-AC5 -> This backlog slice. Proof: AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.
- request-AC6 -> This backlog slice. Proof: AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.
- request-AC7 -> This backlog slice. Proof: AC3: Required implementation checks pass with recorded commands/results; all request ACs have evidence before closure. This initial scaffold stays open and unimplemented.

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

# Tasks
- `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment`

# Notes
- Task `task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment` was finished via `logics-manager flow finish task` on 2026-10-08.
