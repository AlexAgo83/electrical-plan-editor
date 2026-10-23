## item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata - Persist per-network manufacturer and supplier plan reference metadata
> From version: 1.21.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Network metadata contract
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:32:33

# AI Context
- Summary: Audit explicit Network metadata allowlists so all four strings survive clone, imports, workspace snapshots and frozen history.
- Keywords: persist, per, network, manufacturer, supplier, plan, reference, metadata
- Use when: Implementing shared normalization, reducers, migration or portability coverage for these fields.
- Skip when: Building form controls or cartouche layout.

# Problem
- The Network model has no fields for role-specific plan references or editable company names; explicit normalization allowlists can lose newly added fields.

# Scope
- In:
  - Add the four optional Network fields with shared trim/length/single-line normalization and form-compatible validation. Preserve reference codes as strings.
  - Extend actions, reducers, metadata updates, clone/import helpers, migrations and network/workspace portability paths. Preserve ordinary metadata history/dirty behavior and legacy compatibility.
  - Verify two-network isolation, partial clears, omitted-versus-explicit-clear update behavior, clone, undo/redo, malformed imports, network/workspace roundtrips and frozen version isolation. Record mapped AC evidence.
- Out:
  - UI layout, rendering cartouches and component/material reference changes.

# Acceptance criteria
- AC1: Request AC1 and AC3 pass through canonical metadata and portability paths without cross-network contamination.
- AC2: Targeted data/history/compatibility evidence covers the corresponding AC6 cases and contributes to AC7.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned implementation evidence: Shared four-field normalization, Unicode/length/empty-value fixtures and string-preservation evidence.
- request-AC3 -> This backlog slice. Proof: Planned implementation evidence: Clone, network/workspace portability, migrations and frozen-version roundtrip evidence.
- request-AC6 -> This backlog slice. Proof: Planned implementation evidence: Metadata-specific reducer/history and malformed/legacy import regression evidence.
- request-AC7 -> This backlog slice. Proof: Planned implementation evidence: Metadata contract documentation and delivery-check evidence contributed to the orchestration task.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_024_editable_manufacturer_and_supplier_identification_on_network_plans`
- Architecture decision(s): (none yet)
- Request: `req_173_add_editable_manufacturer_and_supplier_references_to_network_settings_and_plan_cartouches`
- Primary task(s): `task_170_deliver_editable_network_manufacturer_and_supplier_references_in_plan_cartouches`

# Priority
- Priority: Medium
- Rationale: Additive plan-identification capability with no reported blocking defect; deliver the metadata contract before its form and export consumers.
