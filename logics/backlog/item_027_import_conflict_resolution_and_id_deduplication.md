## item_027_import_conflict_resolution_and_id_deduplication - Import Conflict Resolution and ID Deduplication
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: High
> Theme: Data Integrity
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Imported data can collide with local `technicalId` values at network and entity level. Without deterministic conflict handling, imports become unsafe and non-repeatable.

# Scope
- In:
  - Detect `technicalId` conflicts for networks and owned entities during import.
  - Apply deterministic default strategy:
    - keep existing local data unchanged
    - import conflicting records with generated non-colliding ID suffix
  - Preserve internal references after deduplication (wire endpoints, segments, occupancy links).
  - Emit structured conflict report for UI layer.
- Out:
  - User-driven manual merge editor.
  - Destructive overwrite strategies.

# Acceptance criteria
- Conflicts are detected consistently on repeated imports.
- Generated fallback IDs are deterministic and non-colliding.
- Imported network remains internally coherent after deduplication.
- Existing local data is never destructively overwritten by default behavior.

# Priority
- Impact: Very high (critical for safe import in real datasets).
- Urgency: High after parser/validation.

# Notes
- Dependencies: item_014, item_016, item_026.
- Blocks: item_028, item_029.
- Related AC: AC4, AC5, AC6.
- References:
  - `logics/request/req_004_network_import_export_file_workflow.md`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`
  - `src/core/entities.ts`

