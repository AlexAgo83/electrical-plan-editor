## req_153_configurable_table_columns - Configurable visible columns in data tables
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 70%
> Complexity: Medium
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the user choose which columns are visible in each data table (e.g. section, color, twist group, number of ways, etc.).
- Goal: better readability per business context, less visual noise.

# Context
- 5 tables exist:
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`: Connectors, Splices, Nodes.
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`: Segments, Wires.
- Columns are currently **hardcoded as JSX** (`<th>/<td>`), not described by a column-config array. Making columns toggleable cleanly requires either guarding each cell with a visibility check or refactoring each table to a data-driven column list.
- Conditional columns already exist but are driven by filters, not user choice (`showNodeKindColumn`, `showSegmentSubNetworkColumn`, `showWireRouteModeColumn`). → existing pattern to follow / generalize.
- UI preferences persistence already exists: `src/app/hooks/uiPreferencesStorage.ts` (versioned localStorage `electrical-plan-editor.ui-preferences.v1` + migrations), in-memory state `useAppControllerPreferencesState.ts`, binding `useAppControllerUiPreferencesBindings.ts`. → column-visibility prefs live here as a new migration; nothing new to build for storage.

# Decisions
- Each table keeps its **identifier column locked** (always visible: Name / ID); all other columns are hideable.
- UI: a **"Columns ▾" button per table** opening a checkbox menu (per-table, discoverable). Follow existing per-table header controls.
- Scope: **all 5 tables** (Connectors, Splices, Nodes, Segments, Wires) in this slice.
- Column visibility is persisted per-table in UI preferences (new versioned migration in `uiPreferencesStorage.ts`).

# Acceptance criteria
- AC1: Each table shows a "Columns ▾" control listing its hideable columns with checkboxes reflecting current visibility.
- AC2: Toggling a column immediately shows/hides it in that table without affecting other tables.
- AC3: The identifier column (Name/ID) is not offered as hideable and always renders.
- AC4: Column visibility persists across reloads via UI preferences (versioned migration, safe default = all visible).
- AC5: Existing filter-driven conditional columns keep working (no regression on kind/sub-network/route-mode behavior).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: per-table column picker UI, visibility state, persistence migration, applied to all 5 tables.
- Out: column reordering, column resizing, saved column presets/views, export honoring visibility (separate concerns).

# Risks / Open questions
- Each table's hardcoded JSX must be made visibility-aware; lowest-risk path is to introduce a per-table column descriptor (id, label, locked, render) and drive both header and body from it — a non-trivial refactor across 5 tables.
- Interaction with existing filter-driven conditional columns: decide whether they merge into the same column-descriptor model or stay separate.
- Need a stable column-id scheme to key persistence (renaming/removing a column must migrate gracefully).

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
- Summary: Per-table "Columns ▾" picker to toggle visible columns, identifier column locked, persisted via the existing versioned UI-preferences store, across all 5 data tables.
- Keywords: table-columns, column-visibility, ui-preferences, edition-plan, readability
- Use when: implementing user-configurable column visibility in the modeling tables.
- Skip when: working on column reordering/resizing or export column selection.

# Backlog
- none
