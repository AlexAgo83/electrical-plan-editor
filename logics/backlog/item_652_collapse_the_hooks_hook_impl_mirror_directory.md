## item_652_collapse_the_hooks_hook_impl_mirror_directory - Collapse the hooks/hook-impl mirror directory
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Codebase simplification and maintenance cost reduction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- src/app/hook-impl/ exists only because the hooks modularization gate scanned src/app/hooks/ with a 500-line cap: six wrapper files are pure re-exports, and the pattern is already inconsistent (appendElectricalDimensioningIssues is imported from hook-impl directly).
- Three single-caller domain-assembly adapters (ModelingAnalysis, Aux, WorkspaceHandlers) each build a callback object and delegate to exactly one hook for exactly one parent, re-declaring parameter interfaces (~30-40 boilerplate lines each).
- Six use*ScreenContentSlice compatibility aliases (useAppControllerScreenContentSlices.tsx lines 1211-1220) have zero callers; the includeNetworkSummaryPanel option is never passed by any caller so its early-return guard is unreachable; workspaceHandlerTypes.ts and workspaceFileStorageTypes.ts each have exactly one importer.

# Scope
- In:
  - Depends on the eslint-gate backlog item landing first (the new max-lines overrides must accommodate the merged file sizes, e.g. a higher cap or per-file disable for the large controller hooks).
  - Move every src/app/hook-impl/ implementation into src/app/hooks/ preserving module names; delete the six re-export wrappers and update all import paths repo-wide (source and tests).
  - Inline useAppControllerModelingAnalysisDomainAssembly, useAppControllerAuxDomainAssembly, and useAppControllerWorkspaceHandlersDomainAssembly into their sole callers, dropping the re-declared param interfaces.
  - Delete the six dead use*ScreenContentSlice aliases, the includeNetworkSummaryPanel option and its unreachable guard, and inline workspaceHandlerTypes.ts / workspaceFileStorageTypes.ts into their single consumers (leave spliceHandlerTypes.ts and networkImportExportTypes.ts, which have 3+ consumers).
- Out:
  - The prop-explosion refactor of useAppControllerModelingHandlersAssembly (passing formsState objects through the orchestrator) — behavior-adjacent, deferred to its own slice if ever prioritized.
  - Any change to hook logic, memoization, or ordering — this is a pure move/inline/delete slice.
  - Renaming hooks or changing their public signatures beyond the deleted dead options.

# Acceptance criteria
- AC1: src/app/hook-impl/ no longer exists; no import path references it anywhere.
- AC2: The six aliases, the includeNetworkSummaryPanel option, the three domain-assembly adapter files, and the two single-consumer type files are gone.
- AC3: typecheck, lint (including the new max-lines configuration), and the full test suite pass with no test assertions weakened.
- AC4: git log preserves file history where practical (git mv for straight moves).

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: src/app/hook-impl/ no longer exists; no import path references it anywhere.
- request-AC8 -> This backlog slice. Proof: AC2: The six aliases, the includeNetworkSummaryPanel option, the three domain-assembly adapter files, and the two single-consumer type files are gone.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Collapse the hooks/hook-impl mirror directory
- Keywords: scaffolded-backlog, collapse the hooks/hook-impl mirror directory, implementation-ready
- Use when: Implementing the scaffolded slice for Collapse the hooks/hook-impl mirror directory.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
