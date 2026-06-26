## task_150_connector_synthesis_parity_with_splice_add_section_color_twist_tag - Connector synthesis: parity with splice (add section, color, twist, tag)
> From version: 1.16.10
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 92
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.

# Backlog
- `item_641_connector_synthesis_parity_with_splice_add_section_color_twist_tag`

# Acceptance criteria
- AC1: The connector synthesis table shows a Section (mm²) column populated from `wire.sectionMm2`, plus Color, Twist group, and Functional tag columns.
- AC2: New columns are sortable (sort field type extended; `sortByTableColumns()` handles them).
- AC3: CSV export of the connector synthesis includes the new columns in matching order.
- AC4: Color rendering reuses the existing `renderWireColorPrefixMarker()` helper for consistency with other wire displays.
- AC5: The new synthesis columns render unconditionally — the analysis synthesis tables are independent of the req_153 modeling-table column model (no shared column-id scheme); per-synthesis-column toggling is out of scope (separate future extension).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_150_connector_synthesis_parity_with_splice_add_section_color_twist_tag.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement connector synthesis: parity with splice (add section, color, twist, tag).
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`, `req_155_connector_synthesis_parity`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
