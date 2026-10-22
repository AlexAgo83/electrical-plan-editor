## item_697_carry_effective_local_and_opposite_endpoint_material_references_into_callout_rows - Carry effective local and opposite endpoint material references into callout rows
> From version: 1.20.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Callout endpoint semantics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-22 20:30:10

# AI Context
- Summary: Carry A/B orientation into connector and splice entries and resolve manual-over-catalog reference codes without writing derived values.
- Keywords: CalloutEntry, endpointA, endpointB, connectorCatalogMaterials, applyCatalogSeals
- Use when: Implementing the pure model prerequisite for the callout table.
- Skip when: Settings controls, export measurement or workspace actions.

# Problem
- Callout entries discard endpoint orientation and material codes, preventing reliable local/opposite display.

# Scope
- In:
  - Extend CalloutEntry and table-row models with explicit row-relative connection/seal values. Carry A/B orientation through both connector and splice grouping paths.
  - Reuse/extract pure effective-reference resolution aligned with BOM manual overrides and connector cavity/catalog materials. Preserve seal-application behavior and keep reference strings separate from entity ID formatting.
  - Add model/resolution coverage for reversed endpoints, shared cavities, self-loops, connector/splice combinations, missing references and catalog overrides.
- Out:
  - UI controls and export layout, wire-schema changes, new metadata editing and changes to BOM output.

# Acceptance criteria
- AC1: Every row resolves local/opposite from its actual endpoints and satisfies request AC3, with distinct asymmetric test values.
- AC2: Effective reference precedence, empty values and read-only behavior satisfy request AC4 with resolver/BOM parity evidence.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Every row resolves local/opposite from its actual endpoints and satisfies request AC3, with distinct asymmetric test values.
- request-AC4 -> This backlog slice. Proof: AC2: Effective reference precedence, empty values and read-only behavior satisfy request AC4 with resolver/BOM parity evidence.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_configurable_endpoint_material_references_on_plans_and_direct_workspace_folder_access`
- Architecture decision(s): (none yet)
- Request: `req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions`
- Primary task(s): `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access`

# Priority
- Priority: Medium
- Rationale: Requested additive usability improvement; no blocking defect reported. Deliver the endpoint-model prerequisite before its display consumer.

# Tasks
- `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access`

# Notes
- Task `task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access` was finished via `logics-manager flow finish task` on 2026-10-22.
