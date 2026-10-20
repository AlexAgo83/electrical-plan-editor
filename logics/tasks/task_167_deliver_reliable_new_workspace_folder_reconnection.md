## task_167_deliver_reliable_new_workspace_folder_reconnection - Deliver reliable new workspace folder reconnection
> From version: 1.19.2
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-20 09:48:13
> Owner: Codex

# AI Context
- Summary: Deliver the two linked slices in sequence: reproduce and repair the folder connection lifecycle, then validate and document recovery. The code review identifies hypotheses rather than a confirmed root cause; preserve both local and disk work throughout.
- Keywords: workspaceId, child directory handle, IndexedDB, relinkFolder, dirty recovery
- Use when: Investigating the reported new-workspace missing-folder failure or implementing its scoped recovery criteria.
- Skip when: Publishing a release, changing portable schemas or converting browser-only storage.

# Context
- The user reports Workspace action failed / The workspace folder is unavailable on newly created workspaces. No runtime change is included in this corpus. Reproduce the failure before implementing the linked lifecycle and validation slices.

# Plan
- [x] 1. Wave 1: reproduce the exact user-visible failure from a fresh named folder workspace; inspect creation, child-handle persistence, activation, permission and Save paths. Record the verified cause and establish failing regression cases before changing behavior.
- [x] 2. Wave 2: deliver backlog item 1 creation and reconnection lifecycle, root/parent resolution, identity checks, conflict-safe preservation and session serialization. Treat candidate validation and handle persistence as a connection commit boundary.
- [x] 3. Wave 3: finish explicit gesture-safe retry actions, localized error/status propagation, reconnect versus verified Save semantics and autosave recovery. Verify all request AC1-AC7 boundaries with focused tests.
- [x] 4. Wave 4: deliver backlog item 2 automated coverage and actual supported-browser OS picker verification, docs and applicable repository gates. Record request AC1-AC8 evidence and any outstanding environment limitations before closeout.
- [x] 5. Leave the chain unimplemented and ready for development after scoping; start, progress and close it only through lifecycle commands during actual implementation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`
- `item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow`

# Definition of Done (DoD)
- [x] The reproduction and confirmed failure stage are recorded separately from initial code-review hypotheses.
- [x] Both linked backlog slices satisfy request AC1-AC8 with file/state preservation and session-isolation evidence.
- [x] A real OS picker run verifies creation, reload, reconnection and disk saving, with browser/version/context recorded; unavailable evidence remains outstanding.
- [x] EN/FR guidance and docs/workspace-lineages.md describe the implemented folder recovery flow.
- [x] Targeted tests, applicable repository delivery gates and Logics validation pass with recorded results.
- [x] Affected workflow docs carry current delivery evidence and are ready for review.

# AC Traceability
- request-AC1 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` fresh creation from current/empty content, reload and save, handle readback unavailable, handle persistence failure with duplicate-free retry, corrupted readback; real OS picker run on Chromium 149 (create > Save > reload > Save, stable workspaceId and child root).
- request-AC2 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` prompt/denied stored-handle lookup without prompting, missing/lookup/query/stale handle failures offering Choose folder; picker invoked synchronously from the click; busy flag released after superseded saves (cffc1588).
- request-AC3 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` root and parent selection, foreign/empty/invalid/future/duplicate/corrupt-working candidates rejected without writes or connection change, candidate handle persistence failure keeps the old connection; real picker reconnect through the original parent.
- request-AC4 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` advanced disk head not overwritten, both heads kept for explicit resolution, cached old base preserved across reload (cffc1588); recovery and version files unchanged.
- request-AC5 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` reconnect does not save dirty content, then Save and autosave; corrupted readback keeps dirty/recovery; e2e native-handle spec verifies reconnect writes nothing and Save advances the disk revision.
- request-AC6 -> This task. Proof: `src/tests/workspace-lineage-folder.spec.ts` delayed picker dropped after workspace switch, repeated clicks serialized, reconnect blocked in historical mode; `src/tests/workspace-storage-settings-section.spec.tsx` disables both reconnect actions during historical consultation.
- request-AC7 -> This task. Proof: `src/tests/workspace-storage-settings-section.spec.tsx` and EN/FR copy in `src/app/i18n/en.json`/`fr.json` (5e695106); neutral cancellation and unavailable picker covered in folder spec; `npm run -s quality:i18n` passed in ci:blocking.
- request-AC8 -> This task. Proof: Controller/folder, UI and Playwright `tests/e2e/workspace-folder-reconnection.spec.ts` (Chromium 149 pass; reload case skipped on Chromium 153 SIGTRAP); real OS picker run create > edit > Save > reload > reselect parent > reconnect > edit > Save > disk bytes verified on Chromium 149.0.7827.55 (revoke/regrant not exercised); docs/workspace-lineages.md section 4; `npm run -s ci:blocking` passed 2026-10-20.

# Validation
- Corpus scoping: request-chain dry-run and generation succeeded; inline validation reported ready-to-dev with no blocking findings.
- command: `npm run -s ci:blocking` | result: passed | date: 2026-10-20 | note: Includes Playwright tests/e2e/workspace-folder-reconnection.spec.ts (1 skipped on Chromium 153) and src/tests/workspace-lineage-folder.spec.ts.
- Real OS picker: Chromium 149.0.7827.55 headed on WSLg, create > edit > Save > reload > Save > reselect parent > reconnect > edit > Save, disk bytes verified.
- command: `npm run -s ci:blocking` | result: passed | date: 2026-10-20 | note: Real OS picker run on Chromium 149 recorded; reload e2e case skipped on Chromium 153.
- Finish workflow executed on 2026-10-20.
- Linked backlog/request close verification passed.

# Report
- Delivered in 5e695106 and cffc1588. Evidence and limitations are listed under Delivery evidence.
- Finished on 2026-10-20.
- Linked backlog item(s): `item_691_repair_named_workspace_folder_connection_lifecycle_and_safe_reconnection`, `item_692_validate_folder_reconnection_regressions_and_document_the_recovery_workflow`
- Related request(s): `req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces`

# Links
- Request: `req_170_make_folder_reconnection_reliable_for_newly_created_named_workspaces`
- Product brief(s): `prod_021_reliable_folder_reconnection_for_named_workspace_persistence`
- Architecture decision(s): (none yet)

# Delivery evidence — 2026-10-19
- Reproduced with Vitest simulated File System Access handles: fresh creation reported success with a null active manifest when handle readback returned null; reconnection after an external working revision allowed Save to overwrite that revision. Both regression assertions failed before implementation (2 failures / 5 tests). These confirm controller defects, not the original user's unknown browser failure sequence.
- Implementation retains the freshly initialized repository; explicit Choose folder invokes the picker before asynchronous lookup. Stored-handle reconnect queries permission without prompting, validates root or immediate child identity without repair, and only persists validated candidates. Divergent editor content is retained as a recovery head and Save remains blocked pending an explicit choice.
- Real OS picker and native persistent-handle evidence remains pending. Mock tests are not evidence of browser activation behavior.

# Delivery evidence — 2026-10-20
- Save base: the session keeps the base revision across reload, saves and restore/reconcile/adoption/head choice; reconnect compares the disk working revision with that base, so a cached older base surfaces divergence instead of rebasing dirty edits onto disk.
- Fixed a stuck save flag found during the real-picker run: `writeWorking` left `save.saving` true when the session token changed mid-save, so later Save and reconnect were refused as already in progress. A `finally` now releases the flag for the same active context. Regression test fails before the fix and passes after.
- Added regressions: cached old base across reload, handle persistence failure before file creation with duplicate-free retry, corrupted write readback not claiming a verified save, superseded save releasing the busy flag (39 focused tests pass).
- Browser coverage: `tests/e2e/workspace-folder-reconnection.spec.ts` runs the Settings UI with native structured-cloneable handles and real IndexedDB (picker substituted by OPFS; no OS picker or activation claim). Both cases pass on Chromium 149.0.7827.55; the reload case is skipped on Chromium 153 because native handle deserialization crashes it with SIGTRAP in this environment (opt in with `EPE_NATIVE_FOLDER_RELOAD=1`).
- Real OS picker (AC8): Chromium 149.0.7827.55, headed, X11 on WSLg, GTK file chooser, `http://127.0.0.1:5284` dev server, isolated page driving `LineageSessionController` with `IndexedDbLineageLibraryStore`; picker opened from real button clicks. Sequence create (picker + edit permission Allow) > edit > Save > reload with persisted handle > edit > Save > Choose folder selecting the original parent > reconnect ok > edit > Save ok; workspaceId stable before/after, disk working file contains the last edit, single child root `native167` with manifest and recovery file. Revoke/regrant was not exercised; reselect was.
- Limitation: the real-picker harness uses the controller directly rather than the full React UI; the UI path is covered by the native-handle e2e spec above. An earlier harness attempt that booted the full app alongside the harness controller shared the session token between two controllers and is not counted as evidence.
- Gate: `npm run -s ci:blocking` passed on 2026-10-20 (Logics lint/audit OK; ESLint 0 errors, 1 existing warning in `src/app/hooks/useWorkspaceFileStorage.ts`; typecheck; i18n; dependency audit; 672 fast + segmented UI tests; Playwright 9 passed, 1 skipped (Chromium 153 reload case); Vite build; PWA gate).
