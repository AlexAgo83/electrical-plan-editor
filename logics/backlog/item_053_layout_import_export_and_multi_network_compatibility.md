## item_053_layout_import_export_and_multi_network_compatibility - Layout Import/Export and Multi-Network Compatibility
> From version: 0.2.0
> Understanding: 99%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Layout Portability and Isolation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without explicit compatibility work, persisted layout coordinates can be lost during import/export, network duplication, or active-network switching, causing inconsistent user experience and state drift.

# Scope
- In:
  - Extend network file payload import/export to include layout coordinates.
  - Keep backward compatibility with files that do not carry layout state.
  - Ensure network switch/duplicate/import flows preserve per-network layout isolation.
  - Keep deterministic conflict handling intact while adding layout data.
- Out:
  - Cloud sync and remote merge workflows.
  - Non-JSON file formats.

# Acceptance criteria
- Import/export roundtrip preserves layout coordinates for supported payloads.
- Networks remain layout-isolated when switching active context.
- Duplicated/imported networks carry valid scoped layout state without cross-network bleed.
- Legacy files without layout data import safely with deterministic fallback placement.

# Priority
- Impact: High (data portability and multi-network reliability).
- Urgency: High before release closure of req_009.

# Notes
- Dependencies: item_050, item_025, item_026, item_027.
- Blocks: item_054.
- Related AC: AC2, AC6.
- References:
  - `logics/request/req_009_2d_layout_persistence_and_crossing_minimization.md`
  - `logics/request/req_004_network_import_export_file_workflow.md`
  - `src/adapters/portability/networkFile.ts`
  - `src/store/reducer/networkReducer.ts`
  - `src/store/networking.ts`
  - `src/tests/portability.network-file.spec.ts`
