# Changelog (`1.10.4 -> 1.11.0`)

## Major Highlights

- Added the Modeling AI Agent workspace entry point, provider settings, readiness checks, and guided proposal controls.
- Added live OpenAI/Gemini provider proposal support with hardened JSON parsing, diagnostics, and local fallback proposals.
- Introduced the AI operation contract for controlled modeling mutations across add, move, update, route, delete, catalog, connector layout, and terminal-material workflows.
- Added editable-plan diffing so provider `modifiedPlan` responses become validated operation proposals before any state mutation.
- Added proposal preview, operation details, impact summaries, explicit apply/reject controls, and last-session rollback support.
- Expanded AI scope handling across active network, current selection, selected harness, and all networks, including network-scoped validation/apply for non-active networks.
- Hardened business validations for route locks, endpoint occupancy, technical-ID conflicts, delete impact, catalog references, and wire sizing recommendations.
- Covered the AI workflow with focused unit and UI integration tests, plus a live OpenAI smoke test run locally against the configured `.env.local` key.

## Version 1.11.0 - Modeling AI Agent Workspace

### AI provider settings

- Added Settings controls for provider selection, API key, model, endpoint, timeout, strict mode, and experimental direct execution.
- Added provider readiness gating so the AI Agent entry is disabled until a valid local provider configuration exists.
- Added connection testing for OpenAI and Gemini without committing or requiring CI secrets.

### Assisted proposal workflow

- Added the Modeling AI Agent panel with scoped instruction entry, permission toggles, assisted proposal generation, raw-response inspection, accepted/rejected/unsupported operation reporting, and apply/reject controls.
- Added local fallback proposals when provider calls fail, keeping the workflow testable without network access.
- Added provider `modifiedPlan` handling and plan-diff conversion so the preferred response shape can edit a scoped JSON model while the app still applies only validated operations.

### Operation contract and application

- Added validated AI operations for adding connectors, splices, nodes, segments, and wires.
- Added movement operations for single entities, relative placement, and batch moves.
- Added safe updates for catalog items, connectors, splices, nodes, segments, and wires.
- Added route operations for regenerating routes and locking wire routes.
- Added delete operations with existing cascade-impact protections.
- Added catalog-item creation, assignment to connectors/splices/wire protection, connector-layout updates, and connector terminal-material overrides.

### Scope and safety

- Added AI contexts for active network, current selection, selected harness, and all networks.
- Updated selected-harness scope to use the displayed harness assembly instead of silently defaulting to the first assembly.
- Added explicit target-network support for multi-network AI validation and application, rejecting ambiguous all-network/selected-harness operations unless an existing entity or `networkId` resolves the target.
- Moved `lock_wire_route` behind route permission so disabling route mutations blocks both regeneration and manual route locks.

### Preview, rollback, and diagnostics

- Added operation detail formatting in the AI panel so users can inspect the proposed mutation list before applying.
- Added impact preview counts by mutation class (`add`, `update`, `move`, `route`, `delete`).
- Added explicit AI session snapshots and rollback of the last applied AI session from the panel.
- Improved OpenAI diagnostics and provider JSON parsing to surface actionable errors instead of opaque failures.

### Validation coverage

- Added focused tests for AI context building, provider client behavior, operation contract validation, plan diffing, proposal fallback, application, undo/rollback behavior, and UI provider workflows.
- Ran a local live OpenAI smoke test using `.env.local` to confirm a real provider proposal validates and applies without exposing the API key.

## Validation and Regression Evidence

- `rtk npm run -s lint`
- `rtk npm run -s typecheck`
- `rtk npm test -- --run src/tests/ai-agent-context.spec.ts src/tests/ai-agent-operation-contract.spec.ts src/tests/ai-agent-apply.spec.ts src/tests/ai-agent-plan-diff.spec.ts src/tests/ai-agent-proposal.spec.ts src/tests/ai-agent-provider-client.spec.ts src/tests/app.ui.settings.spec.tsx src/tests/store.reducer.sync-invariant.spec.ts src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `rtk npm run -s build`
- Local live provider smoke: `rtk npm test -- --run src/tests/ai-agent-live-openai.local.spec.ts` (temporary uncommitted test file removed after run)
