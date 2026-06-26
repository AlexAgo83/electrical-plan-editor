## req_157_reorder_table_columns - Reorder table columns via drag-and-drop
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 70%
> Complexity: Medium
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the user reorder columns in the various data tables.
- Goal: usability comfort, light UI personalization.

# Context
- Companion to [[req_153_configurable_table_columns]] (configurable visible columns), which explicitly listed reordering as out of scope — this slice owns it. Both rely on the same foundation.
- Same 5 tables: `src/app/components/workspace/ModelingPrimaryTables.tsx` (Connectors, Splices, Nodes) and `src/app/components/workspace/ModelingSecondaryTables.tsx` (Segments, Wires).
- Columns are currently hardcoded JSX; the lowest-risk path (shared with req_153) is a per-table column descriptor (id, label, locked, render) driving both header and body. Column order then becomes an ordered list of column ids.
- Persistence reuses the existing versioned UI-preferences store: `src/app/hooks/uiPreferencesStorage.ts` (+ `useAppControllerPreferencesState.ts`, `useAppControllerUiPreferencesBindings.ts`). Column order persists per table as a new versioned migration.

# Decisions
- Reordering mechanism: **drag-and-drop on the column headers** (native HTML5 drag).
- The identifier column (Name/ID, locked from hiding in req_153) is **reorderable like the others** — it stays non-hideable but can be moved.
- Order is persisted per-table in UI preferences (new versioned migration; safe default = the table's natural column order).

# Acceptance criteria
- AC1: In each table, the user can drag a column header to a new position and the column (header + body cells) moves accordingly.
- AC2: The identifier column can be moved like any other column (it remains always-visible / non-hideable per req_153).
- AC3: Column order persists across reloads via UI preferences (versioned migration, safe default = natural order).
- AC4: Reordering interoperates with column visibility ([[req_153_configurable_table_columns]]): hidden columns are skipped in display but their position is preserved if re-shown.
- AC5: Sorting and existing filter-driven conditional columns keep working after a reorder (no regression).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: drag-and-drop header reordering for all 5 tables, ordered-column-id state, persistence migration, interop with req_153 visibility.
- Out: column resizing; saved layout presets/views; reordering in the analysis synthesis tables (separate, unless folded in later); touch-drag polish beyond basic support.

# Risks / Open questions
- Shared dependency with req_153 on the per-table column-descriptor refactor — sequence so one introduces the descriptor model and the other builds on it (avoid double refactor). Recommend req_153 first, then this.
- Native HTML5 drag-and-drop ergonomics (drop indicators, keyboard accessibility) — define minimum acceptable interaction; consider arrow-key fallback for accessibility.
- Stable column-id scheme shared with req_153 so order and visibility key off the same ids and migrate together.
- Touch/mobile drag support is limited with native DnD — confirm whether mobile is in scope.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/components/workspace/ModelingPrimaryTables.tsx` (Connectors, Splices, Nodes)
- `src/app/components/workspace/ModelingSecondaryTables.tsx` (Segments, Wires)
- `src/app/hooks/uiPreferencesStorage.ts` (versioned UI prefs persistence)
- `src/app/hooks/useAppControllerPreferencesState.ts` / `controller/useAppControllerUiPreferencesBindings.ts`
- Related: [[req_153_configurable_table_columns]]

# AI Context
- Summary: Drag-and-drop header reordering for the 5 data tables, identifier column movable, persisted via the existing versioned UI-preferences store, sharing the column-descriptor model and column-id scheme with req_153.
- Keywords: column-reorder, drag-and-drop, table-columns, ui-preferences, edition-plan
- Use when: implementing column reordering in the modeling tables.
- Skip when: working on column resizing, presets, or the visibility engine itself (req_153).

# Backlog
- none
