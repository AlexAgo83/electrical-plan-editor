## req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui - Consolidate release 1.19 workspace controls in Settings storage and align global UI
> From version: 1.19.0
> Schema version: 1.0
> Status: Draft
> Understanding: 95%
> Confidence: 90%
> Complexity: High
> Theme: Workspace storage settings
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# AI Context
- Release 1.19.0 distributes lineage actions across the global toolbar, Home and History while Settings still describes single-file storage.
- Consolidation must preserve the single dialog host, active-session save routing and historical read-only warning.
- Legacy controls are retired by session mode; recovery and old-file compatibility remain supported.

# Needs
- Move the latest release workspace options into Settings > Workspace storage.
- Remove obsolete storage options according to the actual active storage mode.
- Make the relocated controls and associated dialogs follow the global UI and selected theme.

# Context
- Baseline: package.json and local changelog identify release 1.19.0 (1.18.2 -> 1.19.0). This request scopes UI consolidation after req_167, not implementation of a new persistence format. Repository evidence is the source of the release inventory.
- Observed placement: WorkspaceLineageBar in AppShellLayout contains selector, status, Save, Create version, History, New, warnings and the only WorkspaceLineageDialogs host. HomeWorkspaceLineagesPanel contains resume cards, New, Open folder, Import package and Import legacy. HistoryDialog currently hides Rename, supplier handoffs and Export package in its toolbar. Surface them through appropriate Settings groups without duplicating their implementation.
- Observed mismatch: SettingsWorkspaceContent still binds workspaceFileStatus and single-file callbacks. settingsSearchModel indexes that legacy vocabulary. Both storage hooks are composed in useAppControllerWorkspaceRuntime; legacy linked handles are scoped to their owning session. Reuse the existing workspace model and session gate rather than introducing a second repository or unscoped writer.
- Destination contract: retain the existing settings-workspace-storage ID, navigation order, panel header and section-search behavior. Extract a dedicated storage section component so the already large SettingsWorkspaceContent and WorkspaceLineagePanels files do not absorb all orchestration logic. Keep one model instance and one root-level dialog host.
- Action disposition: move workspace selection/creation/renaming, save/version/history and folder/package/adoption management into Settings. Keep supplier handoff creation and attachment retrieval reachable through Versions and handoffs/history. Recovery actions (choose divergent head, reconnect folder, recover orphans, preserved legacy snapshot download/dismiss) belong to contextual Settings messages. Preserve their confirmations and availability rules.
- Legacy disposition: Use a file for autosave, Stop autosave link, Resume last file, linked-file Save now, old Current save location/Storage details and old Load file version/Keep local version conflict panel are obsolete for active named workspaces, not universally dead APIs. Render them only in the no-active-lineage compatibility subsection. Open workspace file and Save as copy remain explicit legacy snapshot tools there; named-workspace portability uses ZIP and existing version download. Do not remove schema readers, stored handles, preserved snapshots or recovery APIs merely because a control moved.
- Also inspect OperationsHealthPanel and Home shortcuts for stale current-target status and old file management links. Redirect duplicate management entry points to the same Settings section; keep health diagnostics and legitimate legacy recovery. Do not infer action identity by comparing translated aria-label text with English literals.
- Keep only compact context outside Settings: active name, truthful save status and a shortcut. The historical warning and Return to working copy remain visible while modeling; Resume from version is reachable through Settings/history. Preserve Home resume cards, which are navigation rather than management.
- Styling evidence: workspace-lineages.css currently uses literal #2f8a4c, #b5751f and #b04343 plus bespoke layouts. Prefer existing semantic status classes/tokens; if a semantic token is missing, define it consistently in the existing theme contract, covering all supported themes without copying independent palettes. Reuse global buttons, icons, form fields, dialogs, spacing and responsive rows.
- Validation matrix: no lineage/empty library; named browser workspace with pending ZIP export; named folder with granted and revoked permissions; busy/save failure; historical read-only; divergent heads/orphans/missing files; preserved legacy recovery; legacy linked and download sessions. Assertions must distinguish verified disk save, local recovery and initiated download.
- Product scope: the existing prod_018 remains the authority for persistence and immutable history. The companion brief here scopes Settings information architecture and visual consistency only; it does not redefine lineage storage semantics. No application changes are delivered by this corpus.

# Acceptance criteria
- AC1: Settings > Workspace storage is the canonical management surface for named workspaces: select/switch, create, rename, Save, Create version, History, supplier handoffs, folder open/reconnect, ZIP import/export and reviewed legacy adoption are reachable from that section. Group controls into Current workspace, Versions and handoffs, Transfer and recovery; contextual detail actions may stay in dialogs.
- AC2: Remove the standalone global management toolbar and management-button duplication on Home. Home retains resume cards and one Manage workspaces shortcut that opens and focuses settings-workspace-storage. Outside Settings retain a compact active-name/save-status indicator with the same shortcut, and an always-visible historical-read-only warning with Return to working copy. Other recovery warnings link directly to the matching Settings action. Ctrl/Cmd+S continues saving the active working copy.
- AC3: For an active named workspace, hide obsolete single-file autosave/link/resume/conflict controls and derive all visible save state from that workspace. For a legacy session without an active named workspace, retain functioning legacy open/save/relink/conflict recovery in a clearly labeled compatibility subsection and offer adoption. Opening old schema files and preserving recovery data remain supported; no UI cleanup deletes user data.
- AC4: Preserve existing save/version distinction, history read-only gates, recovery-before-restore, supplier attachments, permission and divergence handling, busy/disabled behavior and async workspace isolation. Mount exactly one dialog host independently of the removed toolbar; Settings navigation and search cannot lose, duplicate or silently redirect an operation.
- AC5: Storage panels, controls, cards, dialogs, history rows and status/error states reuse global Settings and dialog styles and existing theme tokens. All supported themes render readable foreground/background, borders, inputs, hover, focus and disabled states; no fixed success/warning/error color in the lineage CSS bypasses the theme system. At 360px and desktop widths, controls wrap without page overflow; keyboard focus, labels and dialog focus restoration work.
- AC6: EN/FR semantic translations, Settings search labels/highlighting/counts and section navigation cover the new reachable actions and exclude removed actions in the current storage mode. No raw translation key, misleading legacy save target or unlocalized new copy appears. Network-level Import/Export remains separate and functional.
- AC7: Focused UI and end-to-end coverage exercises both named and legacy sessions, empty library, folder-supported and fallback browsers, history consultation/return/restore, dialog lifecycle and saving after navigation. Theme/responsive checks and documentation explain the new entry points and compatibility policy. Development validation records actual results without treating this scaffold as implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)

# References
- changelogs/CHANGELOGS_1_19_0.md
- logics/request/req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs.md
- logics/product/prod_018_portable_named_workspace_lineages_and_supplier_history.md
- src/app/components/workspace/SettingsWorkspaceContent.tsx
- src/app/components/workspace/WorkspaceLineagePanels.tsx
- src/app/components/workspace/HomeWorkspaceContent.tsx
- src/app/components/workspace/OperationsHealthPanel.tsx
- src/app/components/layout/AppShellLayout.tsx
- src/app/components/settings/settingsSearchModel.ts
- src/app/hooks/controller/buildWorkspaceLineageElements.tsx
- src/app/hooks/controller/useAppControllerWorkspaceRuntime.ts
- src/app/hooks/controller/useAppControllerWorkspaceContentAssembly.tsx
- src/app/AppController.tsx
- src/app/hooks/useWorkspaceLineages.ts
- src/app/hooks/useWorkspaceFileStorage.ts
- src/app/lib/workspaceSessionGate.ts
- src/app/styles/workspace-lineages.css
- src/app/styles/validation-settings/settings-import-export-storage.css
- src/app/styles/validation-settings/settings-theme-overrides.css
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/app.ui.settings.spec.tsx
- src/tests/app.ui.settings-search.spec.tsx
- src/tests/app.ui.settings-locale.spec.tsx
- src/tests/app.ui.theme.spec.tsx
- src/tests/app.ui.workspace-lineages.spec.tsx
- src/tests/workspace-file-storage.hook.spec.tsx
- tests/e2e/workspace-lineages.spec.ts
- docs/workspace-lineages.md

# Backlog
- `item_681_consolidate_named_workspace_management_in_settings_storage`
- `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`
- `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`
- `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`
