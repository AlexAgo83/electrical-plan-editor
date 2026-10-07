## task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives - Deliver named workspace lineages version history and supplier archives
> From version: 1.18.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-07 15:19:22

# AI Context
- Summary: Deliver seven dependent slices: contracts, repository, history UI, supplier archives, transfer/conflicts, legacy adoption and release validation. No implementation has started.
- Keywords: deliver, named, workspace, lineages, version, history, supplier, archives
- Use when: Coordinating implementation order and collecting acceptance evidence for req_167.
- Skip when: Treating generated documentation as proof of delivered software.

# Context
- Deliver the named Series/Prototypes workflow specified by req_167 through the seven linked backlog slices. Preserve portable files, lineage isolation and immutable supplier history. The corpus is ready for implementation; Progress remains 0% until code delivery begins.

# Plan
- [ ] 1. Wave 1: implement and document format/identity/ancestry contracts and backward migration; settle executable fixtures before storage work.
- [ ] 2. Wave 2: build lineage repositories and recovery/commit protocol, including stale callback protection, permission errors and partial-write fault injection. This gates all UI mutation flows.
- [ ] 3. Wave 3: wire named-workspace selection, ordinary saving, version creation and centrally guarded history consultation/restoration on the repository.
- [ ] 4. Wave 4: implement immutable supplier handoffs and exact attachments, then ZIP/manual portability and conflict reconciliation using shared contracts.
- [ ] 5. Wave 5: implement previewable legacy adoption, preserving source provenance and explicit grouping.
- [ ] 6. Wave 6: run the cross-feature release matrix, document tested folder/fallback behavior and measured large-history results, record acceptance evidence and execute Logics closeout only after implementation.
- [ ] 7. Dependencies: contracts -> repository -> UI; contracts/repository -> supplier archives -> full ZIP handoff coverage; repository/format -> legacy import; all items -> integrated release validation. Do not mark this scaffold implemented or close the task while delivery evidence is absent.
- [ ] At each delivery wave, update acceptance evidence and document any format or recovery decision before dependent work begins.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_674_named_lineage_and_immutable_workspace_version_contracts`
- `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`
- `item_676_workspace_selector_home_resume_and_safe_history_consultation`
- `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`
- `item_678_portable_zip_transfer_and_divergence_reconciliation`
- `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`
- `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`

# Definition of Done (DoD)
- [ ] All seven backlog slices are implemented and their acceptance criteria demonstrated.
- [ ] Named workspace switching, ordinary saves, numbered milestones and read-only history work without cross-lineage state leakage.
- [ ] Folder and ZIP portability preserve current work, old versions, provenance and exact supplier attachments in a clean browser.
- [ ] Restore, divergence, interrupted publication and legacy adoption preserve previous valid data; failures have tested recovery paths.
- [ ] Targeted regression suites, lint, typecheck, localization checks, browser scenarios and production build pass.
- [ ] User workflow documentation and measured large-history results are recorded.
- [ ] Request AC1-AC10 have real validation evidence; Logics lint, audit and closeout validation pass before completion.

# AC Traceability
- request-AC1 -> `item_674_named_lineage_and_immutable_workspace_version_contracts`. Proof deferred to slice closeout.
- request-AC3 -> `item_674_named_lineage_and_immutable_workspace_version_contracts`. Proof deferred to slice closeout.
- request-AC7 -> `item_674_named_lineage_and_immutable_workspace_version_contracts`. Proof deferred to slice closeout.
- request-AC9 -> `item_674_named_lineage_and_immutable_workspace_version_contracts`. Proof deferred to slice closeout.
- request-AC2 -> `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`. Proof deferred to slice closeout.
- request-AC3 -> `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`. Proof deferred to slice closeout.
- request-AC6 -> `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`. Proof deferred to slice closeout.
- request-AC9 -> `item_675_lineage_repository_with_durable_folder_storage_and_isolated_local_recovery`. Proof deferred to slice closeout.
- request-AC1 -> `item_676_workspace_selector_home_resume_and_safe_history_consultation`. Proof deferred to slice closeout.
- request-AC2 -> `item_676_workspace_selector_home_resume_and_safe_history_consultation`. Proof deferred to slice closeout.
- request-AC4 -> `item_676_workspace_selector_home_resume_and_safe_history_consultation`. Proof deferred to slice closeout.
- request-AC10 -> `item_676_workspace_selector_home_resume_and_safe_history_consultation`. Proof deferred to slice closeout.
- request-AC5 -> `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`. Proof deferred to slice closeout.
- request-AC6 -> `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`. Proof deferred to slice closeout.
- request-AC9 -> `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`. Proof deferred to slice closeout.
- request-AC10 -> `item_677_supplier_handoff_records_and_exact_delivered_artifact_archives`. Proof deferred to slice closeout.
- request-AC6 -> `item_678_portable_zip_transfer_and_divergence_reconciliation`. Proof deferred to slice closeout.
- request-AC7 -> `item_678_portable_zip_transfer_and_divergence_reconciliation`. Proof deferred to slice closeout.
- request-AC9 -> `item_678_portable_zip_transfer_and_divergence_reconciliation`. Proof deferred to slice closeout.
- request-AC8 -> `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`. Proof deferred to slice closeout.
- request-AC9 -> `item_679_previewable_adoption_of_legacy_timestamped_workspace_collections`. Proof deferred to slice closeout.
- request-AC1 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC2 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC3 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC4 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC5 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC6 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC7 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC8 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC9 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.
- request-AC10 -> `item_680_workspace_lineage_release_validation_and_user_workflow_documentation`. Proof deferred to slice closeout.

# Validation
- Scoping only: scaffold inline validation reported ready-to-dev with no blockers. Runtime validation remains pending implementation.
- Delivery commands: `npm run lint`, `npm run typecheck`, `npm run quality:i18n`, targeted Vitest workspace suites, relevant Playwright scenarios, and `npm run build`.
- Include manual folder permission/relink tests and a browser-capability fallback run; record exact environments and results at delivery.

# Report
- Not started.

# Links
- Request: `req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs`
- Product brief(s): `prod_018_portable_named_workspace_lineages_and_supplier_history`
- Architecture decision(s): (none yet)
