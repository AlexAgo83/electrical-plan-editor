## req_173_add_editable_manufacturer_and_supplier_references_to_network_settings_and_plan_cartouches - Add editable manufacturer and supplier references to network settings and plan cartouches
> From version: 1.21.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Network plan identification
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:59:25

# AI Context
- Summary: Four optional per-network strings identify manufacturer and supplier plans; editable company names are business data, and legacy plans remain empty.
- Keywords: add, editable, manufacturer, supplier, references, network, settings, plan, cartouches
- Use when: Scoping plan-level company names, reference codes, persistence and cartouche acceptance.
- Skip when: Changing component catalog references, material callouts or workspace supplier handoff history.

# Needs
- Enter one manufacturer plan reference and one supplier plan reference in network parameters.
- Edit the company name associated with each reference independently; company names must not be fixed labels.
- Show both references and their associated company names in exported plan cartouches.

# Context
- User request on 2026-10-23 against repository version 1.21.0. This chain scopes development only; no runtime implementation is requested in this change. Documents use English; UI copy supports EN/FR.
- Scope decision: these are references identifying the network plan as a whole. They are unrelated to connector/catalog manufacturerReference, wire endpoint material references, BOM references, network technicalId, projectCode or planRevision. Exactly two fixed semantic roles are required: manufacturer and supplier.
- Interpretation of editable company labels: each role contains a company name and a reference value, giving four editable text inputs in total. Names belong to the network and are user data. Documentation and fixtures use Manufacturer A and Supplier B as anonymized examples. No real company name or brand-specific default is introduced.
- Network already stores optional author/projectCode/exportNotes/planRevision/planIssueDate. networkMetadata, networkClone, networkReducer, migrations and networkFile normalize explicit metadata allowlists. Follow and extend the existing complete path rather than storing local-only UI values.
- The existing network create/edit flow is shared by NetworkScopeWorkspaceContent, networkFormDraft, form state/orchestration and useWorkspaceHandlers. Follow its submit/cancel, draft reset, network switching and historical read-only behavior.
- The cartouche is generated in networkSummaryExport, with parameters supplied through controller, panel types and export actions. Existing metadata rows are omitted when empty and cartouche width is capped; long new text requires wrapping and measured height. Inspect preview and any existing PDF consumer of the same export renderer without creating a new export flow.
- prod_022 remains the reference for issue revision/date semantics. This focused brief adds business identification to the same per-network metadata model without changing release or workspace history semantics.

# Acceptance criteria
- AC1: Store four optional per-Network text values: planManufacturerName, planManufacturerReference, planSupplierName and planSupplierReference. Manufacturer/supplier are fixed roles; both names and both reference values are independently editable and clearable. Each accepts trimmed single-line Unicode text, names up to 80 characters and reference codes up to 120 characters; preserve case, internal spaces, punctuation and leading zeroes. Empty/whitespace-only values are unset. Interactive input prevents over-limit values and reports invalid multiline input; shared normalization removes non-string values and sanitizes imported line breaks to spaces with bounded lengths. Do not reuse the project-code character restriction or entity-prefix formatter.
- AC2: Network create/edit parameters expose two clearly grouped roles with accessible EN/FR labels: manufacturer company name/reference and supplier company name/reference. All four inputs are optional, including name-only and reference-only combinations. Use generic placeholders, never hardcoded real company names. Saving updates only the target network; cancel, reopen, reset and switching networks do not leak drafts. Existing network save validation and historical read-only gates apply. Changes take the ordinary metadata dirty/save and undo/redo path without rerouting or changing entity technical IDs.
- AC3: All four values survive create/update, duplicate/clone, undo/redo, application reload, browser/folder workspace save/open, portable workspace Copy, stored lineage versions and network export/import including import-conflict paths. Audit every explicit metadata allowlist and serializer. Existing files with no fields remain valid with all values unset; malformed imported optional values follow shared normalization and existing import-warning conventions without dropping the network or unrelated data. Choose any schema/version adjustment under existing portability policy. Frozen versions retain their captured values and cannot be changed by later working-copy edits.
- AC4: When the identity cartouche is enabled, each non-empty role produces a distinct localized manufacturer/supplier row using the exported network values. With both values present, show Manufacturer (Manufacturer A): MFG-001 and Supplier (Supplier B): SUP-009 in English and equivalent French role labels; company names/reference values themselves are never translated. With only the reference, show the generic role and reference; with only the company name, show the role and company name without a dangling separator. Omit a role only when both values are unset. Preserve manufacturer-before-supplier order and existing metadata rows/toggle behavior. Editing a name replaces it in subsequent exports without changing either reference.
- AC5: Propagate the four values through all existing preview/export parameter paths. SVG and PNG plus any existing PDF path consuming that renderer show matching role/name/reference values from the correct network, with no stale data after edits or network switches. Measure/wrap long company names and reference codes, including unbroken 120-character codes; expand cartouche height and export bounds as needed so rows, logo and notes remain readable without clipping or overlap at supported sizes. XML-sensitive characters and non-Latin text remain literal safe text. Disabled cartouches emit none of these rows; exports do not mutate metadata or dirty/history state.
- AC6: Add meaningful targeted normalization/form/reducer/portability and export regressions: distinct values on two networks, independent edits/clears, all partial/empty combinations, whitespace, bounds, imported wrong types/line breaks, clone, undo/redo, legacy-file roundtrips, workspace/network serialization and frozen history. Cover EN/FR labels, submit/cancel/switch behavior, long cartouche content with logo/notes and cartouche disabled, SVG text plus PNG/shared-renderer propagation. Reuse existing plan-issue fixtures and relevant lineage tests rather than duplicating whole test suites.
- AC7: Document the two plan-level roles, editable company names, optional-value/cartouche rules and scope difference from component references in the appropriate existing network/export help, creating a focused help page only if none exists. Record per-AC implementation/test evidence in the orchestration task. Before implementation closeout run applicable lint, typecheck, i18n, targeted tests, build and repository-required delivery gates. This corpus alone stays ready for development and does not claim runtime delivery.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_024_editable_manufacturer_and_supplier_identification_on_network_plans`
- Architecture decision(s): (none yet)

# References
- logics/product/prod_022_plan_issue_traceability_and_everyday_workspace_confidence.md
- src/core/entities.ts
- src/core/networkMetadata.ts
- src/store/actions.ts
- src/store/reducer/networkReducer.ts
- src/store/reducer/helpers/networkClone.ts
- src/store/reducer/helpers/networkImport.ts
- src/adapters/persistence/migrations.ts
- src/adapters/portability/networkFile.ts
- src/app/lib/networkFormDraft.ts
- src/app/hooks/useNetworkScopeFormState.ts
- src/app/hooks/useNetworkScopeFormOrchestration.ts
- src/app/hooks/useWorkspaceHandlers.ts
- src/app/components/workspace/NetworkScopeWorkspaceContent.tsx
- src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx
- src/app/components/network-summary/NetworkSummaryPanel.types.ts
- src/app/components/network-summary/export/useNetworkSummaryExportActions.ts
- src/app/components/network-summary/export/networkSummaryExport.ts
- src/app/lib/workspaceFile.ts
- src/app/i18n/en.json
- src/app/i18n/fr.json
- src/tests/network-plan-issue-metadata.spec.ts
- src/tests/network-summary-export-cartouche-plan-issue.spec.ts
- src/tests/app.ui.network-summary-svg-cartouche-export.spec.tsx
- src/tests/portability.network-file.spec.ts
- src/tests/workspace-file.spec.ts
- package.json

# Backlog
- `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`
- `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`
- `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`
