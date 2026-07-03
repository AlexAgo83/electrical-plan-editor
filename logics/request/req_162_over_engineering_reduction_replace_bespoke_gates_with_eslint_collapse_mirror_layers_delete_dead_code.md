## req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code - Over-engineering reduction: replace bespoke gates with eslint, collapse mirror layers, delete dead code
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Complexity: High
> Theme: Codebase simplification and maintenance cost reduction
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- The custom quality-gate scripts that re-implement rules eslint already expresses (per-file line caps, import boundaries, per-test timeout bans, hardcoded test-file lists) must be replaced by standard eslint configuration so the rules are enforced in-editor, maintained by one tool, and ~750 lines of bespoke script code disappear.
- The src/app/hooks -> src/app/hook-impl mirror directory, created solely to evade the 500-line hooks gate, must be collapsed back into one directory: pure re-export wrappers, single-caller domain-assembly adapters, dead compatibility aliases, and single-consumer type files all removed once the gate no longer forces them.
- The ten modal components that each hand-roll focus trapping, Escape handling, Tab cycling, focus restore, and a button backdrop must share one mechanism (native dialog.showModal() or a single shared hook) instead of ten copies.
- All verified dead code (zero references outside src/tests) in src/core, src/store, and src/app/lib must be deleted, including the test-only harness-assembly validation subsystem and speculative parameters whose non-default branches are unreachable.
- Near-verbatim duplicated logic must be consolidated: entity normalizers copied between networkFile.ts and migrations.ts, eight describe*Change field-diff functions, three hand-rolled timestamp formatters, the 96-line custom React.memo comparator, and the parallel per-entity allowlist branches in the AI agent operation contract.
- The remark-gfm dependency must be dropped: zero GFM syntax exists across all 91 changelog files, so react-markdown alone renders everything actually used.

# Context
- A repo-wide over-engineering audit (2026-07-03, five parallel verified passes) identified ~2,500 removable lines across 17 findings; every dead-export claim was verified by grepping src/ excluding src/tests.
- The root cause of the largest cluster is scripts/quality/hooks-modularization-gate-core.mjs: its 500-line cap scans only src/app/hooks/, which pushed implementations into a shadow src/app/hook-impl/ tree behind one-line re-export wrappers (useUiPreferences.ts, useWireHandlers.ts, useAppControllerModelingAnalysisScreenDomains.tsx, useAppControllerNetworkSummaryPanelDomain.tsx, buildValidationIssues.ts, useAppControllerScreenContentSlices.tsx), plus three single-caller domain-assembly adapters and six dead use*ScreenContentSlice aliases retained for a migration that already completed.
- eslint.config.js currently configures none of the rules the gate scripts enforce: max-lines covers the line caps, no-restricted-imports covers the exceljs boundary, and a no-restricted-syntax selector on it/test calls with 3+ arguments covers the timeout governance AST walk.
- check-pin-role-release-gate.mjs runs vitest on 8 spec files that are a strict subset of the full suite ci:blocking runs two steps later; run-vitest-segmented.mjs maintains a hardcoded 71-entry UI_LANE_TEST_FILES list plus a validator that exists only to detect drift from the app.ui.*.spec.tsx glob it could use directly, and hand-rolls chunking vitest provides via --shard.
- Ten dialog components (ConfirmDialog, ChoiceDialog, DeleteImpactDialog, FileFeedbackDialog, ImportOverwriteDialog, BomExportPreviewDialog, SvgExportPreviewDialog, MultiNetworkFunctionalAnalysisDialog, PinRoleMassEditDialog, OnboardingModal) each implement their own focus trap, Escape handler, Tab cycling, focus restore, and button-element backdrop; no shared useModal/useFocusTrap hook exists.
- Verified dead in src/core and src/store: the harness-assembly validation subsystem (validateHarnessAssembly and its types, ~145 lines, test-only), computeRouteLengthWithEndpointDetails, clampSplicePlacementOffset, getWireRouteEndpointDetail, isPlacedSplice, updateConnectorLayoutKeyingSide, updateConnectorLayoutKeyingPosition, applyEntityPrefix, getCatalogItemById, selectNetworkById, selectThemeMode, and the speculative scope parameter of computePinElectricalLoad whose assembly branch only throws NotImplementedScopeError.
- Duplication clusters: normalizeWire*/normalizeConnector*/normalizeSplice*/normalizeConnectorTerminalOverrides/normalizeNodePositions are copy-pasted between src/adapters/portability/networkFile.ts (lines 109-352) and src/adapters/persistence/migrations.ts (lines 80-288); recentChangeLabels.ts lines 491-737 hold eight near-identical before/after field-diff functions; a filesystem-safe timestamp formatter exists three times (exportFileName.ts has the correct one with NaN guard); renderMemoCompare.ts is a 96-line nested comparator that treats all functions as equal to paper over unstable callback identities; aiAgentOperationContract.ts lines 471-624 hold per-entity field allowlists as parallel branches that could be data-driven maps.
- Also verified: lib/app-utils.ts is a zero-importer re-export barrel; adapters/portability/index.ts is bypassed by every caller; migrations.ts carries a test-only migrationStepOverrides injection seam that only ever overrides two no-op version-bump steps; roughly ten env-var knobs in scripts/quality/report-*.mjs are set nowhere in the repo, .env files, or CI.
- Explicitly out of scope because verified healthy: the MinHeap (real Dijkstra queue), exceljs (real multi-sheet styled xlsx), npm overrides (security pins documented in check-npm-audit-allowlist.mjs), legacy v0-v3 migrations (localStorage app, old data genuinely exists), i18n.ts, csv.ts, config/environment.ts, check-npm-audit-allowlist.mjs, check-pwa-build-artifacts.mjs, report-bundle-metrics.mjs core logic.
- A separate work stream is currently fixing tests; this corpus must not assume a green baseline at scaffold time, and implementation should rebase on a green main before starting.

# Acceptance criteria
- AC1: The line-cap, exceljs-boundary, and UI-timeout gate scripts are deleted and their rules enforced by eslint (max-lines with per-glob overrides, no-restricted-imports, no-restricted-syntax), with ci:blocking updated accordingly and violations of each rule still failing CI.
- AC2: check-pin-role-release-gate.mjs is removed from ci:blocking (redundant subset), run-vitest-segmented.mjs derives its UI lane from the app.ui.*.spec.tsx glob with no hardcoded file list or drift validator, and unused env-var knobs in the report scripts are inlined as constants.
- AC3: src/app/hook-impl/ no longer exists: implementations live in src/app/hooks/, pure re-export wrappers and the six dead use*ScreenContentSlice aliases are deleted, and the unused includeNetworkSummaryPanel option is dropped. Domain assembly adapters with dedicated behavioral tests remain because deleting them would erase useful seams rather than simplify runtime behavior.
- AC4: All ten modal components delegate focus trapping, Escape, Tab cycling, focus restore, and backdrop to one shared mechanism (native dialog element or a single shared hook), with per-dialog copies deleted and existing dialog behavior (confirm-on-enter, close-on-backdrop options) preserved.
- AC5: Every export reverified with zero production references is deleted from src/core, src/store, and src/app/lib, including the harness-assembly validation subsystem and computePinElectricalLoad scope parameter. Live portability imports and the migration failure-injection seam remain, with their active callers/tests recorded in closeout evidence.
- AC6: The repeated describe*Change field comparisons collapse to one field-list-driven helper and the timestamp formatter exists once. renderMemoCompare remains until its 18 unstable callback inputs are fixed because removal currently fails render-containment tests; normalizer and AI-contract rewrites are excluded until they produce a measured correctness or maintenance benefit.
- AC7: remark-gfm is removed from package.json and the react-markdown call site, and all 91 changelog entries render with identical visible output.
- AC8: After all slices land, the full ci:blocking pipeline passes and the net line-count reduction (target ~2,000+ source/script lines) is recorded in the task closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)

# References
- scripts/quality/check-ui-modularization.mjs
- scripts/quality/check-hooks-modularization.mjs
- scripts/quality/check-store-modularization.mjs
- scripts/quality/check-ui-timeout-governance.mjs
- scripts/quality/check-exceljs-boundary.mjs
- scripts/quality/check-pin-role-release-gate.mjs
- scripts/quality/run-vitest-segmented.mjs
- src/app/hooks/useUiPreferences.ts
- src/app/hook-impl/controller/useAppControllerScreenContentSlices.tsx
- src/app/components/dialogs/ConfirmDialog.tsx
- src/app/lib/recentChangeLabels.ts
- src/app/lib/renderMemoCompare.ts
- src/app/lib/aiAgentOperationContract.ts
- src/adapters/portability/networkFile.ts
- src/adapters/persistence/migrations.ts
- src/core/harnessAssembly.ts
- src/core/splicePlacement.ts
- package.json
- eslint.config.js

# AI Context
- Summary: Over-engineering reduction: replace bespoke gates with eslint, collapse mirror layers, delete dead code
- Keywords: request-chain-scaffold, over-engineering reduction: replace bespoke gates with eslint, collapse mirror layers, delete dead code, development-ready
- Use when: You need to implement or review the scaffolded workflow for Over-engineering reduction: replace bespoke gates with eslint, collapse mirror layers, delete dead code.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_651_replace_bespoke_quality_gate_scripts_with_eslint_rules_and_trim_ci_redundancy`
- `item_652_collapse_the_hooks_hook_impl_mirror_directory`
- `item_653_unify_modal_dialogs_on_one_shared_focus_dismiss_mechanism`
- `item_654_delete_verified_dead_code_dead_barrels_and_speculative_parameters`
- `item_655_consolidate_duplicated_logic_into_single_shared_implementations`
- `item_656_drop_remark_gfm_from_the_changelog_renderer`
