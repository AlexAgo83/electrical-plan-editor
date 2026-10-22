## req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions - Show local and opposite endpoint connection and seal references in plan callouts and expose Open folder beside workspace actions
> From version: 1.20.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Plan callout material visibility and workspace access
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 20:30:09

# AI Context
- Summary: Four default-off global checkboxes control effective endpoint codes; local/opposite is relative to each callout row. Open folder reuses the existing picker and registration semantics.
- Keywords: callout, endpoint orientation, terminal reference, seal, catalog precedence, workspace picker
- Use when: Scoping the callout settings, export behavior and Current workspace action placement.
- Skip when: Changing wire business data, routing, storage architecture or revealing an OS directory.

# Needs
- Display connection references and seal references for each wire in drawing callouts.
- Let users check whether each reference is shown for the callout connector side, the opposite wire endpoint, or both, in Settings.
- Expose Open folder next to Save, Rename and Copy beside the workspace selector.

# Context
- User request on 2026-10-22; repository version 1.20.0. This is a ready-to-develop documentation corpus; runtime implementation is deferred to the generated task. Logics docs use English and product UI supports EN/FR.
- Wire already stores endpointAConnectionReference, endpointASealReference, endpointBConnectionReference and endpointBSealReference, plus separate names. A connection reference identifies the wire termination/contact, not the connector technical ID or catalog manufacturer reference. Seal means the endpoint seal (French joint).
- calloutModel builds connector and splice groups by visiting both orientations of every wire. CalloutEntry currently loses the A/B orientation and material references. Preserve orientation explicitly when extending entries; local means the actual endpoint represented by that row, never always endpoint A. Opposite means the other endpoint of that same wire, without traversing another connector or splice.
- Use effective endpoint references consistent with the existing BOM: a nonblank manual wire reference takes precedence; otherwise connector material configuration and catalog defaults resolve per cavity. applyCatalogSeals=false suppresses automatic seal fallback but does not hide an explicit manual seal. Splice endpoints have only their explicit references; do not invent catalog defaults for them. Reuse or extract pure resolution without changing BOM output.
- Callout layout has dynamic columns, measured widths, a layout cache and a 520-unit width cap. Extra reference text requires explicit wrapping/measurement/export treatment rather than simply adding unbounded cells. Existing wire grouping, physical cavity labels, splice L/R labels, drawings and network-prefix formatting remain in use.
- Settings already contains a global canvasShowCalloutWireNames preference. Follow that live display-preference pattern for the new checkboxes, rather than introducing network business fields or an unrelated settings store.
- SettingsWorkspaceStorageSection already renders Save, Rename and Copy in Current workspace. Open folder currently appears under Transfer and recovery and calls model.openFolder. Scope is to relocate this existing browser directory-picker action next to the current-workspace selector/actions, not reveal the active directory in an OS file manager. Existing openFolder registers/reconciles a selected lineage root or immediate child lineages and refreshes the selector; it does not automatically activate a newly registered workspace. Retain those semantics and existing conflict/recovery behavior.
- prod_018 remains authoritative for lineage identity/history. This brief groups the two requested UI improvements for delivery without reopening storage architecture or existing Copy semantics.

# Acceptance criteria
- AC1: Add four independent, accessible EN/FR checkboxes to the existing Settings canvas/callout group: connection reference - this side, seal reference - this side, connection reference - opposite side, and seal reference - opposite side. Any combination is allowed, including all unchecked, local only, opposite only and both. All default to false for new or legacy preferences, preserving existing plan appearance. Settings search finds them using connection/contact, seal/joint and local/opposite terms.
- AC2: Persist the four booleans through the existing UI preference storage/normalization pipeline; malformed or missing values default safely to false. Changes immediately update the active drawing and subsequent exports without an Apply defaults step. They remain effective across reloads and network/workspace switches, following existing global display preference scope. They do not mutate wires, trigger rerouting, add undo history, mark workspace content dirty or rewrite historical snapshots.
- AC3: For each callout wire row, resolve this side from the actual grouped endpoint and opposite side from the other endpoint. If wire A is connector C1 and B is C2, C1 shows A locally/B opposite and C2 shows B locally/A opposite. Support connector-to-connector, connector-to-splice, splice-to-splice, self-loops and multiple wires sharing a cavity; keep one row per existing wire entry without collapsing distinct references. Existing splice callouts follow the same row-relative semantics, including directional sides. Switching A/B with its metadata leaves the references attached to the correct physical endpoints.
- AC4: Display effective connection/seal reference codes using the manual-over-connector/catalog precedence described in Context, including cavity-specific material settings and applyCatalogSeals=false. Names never substitute for codes; do not apply the network entity-prefix formatter to reference strings. A missing reference renders an em dash in an enabled field and never borrows the other endpoint value. Empty cavities keep the existing empty-row convention. Rendering is read-only and never writes resolved defaults back to Wire. Cover explicit overrides, whitespace-only values, absent/deleted catalog links and seals disabled with/without a manual override.
- AC5: Enabled reference fields appear as clearly labeled local/opposite columns in the existing wire-details table, grouped near their corresponding local pin and opposite End ID/PIN columns. All unchecked produces the existing columns. Headers and cells never overlap, silently truncate or confuse local and opposite values; long references wrap with measured row height and full values remain available in the drawing and exported output. Include new values, flags and locale in layout/cache invalidation. Preserve sorting, grouping, drawing-plus-table and wire-details-only modes, selected-only filtering, drag positions, hit targets and zoom behavior; drawing-only mode remains drawing-only.
- AC6: Existing SVG/PNG and PDF paths consuming the plan callout renderer honor the same enabled fields, effective values and side labels as the screen. Fit/export bounds and callout dimensions include wrapped content without clipping. No reference is emitted when its field or the whole callout is hidden. Verify all four enabled with distinct A/B values, missing and long references, connector drawings, splice rows and EN/FR; exporting never changes preference values or design state.
- AC7: Relocate the existing Open folder / Ouvrir un dossier button from Transfer and recovery into Current workspace beside Save, Rename and Copy, in the order Save, Rename, Copy, Open folder, New workspace when all actions are present. Keep it available in the same Current workspace group when no workspace is active so users can populate the selector. Render one primary Open folder action, retain the existing supported-directory-access visibility rule and unsupported-browser explanation, and disable while busy or not ready. Use the existing model.openFolder action from the direct user gesture. Preserve root/parent discovery, identity reconciliation and selector refresh without silently activating another workspace or discarding current unsaved work.
- AC8: Open folder remains distinct from reconnecting the active folder, importing a ZIP and downloading Copy. Existing historical-mode/session/conflict safeguards remain authoritative. Cancellation or failure cannot report success or alter the current editor snapshot; successfully registered workspaces remain selectable through the existing selector. The action uses EN/FR labels, keyboard access and Settings search highlighting; Current workspace actions wrap accessibly at 360px and desktop widths. Test supported/unsupported API, no active workspace, busy/not-ready, picker cancellation/error and success through the relocated control. No new native file-manager integration is required.
- AC9: Record evidence for AC1-AC8 using meaningful model/resolver/layout tests, Settings preference persistence/UI tests, export assertions and workspace-action regressions. Include asymmetric A/B references, endpoint reversal, shared cavity, splice opposite endpoint, all-off/local-only/opposite-only/both, long strings and stale-cache updates. Update workspace guidance and relevant callout help. Run applicable lint, typecheck, quality:i18n, targeted Vitest/browser checks and repository delivery gates during implementation; capture any environment limitation honestly. This documentation change does not implement runtime features or publish a release.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_023_configurable_endpoint_material_references_on_plans_and_direct_workspace_folder_access`
- Architecture decision(s): (none yet)

# References
- logics/product/prod_018_portable_named_workspace_lineages_and_supplier_history.md
- logics/scaffold/plan-issue-metadata-routing-drift-and-workspace-visibility.json
- src/core/entities.ts
- src/core/connectorCatalogMaterials.ts
- src/core/wireReferences.ts
- src/app/components/network-summary/callouts/calloutModel.ts
- src/app/components/network-summary/callouts/calloutLayout.ts
- src/app/components/network-summary/callouts/NetworkSummaryCalloutsLayer.tsx
- src/app/components/network-summary/export/networkSummaryExport.ts
- src/app/lib/networkSummaryBomCsv.ts
- src/app/hooks/uiPreferencesStorage.ts
- src/app/hooks/useUiPreferences.ts
- src/app/hooks/useAppControllerPreferencesState.ts
- src/app/hooks/controller/useAppControllerUiPreferencesBindings.ts
- src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx
- src/app/components/workspace/SettingsWorkspaceContent.tsx
- src/app/components/settings/settingsSearchModel.ts
- src/app/components/workspace/SettingsWorkspaceStorageSection.tsx
- src/app/components/workspace/WorkspaceLineagePanels.tsx
- src/app/hooks/useWorkspaceLineages.ts
- src/app/lib/lineage/lineageSessionController.ts
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/app.ui.settings-canvas-callouts.spec.tsx
- src/tests/network-summary-callouts-layer.spec.tsx
- src/tests/network-summary-callout-splice-side-labels.spec.ts
- src/tests/network-summary-callout-prefix.spec.ts
- src/tests/app.ui.network-summary-svg-export.spec.tsx
- src/tests/workspace-storage-settings-section.spec.tsx
- src/tests/app.ui.workspace-lineages.spec.tsx
- src/tests/workspace-lineage-folder.spec.ts
- docs/workspace-lineages.md
- package.json

# Backlog
- `item_697_carry_effective_local_and_opposite_endpoint_material_references_into_callout_rows`
- `item_698_add_persisted_callout_reference_checkboxes_and_readable_screen_and_export_columns`
- `item_699_move_open_folder_beside_save_rename_and_copy_in_current_workspace`
