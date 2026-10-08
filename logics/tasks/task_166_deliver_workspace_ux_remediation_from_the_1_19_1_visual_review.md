## task_166_deliver_workspace_ux_remediation_from_the_1_19_1_visual_review - Deliver workspace UX remediation from the 1.19.1 visual review
> From version: 1.19.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-08 15:36:38

# AI Context
- Summary: Orchestrates items 685-690 in five waves; item 688 reuses the status components of item 686. UI and copy only, with per-AC evidence and screenshots before closeout.
- Keywords: workspace ux, home, settings storage, history dialog, theming, i18n
- Use when: Implementing req_169.
- Skip when: Release publication or persistence work.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Wave 1: fix the Home layout overlap and unthemed buttons (item 1); quick, low-risk, unblocks visual checks.
- [ ] 2. Wave 2: truthful and localized status, preserved-snapshot filtering, single read-only banner and spurious toast root cause (item 2).
- [ ] 3. Wave 3: Home vocabulary, first-workspace action and compact rows (item 3) and Settings storage hierarchy and legacy simplification (item 4); item 4 reuses the status components from item 2.
- [ ] 4. Wave 4: History dialog hierarchy and metadata (item 5).
- [ ] 5. Wave 5: validation matrix, screenshots, docs and delivery gates with per-AC evidence (item 6).
- [ ] 6. Keep the chain ready for development; start/progress/close it only through Logics lifecycle commands when implementation actually happens.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`
- `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`
- `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`
- `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`
- `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`
- `item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`. Proof deferred to slice closeout.
- request-AC2 -> `item_685_fix_home_panel_overlap_and_unthemed_workspace_buttons`. Proof deferred to slice closeout.
- request-AC3 -> `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`. Proof deferred to slice closeout.
- request-AC4 -> `item_686_make_workspace_status_alerts_and_read_only_signals_truthful_and_localized`. Proof deferred to slice closeout.
- request-AC5 -> `item_687_clarify_home_workspace_vocabulary_first_workspace_creation_and_compact_workspace_rows`. Proof deferred to slice closeout.
- request-AC6 -> `item_688_restructure_settings_workspace_storage_hierarchy_and_simplify_legacy_mode`. Proof deferred to slice closeout.
- request-AC7 -> `item_689_give_the_history_dialog_a_clear_action_hierarchy_and_readable_metadata`. Proof deferred to slice closeout.
- request-AC8 -> `item_690_validate_the_workspace_ux_remediation_and_update_the_workflow_guide`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_169_remediate_workspace_ui_and_ux_findings_from_the_1_19_1_visual_review_on_home_and_settings`
- Product brief(s): `prod_020_workspace_experience_polish_after_the_1_19_1_visual_review`
- Architecture decision(s): (none yet)
