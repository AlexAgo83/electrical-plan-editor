## req_074_all_delete_actions_require_styled_confirmation_modal - Require confirmation modal for every delete action
> From version: 0.9.14
> Understanding: 99% (the ask is to enforce a confirmation modal before every delete mutation)
> Confidence: 97% (confirm infrastructure already exists and can be reused across delete handlers)
> Complexity: Medium
> Theme: Destructive-action safety and UX consistency
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- Accidental deletions remain possible on several modeling/catalog actions.
- The product should enforce explicit user confirmation before any delete action is executed.
- Confirmation UX must stay consistent with the styled modal system introduced in app flows.

# Context
Styled confirm modal infrastructure already exists:
- `src/app/components/dialogs/ConfirmDialog.tsx`
- `src/app/types/confirm-dialog.ts`
- `src/app/AppController.tsx` (confirmation request orchestration)

Some delete flows are already protected (example: network delete in workspace handlers), while many entity delete handlers still dispatch directly:
- `src/app/hooks/useCatalogHandlers.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useNodeHandlers.ts`
- `src/app/hooks/useSegmentHandlers.ts`
- `src/app/hooks/useWireHandlers.ts`

Delete action entry points are surfaced in modeling/catalog panels:
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`

# Objective
- Guarantee that all user-triggered delete actions open a styled confirmation modal before mutation.
- Keep current delete business rules unchanged (same reducers, same guard errors, same selection behavior).
- Standardize delete confirmation copy and intent.

# Default decisions (V1)
- Coverage policy:
  - Every UI delete action in catalog/modeling/network scope requires confirmation.
  - Minimum covered entities: network, catalog item, connector, splice, node, segment, wire.
- Modal semantics:
  - Intent defaults to `danger` for delete actions.
  - Primary action = `Delete`; secondary action = `Cancel`.
  - Close on Escape allowed; backdrop close allowed (treated as cancel).
- Copy strategy:
  - Title format: `Delete <entity>`.
  - Message includes enough identity to avoid ambiguity (label and/or technical id).
- Behavior:
  - `Cancel` must produce zero mutation.
  - `Delete` runs existing mutation path only after confirmation.
  - Existing reducer validation errors remain unchanged when deletion is blocked by references/constraints.

# Functional scope
## A. Confirm enforcement for all delete handlers (high priority)
- Route all delete handlers through the shared confirmation requester instead of direct dispatch.
- Ensure consistent invocation from all panels/buttons that expose delete.

## B. Confirmation content standardization (high priority)
- Harmonize titles/messages/labels across entity types.
- Ensure messages remain deterministic and specific to the selected target.

## C. UX and accessibility consistency (medium-high priority)
- Reuse existing styled confirm modal behavior (focus, keyboard, aria, theme).
- No visual or interaction regression in current delete UI actions.

## D. Regression safety (medium priority)
- Preserve current post-delete selection/refresh behavior.
- Preserve existing reducer safeguards and error surfacing.

# Non-functional requirements
- No new browser-native confirm dialogs for delete flows.
- No additional modal orchestration deadlocks; one active confirmation at a time.
- Minimal complexity overhead in handlers.

# Validation and regression safety
- Add/extend tests for each delete-capable entity to verify:
  - modal appears before mutation,
  - cancel path does not delete,
  - confirm path deletes when valid.
- Keep or extend regression tests where delete is blocked by constraints (references/occupancy/dependencies).
- Run quality/test matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test -- src/tests/app.ui.modeling-actions.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.catalog.spec.tsx`
  - `npm run -s test:ci`

# Acceptance criteria
- AC1: Each delete action in UI opens a styled confirmation modal before dispatching delete mutation.
- AC2: Cancel always leaves state unchanged for delete operations.
- AC3: Confirm executes existing delete mutation flow and preserves current guard/error semantics.
- AC4: Delete confirmation modal content is explicit and entity-specific.
- AC5: No `window.confirm` remains in delete-action paths.

# Out of scope
- Non-delete destructive actions already tracked in other requests (e.g. reset/replace flows).
- Backend/API permission model changes.
- Major redesign of list/table layouts.

# References
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
- `src/app/components/workspace/ModelingCatalogListPanel.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
