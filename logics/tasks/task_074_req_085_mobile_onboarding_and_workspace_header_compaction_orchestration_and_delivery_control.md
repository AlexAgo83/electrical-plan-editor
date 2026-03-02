## task_074_req_085_mobile_onboarding_and_workspace_header_compaction_orchestration_and_delivery_control - req_085 mobile onboarding and workspace header compaction orchestration and delivery control
> From version: 0.9.18
> Status: Draft
> Understanding: 100% (scope is a focused mobile compaction pass across onboarding, workspace headers/actions, and dense table labels/columns)
> Confidence: 96% (changes are mostly presentation-level but cross-cutting; targeted regression gates are required)
> Progress: 0%
> Complexity: High
> Theme: Mobile UX compaction and readability hardening across onboarding, network scope, modeling, analysis, catalog, and validation
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
`req_085` extends the mobile pass with explicit one-line placement and label-compaction rules:
- onboarding modal header/actions must stay on single lines;
- Network Scope + Validation header action alignment;
- compact mobile labels across Catalog and shared table columns;
- mobile-only hidden columns (`Route mode`, `Severity`).

The request is cross-surface and requires a strict sequence so shared responsive style updates do not regress unrelated panels.

# Objective
- Deliver req_085 end-to-end through backlog `item_433..item_436`.
- Preserve desktop/tablet behavior while enforcing mobile-only compaction rules.
- Produce auditable closure evidence for all req_085 acceptance criteria.

# Scope
- In:
  - orchestration of `item_433`, `item_434`, `item_435`, `item_436`;
  - sequencing, validation discipline, and AC traceability evidence;
  - synchronization of request/backlog/task statuses at closure.
- Out:
  - new feature scope beyond req_085;
  - business-logic changes unrelated to mobile presentation contracts.

# Request scope covered
- `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`

# Backlog scope covered
- `logics/backlog/item_433_onboarding_modal_mobile_single_row_header_and_action_alignment.md`
- `logics/backlog/item_434_network_scope_mobile_duplicate_label_and_header_tool_alignment.md`
- `logics/backlog/item_435_modeling_analysis_mobile_header_tool_alignment_and_table_compaction.md`
- `logics/backlog/item_436_req_085_mobile_compaction_validation_matrix_and_closure_traceability.md`

# Attention points (mandatory delivery discipline)
- Keep mobile-specific behavior scoped to narrow-view contracts; avoid desktop regressions.
- Avoid broad CSS selectors that accidentally affect non-targeted screens.
- Preserve action semantics and accessibility while changing labels/row composition.
- Keep acceptance evidence explicit for each requested mobile rule.

# Locked implementation decisions
- Execution order is fixed: `item_433 -> item_434 -> item_435 -> item_436`.
- Mobile baseline viewport checks are mandatory on both profiles: `390x844` and `360x800`.
- Copy/column changes in this wave are presentation-only; handlers and sort/filter logic remain unchanged.
- `Route mode` and `Severity` visibility changes are mobile-only.

# Plan
- [ ] 1. Deliver onboarding modal mobile single-line header/footer action alignment (`item_433`)
- [ ] 2. Deliver Network Scope + Validation mobile header/action alignment and duplicate-label compaction (`item_434`)
- [ ] 3. Deliver Catalog/Modeling/Analysis/Validation mobile table/header compaction rules (`item_435`)
- [ ] 4. Execute req_085 AC matrix, validation evidence capture, and closure synchronization (`item_436`)
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`

# Targeted validation guidance (recommended during implementation)
- `npm run -s test -- src/tests/app.ui.onboarding.spec.tsx`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
- `npm run -s test -- src/tests/app.ui.list-ergonomics.spec.tsx`
- `npm run -s test -- src/tests/app.ui.catalog.spec.tsx`
- `npm run -s test -- src/tests/app.ui.validation.spec.tsx`
- targeted narrow viewport checks at `390x844` and `360x800`

# Report
- Current blockers: none.
- Current status: not started.
- Risks to track:
  - selector spillover from shared responsive styles;
  - clipping risks from one-line mobile constraints;
  - assertion drift in UI tests due mobile-only label updates.

# References
- `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisNodeSegmentWorkspacePanels.tsx`
- `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
- `src/app/styles/onboarding.css`
- `src/app/styles/tables.css`
- `src/tests/app.ui.onboarding.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.list-ergonomics.spec.tsx`
- `src/tests/app.ui.catalog.spec.tsx`
- `src/tests/app.ui.validation.spec.tsx`
