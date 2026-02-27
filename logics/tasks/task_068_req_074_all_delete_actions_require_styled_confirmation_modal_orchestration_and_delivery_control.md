## task_068_req_074_all_delete_actions_require_styled_confirmation_modal_orchestration_and_delivery_control - req_074 all delete actions require styled confirmation modal orchestration and delivery control
> From version: 0.9.14
> Understanding: 98% (scope is to enforce styled confirmation modal before every delete mutation in UI flows)
> Confidence: 95% (existing confirmation infrastructure can be reused with handler-level integration and targeted regression coverage)
> Progress: 0%
> Complexity: Medium-High
> Theme: Destructive-action safety rollout across catalog/modeling/network delete paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
`req_074` enforces a strict product rule: all delete actions must require explicit user confirmation via the styled in-app modal system.

Current state is mixed:
- Some destructive flows already use `confirmAction` (notably network delete).
- Several entity delete handlers still dispatch directly.

The orchestration must keep behavior stable:
- cancel = no mutation,
- confirm = existing delete semantics,
- reducer constraints and errors unchanged.

# Objective
- Deliver req_074 with full delete-flow coverage and consistent modal semantics.
- Keep delete UX explicit (`danger`, entity identity in copy, `Delete` / `Cancel`).
- Add regression coverage so future refactors cannot bypass confirmation.

# Scope
- In:
  - Orchestrate `item_383`..`item_386`
  - Cover delete entrypoints for network, catalog item, connector, splice, node, segment, wire
  - Maintain modal accessibility behavior and existing reducer guardrails
  - Validate and close request/backlog/task docs
- Out:
  - Redesign of modal system beyond req_074 needs
  - Non-delete destructive flows covered by other requests

# Backlog scope covered
- `logics/backlog/item_383_delete_confirmation_orchestration_across_catalog_and_modeling_handlers.md`
- `logics/backlog/item_384_delete_confirmation_modal_copy_intent_and_identity_consistency.md`
- `logics/backlog/item_385_regression_coverage_for_delete_confirmation_across_entities.md`
- `logics/backlog/item_386_req_074_delete_confirmation_policy_closure_validation_and_traceability.md`

# Plan
- [ ] 1. Deliver Wave 0 handler orchestration so all delete-capable handlers require `confirmAction` (`item_383`)
- [ ] 2. Deliver Wave 1 standardized delete modal copy/intent/labels with explicit entity identity (`item_384`)
- [ ] 3. Deliver Wave 2 regression coverage for confirm/cancel/guarded-delete behavior across entities (`item_385`)
- [ ] 4. Run targeted validation suites and fix regressions
- [ ] 5. Run full validation matrix and close req_074 traceability (`item_386`)
- [ ] FINAL: Update related `logics` docs (request/backlog/task progress + delivery summary)

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s quality:ui-modularization`
- `npm run -s quality:store-modularization`
- `npm run -s quality:pwa`
- `npm run -s build`
- `npm run -s test:ci`
- `npm run -s test:e2e`

# Targeted validation guidance (recommended during implementation)
- `npm run -s test -- src/tests/app.ui.catalog.spec.tsx`
- `npm run -s test -- src/tests/app.ui.modeling-actions.spec.tsx`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx`

# Report
- Current blockers: none.
- Current status: pending implementation start.
- Risks to track:
  - Missing a delete entrypoint in less-used panel flows.
  - Copy drift if entity-specific messages are duplicated instead of centralized.
  - Test gaps if only reducer-level behavior is covered without UI-confirm path assertions.

# References
- `logics/request/req_074_all_delete_actions_require_styled_confirmation_modal.md`
- `src/app/AppController.tsx`
- `src/app/components/dialogs/ConfirmDialog.tsx`
- `src/app/types/confirm-dialog.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/hooks/useCatalogHandlers.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/hooks/useSegmentHandlers.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/tests/app.ui.catalog.spec.tsx`
- `src/tests/app.ui.modeling-actions.spec.tsx`
- `src/tests/app.ui.networks.spec.tsx`
