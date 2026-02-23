## item_238_legacy_wire_color_backward_compat_patch_for_persistence_import_and_portability_paths - Legacy Wire Color Backward-Compat Patch for Persistence, Import, and Portability Paths
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Backward-Compatible Normalization of Wire Color Fields for Legacy Data
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Older saves/imports contain wires without color fields. Once wire color references are introduced, legacy data can fail normalization or produce undefined wire color properties unless compatibility patching is added.

# Scope
- In:
  - Patch persistence migration/normalization for legacy wires missing color fields:
    - `primaryColorId -> null`
    - `secondaryColorId -> null`
  - Patch portability/import normalization paths with the same compatibility behavior.
  - Ensure compatibility logic does not invent color defaults for legacy wires (no implicit `BK` backfill).
  - Preserve deterministic portability by continuing to resolve labels/hex from canonical in-app catalog.
  - Implement/document schema version bump only if required by current migration framework.
  - Optional defense-in-depth:
    - normalize invalid legacy combinations (`secondary` without `primary`) during migration/import.
- Out:
  - Assigning default colors to legacy wires.
  - User-configurable color catalogs.
  - New UI color behaviors beyond compatibility support.

# Acceptance criteria
- Legacy persisted workspaces lacking wire color fields load successfully with `primaryColorId=null` and `secondaryColorId=null`.
- Legacy imported/portable data lacking wire color fields normalizes to the same no-color state.
- Compatibility patching does not invent a default wire color for existing wires.
- No normalized runtime `Wire` object remains missing color fields after load/import.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_039`, item_235, item_236.
- Blocks: item_239.
- Related AC: AC6, AC7, AC8.
- References:
  - `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`

