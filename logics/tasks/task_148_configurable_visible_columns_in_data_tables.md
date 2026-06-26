## task_148_configurable_visible_columns_in_data_tables - Configurable and reorderable columns in data tables
> From version: 1.16.10
> Schema version: 1.0
> Status: In progress
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.

# Backlog
- `item_639_configurable_visible_columns_in_data_tables`

# Acceptance criteria
- AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- AC3: The identifier column (Name/ID) is not offered as hideable and always renders (but is reorderable).
- AC4: Column visibility AND order persist across reloads via one UI preferences migration (safe default = natural order, all visible).
- AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).
- AC6: In each table, the user can drag a column header (desktop mouse) to a new position; header + body cells move together; the identifier column is movable.
- AC7: Reorder interoperates with hiding — a hidden column keeps its position when re-shown.
- AC8: Sorting keeps working after hide/reorder (sort stays keyed by column field, not position).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_148_configurable_visible_columns_in_data_tables.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement the combined slice — per-table column-descriptor refactor of all 5 tables driving column visibility ("Columns ▾") AND desktop drag-and-drop reordering, persisted in one UI-preferences migration. Absorbs task_152.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
