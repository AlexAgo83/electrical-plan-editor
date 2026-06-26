## item_644_per_pin_connector_size_variation_in_physical_layout - Per-pin connector size variation in physical layout
> From version: 1.16.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Add a per-way (per-pin) size variation in the connector physical layout so a single cavity can be drawn smaller or larger than the others, without changing the grid footprint.
Goal: visually distinguish power vs signal cavities at a glance, improving plan readability, without forcing the user into the existing `big` (2x2) size that changes grid occupancy and can break the layout.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: A way can be set to `small` and is drawn at half the normal shape size in the physical view, the layout editor preview, and the network-summary callout — all three render sites consistent.
- AC2: A `small` way occupies exactly one grid cell (span unchanged); placement, overlap detection, and move/clamp behave identically to a `normal` way (no layout breakage).
- AC3: `big` is unaffected — still spans 2x2 and draws at x2.
- AC4: `small` persists through save/load and import/export (normalization recognizes `"small"`; unknown legacy values still fall back to `normal`).
- AC5: The size selector lets the user choose Small / Normal / Big for a way.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A way can be set to `small` and is drawn at half the normal shape size in the physical view, the layout editor preview, and the network-summary callout — all three render sites consistent.
- request-AC2 -> This backlog slice. Proof: AC2: A `small` way occupies exactly one grid cell (span unchanged); placement, overlap detection, and move/clamp behave identically to a `normal` way (no layout breakage).
- request-AC3 -> This backlog slice. Proof: AC3: `big` is unaffected — still spans 2x2 and draws at x2.
- request-AC4 -> This backlog slice. Proof: AC4: `small` persists through save/load and import/export (normalization recognizes `"small"`; unknown legacy values still fall back to `normal`).
- request-AC5 -> This backlog slice. Proof: AC5: The size selector lets the user choose Small / Normal / Big for a way.

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
- Request: `logics/request/req_158_per_pin_connector_size_variation_in_physical_layout.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Per-pin connector size variation in physical layout
- Keywords: backlog-groom, request, per-pin connector size variation in physical layout, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Per-pin connector size variation in physical layout.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_158_per_pin_connector_size_variation_in_physical_layout` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_158_per_pin_connector_size_variation_in_physical_layout.md`.
- Generated locally by logics-manager.

# Tasks
- `task_153_per_pin_connector_size_variation_in_physical_layout`
