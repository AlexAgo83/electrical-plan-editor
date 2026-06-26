## item_640_catalog_connector_copy_configuration_from_another_reference - Catalog connector: copy configuration from another reference
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Let the user create a new catalog connector by copying the full configuration of an existing reference: ways (connectionCount), reference, name, material defaults, additional accessories, physical layout, fuse box, etc.
Ideally also copy from the catalog of another harness (network).
Goal: faster catalog creation, less re-typing, fewer errors.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: From the catalog create form, a "Copy from…" selector lets the user pick a source reference; selecting it pre-fills all configuration fields (ways, name, material defaults, accessories, layout, fuse box).
- AC2: The source selector can target the active network or another network's catalog in the same document.
- AC3: On copy, `manufacturerReference` is pre-filled with a unique auto-suffixed value (no collision with the target network's existing references).
- AC4: All pre-filled fields stay editable; submitting creates a brand-new catalog item via `catalog/upsert` and never mutates the source.
- AC5: Copy produces a deep, independent copy (editing accessories/layout/fuse box on the new item does not affect the source).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: From the catalog create form, a "Copy from…" selector lets the user pick a source reference; selecting it pre-fills all configuration fields (ways, name, material defaults, accessories, layout, fuse box).
- request-AC2 -> This backlog slice. Proof: AC2: The source selector can target the active network or another network's catalog in the same document.
- request-AC3 -> This backlog slice. Proof: AC3: On copy, `manufacturerReference` is pre-filled with a unique auto-suffixed value (no collision with the target network's existing references).
- request-AC4 -> This backlog slice. Proof: AC4: All pre-filled fields stay editable; submitting creates a brand-new catalog item via `catalog/upsert` and never mutates the source.
- request-AC5 -> This backlog slice. Proof: AC5: Copy produces a deep, independent copy (editing accessories/layout/fuse box on the new item does not affect the source).

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
- Request: `logics/request/req_154_catalog_copy_from_reference.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Catalog connector: copy configuration from another reference
- Keywords: backlog-groom, request, catalog connector: copy configuration from another reference, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Catalog connector: copy configuration from another reference.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_154_catalog_copy_from_reference` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_154_catalog_copy_from_reference.md`.
- Generated locally by logics-manager.
- Task `task_149_catalog_connector_copy_configuration_from_another_reference` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_149_catalog_connector_copy_configuration_from_another_reference`
