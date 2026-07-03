## item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters - Delete verified dead code, dead barrels, and speculative parameters
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
- AC1: Every listed symbol is gone and a repo-wide grep finds zero remaining references.
- AC2: computePinElectricalLoad has no scope parameter and all callers compile and pass tests.
- AC3: Migration specs pass without the injection seam and pipeline behavior coverage is not weakened.
- AC4: typecheck, lint, and full test suite pass; net deletion of at least 250 source lines recorded.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Every listed symbol is gone and a repo-wide grep finds zero remaining references.
- request-AC8 -> This backlog slice. Proof: AC2: computePinElectricalLoad has no scope parameter and all callers compile and pass tests.

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
