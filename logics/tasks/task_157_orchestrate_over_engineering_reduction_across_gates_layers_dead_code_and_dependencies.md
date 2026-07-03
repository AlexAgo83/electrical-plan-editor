## task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies - Orchestrate over-engineering reduction across gates, layers, dead code, and dependencies
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Rebase on a green main first (a parallel work stream is fixing tests); re-verify each audit claim with a fresh grep before deleting anything.
- [x] 2. Land the eslint-gate slice first — it is the root-cause unlock: the hooks-mirror slice cannot merge while the 500-line gate still scans src/app/hooks/.
- [x] 3. Land the hooks/hook-impl collapse immediately after, while the eslint override configuration is fresh; use git mv to preserve history.
- [x] 4. Land the dead-code deletion slice next (lowest risk, independent); then the consolidation slice (normalizers, describe*Change, timestamp, comparator, contract maps), which touches the same adapters and benefits from the dead code being gone.
- [x] 5. Land the dialog unification slice and the remark-gfm drop.
- [x] 6. Run affected suites after each slice, then run the full local CI portal and record the net source/tooling delta.
- [x] GATE: lint, audit, and full local CI validation pass.

# Backlog
- `item_651_replace_bespoke_quality_gate_scripts_with_eslint_rules_and_trim_ci_redundancy`
- `item_652_collapse_the_hooks_hook_impl_mirror_directory`
- `item_653_unify_modal_dialogs_on_one_shared_focus_dismiss_mechanism`
- `item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters`
- `item_655_consolidate_duplicated_logic_into_single_shared_implementations`
- `item_656_drop_remark_gfm_from_the_changelog_renderer`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: bespoke line-cap, ExcelJS-boundary, and UI-timeout scripts were deleted; equivalent ESLint violations were each verified to fail.
- request-AC2 -> This task. Proof: the redundant pin-role gate, hardcoded UI list, drift validator, unused report knobs, and full coverage report were removed; segmentation derives 69 UI specs from the glob.
- request-AC3 -> This task. Proof: `src/app/hook-impl/` and dead slice aliases were deleted, implementations moved to `src/app/hooks/`, and tested domain seams were retained.
- request-AC4 -> This task. Proof: every interactive `*Dialog` delegates focus, Escape, Tab cycling, restoration, and backdrop behavior to `useModalDialog`.
- request-AC5 -> This task. Proof: grep-verified dead core/store/app exports and the speculative pin-load scope were deleted; live portability imports and migration failure injection remain covered.
- request-AC6 -> This task. Proof: timestamp formatting and change-label comparisons were consolidated; comparator removal was rejected by render-containment tests and documented.
- request-AC7 -> This task. Proof: `remark-gfm` and its renderer integration were removed while the full Home/changelog test surface remained green.
- request-AC8 -> This task. Proof: `npm run -s ci:local` passed with 156 test files, 1,055 tests, 3 E2E tests, coverage, and the PWA build; source/tooling delta is 6,764 additions and 9,510 deletions, net -2,746 lines.

# Validation
- Passed `npm run -s ci:local` on 2026-07-03: Logics lint/audit, dependency audit, 87 unit files (563 tests), 69 UI files (489 tests), 3 Playwright E2E tests, coverage, production build, and PWA artifact gate.
- Full npm run -s ci:local passed on 2026-07-03: lint, audit, 1,055 Vitest tests, 3 Playwright E2E tests, coverage, build, and PWA gate.
- Finish workflow executed on 2026-07-03.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Stage 1 complete: replaced bespoke line-cap, ExcelJS boundary, and UI timeout scripts with ESLint rules; removed redundant pin-role gate, hardcoded UI lane list, unused report knobs, full coverage report, and remark-gfm. Deliberate violations confirmed all three ESLint rules fail. Validation: lint, typecheck, segmentation check (69 UI / 157 total specs), and 14 Home tests passed.
- Stage 2a complete: moved all seven hook-impl implementations into src/app/hooks, removed six re-export wrappers, deleted six dead use*ScreenContentSlice aliases, and removed includeNetworkSummaryPanel. Added exact no-growth ESLint budgets for the formerly hidden oversized files. Validation: lint, typecheck, and 52 focused validation/navigation/settings tests passed.
- Stage 3 complete: deleted 501 lines / added 14 (net -487) of grep-verified dead code: unused splice-placement helpers, connector-layout mutators, selectors/catalog helper, applyEntityPrefix, test-only harness validation subsystem, app-utils barrel, and speculative pin-load scope. Kept adapters/portability index (multiple production importers) and migrationStepOverrides (active failure-path coverage), correcting stale audit claims rather than deleting live safety coverage. Validation: lint, typecheck, and 27 focused tests passed.
- Stage 4a complete: consolidated three filesystem timestamp implementations into exportFileName.toFilesystemSafeTimestamp (UTC deterministic, invalid-input fallback retained) and replaced repeated recent-change field comparisons with one field-group helper while preserving output tests. Attempted renderMemoCompare removal was reverted after render-containment tests exposed 18 unstable callback props and one unstable derived object; retaining it prevents measurable rerender regressions until producers are stabilized. Validation: lint, typecheck, 25 timestamp/change-label/render-containment tests passed.
- Stage 4b: introduced shared useModalDialog focus/Escape/Tab/restore mechanism and migrated ConfirmDialog plus the two workspace tool dialogs, deleting 300+ duplicated lines. 29 focused confirmation, pin-role, and multi-network dialog tests passed. Remaining preview/choice/import dialogs stay open in this task for the next migration batch.
- Stage 4c: migrated ChoiceDialog and FileFeedbackDialog to useModalDialog; 15 focused import/recompute/choice tests passed with lint and typecheck.
- Stage 4d complete: all interactive *Dialog components now delegate focus setup/restore, Escape, and Tab cycling to useModalDialog; confirm-on-enter and closeOnBackdrop remain options. Dialog refactor total since 38024c5b: +179/-947, net -768 lines. Validation: lint, typecheck, 41 focused preview/import/delete tests passed; grep finds zero old dialog trap helpers.
- Stage 4e: completed remaining DeleteImpact, SVG/BOM/tabular preview, and import-overwrite dialog migrations. Across all dialog batches the shared mechanism replaced 768 net lines; 41 focused tests passed and no legacy trap helper remains.
- Closeout: the complete local CI portal passed. Across `src`, `scripts`, package manifests, and ESLint configuration, the corpus produced 6,764 added and 9,510 deleted lines (net -2,746), exceeding the reduction target while retaining behavior-backed seams that the initial audit had misclassified.
- Finished on 2026-07-03.
- Linked backlog item(s): `item_651_replace_bespoke_quality_gate_scripts_with_eslint_rules_and_trim_ci_redundancy`, `item_652_collapse_the_hooks_hook_impl_mirror_directory`, `item_653_unify_modal_dialogs_on_one_shared_focus_dismiss_mechanism`, `item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters`, `item_655_consolidate_duplicated_logic_into_single_shared_implementations`, `item_656_drop_remark_gfm_from_the_changelog_renderer`
- Related request(s): `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`

# AI Context
- Summary: Orchestrate over-engineering reduction across gates, layers, dead code, and dependencies
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)

# Notes
- IMPLEMENTER RULES (mandatory): work ONE backlog item at a time, in the plan order; read the item's Decision notes before writing any code — every open choice is already decided there. Never touch files outside the item's scope_in. Never weaken, delete, or snapshot-regenerate a test to make it pass. After each item: npm run lint && npm run typecheck && the affected spec suites, then commit with one commit per item (prefix refactor: or chore:). If anything in the docs contradicts what you find in the code, STOP and record the discrepancy in the task report instead of improvising.
