## item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow - Validate folder reconnection regressions and document the recovery workflow
> From version: 1.19.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Workspace persistence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-20 09:48:14

# AI Context
- Summary: Provide request AC8 evidence for the lifecycle fix. Simulated handles cover failure and isolation cases; a supported-browser run with an actual OS picker separately verifies gesture and persistent-handle behavior. Document unperformed checks explicitly.
- Keywords: workspaceId, child directory handle, IndexedDB, relinkFolder, dirty recovery
- Use when: Investigating the reported new-workspace missing-folder failure or implementing its scoped recovery criteria.
- Skip when: Publishing a release, changing portable schemas or converting browser-only storage.

# Problem
- Current in-memory folder tests do not exercise reconnect or prove persistent handle and real picker behavior; the reported failure can survive a mock-only fix.

# Scope
- In:
  - Extend existing folder/session fixtures with configurable permission transitions, picker and IndexedDB handle failures, stale granted handles, wrong and duplicate-ID roots, corrupt manifests and failed write/readback. Assert state preservation, file bytes, exact identity and absence of false success, not just result.ok.
  - Add UI regressions through Settings and recovery notices in EN/FR, including cancel/retry/busy/focus behavior and explicit Save versus reconnect messages.
  - Exercise real IndexedDB handle persistence in a supported browser where automation permits; test delayed results during switches, repeated clicks, autosave and historical view.
  - Perform and record the real OS directory picker scenario in request AC8, listing browser/version/context and observed disk verification; retain a clearly outstanding validation item if the environment cannot provide it.
  - Update docs/workspace-lineages.md with child-root versus parent selection, permission recovery, conflict behavior and browser fallback. Run targeted Vitest/Playwright checks, npm run quality:i18n, lint/typecheck and the repository ci:local delivery gates in the implementation environment; record per-AC evidence and any pre-existing failures.
- Out:
  - Implementing an unrelated test harness, claiming a mock reproduces real user activation, release publication.

# Acceptance criteria
- AC1: Automated regression evidence maps to request AC1-AC7 and verifies disk bytes, edit/recovery preservation and isolation for the specified failure cases.
- AC2: Real-picker validation is recorded with its environment and results, or explicitly outstanding; no unperformed check is marked passed.
- AC3: The user guide describes the delivered workflow; applicable quality gates and per-AC delivery evidence are recorded before implementation closeout.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: Automated regression evidence maps to request AC1-AC7 and verifies disk bytes, edit/recovery preservation and isolation for the specified failure cases.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_021_reliable_folder_reconnection_for_named_workspace_persistence`
- Architecture decision(s): (none yet)
- Request: `req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces`
- Primary task(s): `task_167_deliver_reliable_new_workspace_folder_reconnection`

# Priority
- Priority: High
- Rationale: The reported failure blocks reliable disk saving for new folder-backed workspaces.

# Tasks
- `task_167_deliver_reliable_new_workspace_folder_reconnection`

# Notes
- Task `task_167_deliver_reliable_new_workspace_folder_reconnection` was finished via `logics-manager flow finish task` on 2026-10-20.
