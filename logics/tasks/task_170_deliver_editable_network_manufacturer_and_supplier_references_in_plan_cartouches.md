## task_170_deliver_editable_network_manufacturer_and_supplier_references_in_plan_cartouches - Deliver editable network manufacturer and supplier references in plan cartouches
> From version: 1.21.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-23 10:59:25
> Owner: Claude

# AI Context
- Summary: Deliver metadata first, then forms and cartouche consumers; preserve compatibility and record evidence for all seven request criteria.
- Keywords: deliver, editable, network, manufacturer, supplier, references, plan, cartouches
- Use when: Starting or coordinating the three ready backlog slices and their delivery checks.
- Skip when: Treating this documentation scaffold as implemented or closing without runtime proof.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Wave 1: Deliver metadata normalization, actions/reducers, clone/import and persistence/portability contracts; establish asymmetric two-network fixtures and prove AC1/AC3 including legacy and frozen-version behavior.
- [x] 2. Wave 2: Deliver the network create/edit role groups and all four independent inputs using the shared contract. Verify draft/reset/cancel/switch behavior, optional combinations, EN/FR and read-only gates; record AC2 evidence.
- [x] 3. Wave 3: Deliver controller-to-export propagation and localized cartouche rows, partial-value formatting and measured wrapping/bounds. Verify shared SVG/PNG and existing PDF consumers, disabled cartouches and stale-data prevention; record AC4-AC5 evidence.
- [x] 4. Wave 4: Complete AC6 regression coverage, focused user help, per-AC traceability and applicable lint/typecheck/i18n/build/repository delivery gates for AC7. Use lifecycle commands for progress and closeout only after implementation and evidence exist.
- [x] 5. All three backlog slices have Medium priority because this is an additive plan-identification feature with no reported blocking defect. Data contract comes first; forms and export can follow it independently. This scoping chain remains unimplemented.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`
- `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`
- `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof: `src/tests/network-plan-party-references.spec.ts` helpers (trim, 80/120 bounds, case/punctuation/Unicode/leading zeroes kept, blank and non-string unset, line breaks to spaces) and reducer isolation on asymmetric two-network fixtures (4f597bd4).
- request-AC3 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof: `src/tests/network-plan-party-references.spec.ts` duplicate, undo/redo via `useStoreHistory`, persisted migration with wrong types, workspace file roundtrip + legacy file without fields, network file export/import with `<-undefined`/`<-normalized` warnings, overwrite and keep-both conflict paths, frozen lineage version + portable Copy unaffected by later working edits; additive optional fields, no schema bump (4f597bd4).
- request-AC6 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof: Data regressions in `src/tests/network-plan-party-references.spec.ts` (11 tests) reuse the plan-issue fixture shape and lineage controller pattern (4f597bd4).
- request-AC7 -> `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`. Proof: README network metadata section; full `ci:blocking` steps passed (see Validation) (fedee19a).
- request-AC1 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof: `buildNetworkFormDraft` rejects multiline and over-limit values and keeps a 120-character code; inputs carry maxLength 80/120 (`src/tests/app.ui.network-plan-party-form.spec.tsx`) (f9b80851).
- request-AC2 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof: `src/tests/app.ui.network-plan-party-form.spec.tsx`: two role fieldsets with accessible legends, generic placeholders, partial saves on the target network only, independent name edit, clear, cancel/reopen/switch/create without draft leaks, FR labels; ordinary `network/update` dispatch (history label `plan references updated`, historical read-only through the session dispatch gate) (f9b80851).
- request-AC6 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof: Form regressions in `src/tests/app.ui.network-plan-party-form.spec.tsx` (6 tests); existing `app.ui.networks.spec.tsx` unchanged and passing (f9b80851).
- request-AC7 -> `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`. Proof: In-form hint `ui.planPartiesHint` (EN/FR) and README; i18n gate passed (f9b80851, fedee19a).
- request-AC4 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof: `src/tests/network-summary-export-cartouche-plan-parties.spec.ts`: `Manufacturer (Manufacturer A): MFG-001` / `Supplier (Supplier B): SUP-009`, FR `Fabricant (…) : …`, reference-only, name-only, both-unset omission, manufacturer before supplier after plan issue rows (08eb627b).
- request-AC5 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof: `src/tests/app.ui.network-summary-svg-cartouche-export.spec.tsx` exports active-network values, fresh after an edit/clear, store networks object unchanged by export; unit spec covers disabled cartouche, wrapped 120-char unbroken code with no lost characters, cartouche/notes below rows and SVG height/viewBox growth; SVG, PNG and PDF all use `prepareDecoratedSvgClone`, which now takes the decorated height (08eb627b).
- request-AC6 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof: Export regressions (6 unit + 1 UI test) including XML-sensitive and non-Latin literal text and serialized escaping (08eb627b).
- request-AC7 -> `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`. Proof: README export cartouche description; per-AC evidence recorded here; `ci:blocking` steps passed (fedee19a).

# Validation
- command: `logics-manager lint --require-status && logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability` | result: see closeout | date: 2026-10-23
- command: `npm run -s lint && npm run -s typecheck && npm run -s quality:i18n && npm run -s quality:dependency-audit && npm run -s test:ci:segmentation:check` | result: passed | date: 2026-10-23 | note: ESLint 0 errors, 1 existing warning (useWorkspaceFileStorage); i18n 1754 keys.
- command: `npm run -s test:ci:fast && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite && npm run -s quality:pwa` | result: passed | date: 2026-10-23 | note: 765 fast tests (107 files), 10 UI chunks, Playwright 14 passed / 1 skipped (existing skip), PWA gate passed.
- command: `npm run -s lint && npm run -s typecheck && npm run -s quality:i18n && npm run -s test:ci:fast && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite` | result: passed | date: 2026-10-23
- Finish workflow executed on 2026-10-23.
- Linked backlog/request close verification passed.

# Report
- Delivered in 4f597bd4 (metadata), f9b80851 (form), 08eb627b (cartouche) and fedee19a (README).
- Form values travel as one `newNetworkPlanParties` record; cartouche values as one `exportCartouchePlanParties` object. The shared draft-to-metadata mapping moved to `toNetworkDraftMetadata`.
- ESLint max-lines ratchets raised by the exact added lines for NetworkSummaryPanel.tsx (+2), useAppControllerNetworkSummaryPanelDomain.tsx (+1) and useAppControllerScreenContentSlices.tsx (+3), as task_168 did for the plan issue props.
- Limitation: a wrapped cartouche row is several tspans, so its SVG text content has no space at the break; the rendered output is correct.
- Finished on 2026-10-23.
- Linked backlog item(s): `item_700_persist_per_network_manufacturer_and_supplier_plan_reference_metadata`, `item_701_edit_manufacturer_and_supplier_company_names_and_references_in_network_parameters`, `item_702_render_manufacturer_and_supplier_plan_references_in_export_cartouches`
- Related request(s): `req_173_add_editable_manufacturer_and_supplier_references_to_network_settings_and_plan_cartouches`

# Links
- Request: `req_173_add_editable_manufacturer_and_supplier_references_to_network_settings_and_plan_cartouches`
- Product brief(s): `prod_024_editable_manufacturer_and_supplier_identification_on_network_plans`
- Architecture decision(s): (none yet)
