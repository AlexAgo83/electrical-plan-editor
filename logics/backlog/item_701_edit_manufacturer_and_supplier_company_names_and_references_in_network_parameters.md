## item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters - Edit manufacturer and supplier company names and references in network parameters
> From version: 1.21.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Network parameter forms
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:32:33

# AI Context
- Summary: Two role groups expose four optional inputs through the existing shared network draft and submit lifecycle.
- Keywords: edit, manufacturer, supplier, company, names, references, network, parameters
- Use when: Implementing localized inputs, validation, cancellation and draft isolation.
- Skip when: Creating global company defaults or changing export layout.

# Problem
- Users cannot enter the two plan reference codes or customize the associated company names in network create/edit forms.

# Scope
- In:
  - Extend existing network form drafts, hooks, orchestration, handlers and shared create/edit controls with two role groups and four accessible optional inputs. Use generic EN/FR labels and placeholders.
  - Apply shared validation, optional/partial rules, max lengths and existing submit/cancel/read-only behavior. Ensure reloading drafts or switching networks cannot carry one network company identity into another.
  - Add focused interaction tests for editing each name separately from its reference, create/save/reopen, clear, partial values, cancel and switching; document parameter semantics and record AC evidence.
- Out:
  - Global Settings company presets, company catalogs and extra reference roles.

# Acceptance criteria
- AC1: Request AC2 works using AC1 data rules with EN/FR and existing network edit/read-only semantics.
- AC2: UI evidence covers the applicable AC6 cases and user documentation supports AC7.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: Planned implementation evidence: Shared bounds and single-line validation exercised through all four form inputs.
- request-AC2 -> This backlog slice. Proof: Planned implementation evidence: Localized create/edit/save/cancel/switch and historical read-only interaction evidence.
- request-AC6 -> This backlog slice. Proof: Planned implementation evidence: Form-specific partial-value, independent-name-edit and cross-network draft regression evidence.
- request-AC7 -> This backlog slice. Proof: Planned implementation evidence: Network parameter help and applicable form quality-check evidence.

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
