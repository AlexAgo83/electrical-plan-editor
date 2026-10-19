## task_167_deliver_reliable_new_workspace_folder_reconnection - Deliver reliable new workspace folder reconnection
> From version: 1.19.2
> Schema version: 1.0
> Status: In progress
> Understanding: 100%
> Confidence: 85%
> Progress: 75%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-19 18:14:29
> Owner: Codex

# AI Context
- Summary: Deliver the two linked slices in sequence: reproduce and repair the folder connection lifecycle, then validate and document recovery. The code review identifies hypotheses rather than a confirmed root cause; preserve both local and disk work throughout.
- Keywords: workspaceId, child directory handle, IndexedDB, relinkFolder, dirty recovery
- Use when: Investigating the reported new-workspace missing-folder failure or implementing its scoped recovery criteria.
- Skip when: Publishing a release, changing portable schemas or converting browser-only storage.

# Context
- The user reports Workspace action failed / The workspace folder is unavailable on newly created workspaces. No runtime change is included in this corpus. Reproduce the failure before implementing the linked lifecycle and validation slices.

# Plan
- [ ] 1. Wave 1: reproduce the exact user-visible failure from a fresh named folder workspace; inspect creation, child-handle persistence, activation, permission and Save paths. Record the verified cause and establish failing regression cases before changing behavior.
- [ ] 2. Wave 2: deliver backlog item 1 creation and reconnection lifecycle, root/parent resolution, identity checks, conflict-safe preservation and session serialization. Treat candidate validation and handle persistence as a connection commit boundary.
- [ ] 3. Wave 3: finish explicit gesture-safe retry actions, localized error/status propagation, reconnect versus verified Save semantics and autosave recovery. Verify all request AC1-AC7 boundaries with focused tests.
- [ ] 4. Wave 4: deliver backlog item 2 automated coverage and actual supported-browser OS picker verification, docs and applicable repository gates. Record request AC1-AC8 evidence and any outstanding environment limitations before closeout.
- [ ] 5. Leave the chain unimplemented and ready for development after scoping; start, progress and close it only through lifecycle commands during actual implementation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`
- `item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow`

# Definition of Done (DoD)
- [ ] The reproduction and confirmed failure stage are recorded separately from initial code-review hypotheses.
- [ ] Both linked backlog slices satisfy request AC1-AC8 with file/state preservation and session-isolation evidence.
- [ ] A real OS picker run verifies creation, reload, reconnection and disk saving, with browser/version/context recorded; unavailable evidence remains outstanding.
- [ ] EN/FR guidance and docs/workspace-lineages.md describe the implemented folder recovery flow.
- [ ] Targeted tests, applicable repository delivery gates and Logics validation pass with recorded results.
- [ ] Affected workflow docs carry current delivery evidence and are ready for review.

# AC Traceability
- request-AC1 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC2 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC3 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC4 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC5 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC6 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC7 -> `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`. Proof deferred to slice closeout.
- request-AC8 -> `item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow`. Proof deferred to slice closeout.

# Validation
- Corpus scoping: request-chain dry-run and generation succeeded; inline validation reported ready-to-dev with no blocking findings. Implementation tests and real-picker validation remain pending.

# Report
- Not started.

# Links
- Request: `req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces`
- Product brief(s): `prod_021_reliable_folder_reconnection_for_named_workspace_persistence`
- Architecture decision(s): (none yet)

# Delivery evidence — 2026-10-19
- Reproduced with Vitest simulated File System Access handles: fresh creation reported success with a null active manifest when handle readback returned null; reconnection after an external working revision allowed Save to overwrite that revision. Both regression assertions failed before implementation (2 failures / 5 tests). These confirm controller defects, not the original user's unknown browser failure sequence.
- Implementation retains the freshly initialized repository; explicit Choose folder invokes the picker before asynchronous lookup. Stored-handle reconnect queries permission without prompting, validates root or immediate child identity without repair, and only persists validated candidates. Divergent editor content is retained as a recovery head and Save remains blocked pending an explicit choice.
- Real OS picker and native persistent-handle evidence remains pending. Mock tests are not evidence of browser activation behavior.
