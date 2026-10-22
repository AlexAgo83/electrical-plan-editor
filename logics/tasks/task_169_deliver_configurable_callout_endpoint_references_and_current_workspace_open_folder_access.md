## task_169_deliver_configurable_callout_endpoint_references_and_current_workspace_open_folder_access - Deliver configurable callout endpoint references and current workspace Open folder access
> From version: 1.20.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Indicators reviewed: 2026-10-22 20:30:09
> Owner: Claude

# AI Context
- Summary: Deliver the endpoint-model prerequisite before settings/layout; Open folder is independent. Track request AC1-AC9 and leave implementation unstarted until development begins.
- Keywords: endpoint mapping, global preferences, export measurement, workspace picker, AC evidence
- Use when: Executing the three linked backlog slices and their delivery gates.
- Skip when: Scaffolding a different request or publishing a release.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Wave 1: Confirm the four-checkbox UX, row-relative endpoint mapping and effective-reference precedence against current BOM/material behavior; establish asymmetric fixtures and record AC3-AC4 evidence while delivering the endpoint-model backlog slice.
- [x] 2. Wave 2: Deliver persisted global settings and the measured dynamic table/export layout using the endpoint-model slice. Verify every visibility combination, EN/FR, wrapping and cache invalidation; record AC1-AC2 and AC5-AC6 evidence.
- [x] 3. Wave 3: Deliver the independently implementable Open folder relocation with the existing picker action and selector semantics. Verify no-active, ready/busy, unsupported API, historical and unsaved states; record AC7-AC8 evidence.
- [x] 4. Wave 4: Complete targeted UI/export/browser regressions, documentation and applicable repository quality/delivery gates. Map implementation proof for AC1-AC9, record limitations and close through lifecycle commands only after implementation is complete.
- [x] 5. All backlog slices have Medium priority: these are requested additive usability improvements with no reported blocking defect. Deliver the endpoint model before its display consumer; Open folder has no dependency on the callout changes. Leave this corpus unimplemented and ready to start.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_697_carry_effective_local_and_opposite_endpoint_material_references_into_callout_rows`
- `item_698_add_persisted_callout_reference_checkboxes_and_readable_screen_and_export_columns`
- `item_699_move_open_folder_beside_save_rename_and_copy_in_current_workspace`

# Definition of Done (DoD)
- [x] Request AC1-AC8 are implemented with per-AC evidence and linked backlog outcomes.
- [x] Effective local/opposite codes and manual/catalog precedence pass asymmetric and edge-case model tests.
- [x] Four persisted checkboxes update readable callouts and existing SVG/PNG/PDF exports with no business-data mutation.
- [x] Open folder appears in Current workspace and retains the existing picker, registration, reconciliation and explicit selection behavior.
- [x] EN/FR, long-reference wrapping, cache invalidation, historical display, responsive actions and unsupported folder access are verified.
- [x] Request AC9 documentation, targeted tests and applicable repository delivery gates pass; any unperformed browser check is explicitly recorded.
- [x] Logics lint, scoped audit and request validation pass before lifecycle closeout.
- [x] Meaningful waves follow ADR 009 with affected docs updated and commit creation under operator control.

# AC Traceability
- request-AC3 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC4 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC1 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC2 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC5 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC6 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC9 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC7 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC8 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`
- request-AC9 -> This task. Proof: Implemented in 43b73f80, a2c9ec72 and 18809acb (task_169); validated with npm run -s lint, typecheck, quality:i18n, test:ci:fast, test:ci:ui, test:e2e and build:vite. Source: `18809acb`

# Validation
- `npm run -s lint`, `npm run -s typecheck`, `npm run -s quality:i18n`, `npm run -s test:ci:segmentation:check`: passed.
- `npm run -s test:ci:fast` (105 files, 748 tests) and `npm run -s test:ci:ui` (all shards): passed.
- `npm run -s test:e2e` (14 passed, 1 skipped) and `npm run -s build:vite`: passed.
- command: `npm run -s lint && npm run -s typecheck && npm run -s quality:i18n && npm run -s test:ci:fast && npm run -s test:ci:ui && npm run -s test:e2e && npm run -s build:vite` | result: passed | date: 2026-10-22
- Finish workflow executed on 2026-10-22.
- Linked backlog/request close verification passed.

# Report
- Wave 1 (`43b73f80`, item_697): `resolveWireEndpointTerminalMaterial` / `resolveWireEndpointSealMaterial` extracted from the BOM into `src/core/connectorCatalogMaterials.ts` (BOM now calls the same functions, BOM tests unchanged and green) plus `resolveEffectiveWireEndpointReferences`. `CalloutEntry` carries `localEndpointSide` and the four row-relative effective codes for connector and splice groups. Evidence AC3/AC4: `src/tests/network-summary-callout-endpoint-references.spec.ts` (asymmetric A/B, A/B swap with metadata, self-loop, shared cavity, connector/splice both directions, manual over instance/catalog override, whitespace-only manual, deleted catalog link, applyCatalogSeals=false with/without manual seal, read-only snapshot).
- Wave 2 (`a2c9ec72`, item_698): global preference `canvasCalloutEndpointReferences` (four booleans, default false, normalized by `normalizeCalloutEndpointReferenceVisibility`) through storage, hooks, controller slices and reset; four EN/FR checkboxes plus a side explanation in Settings > Canvas tools, indexed for search. Optional columns Local contact/Local seal after Pin and Opp. contact/Opp. seal after End ID/PIN; codes wrap inside a bounded measured column with per-row heights (`rowLayouts`), `—` for missing values; locale, flags and values are in the layout cache key. Evidence AC1/AC2/AC5/AC6: `src/tests/network-summary-callout-reference-columns.spec.ts` (all-off columns unchanged, local-only/opposite-only/both/mixed, ordering, no overlap, long wrap without truncation, historical row step kept, cache invalidation by flag/value/locale, FR headers, malformed flags, EN/FR search terms) and `src/tests/app.ui.callout-endpoint-references.spec.tsx` (default unchecked, immediate drawing update, persistence across remount, malformed storage, splice row relative values, SVG export content with preferences unchanged). PNG/PDF rasterize the same prepared SVG clone as the SVG export.
- Wave 3 (`18809acb`, item_699): Open workspace folder moved to Current workspace (Save, Rename, Copy, Open workspace folder, New workspace; also present with no active workspace), disabled while busy or not ready, unsupported explanation moved with it, removed from Transfer and recovery. Evidence AC7/AC8: `src/tests/workspace-storage-settings-section.spec.tsx` (EN/FR order, single action, Transfer keeps Reconnect/Import/Export, no-active state, not-ready, unsupported, search highlight, click calls only `model.openFolder`) and `src/tests/workspace-lineage-folder.spec.ts` (cancel and folder without workspace fail without registering; success registers without switching, unsaved state kept).
- AC9 docs: README callout feature line, `docs/workspace-lineages.md` Current workspace / Transfer rows and transfer guidance.
- Limitations: no dedicated browser (Playwright) scenario for the new columns or the 360px wrap of Current workspace actions; the action row reuses the existing `.row-actions` flex-wrap. Cancelling the folder picker still surfaces the existing "folder not selected" error toast (unchanged behaviour, never reported as success). Lint max-lines budgets were raised for pure preference plumbing files.
- Finished on 2026-10-22.
- Linked backlog item(s): `item_697_carry_effective_local_and_opposite_endpoint_material_references_into_callout_rows`, `item_698_add_persisted_callout_reference_checkboxes_and_readable_screen_and_export_columns`, `item_699_move_open_folder_beside_save_rename_and_copy_in_current_workspace`
- Related request(s): `req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions`

# Links
- Request: `req_172_show_local_and_opposite_endpoint_connection_and_seal_references_in_plan_callouts_and_expose_open_folder_beside_workspace_actions`
- Product brief(s): `prod_023_configurable_endpoint_material_references_on_plans_and_direct_workspace_folder_access`
- Architecture decision(s): (none yet)
