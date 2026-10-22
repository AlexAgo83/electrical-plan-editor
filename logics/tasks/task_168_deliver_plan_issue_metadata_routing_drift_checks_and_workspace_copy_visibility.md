## task_168_deliver_plan_issue_metadata_routing_drift_checks_and_workspace_copy_visibility - Deliver plan issue metadata routing drift checks and workspace copy visibility
> From version: 1.19.3
> Schema version: 1.0
> Status: In progress
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-22 12:00:13
> Owner: claude

# AI Context
- Deliver metadata/export parity, pure routing diagnostics with measured cadence, standalone snapshot Copy and reactive header identity. Request AC1-AC10 require implementation evidence before closeout; scaffolding alone does not complete this task.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Wave 1: implement the per-network issue metadata contract, persistence/import compatibility and cartouche propagation (backlog 1); record AC1-AC3 evidence.
- [x] 2. Wave 2: establish pure recompute parity and report completeness, then lifecycle-scoped warnings, scheduling and representative performance evidence (backlog 2). Choose and document the measured cadence/fallback before claiming AC4-AC6 complete.
- [x] 3. Wave 3: implement standalone Copy snapshot download and its source/session invariants (backlog 3), then bind current workspace identity into the persistent header (backlog 4); cover AC7-AC9.
- [x] 4. Wave 4: complete AC10 with EN/FR, responsive/historical, importer/exporter and browser regression evidence; update workspace/export guidance and run repository-required delivery gates. Record limitations explicitly.
- [x] 5. Keep this chain ready for development. Use Logics lifecycle commands to start, record progress and close only after runtime delivery and AC evidence; the scoping commit is not implementation completion.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`
- `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`
- `item_695_download_the_current_workspace_snapshot_from_a_copy_action`
- `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`

# Definition of Done (DoD)
- [x] Implement all four linked backlog slices and attach request AC1-AC10 evidence to this task.
- [x] Verify legacy/new metadata roundtrips, export rendering, pure recompute parity, warning lifecycle, Copy source invariants and header state transitions.
- [x] Record routing diagnostic performance measurements and the selected cadence or documented fallback from AC6.
- [x] Complete EN/FR, responsive, read-only and browser regressions; update workspace/export guidance.
- [x] Pass applicable repository delivery gates plus Logics lint, audit and request validation; no deferred implementation evidence remains at closeout.
- [x] Refresh the context pack and affected workflow docs with actual delivery outcomes.

# AC Traceability
- request-AC1 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof: `src/tests/network-plan-issue-metadata.spec.ts` (helpers: trim/40 chars, strict calendar dates incl. leap years; form draft rejection; reducer isolation per network, unset default, clear on empty, no change on recompute/unrelated edits) and `src/tests/app.ui.networks.spec.tsx` (EN form edit/clear, creation date untouched); FR labels in `src/app/i18n/fr.json` (e049bcad).
- request-AC2 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof: `src/tests/network-plan-issue-metadata.spec.ts` persisted migration (invalid stored date dropped), workspace .epe.json roundtrip and legacy files without fields, network file export/import with invalid fields normalized + warning, duplicate carries metadata; undo/redo and lineage versions reuse the same state snapshots/serializer; historical versions are read-only through the existing session gate; no schema bump (additive optional fields, entityPrefix precedent) (e049bcad).
- request-AC3 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof: `src/tests/network-summary-export-cartouche-plan-issue.spec.ts` (EN/FR rows, verbatim date, omission when unset, narrow truncation, disabled cartouche) and `src/tests/app.ui.network-summary-svg-cartouche-export.spec.tsx` (SVG export contains Revision/Issue date distinct from Created); PNG/PDF reuse `prepareDecoratedSvgClone` (e049bcad).
- request-AC10 -> `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`. Proof: Per-AC evidence above; docs/workspace-lineages.md (Copy, header identity) and README (plan metadata, cartouche fields, routing consistency); EN/FR i18n gate; `npm run -s ci:blocking` steps all passed except the dependency audit (see Validation); performance evidence recorded under Delivery evidence.
- request-AC4 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof: `src/tests/routing-drift-preview.spec.ts` parity with real `wire/recomputeAll` persisted diffs (stale length/route, unset->set splice side, endpoint details, locked route stale length, invalid locked route -> failed, empty network consistent, sliced == full, no mutation); scheduling after restore/import/activation/switch via input identity in `src/tests/routing-drift-diagnostics.hook.spec.ts` (82745ba9).
- request-AC5 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof: `src/tests/app.ui.routing-drift-warnings.spec.tsx` (localized Routing consistency warnings with count, per-wire technical IDs, store state object unchanged by the check, no report dialog, Go to -> Network Scope edit form -> Recompute routes keeps its dialog and clears drift); `src/tests/routing-drift-diagnostics.hook.spec.ts` builder tests (stable IDs, EN/FR, single distinct unavailable warning) (82745ba9).
- request-AC6 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof: `src/tests/routing-drift-diagnostics.hook.spec.ts` (500 ms debounce, pending never all-clear, selection ignored, coalescing, obsolete run discarded, cache reuse, failed/idle); `tests/e2e/routing-drift-performance.spec.ts` measurements and chosen cadence recorded under Delivery evidence (82745ba9).
- request-AC10 -> `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`. Proof: Per-AC evidence above; docs/workspace-lineages.md (Copy, header identity) and README (plan metadata, cartouche fields, routing consistency); EN/FR i18n gate; `npm run -s ci:blocking` steps all passed except the dependency audit (see Validation); performance evidence recorded under Delivery evidence.
- request-AC7 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof: `src/tests/workspace-lineage-copy.spec.ts` (one .epe.json, all networks, unsaved edits, identity/ancestry, sanitized filename), `src/tests/workspace-storage-settings-section.spec.tsx` (Copy placed between Rename and New workspace, EN/FR tooltip), Settings search test; `tests/e2e/workspace-copy.spec.ts` browser download (cc999826, c91b5e3b).
- request-AC8 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof: `src/tests/workspace-lineage-copy.spec.ts` (save status/records/versions/activation unchanged, historical frozen snapshot only with labelled filename, truthful failure, no active workspace) and `src/tests/workspace-lineage-folder.spec.ts` (folder without write permission, folder bytes untouched); importer roundtrip via `buildLegacyAdoptionPreview`/`parseWorkspaceFilePayload`; capture is synchronous so no async feedback can cross a switch (cc999826).
- request-AC10 -> `item_695_download_the_current_workspace_snapshot_from_a_copy_action`. Proof: Per-AC evidence above; docs/workspace-lineages.md (Copy, header identity) and README (plan metadata, cartouche fields, routing consistency); EN/FR i18n gate; `npm run -s ci:blocking` steps all passed except the dependency audit (see Validation); performance evidence recorded under Delivery evidence.
- request-AC9 -> `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`. Proof: `src/tests/header-workspace-identity.spec.tsx` (loading/unnamed/named/historical from lineage only, EN/FR, placement right after the brand, full-text accessible prefix and tooltip, slug never shown) and `tests/e2e/workspace-header-identity.spec.ts` (Home/Network/Modeling/Validation/Settings, duplicate names, rename, switch, 360 px with menu/Settings/Ops visible and no overflow) (c91b5e3b).
- request-AC10 -> `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`. Proof: Per-AC evidence above; docs/workspace-lineages.md (Copy, header identity) and README (plan metadata, cartouche fields, routing consistency); EN/FR i18n gate; `npm run -s ci:blocking` steps all passed except the dependency audit (see Validation); performance evidence recorded under Delivery evidence.

# Validation
- command: `npm run -s ci:blocking` | result: failed at `quality:dependency-audit` | date: 2026-10-22 | note: Logics lint/audit, ESLint (0 errors, 1 existing warning), typecheck and i18n passed before it; the audit rejects new moderate advisories GHSA-qxg6-89mg-rqv8 / GHSA-xp26-3454-mjgp on vitest 4.1.11 (dev-only). package.json/package-lock.json are unchanged since the scoping commit d26d1202, so the base fails identically; the vitest bump is left to a separate change.
- command: `npm run -s test:ci:segmentation:check && npm run -s test:ci:fast -- --coverage && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite && npm run -s quality:pwa` | result: passed | date: 2026-10-22 | note: remaining ci:blocking steps; 719 fast tests, 9 UI chunks, Playwright 14 passed / 1 skipped (existing Chromium 153 reload skip), PWA gate passed.
- command: `ROUTING_DRIFT_BENCH_RUNS=10 node scripts/quality/run-playwright-e2e.mjs tests/e2e/routing-drift-performance.spec.ts` | result: passed | date: 2026-10-22

# Report
- Delivered in e049bcad, 82745ba9, cc999826 and c91b5e3b. Evidence, cadence decision and limitations are under Delivery evidence.
- Outstanding outside this task: vitest dev-dependency advisories block `quality:dependency-audit` (patch release available upstream).

# Links
- Request: `req_171_add_plan_issue_metadata_proactive_routing_drift_warnings_and_visible_portable_workspace_controls`
- Product brief(s): `prod_022_plan_issue_traceability_and_everyday_workspace_confidence`
- Architecture decision(s): (none yet)

# Delivery evidence — 2026-10-22
- Commits: e049bcad (wave 1 plan issue metadata), 82745ba9 (wave 2 routing drift diagnostics), cc999826 (wave 3a Copy), c91b5e3b (wave 3b header identity, docs).
- Schema policy: planRevision/planIssueDate are additive optional Network fields; no persisted/workspace/network-file schema bump, same policy as `entityPrefix` (9b30afa3). Files without the fields load unset; invalid imported values are dropped with a `planIssueDate<-undefined` / `planRevision<-undefined` import warning.
- Cartouche convention: unset revision/date are omitted like author/project code; the issue date is rendered verbatim (`YYYY-MM-DD`, no Date parsing) so it cannot shift with timezone. PDF reuses `prepareDecoratedSvgClone`, so SVG/PNG/PDF share the rows. Narrow cartouches keep the existing single-line `...` truncation.
- Routing drift report completeness: `describeWireRecomputeChange` now reports ordered route, length, endpoint route details A/B, splice side A/B including unset -> set (and any endpoint field change) and a canonical field-diff fallback, so the manual report dialog lists exactly the wires whose persisted representation changes. Parity tests compare preview IDs against the real `wire/recomputeAll` persisted diff (consistent, stale length/route, unset side, endpoint detail, locked stale length, invalid locked route -> failed, sliced vs full run, no input mutation).
- Cadence decision (AC6): checks run 500 ms after the latest routing-input change (restore, import, activation, network switch included), in idle-time slices with an 8 ms budget (`requestIdleCallback`, `setTimeout(0)` fallback), cached by the identity of activeNetworkId/wires/segments/nodes/nodePositions/splices/connectors (up to 8 entries), obsolete runs cancelled, pending/failed never shown as consistent. Selection, viewport, locale, workspace rename and network metadata edits keep the inputs. No timer polling. Node drags invalidate (nodePositions drive directional splice side inference); the debounce coalesces them.
- Performance measurement: Node/V8 single-shot preview (vitest, i7-12700H): sample 15 wires p50 0.80 / p95 1.00 ms; 300 wires p50 39.6 / p95 40.9 ms; 1500 wires p50 946 / p95 957 ms -> a single-shot check would breach the 50 ms task target, hence slicing.
- Browser measurement: Playwright 1.63 Chromium (headless), Vite dev server (unminified), Intel i7-12700H 20 threads, 7 GB RAM WSL2, `ROUTING_DRIFT_BENCH_RUNS=10` `tests/e2e/routing-drift-performance.spec.ts`, 10 page loads per fixture. Representative (10x10 grid, 60 connectors, 10 directional splices, 300 wires): 6-9 slices, max slice 10.0 ms, check wall p50 272 ms, 0 long tasks, event-loop lag added during check p50 0.10 / p95 20.30 ms, first slice ~1071 ms after DOMContentLoaded. Large (20x20 grid, 200 connectors, 30 splices, 1500 wires): 102-153 slices, max slice 9.9 ms (p95 9.0), check wall p50 5.1 s, 0 long tasks, added lag p50 0.00 / p95 0.00 ms, first slice ~1030 ms after DOMContentLoaded. Startup: no check runs before hydration + debounce, so no startup-blocking diagnostic task. CI runs the same spec with 2 runs and asserts max slice < 50 ms, added lag p95 < 50 ms.
- Limitations: measurements use the dev build and synthetic grid fixtures; the event-loop lag probe (10 ms timer) is an input-latency proxy, not real input events. A large check takes seconds of wall time in the background; warnings appear after it completes.
- Copy: `LineageSessionController.copySnapshot` (sync capture) + model/UI/search; working copy keeps workspaceId/lineage/working ancestry; historical copy = displayed frozen snapshot, `-vNNN-copy-` filename, no working ancestry; no save-state/records/version/activation change; works without folder write permission.
- Header identity: lineage-session-only describer (loading/unnamed/named/historical), visually hidden "Current workspace:" prefix + title tooltip; 360 px keeps identity, menu, Settings and Ops visible; docked entity nav moves to a second row at <= 670 px.
