## req_092_optional_catalog_association_for_splices - Optional catalog association for splices
> From version: 1.1.0
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Complexity: Medium
> Theme: Modeling contract alignment for splice real-world usage
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Allow `Splice` records to be created, edited, and persisted without a linked catalog item (`catalogItemId`).
- Keep existing catalog-linked splice flows fully supported.
- Avoid a breaking refactor while aligning the model with real usage where many splices do not map to a concrete product item.

# Context
- `req_051` established a strict catalog-first workflow for connectors and splices, including required catalog selection in splice forms.
- Team feedback indicates this strict rule is often not representative for splices: in many modeling cases, a splice exists functionally but is not tied to a concrete purchasable item.
- Current UX/validation forces users to select a catalog item even when it adds no value, creating friction and data that can be artificial.
- The request goal is to relax only splice catalog association, while preserving compatibility with existing saved data and existing catalog-backed splice use cases.
- Capacity semantics note: advanced splice capacity behavior (`bounded`/`unbounded`) is defined in `req_093`. This request focuses on catalog-link optionality.

# Objective
- Make splice-to-catalog association optional by design (`catalogItemId` can be empty for splices) without regressing existing catalog-driven flows.
- Preserve data integrity and deterministic behavior for both splice modes:
  - linked splice (with catalog item),
  - standalone splice (without catalog item).

# Scope
- In:
  - update splice form workflow to allow saving without catalog selection;
  - adjust splice validation so missing `catalogItemId` is no longer treated as an error for splices;
  - keep broken-link validation for splices that do provide `catalogItemId` but reference a missing catalog item;
  - keep catalog-derived splice behavior when a catalog item is selected (manufacturer reference + port count derivation);
  - ensure persistence/import/export paths accept and preserve splices with no catalog link;
  - add regression coverage for create/edit/save on both splice modes.
- Out:
  - changing connector behavior (connector catalog association remains required);
  - redesigning catalog domain or uniqueness rules;
  - changing BOM/fuse contracts outside splice-optional association handling.

# Locked execution decisions
- Decision 1: `Splice.catalogItemId` remains optional in the entity contract and is officially supported as a standard non-legacy state.
- Decision 2: Missing splice catalog link must not raise a validation issue by itself.
- Decision 3: If a splice has a non-empty `catalogItemId`, link validity and connection-count consistency checks still apply.
- Decision 4: Splice create/edit UX must provide an explicit "no catalog item" path without blocking submission.
- Decision 5: Existing linked splices and existing saved workspaces remain compatible with no forced migration.
- Decision 6: Connector catalog-link requirements are unchanged by this request.
- Decision 7: For unlinked splices, `portCount` is manually editable and remains required (`integer >= 1`).
- Decision 8: For unlinked splices, `manufacturerReference` stays empty (`undefined` canonical state) unless explicitly provided by existing flows; no auto-generated fallback value is introduced.
- Decision 9: When `req_093` capacity mode is present, Decision 7 applies only to `bounded` splices; `unbounded` capacity rules are governed by `req_093`.

# Functional behavior contract
- Splice form:
  - users can save a splice with no catalog selection;
  - when no catalog item is selected:
    - `portCount` is user-provided, manually editable, and required (`integer >= 1`) for bounded splice mode;
    - `manufacturerReference` remains empty/`undefined` by default (no generated placeholder/reference);
  - when a catalog item is selected, existing derivation behavior remains:
    - `manufacturerReference` from catalog item,
    - `portCount` from catalog `connectionCount`.
- Validation:
  - remove `splice-missing-catalog-link-*` error generation;
  - keep `splice-broken-catalog-link-*` and `splice-catalog-capacity-mismatch-*` checks when `catalogItemId` is present.
- Persistence and import/export:
  - loading, saving, and importing state with splice `catalogItemId` omitted must be valid and stable;
  - linked and unlinked splice states must both round-trip without corruption.
- Catalog interactions:
  - deleting a catalog item referenced by at least one splice remains blocked;
  - unlinked splices do not participate in catalog-link constraints.

# Acceptance criteria
- AC1: A splice can be created and saved without selecting a catalog item.
- AC2: Without catalog selection, bounded splice `portCount` is manually editable and save is blocked when `portCount` is not an integer `>= 1` (unbounded mode rules are defined in `req_093`).
- AC3: Without catalog selection, splice `manufacturerReference` is not auto-generated and persists as empty/`undefined` by default.
- AC4: A splice can still be created/edited with a catalog item; derived manufacturer reference and port count behavior remains unchanged.
- AC5: Connector behavior is unchanged: connector `catalogItemId` remains required.
- AC6: Validation no longer emits an error solely because a splice has no `catalogItemId`.
- AC7: Validation still emits errors for broken splice catalog references and splice/catalog connection-count mismatches when `catalogItemId` is present.
- AC8: Existing data with linked splices remains compatible and non-regressed.
- AC9: Persistence/import round-trip supports mixed datasets (linked and unlinked splices) without data loss.
- AC10: Relevant lint/typecheck/tests pass after the change.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted regression focus:
  - splice form create/edit with and without catalog selection,
  - validation issue generation rules for splice catalog links,
  - persistence/import compatibility for unlinked splices.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Mixed-mode splice behavior (linked vs unlinked) can introduce UI confusion if labels/hints are not explicit.
- Existing tests that assume mandatory splice catalog selection may fail and require intentional updates.
- BOM/reporting surfaces that implicitly expect catalog linkage for all splices must explicitly handle unlinked splices.

# Backlog
- To create from this request:
  - `item_461_splice_form_optional_catalog_selection_and_submit_path.md`
  - `item_462_validation_rules_relax_missing_splice_catalog_link_while_preserving_integrity_checks.md`
  - `item_463_persistence_and_import_round_trip_coverage_for_unlinked_splices.md`
  - `item_464_req_092_optional_splice_catalog_association_closure_and_traceability.md`

# References
- `src/core/entities.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
- `src/tests/app.ui.catalog.spec.tsx`
- `src/tests/portability.network-file.spec.ts`
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_093_splice_unbounded_port_mode_with_adaptive_port_rendering.md`
