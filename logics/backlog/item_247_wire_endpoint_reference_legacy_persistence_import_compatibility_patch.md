## item_247_wire_endpoint_reference_legacy_persistence_import_compatibility_patch - Wire Endpoint Reference Legacy Persistence/Import Compatibility Patch
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium-High
> Theme: Backward-Compatible Normalization for Per-Side Wire Endpoint Reference Fields
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Older saves/imports predate per-side wire connection/seal references. Once the `Wire` contract adds these fields, legacy data must remain loadable without invented values or missing-field runtime issues.

# Scope
- In:
  - Patch persistence migration/normalization for legacy wires missing:
    - `endpointAConnectionReference`
    - `endpointASealReference`
    - `endpointBConnectionReference`
    - `endpointBSealReference`
  - Patch portability/import normalization with equivalent behavior.
  - Legacy behavior baseline:
    - missing fields normalize to absent/empty (`undefined` or chosen empty representation)
    - no invented defaults
  - Preserve backward-compatible loading/import behavior.
  - Follow existing migration/versioning conventions if schema updates require a bump.
  - Optional defense-in-depth:
    - normalize unexpected non-string legacy values to absent/empty safely.
- Out:
  - New UI display/export features for endpoint references.
  - Endpoint-type-specific restrictions.

# Acceptance criteria
- Legacy persisted workspaces without the new per-side endpoint reference fields load successfully.
- Legacy imported data without the fields normalizes successfully.
- No runtime wire objects remain invalid due to missing endpoint reference fields after normalization.
- Compatibility patching does not invent connection/seal references.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_041`, item_245.
- Blocks: item_248, item_249.
- Related AC: AC3, AC5, AC6.
- References:
  - `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
  - `src/adapters/persistence/migrations.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`

