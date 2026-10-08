## task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment - Deliver workspace storage settings consolidation and UI alignment
> From version: 1.19.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude
> Indicators reviewed: 2026-10-08 10:16:11

# AI Context
- Deliver the four slices in order: Settings integration, legacy compatibility, themes/search, then validation.
- Keep one model and one stable dialog host. Record actual evidence for each request AC before closeout.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Wave 1: confirm the action disposition against 1.19.0 and extract Settings storage bindings plus a single stable dialog host; deliver item 1.
- [x] 2. Wave 2: deliver mode-aware legacy compatibility and authoritative status; inspect health/Home shortcuts and session isolation (item 2 depends on item 1).
- [x] 3. Wave 3: integrate global theme/UI conventions and localized search for the final controls (item 3 depends on items 1 and 2).
- [x] 4. Wave 4: execute the state/theme/responsive/keyboard matrix, run required gates, update docs and record AC evidence (item 4 depends on all prior items).
- [x] 5. Keep the chain ready for development; start/progress/close it only through Logics lifecycle commands when implementation actually happens.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_681_consolidate_named_workspace_management_in_settings_storage`
- `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`
- `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`
- `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`

# Definition of Done (DoD)
- [x] All four linked implementation slices satisfy their acceptance criteria.
- [x] Settings is the canonical management surface; compact context and read-only safety remain visible outside it.
- [x] Named and legacy storage, recovery and historical safeguards pass focused regression coverage.
- [x] All supported themes, EN/FR search, 360px/desktop layout and keyboard/dialog behavior have evidence.
- [x] Lint, typecheck, i18n, applicable unit/end-to-end suites, build and repository-required delivery checks pass.
- [x] Updated workflow documentation and actual per-AC proof are recorded before lifecycle closeout.

# AC Traceability
- request-AC1 -> This task. Proof: Settings > Workspace storage exposes Current workspace (select/switch, Save, Rename, New), Versions and handoffs (Create version, History, Record supplier handoff) and Transfer and recovery (Export/Import package ZIP, Open/Reconnect folder, Import old workspace files); asserted in src/tests/app.ui.workspace-lineages.spec.tsx and tests/e2e/workspace-lineages.spec.ts (commits 850cceb4, c1519001).
- request-AC2 -> This task. Proof: global WorkspaceLineageBar replaced by WorkspaceLineageContextBar (name, status, Manage workspaces, read-only warning + Return to working copy, Resolve in Settings links); Home panel reduced to resume cards + Manage workspaces which focuses the storage heading (keyboard Enter in e2e, focus assertion in UI spec); Ctrl/Cmd+S saves after navigation (app.ui.workspace-lineages.spec.tsx).
- request-AC3 -> This task. Proof: single-file autosave/link/resume/conflict controls render only in the Single-file compatibility subsection when no named workspace is active; workspace-storage-settings-section.spec.tsx asserts an unrelated linked conflict is hidden in named mode and a legacy linked session can save, relink, unlink and resolve the conflict, with adoption offered; no reader, handle or recovery API removed.
- request-AC4 -> This task. Proof: one WorkspaceLineageDialogs host mounted in AppController (single lineage dialog asserted in UI spec); read-only and busy gates asserted in workspace-storage-settings-section.spec.tsx; undo blocked while read-only and duplicate version clicks still single (app.ui.workspace-lineages.spec.tsx); legacy hook session isolation unchanged (workspace-file-storage.hook.spec.tsx passes).
- request-AC5 -> This task. Proof: workspace-lineages.css uses --theme-status-* tokens defined on .app-shell mixed with currentColor (no hex/rgb literal, asserted in app.ui.theme.spec.tsx); every theme option applies its classes to the storage section and to the dialog layer with focus restoration on close (app.ui.theme.spec.tsx); e2e asserts no horizontal overflow at 360px and keyboard focus of the storage heading.
- request-AC6 -> This task. Proof: new EN/FR keys (quality:i18n valid, 1680 keys); mode-aware getSettingsSections labels and localized match counts; named-mode search for "autosave" yields no storage hit while "create version" is highlighted (app.ui.workspace-lineages.spec.tsx); French groups, compatibility subsection and count asserted in app.ui.settings-locale.spec.tsx; network Import/Export untouched.
- request-AC7 -> This task. Proof: UI and e2e cover legacy and named sessions, empty library, browser fallback, history consultation/return, ZIP export/import into a clean context and saving after navigation; docs/workspace-lineages.md documents the Settings entry points and compatibility policy. Folder mode remains validated through the simulated handle only; no native OS picker run.

# Validation
- 2026-10-08: `npm run -s lint && npm run -s typecheck && npm run -s quality:i18n && npm run -s quality:dependency-audit && npm run -s test:ci:segmentation:check && npm run -s test:ci:fast -- --coverage && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite && npm run -s quality:pwa` passed (exit 0) at commit 6ac6c62c: lint 0 errors (1 pre-existing warning in useWorkspaceFileStorage.ts), fast lane 96 files / 632 tests, UI lane 70 files all passed, Playwright 4 passed, build and PWA artifact gate passed.
- command: `npm run -s lint && npm run -s typecheck && npm run -s quality:i18n && npm run -s quality:dependency-audit && npm run -s test:ci:segmentation:check && npm run -s test:ci:fast -- --coverage && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite && npm run -s quality:pwa` | result: passed | date: 2026-10-08
- Finish workflow executed on 2026-10-08.
- Linked backlog/request close verification passed.

# Report
- Wave 1 (item_681): SettingsWorkspaceStorageSection with three groups; compact WorkspaceLineageContextBar; Home resume cards + Manage workspaces; single app-level dialog host with theme host classes; focus handoff via workspaceStorageFocus.
- Wave 2 (item_682): mode-aware rendering; legacy tools in a Single-file compatibility subsection with adoption; operations panel and Home quick-start file shortcuts follow the active mode.
- Wave 3 (item_683): --theme-status-* tokens, Settings group styles, EN/FR copy for relocated and legacy controls, localized search counts, mode-aware search labels.
- Wave 4 (item_684): UI/component/theme/locale/e2e coverage and docs/workspace-lineages.md update.
- Not done: the 1.19.0 changelog was not edited because tag v1.19.0 already exists; the entry belongs to the next release. No manual native folder-picker or screenshot-based visual review was performed; theme evidence is class/token based plus headless Chromium layout checks.
- Finished on 2026-10-08.
- Linked backlog item(s): `item_681_consolidate_named_workspace_management_in_settings_storage`, `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`, `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`, `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`
- Related request(s): `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`

# Links
- Request: `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)
