## item_655_consolidate_duplicated_logic_into_single_shared_implementations - Consolidate duplicated logic into single shared implementations
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
- Entity normalizers (normalizeWire*, normalizeConnector*, normalizeSplice*, normalizeConnectorTerminalOverrides, normalizeNodePositions) are copy-pasted between src/adapters/portability/networkFile.ts:109-352 and src/adapters/persistence/migrations.ts:80-288 (~130 duplicated lines that can drift independently).
- src/app/lib/recentChangeLabels.ts:491-737 holds eight near-identical describe*Change functions, each re-implementing the compare-old-vs-new-field-push-detail loop (~120 collapsible lines).
- A filesystem-safe timestamp formatter exists three times; only exportFileName.toFilesystemSafeTimestamp has the NaN guard.
- renderMemoCompare.ts is a 96-line hand-rolled nested comparator used as a React.memo equality function that treats all functions as equal to compensate for unstable callback identities.
- aiAgentOperationContract.ts:471-624 encodes per-entity safe-update field allowlists as parallel code branches instead of data-driven maps (~80 collapsible lines).

# Scope
- In:
  - Extract one shared entity-normalization module under src/adapters/ imported by both networkFile.ts and migrations.ts, byte-identical output on both paths verified by existing import/migration fixtures.
  - Collapse the eight describe*Change functions into one field-diff helper driven by a per-entity field descriptor list, preserving every existing label string exactly (snapshot-covered).
  - Replace the two duplicate timestamp formatters with calls to exportFileName.toFilesystemSafeTimestamp.
  - Stabilize the callback props feeding the memoized panels with useCallback at the AppController seam, switch the panels to React.memo default shallow comparison, and delete renderMemoCompare.ts; prove no render-containment regression with the existing render-count tests.
  - Convert the per-entity allowlist branches in aiAgentOperationContract.ts to a data-driven map keyed by entity kind, preserving the exact accepted/rejected field sets (contract spec-covered).
- Out:
  - Any change to normalization semantics, change-label wording, timestamp format, or contract field sets — pure consolidation.
  - The broader render-containment work tracked by the runtime-performance corpus; only the comparator replacement is in scope here.
  - csv.ts, networkSummaryBomCsv.ts domain logic, i18n.ts (audited healthy).

# Acceptance criteria
- AC1: One normalization module serves both import and migration paths; existing round-trip and migration fixtures produce byte-identical results.
- AC2: recentChangeLabels output strings are unchanged for all entity kinds (existing specs and snapshots pass) with the eight functions replaced by one helper.
- AC3: renderMemoCompare.ts is deleted; render-containment regression tests still pass with default shallow memo comparison.
- AC4: The AI agent contract accepts and rejects exactly the same operations as before (contract spec suite passes unchanged).
- AC5: Net deletion of at least 300 lines across the five clusters; full ci:blocking passes.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: One normalization module serves both import and migration paths; existing round-trip and migration fixtures produce byte-identical results.
- request-AC8 -> This backlog slice. Proof: AC2: recentChangeLabels output strings are unchanged for all entity kinds (existing specs and snapshots pass) with the eight functions replaced by one helper.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Consolidate duplicated logic into single shared implementations
- Keywords: scaffolded-backlog, consolidate duplicated logic into single shared implementations, implementation-ready
- Use when: Implementing the scaffolded slice for Consolidate duplicated logic into single shared implementations.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
