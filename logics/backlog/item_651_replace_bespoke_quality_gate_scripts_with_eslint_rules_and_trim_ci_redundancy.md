## item_651_replace_bespoke_quality_gate_scripts_with_eslint_rules_and_trim_ci_redundancy - Replace bespoke quality-gate scripts with eslint rules and trim CI redundancy
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
- Six custom gate scripts (~750 lines) re-implement rules eslint expresses natively: three modularization gates are per-file line caps plus file-existence pinning, the UI timeout gate is a hand-rolled TypeScript AST walk with an 11-entry prose allowlist, and the exceljs boundary gate regex-scans every source file.
- check-pin-role-release-gate.mjs reruns 8 specs that ci:blocking's full suite covers two steps later; run-vitest-segmented.mjs hardcodes a 71-file UI test list plus a drift validator instead of using the glob, and hand-rolls chunking vitest ships as --shard.
- Roughly ten env-var knobs across report-ui-coverage.mjs, report-full-coverage.mjs, report-slowest-tests.mjs, and report-bundle-metrics.mjs are set nowhere; coverage:full:report is not referenced by CI.

# Scope
- In:
  - Add eslint max-lines with per-glob overrides reproducing the current line caps for src/app/hooks, src/app/components, and src/store; delete the three modularization gate scripts and their gate-core helpers plus their package.json scripts and ci:blocking entries.
  - Add eslint no-restricted-imports (exceljs outside the designated adapter) and no-restricted-syntax (static exceljs import in the adapter; it/test calls with a third timeout argument in UI specs, honoring the existing allowlist as eslint-disable comments); delete check-exceljs-boundary.mjs and check-ui-timeout-governance.mjs.
  - Delete check-pin-role-release-gate.mjs and its ci:blocking entry; replace UI_LANE_TEST_FILES and validateLaneContract in run-vitest-segmented.mjs with a glob-derived list; evaluate vitest --shard for the chunk loop and adopt it if it preserves current lane semantics.
  - Inline the never-set env-var knobs in the report scripts as constants; collapse the two coverage wrappers to package.json one-liners where nothing else remains.
  - Update src/tests/quality.ui-modularization.spec.ts (which tests gate internals) to match the new enforcement mechanism or delete it if eslint config makes it redundant.
- Out:
  - check-npm-audit-allowlist.mjs, check-pwa-build-artifacts.mjs, report-bundle-metrics.mjs core logic (real policy gates with no eslint equivalent).
  - Changing any current line-cap value or boundary rule — enforcement moves, thresholds stay.
  - The vitest fast/ui lane split itself (segmentation stays; only its bookkeeping shrinks).

# Acceptance criteria
- AC1: Adding a file over the line cap in a governed directory, a static exceljs import outside the adapter, or a per-test timeout in a UI spec each fails eslint (and thus ci:blocking), demonstrated by a temporary violation during development.
- AC2: The six replaced gate scripts, their package.json entries, and their ci:blocking steps are gone; npm run lint covers the same rules.
- AC3: run-vitest-segmented.mjs contains no hardcoded spec-file list and no drift validator; UI lane membership follows the app.ui.*.spec.tsx glob and total lane coverage is unchanged (segmentation check passes).
- AC4: No env-var knob remains in scripts/quality that is set nowhere in repo, .env.example, or CI.
- AC5: Full ci:blocking passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Adding a file over the line cap in a governed directory, a static exceljs import outside the adapter, or a per-test timeout in a UI spec each fails eslint (and thus ci:blocking), demonstrated by a temporary violation during development.
- request-AC2 -> This backlog slice. Proof: AC2: The six replaced gate scripts, their package.json entries, and their ci:blocking steps are gone; npm run lint covers the same rules.
- request-AC8 -> This backlog slice. Proof: AC3: run-vitest-segmented.mjs contains no hardcoded spec-file list and no drift validator; UI lane membership follows the app.ui.*.spec.tsx glob and total lane coverage is unchanged (segmentation check passes).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Replace bespoke quality-gate scripts with eslint rules and trim CI redundancy
- Keywords: scaffolded-backlog, replace bespoke quality-gate scripts with eslint rules and trim ci redundancy, implementation-ready
- Use when: Implementing the scaffolded slice for Replace bespoke quality-gate scripts with eslint rules and trim CI redundancy.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
