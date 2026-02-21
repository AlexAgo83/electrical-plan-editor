## item_025_network_export_schema_and_serializer - Network Export Schema and Serializer
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Data Portability Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Export cannot be reliable without a strict payload contract and deterministic serializer. Ad-hoc export logic would create unstable files and break re-import compatibility.

# Scope
- In:
  - Define export file schema for network payloads (single and multi-network batches).
  - Include metadata fields (`schemaVersion`, `exportedAt`, source/app metadata).
  - Implement deterministic JSON serialization order for stable outputs.
  - Support export actions for active network, selected networks, and all networks.
- Out:
  - Import parsing and migration logic.
  - UI workflows for selecting files and displaying import reports.

# Acceptance criteria
- Exported file structure is formally defined and versioned.
- Export output is deterministic for unchanged input state.
- Export includes all required network-owned entities and state needed for valid re-import.
- Export operation does not mutate in-memory application state.

# Priority
- Impact: Very high (base contract for all import/export work).
- Urgency: Immediate (must be delivered first).

# Notes
- Dependencies: item_014, item_017.
- Blocks: item_026, item_027, item_028, item_029.
- Related AC: AC1, AC5.
- References:
  - `logics/request/req_004_network_import_export_file_workflow.md`
  - `src/core/schema.ts`
  - `src/store/selectors.ts`
  - `src/adapters/persistence/localStorage.ts`

