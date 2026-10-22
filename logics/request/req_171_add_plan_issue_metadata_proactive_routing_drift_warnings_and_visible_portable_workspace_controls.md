## req_171_add_plan_issue_metadata_proactive_routing_drift_warnings_and_visible_portable_workspace_controls - Add plan issue metadata, proactive routing drift warnings and visible portable workspace controls
> From version: 1.19.3
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Plan release and workspace confidence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 11:56:36

# AI Context
- Network metadata and cartouches use explicit issue fields. Recompute diagnostics share the pure manual engine; Copy exports current .epe.json content while preserving the source session. Header identity comes from the lineage snapshot.

# Needs
- Add a user-controlled issue revision/index and issue date to plans.
- On opening a harness/network, detect whether the manual Network recompute operation would change the design and notify in Warnings; check more frequently only when measured cost remains low.
- Provide a Copy action beside Save, Rename and New workspace to obtain a portable workspace file.
- Keep the current workspace visible immediately beside the application brand.

# Context
- User request on 2026-10-22; repository release 1.19.3. Scoping only, implementation follows through the generated task.
- Product scope decision: a plan is an existing Network and its exported drawing. Metadata is per network, not per workspace or harness assembly; it does not introduce a release management workflow. This coordinated brief spans plan checking and workspace confidence; prod_018 remains authoritative for lineage/history semantics.
- Network already contains author, projectCode, exportNotes, createdAt and updatedAt; networkMetadata, migrations and networkFile normalize explicit allowlists. Export cartouches currently show creation date. Extend the whole form-to-export chain rather than conflating creation and issue dates.
- buildWireRecomputeReport already calls recomputeAllWiresForNetwork without committing and returns recomputed wires plus a report. The manual reducer then bumps revision and opens a one-shot dialog. Reuse the pure calculation for diagnostics. The current report compares route, length and only set-to-set splice sides; endpoint details and unset transitions require parity review to answer whether any persisted routing output would change.
- Validation already has route-lock and electrical checks; integrate warnings and counters there rather than using a separate popup at startup. Active network checks follow workspace hydration and session identity; harness assemblies must not change the scope of the Network button being simulated.
- Current workspace actions are centralized in SettingsWorkspaceStorageSection and use WorkspaceLineageModel/LineageSessionController. Ordinary browser Save can export a complete ZIP, while workspaceFile implements standalone .epe.json. Copy is defined as downloading the displayed snapshot including unsaved work; it preserves lineage identity and does not fork/register a new workspace. Independent lineage duplication and OS clipboard file-copy behavior are outside this request.
- AppHeaderAndStats renders the brand but currently has no active-workspace prop. Read identity from the existing lineage snapshot, with explicit legacy and historical display states. User-facing UI remains EN/FR; Logics documents follow the repository English convention.

# Acceptance criteria
- AC1: Each network plan has independently editable optional planRevision (trimmed text, maximum 40 characters; e.g. A, B02 or 03) and planIssueDate (a real calendar date stored as YYYY-MM-DD). Network create/edit forms accept, clear and validate both fields with EN/FR labels. Neither value is inferred from createdAt/updatedAt, application release, technical revisionId, milestone numbering or supplier handoffs; no automatic increment or date update occurs on Save, export or recompute. Existing plans default to unset.
- AC2: Plan issue metadata survives reducer updates, undo/redo, reload, workspace save/open/copy, lineage versions and network export/import/clone. Extend normalization, persistence migrations and portability validation consistently, preserving backward compatibility for files without fields; select schema changes using repository policy. Frozen versions retain their original values and cannot be edited. Tests include two networks with different metadata and missing/invalid imported fields.
- AC3: With the identity cartouche enabled, existing SVG and PNG exports and PDF exports that reuse the canvas export show Revision / Indice and Issue date / Date de diffusion from the exported network. The issue date is distinct from the existing creation date and never shifts with timezone. Unset values use the existing empty-metadata convention; disabled cartouches stay disabled. Preview/export propagation, long labels and narrow layouts remain readable. No new PDF export flow is required.
- AC4: After initial workspace restoration, file/package import, workspace activation and active-network switching, run a read-only preview of precisely the same full-network recompute operation as the Network button. Report whether any persisted routing outcome would change, including ordered segment IDs, length, endpoint route details and directional splice side transitions (including unset-to-set). Preserve locked routes and all current routing rules. An empty network yields no drift warning. A failed preview is explicitly unavailable/failed, never reported as consistent.
- AC5: Detected drift appears in the existing Warnings/Validation system as a stable, localized warning with network scope, affected-wire count and a path to Network > Recompute routes. Wire details identify technical IDs and changes; reuse existing navigation where available. Rechecking deduplicates/replaces findings. Successful manual recompute refreshes and clears resolved drift and keeps its existing report dialog. Routing failure diagnostics stay distinct and do not duplicate existing errors. Background checks never dispatch wire/recomputeAll, mutate editor state, increment meta.revision, mark dirty, trigger Save/autosave/history or open the manual report dialog, including in historical read-only mode.
- AC6: Recheck after routing-relevant edits using dependency invalidation, coalescing and an idle/debounced scheduler (initial target 500 ms after the latest relevant edit); exclude selection, pan/zoom, locale, workspace rename and plan metadata edits. Cache by workspace/session, network and routing input generation, not meta.revision alone. Ignore obsolete results after edits/switches/imports; pending or failed results cannot leave an old all-clear. Before enabling frequent checks, record fixture sizes, browser/hardware, run count and p50/p95 for startup overhead and input responsiveness on representative and large networks. Target no diagnostic-attributable main-thread task over 50 ms and no more than 50 ms p95 added startup/input latency. Chunk/offload as necessary; if targets fail, keep activation checks deferred and use invalidation plus checks on entering Validation or explicit refresh instead of expensive per-edit runs. Record the chosen cadence and evidence; no unconditional timer polling.
- AC7: Add Copy / Copier in Settings > Workspace storage > Current workspace alongside Save, Rename and New workspace. Copy initiates download of one portable workspace snapshot containing all networks and current in-memory unsaved edits, using the existing .epe.json JSON format (the user calls it .epe), a sanitized workspace-derived copy filename and the normal serializer. Preserve workspace identity for portable reopen/reconciliation; do not register/activate a second workspace or copy an entire lineage folder/ZIP/history/attachments. Copy is separate from Save and Create version, with a tooltip explaining snapshot download.
- AC8: Copy works for browser-backed and folder-backed active named workspaces even without source-folder write permission, subject to existing recoverability/session gates. It does not write/relink the source, clear dirty or pending-export flags, advance its technical save base, create a milestone or change verified-save timestamps. In historical mode it copies the displayed frozen snapshot and labels the filename accordingly; never exports hidden working content. Busy/not-ready/no active workspace states have explicit enablement. Cancellation/failure is truthful, no false disk-verified success; download initiation is the only success claim. Capture immutable content and identity at click time and guard asynchronous feedback against workspace switches. Roundtrip exported files through the existing importer.
- AC9: Display the active workspace displayName immediately to the right of e-Plan Editor in the persistent application header across Home, Network, Modeling, Validation and Settings. Use lineage/session state rather than active network name, filename or slug. Update on restore/create/open/switch/rename, distinguish legacy/unnamed and loading states, and show the existing historical/read-only context when appropriate. Long names remain available through an accessible full-text label/tooltip; 360px and desktop layouts retain a visible workspace identity without hiding navigation or header actions. Cover duplicate display names, empty state and switching races.
- AC10: Record per-AC implementation evidence with meaningful unit/integration and targeted browser regressions for metadata/export roundtrips, pure recompute parity and warnings lifecycle, Copy content and source invariants, and header reactivity/accessibility. Verify EN/FR, 360px/desktop and read-only contexts. Update docs/workspace-lineages.md and relevant export/help documentation. Run applicable lint/typecheck/i18n, targeted tests and build checks plus repository-required delivery gates before implementation closeout; performance evidence is required for the selected routing-check cadence. This corpus delivers no runtime changes or release publication.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_022_plan_issue_traceability_and_everyday_workspace_confidence`
- Architecture decision(s): (none yet)

# References
- logics/product/prod_018_portable_named_workspace_lineages_and_supplier_history.md
- logics/request/req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui.md
- src/core/entities.ts
- src/core/networkMetadata.ts
- src/store/reducer/networkReducer.ts
- src/store/reducer/wireReducer.ts
- src/store/reducer/helpers/wireRecomputeReport.ts
- src/store/reducer/helpers/wireTransitions.ts
- src/store/reducer/helpers/derivedWireRouting.ts
- src/adapters/persistence/migrations.ts
- src/adapters/portability/networkFile.ts
- src/app/components/workspace/NetworkScopeWorkspaceContent.tsx
- src/app/hooks/useNetworkScopeFormState.ts
- src/app/hooks/useNetworkScopeFormOrchestration.ts
- src/app/components/network-summary/export/networkSummaryExport.ts
- src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx
- src/app/hooks/validation/buildValidationIssues.ts
- src/app/hooks/useValidationModel.ts
- src/app/hooks/controller/useAppControllerNetworkRecomputeReport.ts
- src/app/components/workspace/SettingsWorkspaceStorageSection.tsx
- src/app/components/workspace/AppHeaderAndStats.tsx
- src/app/components/layout/AppShellLayout.tsx
- src/app/hooks/useWorkspaceLineages.ts
- src/app/lib/lineage/lineageSessionController.ts
- src/app/lib/workspaceFile.ts
- src/app/lib/workspaceFileAccess.ts
- src/app/lib/exportFileName.ts
- src/app/components/settings/settingsSearchModel.ts
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/network-recompute-report.spec.tsx
- src/tests/app.ui.network-summary-svg-cartouche-export.spec.tsx
- src/tests/app.ui.workspace-lineages.spec.tsx
- src/tests/workspace-storage-settings-section.spec.tsx
- src/tests/app.ui.workspace-shell-regression.spec.tsx
- src/tests/workspace-file.spec.ts
- tests/e2e/workspace-lineages.spec.ts
- docs/workspace-lineages.md
- package.json

# Backlog
- `item_693_persist_plan_issue_revision_and_date_and_render_them_in_export_cartouches`
- `item_694_detect_full_network_recompute_drift_with_pure_cached_warnings`
- `item_695_download_the_current_workspace_snapshot_from_a_copy_action`
- `item_696_keep_active_workspace_identity_visible_beside_the_application_brand`
