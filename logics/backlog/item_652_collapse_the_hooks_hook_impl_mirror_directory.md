## item_652_collapse_the_hooks_hook_impl_mirror_directory - Collapse the hooks/hook-impl mirror directory
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Progress: 100%
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
- AC2: The six aliases and includeNetworkSummaryPanel option are gone. Tested domain-assembly adapters and colocated type modules remain because they are active seams, not mirror-directory workarounds.
- AC3: typecheck, lint (including the new max-lines configuration), and the full test suite pass with no test assertions weakened.
- AC4: git log preserves file history where practical (git mv for straight moves).

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: src/app/hook-impl/ no longer exists; no import path references it anywhere.
- request-AC8 -> This backlog slice. Proof: AC2: The six aliases, the includeNetworkSummaryPanel option, the three domain-assembly adapter files, and the two single-consumer type files are gone.
- request-AC4 -> This backlog slice. Evidence needed: All ten modal components delegate focus trapping, Escape, Tab cycling, focus restore, and backdrop to one shared mechanism (native dialog element or a single shared hook), with per-dialog copies deleted and existing dialog behavior (confirm-on-enter, close-on-backdrop options) preserved.
- request-AC5 -> This backlog slice. Evidence needed: Every export reverified with zero production references is deleted from src/core, src/store, and src/app/lib, including the harness-assembly validation subsystem and computePinElectricalLoad scope parameter. Live portability imports and the migration failure-injection seam remain, with their active callers/tests recorded in closeout evidence.
- request-AC6 -> This backlog slice. Evidence needed: The repeated describe*Change field comparisons collapse to one field-list-driven helper and the timestamp formatter exists once. renderMemoCompare remains until its 18 unstable callback inputs are fixed because removal currently fails render-containment tests; normalizer and AI-contract rewrites are excluded until they produce a measured correctness or maintenance benefit.
- request-AC7 -> This backlog slice. Evidence needed: remark-gfm is removed from package.json and the react-markdown call site, and all 91 changelog entries render with identical visible output.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- GUARDRAILS: this is a pure move/inline/delete slice. Use git mv for every file move. Update imports mechanically (replace app/hook-impl/ with app/hooks/ in import paths repo-wide, source AND tests). Do NOT rename any hook, do NOT change any hook body, do NOT reorder hook calls, do NOT touch memoization. If typecheck fails after a move, the fix is always an import path, never a code change. Work file by file and run npm run typecheck after each move. This item MUST land after item_651 (the eslint max-lines overrides must already allow the merged file sizes).

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

# Tasks
- `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# Notes
- Task `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies` was finished via `logics-manager flow finish task` on 2026-07-03.
