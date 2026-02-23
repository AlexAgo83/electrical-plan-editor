## item_233_legacy_wire_section_backward_compat_patch_for_persistence_and_import_paths - Legacy Wire Section Backward-Compat Patch for Persistence and Import Paths
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: High
> Theme: Backward-Compatible Wire `sectionMm2` Normalization for Legacy Saves and Imports
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Older saved/imported data predates `Wire.sectionMm2`. Once the field becomes required, legacy loads/imports can produce `undefined` wire sections or fail normalization unless compatibility patching is added.

# Scope
- In:
  - Patch persistence migration/normalization so legacy wires missing `sectionMm2` are assigned `0.5` (`mm²`) during load/restore.
  - Patch file import/portability normalization path(s) so imported legacy data also receives `sectionMm2` when missing.
  - Ensure fallback normalization uses a constant compatibility baseline (`0.5`) and does not depend on current user preference.
  - Preserve backward-compatible loading behavior and diagnostics/version semantics consistent with current migration framework.
  - Implement/document schema version bump only if required by current persistence design.
  - Optional defense-in-depth: normalize missing `sectionMm2` on save/write/export if absent unexpectedly.
- Out:
  - Migrating legacy wires to user-configured default section values.
  - Bulk rewriting already-loaded valid wires with explicit `sectionMm2`.
  - New UI behavior beyond compatibility needs.

# Acceptance criteria
- Legacy local persisted workspace snapshots lacking wire section load successfully and normalize wire `sectionMm2` to `0.5`.
- Legacy imported/file-based data lacking wire section normalizes `sectionMm2` to `0.5`.
- No runtime `Wire` in normalized app state remains without `sectionMm2`.
- Compatibility normalization is independent of current user settings preference value.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_038`, item_230.
- Blocks: item_234.
- Related AC: AC6, AC7, AC8.
- References:
  - `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`

