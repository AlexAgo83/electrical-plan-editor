## item_601_ai_agent_context_builder_and_operation_contract - AI Agent Context Builder and Operation Contract
> From version: 1.10.3
> Schema version: 1.0
> Status: Done
> Understanding: 97%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: AI
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The AI Agent needs enough Modeling context to propose useful changes, but the app must not send or accept unbounded raw state.
A stable scoped context format and a validated operation vocabulary are required before assisted or direct execution can be safe.

# Scope
- In:
  - Build scoped AI context for current selection, active network, selected harness, and all networks.
  - Require explicit or locally inferable `networkId` targeting for multi-network operations.
  - Define a V1.11.0 operation schema for safe add, move, update, route regeneration, delete, catalog, connector layout, terminal-material, batch move, and route-lock operations.
  - Implement local operation parsing and validation boundaries.
  - Return structured validation results with accepted, rejected, and unsupported operations.
- Out:
  - Direct provider execution.
  - Full visual diff rendering.
  - Endpoint assignment in the first operation vocabulary.
  - Autonomous provider tool execution that bypasses local validation.
  - Raw store patching.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|ai-agent-context-builder-and-operation-c|req-128-ai-agent-modeling-workspace|the-ai-agent-needs-enough-modeling|ac1-the-app-can-build-structured
flowchart TD
    Scope[Selected scope] --> ContextBuilder[AI context builder]
    ContextBuilder --> Context[Structured context]
    Context --> Provider[AI provider]
    Provider --> Operations[Operation list]
    Operations --> Parser[Parser and schema guard]
    Parser --> Validator[Domain validator]
    Validator --> Accepted[Accepted operations]
    Validator --> Rejected[Rejected operations]
```

# Acceptance criteria
- AC1: The app can build structured AI context for current selection.
- AC2: The app can build structured AI context for active network.
- AC3: Selected-harness and all-networks scopes are supported with network-scoped validation/apply.
- AC4: The V1 operation schema is versioned and documented.
- AC5: Operation parsing rejects malformed, unknown, or unsupported operation types.
- AC6: Validation rejects operations outside the selected scope.
- AC7: Validation rejects invalid entity IDs, route segments, coordinates, and unsupported V1 fields.
- AC8: Validation enforces permission gates for add, move, update, and route regeneration.
- AC9: Validation output separates accepted, rejected, unsupported, and warning states.
- AC10: Unit tests cover context scoping and operation validation without requiring a live AI provider.

# V1 operation vocabulary
Providers should receive a scoped editable plan JSON and return a full `modifiedPlan`.
The application derives the following operation vocabulary from the before/after diff, then validates permissions, scope, identity, and positions locally.

- `add_connector`: Create one connector in the active network with name, technical ID, cavity count, optional catalog item ID, and canvas position.
- `add_splice`: Create one splice in the active network with name, technical ID, port count or directional mode defaults, and canvas position.
- `add_node`: Create one routing node in the active network with name and canvas position.
- `add_segment`: Create one segment between existing nodes in the active network.
- `add_wire`: Create one wire with supported endpoint references only when both endpoints are already valid and unambiguous; otherwise reject with a validation message.
- `move_entity`: Move a connector, splice, node, or selected supported canvas entity to a validated coordinate.
- `batch_move_entities`: Move multiple supported canvas entities as one validated operation family.
- `place_entity_relative_to_entity`: Place a connector, splice, or node relative to another validated connector, splice, or node (`leftOf`, `rightOf`, `above`, `below`) for instructions that name both a target and an anchor.
- `update_entity`: Update safe scalar fields only: name, technical ID, wire section, material, color, protection, route lock, and display metadata.
- `regenerate_route`: Regenerate routes for selected or scoped wires when route permission is enabled.
- `delete_entity`: Delete connectors, splices, nodes, segments, or wires only when delete permission is explicitly enabled.
- `create_catalog_item`, `assign_catalog_item`, and `update_catalog_connector_layout`: Apply catalog-backed changes through local validation.
- `set_connector_terminal_material`: Apply terminal material changes to validated connector ways.
- `lock_wire_route`: Preserve forced routes for validated wire/segment references.
- `clarification_required`: Return a non-mutating request for more user intent.

# Identity and Position Resolution
- The editable plan includes generated canvas positions when no persisted manual node position exists, so providers can reason over visible layout.
- Provider output should use exact internal IDs from the context when possible.
- Technical IDs are accepted as aliases for connectors, splices, and wires.
- Unique partial aliases may be resolved after removing generic words like `connector`; ambiguous aliases must be rejected.
- Relative placement and relative movement may use generated canvas layout positions when no persisted manual node position exists.

# Deferred operation vocabulary
- `assign_endpoint`: Deferred to V2 because connector cavity and splice port assignment can invalidate occupancy rules.
- autonomous provider tool streaming and background execution;
- persistent AI session history beyond the latest rollbackable session.

# AC Traceability
- request-AC5 -> backlog AC4, AC5, AC6, AC7, AC8, AC9.
- request-AC11 -> backlog AC5, AC6, AC7, AC8.
- request-AC12 -> backlog AC8.
- request-AC14 -> backlog AC9.
- request-AC15 -> backlog AC10.

# Decision framing
- Product framing: Covered by `prod_004_ai_agent_modeling_workspace`.
- Architecture framing: Covered by `adr_009_ai_agent_operation_contract_and_reversible_execution`.

# Links
- Product brief(s): `logics/product/prod_004_ai_agent_modeling_workspace.md`
- Architecture decision(s): `logics/architecture/adr_009_ai_agent_operation_contract_and_reversible_execution.md`
- Request: `logics/request/req_128_ai_agent_modeling_workspace.md`
<!-- When creating a task from this item, add: Derived from `logics/backlog/item_601_ai_agent_context_builder_and_operation_contract.md` in the task # Links section -->

# Priority
- Impact: High
- Urgency: High

# Dependencies
- Existing entity and graph domain model.
- Existing selected-harness agent JSON export for harness-scoped context.
- Existing dependency guards and validation rules.
- Existing routing and catalog resolution helpers.

# Risks
- Sending too much context can be expensive, slow, or expose unnecessary data.
- Sending too little context can cause low-quality operations.
- Operation schema churn can break provider prompts and tests if not versioned.
- Validation must stay aligned with manual Modeling behavior.
- Allowing wire creation in V1 may still be too broad if endpoint ambiguity is common; implementation can narrow `add_wire` to explicitly valid endpoints only.

# Validation plan
- Add pure unit tests for context builders.
- Add pure unit tests for operation schema parsing.
- Add validator tests for permission gates, invalid IDs, invalid coordinates, and out-of-scope operations.
- Run `npm run -s typecheck` and targeted test suites.

# Delivery Status
- Delivered in release `1.11.0`.
- Context scopes cover active network, current selection, selected harness, and all networks.
- Multi-network validation/apply uses `networkId` and rejects ambiguous operations.
- Covered by `logics/tasks/task_112_ai_agent_modeling_workspace_release_validation.md`.
- Validation evidence: AI context, operation contract, apply, plan diff, and proposal targeted tests plus lint/typecheck/build.

# AI Context
- Summary: Define scoped AI context and validated operation schema for AI-assisted Modeling changes.
- Keywords: AI context, operation schema, validation, scope, current selection, active network, selected harness, all networks, provider output
- Use when: Implementing the shared foundation for assisted and experimental AI execution.
- Skip when: Work only targets provider settings UI.

# Tasks
- `logics/tasks/task_112_ai_agent_modeling_workspace_release_validation.md`
