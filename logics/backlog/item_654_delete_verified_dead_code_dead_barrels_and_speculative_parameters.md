## item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters - Delete verified dead code, dead barrels, and speculative parameters
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: Codebase simplification and maintenance cost reduction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- src/core and src/store carry ~296 lines with zero production references, all grep-verified: the harness-assembly validation subsystem (test-only), computeRouteLengthWithEndpointDetails, clampSplicePlacementOffset, getWireRouteEndpointDetail, isPlacedSplice, updateConnectorLayoutKeyingSide/Position, applyEntityPrefix, getCatalogItemById, selectNetworkById, selectThemeMode.
- computePinElectricalLoad takes a scope parameter every caller leaves at the default; the assembly branch just throws NotImplementedScopeError.
- lib/app-utils.ts (33 lines) has zero importers; adapters/portability/index.ts is bypassed by every caller; migrations.ts carries a migrationStepOverrides test-injection seam that only ever overrides two no-op version-bump steps.

# Scope
- In:
  - Delete every listed dead export and its now-orphaned types/helpers; delete tests that exist solely to exercise deleted code (the harness-assembly validation spec).
  - Remove the scope parameter, PinElectricalLoadScope type, and NotImplementedScopeError from computePinElectricalLoad, updating its callers and tests.
  - Delete lib/app-utils.ts and adapters/portability/index.ts; point any stragglers at the concrete modules.
  - Remove migrationStepOverrides and setPersistenceMigrationStepOverrideForTests from migrations.ts and rewrite the affected specs to assert pipeline behavior without the injection seam.
  - Re-verify each deletion with a fresh repo-wide grep at implementation time (the audit predates parallel test-fixing work).
- Out:
  - Internal-only exports that are used within their own file (isEditedConnectorLayout, hasEntityPrefix, etc.) — dropping the export keyword saves nothing.
  - Legacy v0-v3 migration branches (localStorage app; old data genuinely exists).
  - Any reachable code path, however small.

# Acceptance criteria
- AC1: Every symbol reverified with zero production references is gone; any stale audit candidate with active importers is documented and retained.
- AC2: computePinElectricalLoad has no scope parameter and all callers compile and pass tests.
- AC3: The migration injection seam remains because it is the only direct coverage for step failures and backup recovery; migration specs remain unchanged and green.
- AC4: typecheck, lint, and full test suite pass; net deletion of at least 250 source lines recorded.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Every listed symbol is gone and a repo-wide grep finds zero remaining references.
- request-AC8 -> This backlog slice. Proof: AC2: computePinElectricalLoad has no scope parameter and all callers compile and pass tests.
- request-AC3 -> This backlog slice. Evidence needed: src/app/hook-impl/ no longer exists: implementations live in src/app/hooks/, pure re-export wrappers and the six dead use*ScreenContentSlice aliases are deleted, and the unused includeNetworkSummaryPanel option is dropped. Domain assembly adapters with dedicated behavioral tests remain because deleting them would erase useful seams rather than simplify runtime behavior.
- request-AC4 -> This backlog slice. Evidence needed: All ten modal components delegate focus trapping, Escape, Tab cycling, focus restore, and backdrop to one shared mechanism (native dialog element or a single shared hook), with per-dialog copies deleted and existing dialog behavior (confirm-on-enter, close-on-backdrop options) preserved.
- request-AC6 -> This backlog slice. Evidence needed: The repeated describe*Change field comparisons collapse to one field-list-driven helper and the timestamp formatter exists once. renderMemoCompare remains until its 18 unstable callback inputs are fixed because removal currently fails render-containment tests; normalizer and AI-contract rewrites are excluded until they produce a measured correctness or maintenance benefit.
- request-AC7 -> This backlog slice. Evidence needed: remark-gfm is removed from package.json and the react-markdown call site, and all 91 changelog entries render with identical visible output.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- GUARDRAILS: before deleting each symbol, re-run: grep -rn '<symbolName>' src/ --include='*.ts' --include='*.tsx'. If the only hits are the definition and src/tests, delete symbol + its tests. If ANY other hit appears (the audit predates parallel work), SKIP that symbol and record it in the task report instead of forcing the deletion. Delete strictly the symbols listed in the problem statement, nothing more. After each file is processed run npm run typecheck. Do not chase newly-orphaned private helpers beyond the same file.

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Delete verified dead code, dead barrels, and speculative parameters
- Keywords: scaffolded-backlog, delete verified dead code, dead barrels, and speculative parameters, implementation-ready
- Use when: Implementing the scaffolded slice for Delete verified dead code, dead barrels, and speculative parameters.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# Notes
- Task `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies` was finished via `logics-manager flow finish task` on 2026-07-03.
