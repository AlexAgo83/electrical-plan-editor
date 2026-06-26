## req_153_configurable_table_columns - Configurable and reorderable columns in data tables
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Complexity: Medium
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the user choose which columns are visible in each data table (e.g. section, color, twist group, number of ways, etc.) AND reorder them.
- Goal: better readability per business context, less visual noise, light UI personalization.
- **Merged slice**: this request now owns both column **visibility** and column **reordering**. The reordering need ([[req_157_reorder_table_columns]]) is folded in here because both require the same per-table column-descriptor refactor — splitting them would mean refactoring the 5 tables twice (decision recorded 2026-06-26).

# Context
- 5 tables exist:
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`: Connectors, Splices, Nodes.
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`: Segments, Wires.
- Columns are currently **hardcoded as JSX** (`<th>/<td>`), not described by a column-config array. Making columns toggleable cleanly requires either guarding each cell with a visibility check or refactoring each table to a data-driven column list.
- Conditional columns already exist but are driven by filters, not user choice (`showNodeKindColumn` at `ModelingPrimaryTables.tsx:145`, `showSegmentSubNetworkColumn` at `ModelingSecondaryTables.tsx:235`, `showWireRouteModeColumn` at `:236`). Research confirms these flags are computed purely from filter state and applied via conditional JSX — they are **not entangled with filtering logic**, so they fold cleanly into the column-descriptor model as a `visibleWhen`/computed flag. (no longer an open question)
- Each table already has per-table sort state synced to global prefs (`connectorTableSort` `ModelingPrimaryTables.tsx:205-211`, `spliceTableSort` `:212-218`; `segmentTableSort`/`wireTableSort` `ModelingSecondaryTables.tsx:256-269`). Sort keys off **field names**, so the descriptor MUST preserve a stable `field` per column — reorder/hide must not remap sort. (constraint, resolved)
- UI preferences persistence already exists: `src/app/hooks/uiPreferencesStorage.ts` (versioned localStorage `electrical-plan-editor.ui-preferences.v1` + migrations), in-memory state `useAppControllerPreferencesState.ts`, binding `useAppControllerUiPreferencesBindings.ts`. → both column visibility AND order live here as one new migration (per-table ordered list of column ids + hidden set); nothing new to build for storage.

# Decisions
- **Combined slice**: deliver visibility + reordering together on one per-table column-descriptor refactor (`{ id, field, label, locked, render }`). Driving both header and body from the descriptor list makes hide and reorder fall out of the same model. (decision 2026-06-26)
- Each table keeps its **identifier column locked from hiding** (Name / ID always visible) but it **is reorderable** like the others.
- UI visibility: a **"Columns ▾" button per table** opening a checkbox menu (per-table, discoverable). Follow existing per-table header controls.
- UI reordering: **drag-and-drop on the column headers, desktop mouse only** (native HTML5 DnD). No keyboard or touch fallback in this slice. (decision 2026-06-26)
- Scope: **all 5 tables** (Connectors, Splices, Nodes, Segments, Wires) in this slice.
- Column visibility AND order are persisted per-table in UI preferences (one new versioned migration in `uiPreferencesStorage.ts`; safe default = natural order, all visible).
- Filter-driven conditional columns (`showNodeKindColumn` etc.) are generalized into the descriptor as computed visibility, not a parallel mechanism.

# Acceptance criteria
- AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- AC3: The identifier column (Name/ID) is not offered as hideable and always renders.
- AC4: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).
- AC6: In each table, the user can drag a column header to a new position; header + body cells move together; the identifier column is movable.
- AC7: Column order persists across reloads via the same UI-preferences migration; reorder interoperates with hiding (a hidden column keeps its position when re-shown).
- AC8: Sorting keeps working after hide/reorder (sort stays keyed by column field, not position).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: per-table column-descriptor refactor (5 tables); "Columns ▾" visibility picker; desktop drag-and-drop header reordering; combined visibility+order persistence migration; generalize filter-driven conditional columns into the descriptor.
- Out: column resizing; saved column presets/views; export honoring visibility/order; keyboard and touch DnD (desktop mouse only); reordering in the analysis synthesis tables (separate, unless folded later).

# Risks / Open questions
- Each table's hardcoded JSX (`ModelingPrimaryTables.tsx` header `621-779`/body `782-861`; `ModelingSecondaryTables.tsx` segments/wires) must move to the descriptor — a real but bounded refactor across 5 tables; doing it once for both visibility and order is the whole reason for the merge. (accepted)
- Stable column-id scheme keys both order and visibility and the persistence migration; ids must stay constant across renames. (design constraint, not a blocker)
- RESOLVED — filter-driven conditional columns fold into the descriptor (flags computed from filter state, not entangled with filtering logic).
- RESOLVED — sort is field-based; descriptor carries a stable `field` so hide/reorder never remap sort.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/components/workspace/ModelingPrimaryTables.tsx` (Connectors, Splices, Nodes)
- `src/app/components/workspace/ModelingSecondaryTables.tsx` (Segments, Wires)
- `src/app/hooks/uiPreferencesStorage.ts` (versioned UI prefs persistence)
- `src/app/hooks/useAppControllerPreferencesState.ts` (in-memory prefs state)
- `src/app/hooks/controller/useAppControllerUiPreferencesBindings.ts` (prefs binding)

# AI Context
- Summary: Combined slice — per-table column-descriptor refactor of all 5 tables driving a "Columns ▾" visibility picker AND desktop drag-and-drop header reordering, with visibility+order persisted in one new UI-preferences migration. Absorbs req_157.
- Keywords: table-columns, column-visibility, column-reorder, drag-and-drop, ui-preferences, edition-plan, readability
- Use when: implementing user-configurable column visibility and/or reordering in the modeling tables.
- Skip when: working on column resizing, presets, or export column selection.

# Backlog
- none
- `item_639_configurable_visible_columns_in_data_tables`
