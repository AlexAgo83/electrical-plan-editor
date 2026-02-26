## item_367_wire_fuse_metadata_visibility_and_persistence_compatibility_across_wire_workflows - Wire fuse metadata visibility and persistence compatibility across wire workflows
> From version: 0.9.8
> Understanding: 94%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium-High
> Theme: Fuse metadata visibility after save and non-regression across persistence/export boundaries
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
If fuse metadata is saved but not visible in wire-focused UI or not preserved across persistence flows, users cannot reliably use the feature in real workflows.

# Scope
- In:
  - Surface fuse metadata in wire-focused UI (wire list/table and wire analysis/details surfaces), including a `Fuse` badge and linked catalog `manufacturerReference`.
  - Preserve `wire.protection` metadata across workspace persistence/import/export payloads.
  - Confirm backward compatibility for legacy payloads with no protection metadata.
  - Preserve referential integrity by aligning with catalog deletion blocking when a referenced fuse catalog item is in use.
  - Keep existing catalog CSV and network summary BOM CSV flows non-regressed (V1 BOM pricing integration for fuse wires is not required).
- Out:
  - Full fuse pricing/BOM integration into the existing catalog-backed BOM export
  - Dedicated 2D fuse iconography/callouts (optional follow-up)
  - Regression suite additions (handled in `item_368`)

# Acceptance criteria
- Saved fuse metadata is visible in at least one wire list surface and one wire analysis/detail surface.
- Fuse metadata visibility includes a `Fuse` indicator plus the linked catalog `manufacturerReference`.
- Workspace persistence/import/export retains fuse metadata without breaking legacy payloads.
- Existing catalog CSV and BOM CSV export workflows remain functional and unchanged in semantics.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_067`, `item_365`, `item_366`.
- Blocks: `item_368`, `task_065`.
- Related AC: AC4, AC5, AC6.
- References:
  - `logics/request/req_067_wire_protection_metadata_v1_fuse_kind_with_required_reference.md`
  - `src/app/components/workspace/ModelingSecondaryTables.tsx`
  - `src/app/components/workspace/AnalysisWireWorkspacePanels.tsx`
  - `src/app/AppController.tsx`
  - `src/store/index.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`
