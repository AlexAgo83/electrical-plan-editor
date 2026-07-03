## task_149_catalog_connector_copy_configuration_from_another_reference - Catalog connector: copy configuration from another reference
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Restored historical AC traceability proof.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

# Backlog
- `item_640_catalog_connector_copy_configuration_from_another_reference`

# Acceptance criteria
- AC1: From the catalog create form, a "Copy from…" selector lets the user pick a source reference; selecting it pre-fills all configuration fields (ways, name, material defaults, accessories, layout, fuse box).
- AC2: The source selector can target the active network or another network's catalog in the same document.
- AC3: On copy, `manufacturerReference` is pre-filled with a unique auto-suffixed value (no collision with the target network's existing references).
- AC4: All pre-filled fields stay editable; submitting creates a brand-new catalog item via `catalog/upsert` and never mutates the source.
- AC5: Copy produces a deep, independent copy (editing accessories/layout/fuse box on the new item does not affect the source).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_149_catalog_connector_copy_configuration_from_another_reference.md` after implementation.
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-06-26.
- Linked backlog item(s): `item_640_catalog_connector_copy_configuration_from_another_reference`
- Related request(s): `req_154_catalog_copy_from_reference`

# AI Context
- Summary: Implement catalog connector: copy configuration from another reference.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_154_catalog_copy_from_reference`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: From the catalog create form, a "Copy from…" selector lets the user pick a source reference; selecting it pre-fills all configuration fields (ways, name, material defaults, accessories, layout, fuse box).
- request-AC2 -> This task. Evidence needed: The source selector can target the active network or another network's catalog in the same document.
- request-AC3 -> This task. Evidence needed: On copy, `manufacturerReference` is pre-filled with a unique auto-suffixed value (no collision with the target network's existing references).
- request-AC4 -> This task. Evidence needed: All pre-filled fields stay editable; submitting creates a brand-new catalog item via `catalog/upsert` and never mutates the source.
- request-AC5 -> This task. Evidence needed: Copy produces a deep, independent copy (editing accessories/layout/fuse box on the new item does not affect the source).
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
