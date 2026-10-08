## req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings - Remediate workspace UI and UX findings from the 1.19.1 visual review on Home and Settings
> From version: 1.19.1
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Workspace UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-08 15:36:38

# AI Context
- Summary: Scope is the 15 proposals (P1-P15) of the 2026-10-08 Playwright review of production 1.19.1; each AC cites the proposals it covers. Root causes already located: fixed-height Home left column, themed buttons limited to .row-actions, sample state preserved as legacy snapshot, browser-locale dates, blocked-mutation report on read-only navigation.
- Keywords: home layout, themed buttons, preserved snapshot, export reminder, read-only banner, app locale dates, history actions
- Use when: Changing Home or Settings workspace surfaces, lineage status copy or the History dialog after 1.19.1.
- Skip when: Changing persistence, recovery, read-only gates or the single dialog host from req_168; those stay untouched.

# Needs
- Fix the visual defects found on Home and Settings > Workspace storage in release 1.19.1 (overlapping panels, unthemed buttons).
- Make workspace status, alerts and read-only signals truthful and non-alarming.
- Simplify the Home and Settings workspace flows and the History dialog so the main actions are obvious.

# Context
- Source: visual review of production 1.19.1 (Playwright, 1366px and 360px, themes warm brown, normal, dark, cyberpunk, circle mobility dark, sage paper, EN/FR) performed on 2026-10-08. Findings and proposals 1 to 15 below are the scope; each AC names the proposal numbers it covers.
- P1 Home overlap: at >=980px home.css gives .home-left-column a fixed viewport height, overflow hidden and grid-template-rows 'auto minmax(0, 1fr)' designed for two panels. The Named workspaces panel added in 1.19.0 is a third child, so Quick start is squeezed and the Workspace (active network) panel is drawn over it (Help button hidden); with an empty library a large gap appears instead.
- P2 Unthemed buttons: themed button styles target '.row-actions button'. Buttons outside that container render with browser defaults (grey, square): preserved snapshot Download/Dismiss and other notice actions, read-only Return to working copy / Resume from this version (global banner and Settings), and the Resume button of each Home card. Visible in every theme.
- P3 Misleading preserved snapshot: LineageSessionController.preserveLegacyStateIfNeeded preserves any non-empty state, including the built-in sample network (hasSampleNetworkSignature exists in the store). A fresh browser therefore shows 'Your previous browser workspace was preserved' in warning tone at the top of Settings without explaining what it is.
- P4 Locale: lineageStatus.formatTime and formatLineageDateTime use the browser locale ([]) instead of the app locale, so FR shows '02:41 PM' and 'Oct 8, 2026'.
- P5 Status: browser-only workspaces always show 'Stored in this browser HH:MM · package export pending' in warning tone (Settings chip, every Home card, Ops panel), although it is the normal state of that mode; the export action is in another column.
- P6 Read-only: Settings shows the same read-only information three times (global banner, chip, boxed banner in Current workspace with two unthemed buttons). Navigating to Modeling while read-only immediately shows a 'Read-only version' blocked-mutation toast without user action; the automatic write that triggers reportBlockedMutationAttempt must be identified (useStoreHistory) and must not notify.
- P7 Vocabulary: Home uses 'workspace' for three things: Named workspaces, Quick start Create empty workspace / Save workspace / Load workspace, and the 'Workspace' panel that actually shows the active network. The Quick start intro still mentions saved workspace files in named mode.
- P8-P11 Settings > Workspace storage: three equal-height columns of full-width equal-weight buttons, no primary action; '2 version(s), 0 supplier handoff(s)' without latest version; in legacy mode a disabled selector 'Unnamed browser workspace' plus a 'No named workspace' chip, a duplicate 'Create named workspace from current content' next to New workspace, and a sentence repeating the save-location card.
- P12-P13 Home: an empty library only offers Manage workspaces (two steps to create the first workspace); cards duplicate the selector, use a very large title, show 'Resume <full name>' buttons that wrap on long names, are sorted alphabetically and do not put the active workspace first. Decision: keep the Home selector requested for 1.19.1; cards become compact rows for the other workspaces.
- P14-P15 History dialog: four equal buttons per version with the risky Resume from this version as prominent as Download file; duplicated Record supplier handoff (toolbar and per row); meaningless 'Stored in this browser' line; cryptic 'created on device-xxxx' labels (generated in useWorkspaceLineages.resolveDeviceLabel); the filter input looks focused at rest; success toasts stack under the dialog.
- Guardrails: no change to persistence formats, immutable versions, recovery-before-restore, read-only gates, session isolation or the single app-level dialog host from req_168. Every action reachable today stays reachable (possibly behind a menu or disclosure). No data is deleted. All copy is semantic EN/FR in the i18n catalogs.

# Acceptance criteria
- AC1 (P1): At 980px to 1920px widths and 0, 1, 2 and 8 named workspaces with long names, Home panels never overlap or clip each other and no large empty gap appears; each panel scrolls internally if needed and Quick start buttons stay fully visible and clickable.
- AC2 (P2): Every button in lineage notices, the read-only banner, the Settings storage section and Home workspace rows uses the global themed button style (radius, font, colors, hover, focus-visible, disabled) in all supported theme modes; a test asserts no lineage button falls back to browser default styling.
- AC3 (P3, P4, P5): The preserved-snapshot notice appears only when the preserved state is not empty and not the built-in sample; it is shown in Transfer and recovery with explanatory copy, neutral tone, Download and Dismiss. Times and dates in lineage status, cards, history and dialogs follow the app locale (EN/FR). A browser-only workspace in its normal state shows a success-toned saved status; the export reminder is a separate neutral hint with an adjacent Export package action, escalating to warning only after a documented threshold.
- AC4 (P6): While a version is open read-only there is exactly one read-only banner (global, themed, Return to working copy and Resume from this version); Settings shows disabled actions with an explanation instead of duplicate banners. Navigating between screens in read-only mode raises no blocked-mutation toast unless the user attempts an edit, and read-only gates still block every edit route.
- AC5 (P7, P12, P13): Home vocabulary distinguishes named workspaces from the active network panel and from legacy file shortcuts; Quick start copy matches the current mode. An empty library offers a primary Create your first workspace action opening the create dialog directly. Home keeps the themed selector; other workspaces appear as compact rows (name, version count, last save) with the active workspace excluded or first, whole-row resume, and no wrapping multi-line buttons for long names.
- AC6 (P8, P9, P10, P11): Settings > Workspace storage shows a current-workspace header (name, selector, status, primary Save, secondary Rename/New), a versions summary with the latest version label/title/date and correct pluralization, primary Create version and secondary History, compact Transfer and recovery actions with legacy import under an Advanced disclosure once a workspace exists, and a simplified legacy mode (no disabled selector or redundant chip, a single create action, single-file tools collapsed unless a link or conflict is active). All req_168 actions, gates, search labels and focus targets still work.
- AC7 (P14, P15): Each History row has one primary action (Open read-only) and a secondary menu for Download file, Record supplier handoff and Resume from this version, the latter visually marked as risky with explicit copy and the existing confirmation; the toolbar keeps a single Record supplier handoff and Export package; the storage line is removed; device labels are human-readable or hidden; the filter field has a normal rest state; success toasts remain visible above or are grouped with the dialog.
- AC8: EN/FR catalogs, Settings search and quality:i18n stay valid; UI, theme, locale and e2e tests cover AC1 to AC7 including 360px and desktop layouts and keyboard flows; docs/workspace-lineages.md describes the updated Home, Settings and History flows; repository delivery gates pass with recorded results.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_020_workspace_experience_polish_after_the_1_19_1_visual_review`
- Architecture decision(s): (none yet)

# References
- changelogs/CHANGELOGS_1_19_1.md
- logics/request/req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui.md
- logics/product/prod_018_portable_named_workspace_lineages_and_supplier_history.md
- logics/product/prod_019_workspace_storage_settings_information_architecture_and_theme_consistency.md
- src/app/styles/home.css
- src/app/styles/workspace-lineages.css
- src/app/styles/workspace/workspace-panels-and-responsive/workspace-panels-and-actions.css
- src/app/components/workspace/HomeWorkspaceContent.tsx
- src/app/components/workspace/WorkspaceLineagePanels.tsx
- src/app/components/workspace/SettingsWorkspaceStorageSection.tsx
- src/app/components/workspace/OperationsHealthPanel.tsx
- src/app/components/settings/settingsSearchModel.ts
- src/app/hooks/useWorkspaceLineages.ts
- src/app/hooks/useStoreHistory.ts
- src/app/lib/workspaceSessionGate.ts
- src/app/lib/lineage/lineageSessionController.ts
- src/app/lib/lineage/lineageStatus.ts
- src/app/lib/lineage/lineageFormat.ts
- src/app/lib/lineage/lineageNotices.ts
- src/app/lib/i18n.ts
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/app.ui.home.spec.tsx
- src/tests/app.ui.theme.spec.tsx
- src/tests/app.ui.settings-locale.spec.tsx
- src/tests/app.ui.workspace-lineages.spec.tsx
- src/tests/workspace-storage-settings-section.spec.tsx
- tests/e2e/workspace-lineages.spec.ts
- docs/workspace-lineages.md

# Backlog
- `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`
- `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`
- `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`
- `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`
- `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`
- `item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide`
