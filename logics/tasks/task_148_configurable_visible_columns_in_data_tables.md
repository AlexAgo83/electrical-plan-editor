## task_148_configurable_visible_columns_in_data_tables - Configurable visible columns in data tables
> From version: 1.16.10
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
- `item_639_configurable_visible_columns_in_data_tables`

# Acceptance criteria
- AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- AC3: The identifier column (Name/ID) is not offered as hideable and always renders.
- AC4: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_148_configurable_visible_columns_in_data_tables.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement configurable visible columns in data tables.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
