## req_128_ai_agent_modeling_workspace - AI Agent Modeling Workspace
> From version: 1.10.3
> Schema version: 1.0
> Status: In progress
> Understanding: 99%
> Confidence: 97%
> Complexity: High
> Theme: AI
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a new `AI Agent` section inside Modeling that can assist with harness and network modifications.
- Add an AI settings area where users can configure OpenAI or Gemini, editable model name, local-storage API key, endpoint, and safety options.
- Support a default assisted mode where the agent proposes structured plan operations for user review before application.
- Support a clearly gated experimental mode affordance and a shared validated apply/rollback path; true no-confirmation direct execution remains a follow-up after 1.11.0.
- Make every AI session reversible through a single grouped undo or rollback action.
- Keep the agent bounded by the same domain rules as the editor: connectors, splices, wires, routes, catalogs, harness assemblies, validation, and history.

# Context
The application already contains machine-oriented harness context through the selected-harness agent JSON export (`req_127`). That export is useful for external agents, but it is read-only. The next product step is an in-app AI agent workspace that can use similar structured context to help users modify the active modeling state.

The feature should not be a generic chatbot. It should be an operational Modeling surface where the user selects a target scope, describes the intended change, chooses the execution mode, grants explicit permissions, and reviews or rolls back the resulting modifications.

The agent must not write arbitrary raw application state. It should produce or call a bounded set of plan operations that are validated locally before they mutate the store.

```mermaid
%% logics-kind: request
%% logics-signature: request|ai-agent-modeling-workspace|add-a-new-ai-agent-section|ac1-settings-includes-an-ai-configuratio
flowchart TD
    User[User instruction] --> Workspace[Modeling AI Agent section]
    Workspace --> Context[Scoped harness and network context]
    Context --> Provider[Configured AI provider]
    Provider --> Ops[Structured plan operations]
    Ops --> Validate[Local validation and permissions]
    Validate --> Assisted[Assisted proposal review]
    Validate --> Experimental[Experimental mode]
    Assisted --> Apply[Apply as one history transaction]
    Experimental --> Apply
    Apply --> Undo[Single undo or rollback]
```

# Functional Scope
## A. AI settings
- Add a dedicated AI settings area.
- Let users select a provider such as OpenAI, Anthropic, local, or custom endpoint.
- Store provider configuration consistently with the app's existing preference and settings patterns.
- Include model, API key or credential reference, endpoint, timeout, and strict mode controls where applicable.
- Include a connection test action.
- Include an explicit setting that enables or disables experimental direct execution.

## B. Modeling AI Agent section
- Add a new Modeling section named `AI Agent`.
- Add the `AI Agent` entry as a peer action next to the existing `Wires` Modeling entry.
- Keep the `AI Agent` entry visible but disabled when no valid provider is configured.
- The section should act as the control surface for AI-assisted modeling, not as a generic chat page.
- Let the user choose an action type, target scope, execution mode, and free-form instruction.
- Target scope candidates include current selection, active network, selected harness assembly, and all networks.
- Display permissions before execution, including at least add, move, update, route, circuit/domain-like assignment where applicable, and delete.
- Keep delete disabled by default unless explicitly enabled by the user.

## C. Assisted mode
- Assisted mode is the default.
- The agent returns a structured operation list.
- The app validates the operation list before presenting it.
- The user can review a summary and details before applying or rejecting.
- Applying the proposal records one grouped history transaction.

## D. Experimental direct mode
- Experimental mode is opt-in and visibly marked as higher risk.
- In 1.11.0, the experimental mode affordance is gated in Settings while execution still flows through the same locally validated proposal/apply controls.
- The agent still operates only through local, bounded operation handlers.
- A snapshot is created before application.
- The completed session shows a summary and offers one-click rollback.

## E. Operation contract
- Define a first operation vocabulary for AI-driven changes.
- Candidate operations include:
  - add connector, splice, node, segment, or wire;
  - move connector, splice, node, or selected canvas entities;
  - update labels, technical IDs, sections, materials, colors, references, or route locks;
  - assign or change catalog-backed parts where supported;
  - assign wire endpoint references;
  - trigger route regeneration or preserve forced routes;
  - delete only when explicitly permitted.
- Every operation must be validated against current domain rules before mutation.

## F. Undo, rollback, and auditability
- Every AI run must be grouped into a single AI session.
- The app must create a snapshot before execution.
- The user must be able to undo the full AI session with one action.
- The result view must show what was added, moved, updated, deleted, routed, or rejected.
- Validation failures must be visible instead of silently ignored.

# Clarified Behavior
- The AI Agent section belongs in Modeling.
- AI provider configuration belongs in Settings, not inside the Modeling panel.
- V1 supports OpenAI and Gemini provider configuration.
- End users enter API keys locally in app settings; keys are persisted in local storage and `.env` keys are only a local development convenience.
- V1 model selection uses editable model-name fields rather than a rigid provider model list.
- Assisted mode is the safe default.
- Experimental direct execution is allowed only when explicitly enabled.
- V1.11.0 target scopes are current selection, active network, selected harness, and all networks.
- Multi-network operations require explicit or locally inferable `networkId` targeting; ambiguous cross-network operations are rejected.
- AI-generated changes are not trusted until local validation accepts them.
- The agent should receive structured, scoped context instead of a full raw application dump.
- The first implementation ships a bounded operation vocabulary for add, move, update, route, delete, catalog assignment, connector layout, terminal-material, batch move, and route-lock workflows.

# Acceptance Criteria
- AC1: Settings includes an AI configuration area with OpenAI and Gemini provider choices, editable model name, local-storage API key or endpoint configuration, timeout or strictness options, and a connection test.
- AC2: Modeling includes a visible `AI Agent` section.
- AC3: The `AI Agent` entry is placed beside the existing `Wires` Modeling entry and is disabled when provider readiness is invalid.
- AC4: The AI Agent section lets the user provide an instruction, choose a target scope, choose assisted or experimental mode, and review permissions.
- AC5: Assisted mode is the default mode.
- AC6: Assisted mode receives AI output as structured operations and validates those operations before user review.
- AC7: The user can apply or reject an assisted proposal.
- AC8: Applied assisted proposals are committed as one grouped history transaction.
- AC9: Experimental mode is disabled unless explicitly enabled in AI settings.
- AC10: Experimental-mode application creates a pre-run snapshot and applies only locally validated operations.
- AC11: A completed AI session can be rolled back in one user action.
- AC12: AI operations cannot bypass existing domain validation, dependency guards, or destructive-action permissions.
- AC13: Delete operations are blocked by default and require explicit permission.
- AC14: The result view summarizes added, moved, updated, deleted, routed, accepted, and rejected operations.
- AC15: Validation errors and rejected operations are exposed to the user with actionable context.
- AC16: Tests cover operation validation, assisted apply/reject, experimental rollback, delete permission gating, provider-readiness disabled entry behavior, and grouped undo behavior.

# Out of Scope
- Fully autonomous background optimization without user-triggered execution.
- Unbounded raw store mutation by an AI provider.
- Multi-agent collaboration or persistent agent memory.
- Provider-specific UI branching beyond configuration and capability reporting.
- Replacing existing manual Modeling tools.
- Building a human-readable AI report export.
- Implementing every possible modeling operation in the first version.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries are explicit.
- [x] Assisted and experimental modes are separated.
- [x] Undo and rollback behavior is mandatory.
- [x] Acceptance criteria are testable.
- [x] Known architectural dependencies are listed.

# Companion docs
- Product brief(s): `logics/product/prod_004_ai_agent_modeling_workspace.md`
- Architecture decision(s): `logics/architecture/adr_009_ai_agent_operation_contract_and_reversible_execution.md`
- Closure task: `logics/tasks/task_112_ai_agent_modeling_workspace_release_validation.md`

# Delivery Status
- Delivered in release `1.11.0`.
- Provider settings, Modeling entry, assisted proposal review, local validation, grouped apply, impact preview, and latest-session rollback are implemented.
- Selected-harness and all-networks context scopes are implemented with network-scoped validation/apply.
- Experimental direct execution is gated in Settings, but 1.11.0 intentionally keeps mutation behind the same validated proposal/apply path; true no-confirmation direct execution remains future work.
- Validation evidence is recorded in `logics/tasks/task_112_ai_agent_modeling_workspace_release_validation.md`.

# References
- `logics/request/req_127_selected_harness_agent_json_export.md`
- `logics/product/prod_000_modeling_productivity_and_repeated_action_ergonomics.md`
- `logics/architecture/adr_003_modeling_create_flow_reset_and_canvas_group_movement_interaction_contracts.md`
- `logics/architecture/adr_008_audit_hardening_delivery_strategy_for_security_ci_bundle_and_maintainability.md`

# AI Context
- Summary: Add a Modeling AI Agent workspace with provider settings, assisted proposals, experimental mode gating, bounded operation validation, and single-action rollback for AI-made changes.
- Keywords: AI Agent, Modeling, provider settings, structured operations, assisted mode, experimental mode, direct execution follow-up, snapshot, rollback, undo, harness, network, connectors, splices, wires, routing
- Use when: Designing or implementing AI-assisted in-app modeling changes.
- Skip when: The work only exports read-only agent context, targets human reports, or modifies providers without an in-app Modeling agent.

# Backlog
- `logics/backlog/item_600_ai_provider_settings_and_capability_contract.md`
- `logics/backlog/item_601_ai_agent_context_builder_and_operation_contract.md`
- `logics/backlog/item_602_modeling_ai_agent_assisted_proposal_workflow.md`
- `logics/backlog/item_603_ai_agent_experimental_direct_execution_and_rollback.md`
- `logics/backlog/item_604_ai_agent_validation_regression_and_release_gate.md`
