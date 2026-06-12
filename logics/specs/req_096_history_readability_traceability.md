## req_096_history_readability_traceability - Acceptance Criteria Traceability
> Request: `req_096_recent_changes_human_readable_entity_references_instead_of_system_ids`
> Last updated: 2026-03-25
> From version: 1.4.3
> Status: Done
> Understanding: 100%
> Confidence: 99%

# Traceability Matrix
- AC1: New `Recent changes` entries no longer show raw UUID-like IDs as primary target references.
  - Evidence:
    - `src/app/hooks/useStoreHistory.ts`
    - `src/tests/app.ui.undo-redo-global.spec.tsx`

- AC2: Connector/splice/wire/history labels use readable references (`technicalId`/name-style identifiers) when available.
  - Evidence:
    - `src/app/hooks/useStoreHistory.ts`
    - `src/tests/app.ui.undo-redo-global.spec.tsx`

- AC3: Delete actions keep readable target references (not internal IDs) after deletion.
  - Evidence:
    - `src/app/hooks/useStoreHistory.ts`
    - `src/tests/app.ui.undo-redo-global.spec.tsx`

- AC4: Node/segment/layout history labels are human-readable and not raw storage identifiers.
  - Evidence:
    - `src/app/hooks/useStoreHistory.ts`
    - `src/tests/app.ui.networks.spec.tsx`

- AC5: Existing recent-changes snapshots remain loadable after the change.
  - Evidence:
    - `src/adapters/persistence/recentChanges.ts`
    - `src/tests/app.ui.networks.spec.tsx`

- AC6: Undo/redo behavior and recent-changes alignment remain non-regressed.
  - Evidence:
    - `src/app/hooks/useStoreHistory.ts`
    - `src/tests/app.ui.undo-redo-global.spec.tsx`
    - `src/tests/app.ui.networks.spec.tsx`

- AC7: `logics_lint`, `lint`, `typecheck`, and relevant UI tests pass.
  - Evidence:
    - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
    - `npm run -s lint`
    - `npm run -s typecheck`
    - `npm test -- --run src/tests/app.ui.undo-redo-global.spec.tsx src/tests/app.ui.networks.spec.tsx`
