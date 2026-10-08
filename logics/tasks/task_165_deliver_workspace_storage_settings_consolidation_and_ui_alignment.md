## task_165_deliver_workspace_storage_settings_consolidation_and_ui_alignment - Deliver workspace storage settings consolidation and UI alignment
> From version: 1.19.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# AI Context
- Deliver the four slices in order: Settings integration, legacy compatibility, themes/search, then validation.
- Keep one model and one stable dialog host. Record actual evidence for each request AC before closeout.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Wave 1: confirm the action disposition against 1.19.0 and extract Settings storage bindings plus a single stable dialog host; deliver item 1.
- [ ] 2. Wave 2: deliver mode-aware legacy compatibility and authoritative status; inspect health/Home shortcuts and session isolation (item 2 depends on item 1).
- [ ] 3. Wave 3: integrate global theme/UI conventions and localized search for the final controls (item 3 depends on items 1 and 2).
- [ ] 4. Wave 4: execute the state/theme/responsive/keyboard matrix, run required gates, update docs and record AC evidence (item 4 depends on all prior items).
- [ ] 5. Keep the chain ready for development; start/progress/close it only through Logics lifecycle commands when implementation actually happens.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_681_consolidate_named_workspace_management_in_settings_storage`
- `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`
- `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`
- `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`

# Definition of Done (DoD)
- [ ] All four linked implementation slices satisfy their acceptance criteria.
- [ ] Settings is the canonical management surface; compact context and read-only safety remain visible outside it.
- [ ] Named and legacy storage, recovery and historical safeguards pass focused regression coverage.
- [ ] All supported themes, EN/FR search, 360px/desktop layout and keyboard/dialog behavior have evidence.
- [ ] Lint, typecheck, i18n, applicable unit/end-to-end suites, build and repository-required delivery checks pass.
- [ ] Updated workflow documentation and actual per-AC proof are recorded before lifecycle closeout.

# AC Traceability
- request-AC1 -> `item_681_consolidate_named_workspace_management_in_settings_storage`. Proof deferred to slice closeout.
- request-AC2 -> `item_681_consolidate_named_workspace_management_in_settings_storage`. Proof deferred to slice closeout.
- request-AC4 -> `item_681_consolidate_named_workspace_management_in_settings_storage`. Proof deferred to slice closeout.
- request-AC3 -> `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`. Proof deferred to slice closeout.
- request-AC4 -> `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`. Proof deferred to slice closeout.
- request-AC6 -> `item_682_retire_obsolete_storage_controls_with_explicit_legacy_compatibility`. Proof deferred to slice closeout.
- request-AC5 -> `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`. Proof deferred to slice closeout.
- request-AC6 -> `item_683_align_storage_settings_and_lineage_dialogs_with_global_themes_and_localization`. Proof deferred to slice closeout.
- request-AC1 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC2 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC3 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC4 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC5 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC6 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.
- request-AC7 -> `item_684_validate_workspace_storage_consolidation_and_document_the_updated_workflow`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_168_consolidate_release_1_19_workspace_controls_in_settings_storage_and_align_global_ui`
- Product brief(s): `prod_019_workspace_storage_settings_information_architecture_and_theme_consistency`
- Architecture decision(s): (none yet)
