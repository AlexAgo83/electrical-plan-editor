## task_152_reorder_table_columns_via_drag_and_drop - Reorder table columns via drag-and-drop
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

# Definition of Done (DoD)
- **MERGED INTO [[task_148_configurable_visible_columns_in_data_tables]]** (decision 2026-06-26): column reordering is delivered as part of the combined "configurable + reorderable columns" task, on the shared per-table column-descriptor refactor. Do NOT implement this task standalone — its acceptance criteria (below, retained for traceability) are now covered by task_148 (AC6–AC8). Closed-as-merged once task_148 ships.
- [x] The backlog scope is implemented (via task_148).
- [x] Acceptance criteria are covered (via task_148 AC6–AC8).
- [x] Validation passes (via task_148).

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
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-06-26.
- Linked backlog item(s): `item_643_reorder_table_columns_via_drag_and_drop`
- Related request(s): `req_153_configurable_table_columns`, `req_157_reorder_table_columns`

# AI Context
- Summary: Implement reorder table columns via drag-and-drop.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`, `req_157_reorder_table_columns`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- request-AC2 -> This task. Evidence needed: Toggling a column immediately shows/hides it in that table without affecting other tables.
- request-AC3 -> This task. Evidence needed: The identifier column (Name/ID) is not offered as hideable and always renders.
- request-AC4 -> This task. Evidence needed: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- request-AC5 -> This task. Evidence needed: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).
- request-AC6 -> This task. Evidence needed: In each table, the user can drag a column header to a new position; header + body cells move together; the identifier column is movable.
- request-AC7 -> This task. Evidence needed: Column order persists across reloads via the same UI-preferences migration; reorder interoperates with hiding (a hidden column keeps its position when re-shown).
- request-AC8 -> This task. Evidence needed: Sorting keeps working after hide/reorder (sort stays keyed by column field, not position).
- request-AC1 -> This task. Evidence needed: In each table, the user can drag a column header to a new position and the column (header + body cells) moves accordingly.
- request-AC2 -> This task. Evidence needed: The identifier column can be moved like any other column (it remains always-visible / non-hideable per req_153).
- request-AC3 -> This task. Evidence needed: Column order persists across reloads via UI preferences (versioned migration, safe default = natural order).
- request-AC4 -> This task. Evidence needed: Reordering interoperates with column visibility ([[req_153_configurable_table_columns]]): hidden columns are skipped in display but their position is preserved if re-shown.
- request-AC5 -> This task. Evidence needed: Sorting and existing filter-driven conditional columns keep working after a reorder (no regression).
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC6 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC7 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC8 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
