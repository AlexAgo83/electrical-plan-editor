## task_153_per_pin_connector_size_variation_in_physical_layout - Per-pin connector size variation in physical layout
> From version: 1.16.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.

# Backlog
- `item_644_per_pin_connector_size_variation_in_physical_layout`

# Acceptance criteria
- AC1: A way can be set to `small` and is drawn at half the normal shape size in the physical view, the layout editor preview, and the network-summary callout — all three render sites consistent.
- AC2: A `small` way occupies exactly one grid cell (span unchanged); placement, overlap detection, and move/clamp behave identically to a `normal` way (no layout breakage).
- AC3: `big` is unaffected — still spans 2x2 and draws at x2.
- AC4: `small` persists through save/load and import/export (normalization recognizes `"small"`; unknown legacy values still fall back to `normal`).
- AC5: The size selector lets the user choose Small / Normal / Big for a way.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_153_per_pin_connector_size_variation_in_physical_layout.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement per-pin connector size variation in physical layout.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_158_per_pin_connector_size_variation_in_physical_layout`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
