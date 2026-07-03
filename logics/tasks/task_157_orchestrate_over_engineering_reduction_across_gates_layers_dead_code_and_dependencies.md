## task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies - Orchestrate over-engineering reduction across gates, layers, dead code, and dependencies
> From version: 1.18.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 60
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Rebase on a green main first (a parallel work stream is fixing tests); re-verify each audit claim with a fresh grep before deleting anything.
- [ ] 2. Land the eslint-gate slice first — it is the root-cause unlock: the hooks-mirror slice cannot merge while the 500-line gate still scans src/app/hooks/.
- [ ] 3. Land the hooks/hook-impl collapse immediately after, while the eslint override configuration is fresh; use git mv to preserve history.
- [ ] 4. Land the dead-code deletion slice next (lowest risk, independent); then the consolidation slice (normalizers, describe*Change, timestamp, comparator, contract maps), which touches the same adapters and benefits from the dead code being gone.
- [ ] 5. Land the dialog unification slice (spike native dialog on ConfirmDialog, then roll the chosen mechanism across all ten) and the remark-gfm drop in either order — both independent.
- [ ] 6. After each slice: run the affected suites plus lint and typecheck; after the final slice run full ci:blocking, record the net line-count delta (target ~2,000+) and before/after scripts/quality inventory in the task closeout; validate and close the request chain.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_651_replace_bespoke_quality_gate_scripts_with_eslint_rules_and_trim_ci_redundancy`
- `item_652_collapse_the_hooks_hook_impl_mirror_directory`
- `item_653_unify_modal_dialogs_on_one_shared_focus_dismiss_mechanism`
- `item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters`
- `item_655_consolidate_duplicated_logic_into_single_shared_implementations`
- `item_656_drop_remark_gfm_from_the_changelog_renderer`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.
- Stage 1 complete: replaced bespoke line-cap, ExcelJS boundary, and UI timeout scripts with ESLint rules; removed redundant pin-role gate, hardcoded UI lane list, unused report knobs, full coverage report, and remark-gfm. Deliberate violations confirmed all three ESLint rules fail. Validation: lint, typecheck, segmentation check (69 UI / 157 total specs), and 14 Home tests passed.
- Stage 2a complete: moved all seven hook-impl implementations into src/app/hooks, removed six re-export wrappers, deleted six dead use*ScreenContentSlice aliases, and removed includeNetworkSummaryPanel. Added exact no-growth ESLint budgets for the formerly hidden oversized files. Validation: lint, typecheck, and 52 focused validation/navigation/settings tests passed.
- Stage 3 complete: deleted 501 lines / added 14 (net -487) of grep-verified dead code: unused splice-placement helpers, connector-layout mutators, selectors/catalog helper, applyEntityPrefix, test-only harness validation subsystem, app-utils barrel, and speculative pin-load scope. Kept adapters/portability index (multiple production importers) and migrationStepOverrides (active failure-path coverage), correcting stale audit claims rather than deleting live safety coverage. Validation: lint, typecheck, and 27 focused tests passed.
- Stage 4a complete: consolidated three filesystem timestamp implementations into exportFileName.toFilesystemSafeTimestamp (UTC deterministic, invalid-input fallback retained) and replaced repeated recent-change field comparisons with one field-group helper while preserving output tests. Attempted renderMemoCompare removal was reverted after render-containment tests exposed 18 unstable callback props and one unstable derived object; retaining it prevents measurable rerender regressions until producers are stabilized. Validation: lint, typecheck, 25 timestamp/change-label/render-containment tests passed.

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
