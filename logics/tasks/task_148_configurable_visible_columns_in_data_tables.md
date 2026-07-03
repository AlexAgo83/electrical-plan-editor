## task_148_configurable_visible_columns_in_data_tables - Configurable and reorderable columns in data tables
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 92
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

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
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-06-26.
- Linked backlog item(s): `item_639_configurable_visible_columns_in_data_tables`
- Related request(s): `req_153_configurable_table_columns`

# AI Context
- Summary: Implement the combined slice — per-table column-descriptor refactor of all 5 tables driving column visibility ("Columns ▾") AND desktop drag-and-drop reordering, persisted in one UI-preferences migration. Absorbs task_152.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_153_configurable_table_columns`
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
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC6 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC7 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC8 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
