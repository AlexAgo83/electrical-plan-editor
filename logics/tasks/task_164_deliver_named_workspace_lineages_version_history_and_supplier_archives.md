## task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives - Deliver named workspace lineages version history and supplier archives
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-07 16:16:36
> Owner: Claude

# AI Context
- Summary: Deliver seven dependent slices: contracts, repository, history UI, supplier archives, transfer/conflicts, legacy adoption and release validation. No implementation has started.
- Keywords: deliver, named, workspace, lineages, version, history, supplier, archives
- Use when: Coordinating implementation order and collecting acceptance evidence for req_167.
- Skip when: Treating generated documentation as proof of delivered software.

# Context
- Deliver the named Series/Prototypes workflow specified by req_167 through the seven linked backlog slices. Preserve portable files, lineage isolation and immutable supplier history. The corpus is ready for implementation; Progress remains 0% until code delivery begins.

# Plan
- [x] 1. Wave 1: implement and document format/identity/ancestry contracts and backward migration; settle executable fixtures before storage work.
- [x] 2. Wave 2: build lineage repositories and recovery/commit protocol, including stale callback protection, permission errors and partial-write fault injection. This gates all UI mutation flows.
- [x] 3. Wave 3: wire named-workspace selection, ordinary saving, version creation and centrally guarded history consultation/restoration on the repository.
- [x] 4. Wave 4: implement immutable supplier handoffs and exact attachments, then ZIP/manual portability and conflict reconciliation using shared contracts.
- [x] 5. Wave 5: implement previewable legacy adoption, preserving source provenance and explicit grouping.
- [x] 6. Wave 6: run the cross-feature release matrix, document tested folder/fallback behavior and measured large-history results, record acceptance evidence and execute Logics closeout only after implementation.
- [x] 7. Dependencies: contracts -> repository -> UI; contracts/repository -> supplier archives -> full ZIP handoff coverage; repository/format -> legacy import; all items -> integrated release validation. Do not mark this scaffold implemented or close the task while delivery evidence is absent.
- [x] At each delivery wave, update acceptance evidence and document any format or recovery decision before dependent work begins.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_674_named_lineage_and_immutable_workspace_version_contracts`
- `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`
- `item_676_workspace_selector_home_resume_and_safe_history_consultation`
- `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`
- `item_678_portable_zip_transfer_and_divergence_reconciliation`
- `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`
- `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`

# Definition of Done (DoD)
- [x] All seven backlog slices are implemented and their acceptance criteria demonstrated.
- [x] Named workspace switching, ordinary saves, numbered milestones and read-only history work without cross-lineage state leakage.
- [x] Folder and ZIP portability preserve current work, old versions, provenance and exact supplier attachments in a clean browser (ZIP: real Chromium E2E; folder: simulated File System Access handle — see Report limitations).
- [x] Restore, divergence, interrupted publication and legacy adoption preserve previous valid data; failures have tested recovery paths.
- [x] Targeted regression suites, lint, typecheck, localization checks, browser scenarios and production build pass.
- [x] User workflow documentation and measured large-history results are recorded.
- [x] Request AC1-AC10 have real validation evidence; Logics lint, audit and closeout validation pass before completion.

# AC Traceability
- request-AC1 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC3 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC7 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC2 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC3 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC6 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC1 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC2 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC4 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC10 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC5 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC6 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC10 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC6 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC7 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC8 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC1 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC2 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC3 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC4 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC5 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC6 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC7 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC8 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC9 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`
- request-AC10 -> This task. Proof: Implemented in 30f949a9, bd016df6 and 40ad0e38; validated with npm run lint, npm run typecheck, npm run quality:i18n, npx vitest run (1060 tests), npm run test:e2e (4/4 incl. tests/e2e/workspace-lineages.spec.ts) and npm run build. Source: `40ad0e38`

# Validation
- `npm run lint` — passed (0 errors; 1 pre-existing warning in useWorkspaceFileStorage.ts also present on 22fd68c8).
- `npm run typecheck` — passed.
- `npm run quality:i18n` — passed (1642 keys, EN/FR).
- `npx vitest run` — 165 files / 1060 tests passed; `npm run test:ci:ui` all chunks passed; `npm run test:ci:fast -- --coverage` 95 files / 628 tests passed.
- `npm run test:e2e` — 4/4 passed (Playwright 1.61.1, Chrome Headless Shell 149), including `tests/e2e/workspace-lineages.spec.ts`.
- `npm run build` and `npm run quality:pwa` — passed.
- Not performed: manual folder picker/relink test against a real OS folder (headless browsers cannot drive the native directory picker); folder mode is covered by simulated-handle tests only.
- command: `npm run lint && npm run typecheck && npm run quality:i18n && npx vitest run && npm run test:ci:ui && npm run test:ci:fast -- --coverage && npm run test:e2e && npm run build && npm run quality:pwa` | result: passed | date: 2026-10-07 | note: 1060 vitest tests, 4/4 Playwright incl. workspace-lineages scenario; folder mode via simulated handle only, no manual real-folder run
- Finish workflow executed on 2026-10-07.
- Linked backlog/request close verification passed.

# Report
- Commits: `30f949a9` (format contracts, repository, ZIP, reconciliation, legacy adoption), `bd016df6` (session controller, mutation/persistence gate, selector/Home/history/handoff/legacy/divergence UI, EN/FR), `40ad0e38` (folder-mode, persistence-suspension and E2E tests, docs/workspace-lineages.md).
- Format: workspace file schema 2 (schema 1 readable, future schema rejected), manifest schema 1, handoff record schema 1; contract in `docs/workspace-lineages.md`.
- Repository: verified writes, Recovery/working-previous protocol, staged immutable publication, orphan detection/adoption, idempotent operation IDs, manifest reconstruction, no pruning.
- Isolation: session tokens drop stale autosaves; central gate blocks dispatch/undo/redo/replace (imports, AI agent) and browser/linked-file persistence during read-only consultation; undo history reset at boundaries.
- Portability: in-house ZIP codec (no dependency) with decoded-size limits; reconciliation by IDs/digests/ancestry with quarantine and explicit divergent-head choice.
- Large history (100 versions x 150 wires, Node 24/WSL2): raw 24.89 MiB, ZIP 1.46 MiB, open 2.6 ms with zero version reads, history list 0.1 ms, one lazy read 1.9 ms, export 222 ms.
- Limitations: folder mode validated with a simulated File System Access handle, not with a manual run on a real OS folder; Firefox/Safari use browser-only + ZIP mode.
- Finished on 2026-10-07.
- Linked backlog item(s): `item_674_named_lineage_and_immutable_workspace_version_contracts`, `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`, `item_676_workspace_selector_home_resume_and_safe_history_consultation`, `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`, `item_678_portable_zip_transfer_and_divergence_reconciliation`, `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`, `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`
- Related request(s): `req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs`

# Links
- Request: `req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs`
- Product brief(s): `prod_018_portable_named_workspace_lineages_and_supplier_history`
- Architecture decision(s): (none yet)
