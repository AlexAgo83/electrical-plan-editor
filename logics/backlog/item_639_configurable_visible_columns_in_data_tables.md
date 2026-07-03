## item_639_configurable_visible_columns_in_data_tables - Configurable visible columns in data tables
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
Let the user choose which columns are visible in each data table (e.g. section, color, twist group, number of ways, etc.).
Goal: better readability per business context, less visual noise.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- AC3: The identifier column (Name/ID) is not offered as hideable and always renders.
- AC4: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- request-AC2 -> This backlog slice. Proof: AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- request-AC3 -> This backlog slice. Proof: AC3: The identifier column (Name/ID) is not offered as hideable and always renders.
- request-AC4 -> This backlog slice. Proof: AC4: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- request-AC5 -> This backlog slice. Proof: AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).
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
- Request: `logics/request/req_153_configurable_table_columns.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Configurable visible columns in data tables
- Keywords: backlog-groom, request, configurable visible columns in data tables, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Configurable visible columns in data tables.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_153_configurable_table_columns` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_153_configurable_table_columns.md`.
- Generated locally by logics-manager.
- Task `task_148_configurable_visible_columns_in_data_tables` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_148_configurable_visible_columns_in_data_tables`
