## task_155_physical_layout_way_labels_in_endpoints - Display physical layout way labels in endpoints
> From version: 1.17.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] Shared connector way label resolution is implemented with `ConnectorLayoutWay.label` first and `C<n>` fallback.
- [x] Wire endpoint UI descriptions and export-facing endpoint position helpers use the shared resolved label.
- [x] Wire endpoint numeric index forms show the resolved physical label beside the numeric field when it differs from `C<n>`.
- [x] Numeric `cavityIndex` remains the persisted/submitted endpoint value.
- [x] Regression tests cover labeled display, fallback display, and form label preview.
- [x] Validation passes.

# Backlog
- `item_646_physical_layout_way_labels_in_endpoints`

# Acceptance criteria
- AC1: `describeWireEndpoint`, `describeWireEndpointId`, and `describeWireEndpointCsvParts` resolve connector cavity labels from the linked catalog physical layout when possible.
- AC2: The same helpers fall back to `C<n>` for missing labels, missing catalog items, or missing connectors.
- AC3: Wire endpoint form UI keeps accepting numeric connector way indexes and shows a read-only label preview for labeled physical ways.
- AC4: The implementation does not alter route, occupancy, validation, import, or save data semantics for connector endpoints.
- AC5: Tests assert the labeled and fallback display behavior plus the numeric-form label preview.

# Validation
- Run the focused endpoint/form regression tests added or updated for this change.
- Run `npm test -- --run` or the repo's narrowed Vitest command if a full run is too costly.
- Run `logics-manager flow validate req_160_physical_layout_way_labels_in_endpoints item_646_physical_layout_way_labels_in_endpoints task_155_physical_layout_way_labels_in_endpoints --format json`.
- Run `logics-manager lint --require-status`.
- Implemented shared connector way label resolution with C<n> fallback; endpoint descriptions, wire-list export positions, and wire endpoint numeric form previews use the resolved label. Validation: npm test -- --run src/tests/use-wire-endpoint-descriptions.spec.tsx src/tests/wire-list-export.spec.ts src/tests/app.ui.creation-flow-wire-ergonomics.spec.tsx passed; npm run -s typecheck passed; npm run -s lint passed; logics-manager lint --require-status passed.
- Finish workflow executed on 2026-07-02.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-02.
- Linked backlog item(s): `item_646_physical_layout_way_labels_in_endpoints`
- Related request(s): `req_160_physical_layout_way_labels_in_endpoints`

# AI Context
- Summary: Implement physical layout connector way labels in endpoint displays while preserving numeric cavity indexes as the data model.
- Keywords: task, implementation, endpoint labels, connector layout, wire forms, cavityIndex
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_160_physical_layout_way_labels_in_endpoints`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: Implemented in task_155: connector cavity displays resolve ConnectorLayoutWay.label via linked catalog physical layout with C<n> fallback; numeric cavityIndex remains stored/submitted; wire endpoint forms show Physical label preview for labeled numeric indexes; regression coverage includes use-wire-endpoint-descriptions, wire-list-export, and app.ui.creation-flow-wire-ergonomics targeted tests. Validation passed: targeted Vitest, typecheck, ESLint, and logics lint. Source: `task_155_physical_layout_way_labels_in_endpoints`
- request-AC2 -> This task. Proof: Implemented in task_155: connector cavity displays resolve ConnectorLayoutWay.label via linked catalog physical layout with C<n> fallback; numeric cavityIndex remains stored/submitted; wire endpoint forms show Physical label preview for labeled numeric indexes; regression coverage includes use-wire-endpoint-descriptions, wire-list-export, and app.ui.creation-flow-wire-ergonomics targeted tests. Validation passed: targeted Vitest, typecheck, ESLint, and logics lint. Source: `task_155_physical_layout_way_labels_in_endpoints`
- request-AC3 -> This task. Proof: Implemented in task_155: connector cavity displays resolve ConnectorLayoutWay.label via linked catalog physical layout with C<n> fallback; numeric cavityIndex remains stored/submitted; wire endpoint forms show Physical label preview for labeled numeric indexes; regression coverage includes use-wire-endpoint-descriptions, wire-list-export, and app.ui.creation-flow-wire-ergonomics targeted tests. Validation passed: targeted Vitest, typecheck, ESLint, and logics lint. Source: `task_155_physical_layout_way_labels_in_endpoints`
- request-AC4 -> This task. Proof: Implemented in task_155: connector cavity displays resolve ConnectorLayoutWay.label via linked catalog physical layout with C<n> fallback; numeric cavityIndex remains stored/submitted; wire endpoint forms show Physical label preview for labeled numeric indexes; regression coverage includes use-wire-endpoint-descriptions, wire-list-export, and app.ui.creation-flow-wire-ergonomics targeted tests. Validation passed: targeted Vitest, typecheck, ESLint, and logics lint. Source: `task_155_physical_layout_way_labels_in_endpoints`
- request-AC5 -> This task. Proof: Implemented in task_155: connector cavity displays resolve ConnectorLayoutWay.label via linked catalog physical layout with C<n> fallback; numeric cavityIndex remains stored/submitted; wire endpoint forms show Physical label preview for labeled numeric indexes; regression coverage includes use-wire-endpoint-descriptions, wire-list-export, and app.ui.creation-flow-wire-ergonomics targeted tests. Validation passed: targeted Vitest, typecheck, ESLint, and logics lint. Source: `task_155_physical_layout_way_labels_in_endpoints`
