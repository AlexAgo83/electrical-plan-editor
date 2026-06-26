## task_152_reorder_table_columns_via_drag_and_drop - Reorder table columns via drag-and-drop
> From version: 1.16.10
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- **MERGED INTO [[task_148_configurable_visible_columns_in_data_tables]]** (decision 2026-06-26): column reordering is delivered as part of the combined "configurable + reorderable columns" task, on the shared per-table column-descriptor refactor. Do NOT implement this task standalone — its acceptance criteria (below, retained for traceability) are now covered by task_148 (AC6–AC8). Closed-as-merged once task_148 ships.
- [ ] The backlog scope is implemented (via task_148).
- [ ] Acceptance criteria are covered (via task_148 AC6–AC8).
- [ ] Validation passes (via task_148).

# Backlog
- `item_643_reorder_table_columns_via_drag_and_drop`

# Acceptance criteria
- AC1: In each table, the user can drag a column header to a new position and the column (header + body cells) moves accordingly.
- AC2: The identifier column can be moved like any other column (it remains always-visible / non-hideable per req_153).
- AC3: Column order persists across reloads via UI preferences (versioned migration, safe default = natural order).
- AC4: Reordering interoperates with column visibility ([[req_153_configurable_table_columns]]): hidden columns are skipped in display but their position is preserved if re-shown.
- AC5: Sorting and existing filter-driven conditional columns keep working after a reorder (no regression).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_152_reorder_table_columns_via_drag_and_drop.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement reorder table columns via drag-and-drop.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`, `req_157_reorder_table_columns`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
