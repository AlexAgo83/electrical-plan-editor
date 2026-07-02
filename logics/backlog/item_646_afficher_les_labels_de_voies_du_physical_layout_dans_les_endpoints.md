## item_646_afficher_les_labels_de_voies_du_physical_layout_dans_les_endpoints - Afficher les labels de voies du physical layout dans les endpoints
> From version: 1.17.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Operators can define physical connector way labels in the catalog layout, but wire endpoint displays still show the numeric fallback (`C1`, `C2`, etc.). This makes the endpoint list, detail panels, analysis tables, and exports harder to reconcile with the physical connector drawing. Numeric endpoint forms also need to expose the resolved physical label beside the numeric field so editing by index does not become ambiguous.

# Scope
- In:
  - Add a shared way-label resolution path that maps connector cavity indexes to catalog physical layout labels, with `C<n>` fallback.
  - Use the resolved label in wire endpoint display helpers and export-facing endpoint position helpers.
  - Show the resolved physical label beside numeric connector way index inputs in wire endpoint forms when it differs from `C<n>`.
  - Add focused regression coverage for labeled and unlabeled connector ways.
- Out:
  - Changing the persisted endpoint model from numeric `cavityIndex` to label-based references.
  - Enforcing physical layout labels as unique identifiers.
  - Reworking connector physical layout editing beyond consuming existing `ConnectorLayoutWay.label` values.
  - Renaming the user-facing way terminology outside the surfaces touched by this feature.

# Acceptance criteria
- AC1: Connector cavity endpoint descriptions display the configured physical layout label for the matching `cavityIndex` when available.
- AC2: Connector cavity endpoint descriptions continue to display `C<n>` when the connector has no catalog physical layout label for that index.
- AC3: CSV/table/export endpoint position parts use the same resolved connector way label policy as the UI endpoint descriptions.
- AC4: Numeric connector way index inputs in wire endpoint forms show a nearby read-only label preview when the resolved label differs from the numeric fallback.
- AC5: The endpoint data model, occupancy keys, routing, and validation remain based on numeric `cavityIndex`.
- AC6: Tests cover a labeled physical way, an unlabeled fallback way, and the form-side label preview.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1, AC3.
- request-AC2 -> This backlog slice. Proof: AC2.
- request-AC3 -> This backlog slice. Proof: AC5.
- request-AC4 -> This backlog slice. Proof: AC4.
- request-AC5 -> This backlog slice. Proof: AC6.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_160_physical_layout_way_labels_in_endpoints`
- Primary task(s): `task_155_afficher_les_labels_de_voies_du_physical_layout_dans_les_endpoints`

# AI Context
- Summary: Afficher les labels de voies du physical layout dans les endpoints
- Keywords: backlog-groom, request, afficher les labels de voies du physical layout dans les endpoints, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Afficher les labels de voies du physical layout dans les endpoints.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Small operator-facing clarity improvement that reduces mismatch between physical connector drawings and endpoint tables/forms.

# Notes
- Hybrid rationale: Derived from request `req_160_physical_layout_way_labels_in_endpoints` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_160_physical_layout_way_labels_in_endpoints.md`.
- Generated locally by logics-manager.
- Task `task_155_afficher_les_labels_de_voies_du_physical_layout_dans_les_endpoints` was finished via `logics-manager flow finish task` on 2026-07-02.

# Tasks
- `task_155_afficher_les_labels_de_voies_du_physical_layout_dans_les_endpoints`
