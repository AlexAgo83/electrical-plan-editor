## task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review - Deliver workspace UX remediation from the 1.19.1 visual review
> From version: 1.19.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-08 18:20:21
> Owner: Claude (paul.mondou)

# AI Context
- Summary: Orchestrates items 685-690 in five waves; item 688 reuses the status components of item 686. UI and copy only, with per-AC evidence and screenshots before closeout.
- Keywords: workspace ux, home, settings storage, history dialog, theming, i18n
- Use when: Implementing req_169.
- Skip when: Release publication or persistence work.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Decisions (2026-10-08, operator): export reminder escalates to warning when the last export is older than 7 days; the active workspace is excluded from the Home compact rows; History device labels are hidden; success toasts render above the History dialog; History row secondary actions live in a dropdown menu with Resume from this version styled as danger after a separator.

# Plan
- [x] 1. Wave 1: fix the Home layout overlap and unthemed buttons (item 1); quick, low-risk, unblocks visual checks.
- [x] 2. Wave 2: truthful and localized status, preserved-snapshot filtering, single read-only banner and spurious toast root cause (item 2).
- [x] 3. Wave 3: Home vocabulary, first-workspace action and compact rows (item 3) and Settings storage hierarchy and legacy simplification (item 4); item 4 reuses the status components from item 2.
- [x] 4. Wave 4: History dialog hierarchy and metadata (item 5).
- [x] 5. Wave 5: validation matrix, screenshots, docs and delivery gates with per-AC evidence (item 6).
- [x] 6. Keep the chain ready for development; start/progress/close it only through Logics lifecycle commands when implementation actually happens.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`
- `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`
- `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`
- `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`
- `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`
- `item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`. Proof deferred to slice closeout.
- request-AC2 -> `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`. Proof deferred to slice closeout.
- request-AC3 -> `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`. Proof deferred to slice closeout.
- request-AC4 -> `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`. Proof deferred to slice closeout.
- request-AC5 -> `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`. Proof deferred to slice closeout.
- request-AC6 -> `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`. Proof deferred to slice closeout.
- request-AC7 -> `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`. Proof deferred to slice closeout.
- request-AC8 -> This task. Proof: Implemented in abd7668f, dc98be17, 8942262e, d0dd7042, 0d5421b6, e6e551fd, 10165d8f; validated with npm run -s ci:local (lint, typecheck, quality:i18n, Logics lint/audit, vitest fast+ui segments, Playwright e2e incl. tests/e2e/workspace-ux-remediation.spec.ts, build, PWA) passing on 2026-10-08. Source: `10165d8f`

# Validation
- (no validation recorded yet)
- command: `npm run -s ci:local` | result: passed | date: 2026-10-08 | note: Includes Playwright e2e tests/e2e/workspace-ux-remediation.spec.ts and src/tests/workspace-ux-remediation.spec.tsx
- Finish workflow executed on 2026-10-08.
- Linked backlog/request close verification passed.

# Report
- Wave 1 (item_685, abd7668f): desktop Home left column keeps each panel at natural height, the active network panel absorbs the rest and What's new follows the column height; every lineage button sits in the themed row-actions convention; shared theme-token danger style for Resume from this version.
- Wave 2 (item_686, dc98be17): untouched built-in sample is neither preserved nor announced (older sample-only snapshots stay stored, not shown); preserved copy is a neutral recovery notice in Transfer and recovery; lineage dates/times follow the app locale; browser saves read as success; separate export hint with Export now, warning only when the last export (or creation if never exported) is older than 7 days; one global read-only banner with Return and Resume, Settings explains disabled actions; root cause of the spurious toast was the network summary view-state sync dispatching on Modeling mount, now flagged as a background write that is still blocked but no longer notifies.
- Wave 3 (item_687, item_688, dc98be17): mode-aware Home vocabulary (Active network panel, Clear current content / Start from empty content, Save/Open workspace file), Create your first workspace, compact whole-row resume rows with the active workspace excluded; Settings storage restructured (header with primary Save, versions summary with latest version and plurals, compact transfer, legacy import under Advanced, collapsed single-file tools with one create action in legacy mode).
- Wave 4 (item_689, 8942262e): History rows with one primary Open read-only and a keyboard-accessible More menu (Download file, Record supplier handoff, separator, danger-styled Resume with hint and existing confirmation); storage line and device ids removed; filter normal at rest; toasts verified on top of the dialog.
- Wave 5 (item_690, d0dd7042, 0d5421b6, e6e551fd, 10165d8f): unit specs (src/tests/workspace-ux-remediation.spec.tsx) and e2e specs (tests/e2e/workspace-ux-remediation.spec.ts, updated workspace-lineages.spec.ts) cover AC1-AC7 at 360/980/1366/1920 px, six themes, EN/FR and keyboard; docs/workspace-lineages.md updated.
- Validation: npm run -s ci:local passed on 2026-10-08 (Logics lint/audit, eslint, typecheck, quality:i18n, dependency audit, vitest fast and ui segments, Playwright e2e 8 passed, vite build, PWA check). One pre-existing eslint warning in src/app/hooks/useWorkspaceFileStorage.ts (untouched).
- Screenshots: before/after captures were reviewed during delivery, then discarded at the operator's request (2026-10-08); visual evidence rests on the e2e assertions (layout, theming, locale, menu, toast stacking).
- Persistence: the 7-day threshold stores the last export date as an optional lastPortableExportIso field on the browser library registry record (IndexedDB); the operator lifted the no-persistence-change guardrail for this field (2026-10-08). Portable workspace, manifest and package formats are unchanged.
- Finished on 2026-10-08.
- Linked backlog item(s): `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`, `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`, `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`, `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`, `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`, `item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide`
- Related request(s): `req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings`

# Links
- Request: `req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings`
- Product brief(s): `prod_020_workspace_experience_polish_after_the_1_19_1_visual_review`
- Architecture decision(s): (none yet)
