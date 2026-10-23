## item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches - Render manufacturer and supplier plan references in export cartouches
> From version: 1.21.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Plan cartouche export
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:59:26

# AI Context
- Summary: Render literal company names and codes in role-labeled rows, with partial-value formatting and measured wrapping.
- Keywords: render, manufacturer, supplier, plan, references, export, cartouches
- Use when: Implementing cartouche parameter propagation, text layout and shared export regressions.
- Skip when: Changing BOM references or adding a new PDF pipeline.

# Problem
- Current cartouches cannot identify either business reference or its editable associated company, and capped metadata rows need wrapping for long values.

# Scope
- In:
  - Thread all four values from the exported network through controller slices, panel props, preview and export actions to the shared cartouche renderer. Follow any existing PNG/PDF consumer.
  - Render localized fixed roles with literal editable names/references, deterministic partial/empty behavior and safe text nodes. Wrap/measure long values and adjust row heights/cartouche bounds while preserving logo, notes and toggle behavior.
  - Verify two-network/export freshness, EN/FR, name edits, all empty/partial combinations, long Unicode/XML-sensitive text, logo/notes and SVG/PNG parity. Finish export help and complete per-request AC evidence and applicable delivery checks.
- Out:
  - A new PDF workflow, BOM columns and unrelated export redesign.

# Acceptance criteria
- AC1: Request AC4-AC5 pass for all existing consumers of the shared cartouche renderer.
- AC2: Applicable AC6 export tests and AC7 documentation/quality evidence are recorded before implementation closeout.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: Delivered in 08eb627b (see task_170 AC Traceability for test files): Localized role ordering and all name/reference partial/empty combinations in cartouche assertions.
- request-AC5 -> This backlog slice. Proof: Delivered in 08eb627b (see task_170 AC Traceability for test files): Preview/shared-export propagation, wrapping/bounds, disabled-cartouche and export-purity evidence.
- request-AC6 -> This backlog slice. Proof: Delivered in 08eb627b (see task_170 AC Traceability for test files): SVG/PNG, Unicode/XML-sensitive content, long-code and logo/notes regression evidence.
- request-AC7 -> This backlog slice. Proof: Delivered in 08eb627b (see task_170 AC Traceability for test files): Export help, complete per-request evidence mapping and applicable delivery gate results.

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

# Tasks
- `task_170_deliver_editable_network_manufacturer_and_supplier_references_in_plan_cartouches`

# Notes
- Task `task_170_deliver_editable_network_manufacturer_and_supplier_references_in_plan_cartouches` was finished via `logics-manager flow finish task` on 2026-10-23.
