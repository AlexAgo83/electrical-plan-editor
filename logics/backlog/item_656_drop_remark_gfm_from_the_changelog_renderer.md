## item_656_drop_remark_gfm_from_the_changelog_renderer - Drop remark-gfm from the changelog renderer
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Codebase simplification and maintenance cost reduction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- remark-gfm ships in the production dependency tree solely for the changelog renderer, but a grep across all 91 changelog files found zero GFM constructs (no tables, no strikethrough, no task lists, no autolinks beyond what CommonMark covers).
- react-markdown alone renders the headings, lists, bold, and code spans the changelogs actually use.

# Scope
- In:
  - Remove the remarkPlugins={[remarkGfm]} usage from HomeWorkspaceContent.tsx and remove remark-gfm from package.json dependencies.
  - Add a lightweight guard (changelog lint step or unit test) that fails if a future changelog introduces GFM-only syntax, so the regression is caught at authoring time rather than as silently-unrendered markup.
  - Visually verify a representative sample of changelog entries renders identically (the existing changelog-feed spec plus manual spot check recorded in closeout).
- Out:
  - Replacing react-markdown itself with a custom renderer — separate decision, only worth it if bundle size becomes a priority.
  - Rewriting any changelog content.

# Acceptance criteria
- AC1: remark-gfm is absent from package.json and package-lock.json; npm install and the production build succeed.
- AC2: All existing changelog rendering tests pass and rendered output is visually identical for current entries.
- AC3: A guard exists that fails CI (or the changelog test) if GFM-only syntax appears in a future changelog file.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: remark-gfm is absent from package.json and package-lock.json; npm install and the production build succeed.
- request-AC8 -> This backlog slice. Proof: AC2: All existing changelog rendering tests pass and rendered output is visually identical for current entries.
- request-AC3 -> This backlog slice. Evidence needed: src/app/hook-impl/ no longer exists: implementations live in src/app/hooks/, pure re-export wrappers and the six dead use*ScreenContentSlice aliases are deleted, and the unused includeNetworkSummaryPanel option is dropped. Domain assembly adapters with dedicated behavioral tests remain because deleting them would erase useful seams rather than simplify runtime behavior.
- request-AC4 -> This backlog slice. Evidence needed: All ten modal components delegate focus trapping, Escape, Tab cycling, focus restore, and backdrop to one shared mechanism (native dialog element or a single shared hook), with per-dialog copies deleted and existing dialog behavior (confirm-on-enter, close-on-backdrop options) preserved.
- request-AC5 -> This backlog slice. Evidence needed: Every export reverified with zero production references is deleted from src/core, src/store, and src/app/lib, including the harness-assembly validation subsystem and computePinElectricalLoad scope parameter. Live portability imports and the migration failure-injection seam remain, with their active callers/tests recorded in closeout evidence.
- request-AC6 -> This backlog slice. Evidence needed: The repeated describe*Change field comparisons collapse to one field-list-driven helper and the timestamp formatter exists once. renderMemoCompare remains until its 18 unstable callback inputs are fixed because removal currently fails render-containment tests; normalizer and AI-contract rewrites are excluded until they produce a measured correctness or maintenance benefit.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- DECIDED: the GFM guard is a vitest unit test (extend src/tests/changelog-feed.spec.ts) that loads every changelog markdown file and fails if any line matches GFM-only syntax: /^\s*\|.*\|/ (tables), /~~[^~]+~~/ (strikethrough), /^\s*[-*] \[[ xX]\]/ (task lists). Exact steps: remove remarkPlugins usage in HomeWorkspaceContent.tsx, npm uninstall remark-gfm, add the guard test, run the changelog spec suite and npm run build. Nothing else.

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Drop remark-gfm from the changelog renderer
- Keywords: scaffolded-backlog, drop remark-gfm from the changelog renderer, implementation-ready
- Use when: Implementing the scaffolded slice for Drop remark-gfm from the changelog renderer.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# Notes
- Task `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies` was finished via `logics-manager flow finish task` on 2026-07-03.
