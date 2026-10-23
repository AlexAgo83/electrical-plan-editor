## task_170_deliver_editable_network_manufacturer_and_supplier_references_in_plan_cartouches - Deliver editable network manufacturer and supplier references in plan cartouches
> From version: 1.21.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:32:05

# AI Context
- Summary: Deliver metadata first, then forms and cartouche consumers; preserve compatibility and record evidence for all seven request criteria.
- Keywords: deliver, editable, network, manufacturer, supplier, references, plan, cartouches
- Use when: Starting or coordinating the three ready backlog slices and their delivery checks.
- Skip when: Treating this documentation scaffold as implemented or closing without runtime proof.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Wave 1: Deliver metadata normalization, actions/reducers, clone/import and persistence/portability contracts; establish asymmetric two-network fixtures and prove AC1/AC3 including legacy and frozen-version behavior.
- [ ] 2. Wave 2: Deliver the network create/edit role groups and all four independent inputs using the shared contract. Verify draft/reset/cancel/switch behavior, optional combinations, EN/FR and read-only gates; record AC2 evidence.
- [ ] 3. Wave 3: Deliver controller-to-export propagation and localized cartouche rows, partial-value formatting and measured wrapping/bounds. Verify shared SVG/PNG and existing PDF consumers, disabled cartouches and stale-data prevention; record AC4-AC5 evidence.
- [ ] 4. Wave 4: Complete AC6 regression coverage, focused user help, per-AC traceability and applicable lint/typecheck/i18n/build/repository delivery gates for AC7. Use lifecycle commands for progress and closeout only after implementation and evidence exist.
- [ ] 5. All three backlog slices have Medium priority because this is an additive plan-identification feature with no reported blocking defect. Data contract comes first; forms and export can follow it independently. This scoping chain remains unimplemented.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`
- `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`
- `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof deferred to slice closeout.
- request-AC3 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof deferred to slice closeout.
- request-AC6 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof deferred to slice closeout.
- request-AC7 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof deferred to slice closeout.
- request-AC1 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof deferred to slice closeout.
- request-AC2 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof deferred to slice closeout.
- request-AC6 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof deferred to slice closeout.
- request-AC7 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof deferred to slice closeout.
- request-AC4 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC5 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC6 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof deferred to slice closeout.
- request-AC7 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof deferred to slice closeout.

# Validation
- (no validation recorded yet)

# Report
- Not started.

# Links
- Request: `req_173_add_editable_manufacturer_and_supplier_references_to_network_settings_and_plan_cartouches`
- Product brief(s): `prod_024_editable_manufacturer_and_supplier_identification_on_network_plans`
- Architecture decision(s): (none yet)
