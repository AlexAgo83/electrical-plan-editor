## item_643_reorder_table_columns_via_drag_and_drop - Reorder table columns via drag-and-drop
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Let the user reorder columns in the various data tables.
Goal: usability comfort, light UI personalization.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: In each table, the user can drag a column header to a new position and the column (header + body cells) moves accordingly.
- AC2: The identifier column can be moved like any other column (it remains always-visible / non-hideable per req_153).
- AC3: Column order persists across reloads via UI preferences (versioned migration, safe default = natural order).
- AC4: Reordering interoperates with column visibility ([[req_153_configurable_table_columns]]): hidden columns are skipped in display but their position is preserved if re-shown.
- AC5: Sorting and existing filter-driven conditional columns keep working after a reorder (no regression).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: In each table, the user can drag a column header to a new position and the column (header + body cells) moves accordingly.
- request-AC2 -> This backlog slice. Proof: AC2: The identifier column can be moved like any other column (it remains always-visible / non-hideable per req_153).
- request-AC3 -> This backlog slice. Proof: AC3: Column order persists across reloads via UI preferences (versioned migration, safe default = natural order).
- request-AC4 -> This backlog slice. Proof: AC4: Reordering interoperates with column visibility ([[req_153_configurable_table_columns]]): hidden columns are skipped in display but their position is preserved if re-shown.
- request-AC5 -> This backlog slice. Proof: AC5: Sorting and existing filter-driven conditional columns keep working after a reorder (no regression).
- request-AC6 -> This backlog slice. Evidence needed: In each table, the user can drag a column header to a new position; header + body cells move together; the identifier column is movable.
- request-AC7 -> This backlog slice. Evidence needed: Column order persists across reloads via the same UI-preferences migration; reorder interoperates with hiding (a hidden column keeps its position when re-shown).
- request-AC8 -> This backlog slice. Evidence needed: Sorting keeps working after hide/reorder (sort stays keyed by column field, not position).
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`

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
- Request: `logics/request/req_157_reorder_table_columns.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Reorder table columns via drag-and-drop
- Keywords: backlog-groom, request, reorder table columns via drag-and-drop, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Reorder table columns via drag-and-drop.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_157_reorder_table_columns` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_157_reorder_table_columns.md`.
- Generated locally by logics-manager.
- Task `task_152_reorder_table_columns_via_drag_and_drop` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_152_reorder_table_columns_via_drag_and_drop`
