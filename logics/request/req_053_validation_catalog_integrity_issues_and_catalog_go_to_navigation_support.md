## req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support - Validation: Catalog Integrity Issues and Catalog Go-to Navigation Support
> From version: 0.9.5
> Understanding: 97%
> Confidence: 95%
> Complexity: Medium
> Theme: Extend the Validation screen to detect and navigate catalog-related integrity issues introduced by req_051 catalog-first modeling
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- The Validation screen currently does not surface issues related to `Catalog` items or broken `catalogItemId` references introduced by `req_051`.
- Catalog errors are only handled via form validation and reducer guards, which is insufficient for corrupted legacy/imported data or cross-entity integrity audits.
- Users need validation visibility and `Go to` navigation for catalog-related issues in the same workflow as other modeling validation categories.

# Context
`req_051` introduced a network-scoped `Catalog` and catalog-first creation flow for `Connectors` and `Splices`, using `catalogItemId` links. This adds a new integrity surface area:
- missing or broken `catalogItemId` references,
- corrupted catalog items (invalid `manufacturerReference`, invalid `connectionCount`, invalid URL),
- inconsistent derived connector/splice capacities vs linked catalog `connectionCount`.

The current Validation pipeline does not inspect `catalogItems`, and `ValidationIssue.selectionKind` does not support `catalog`, so these problems do not appear in the Validation UI.

# Objective
- Add catalog-aware validation rules in the Validation screen pipeline.
- Surface catalog integrity issues in clear groups/chips with `Go to` actions.
- Support navigating from Validation to the `Catalog` screen and selecting the relevant catalog item when applicable.
- Preserve backward compatibility while helping users repair corrupted imported/legacy states.

# Functional scope
## A. Validation issue model support for Catalog targets (high priority)
- Extend validation issue targeting so issues can point to a `Catalog` item.
- Add `catalog` support in validation selection/navigation typing (e.g. `ValidationIssue.selectionKind`).
- Ensure `Go to` actions can route to the `Catalog` modeling sub-screen and open/select the relevant item.

## B. Catalog integrity validation rules (high priority)
- Extend `buildValidationIssues(...)` (or equivalent validation aggregation pipeline) to inspect network-scoped `catalogItems`.
- Add validation issues for corrupted catalog item records loaded from persistence/import, including at minimum:
  - missing/empty `manufacturerReference` after trim,
  - duplicate `manufacturerReference` within the same network catalog,
  - invalid `connectionCount` (non-integer or `< 1`),
  - invalid `URL` format when non-empty (must be absolute `http://` or `https://` URL, consistent with `req_051`).
- Group/label these issues in a user-readable category (recommended: `Catalog integrity`).

## C. Connector/Splice catalog-link integrity rules (high priority)
- Add validation issues for connector/splice records related to catalog linkage, including at minimum:
  - missing `catalogItemId` where a catalog-first link is expected,
  - `catalogItemId` points to a missing catalog item,
  - linked catalog item exists but connector/splice derived capacity is inconsistent with catalog `connectionCount` (state corruption/import mismatch).
- Validation wording should help users understand whether they must:
  - repair the catalog item,
  - reassign connector/splice catalog selection,
  - or recreate missing catalog entries.

## D. Validation navigation behavior (high priority)
- `Go to` from catalog-targeted issues must:
  - switch to the `Catalog` screen,
  - select the corresponding catalog item,
  - open the edit panel if that is the existing screen pattern.
- `Go to` from connector/splice catalog-link issues should continue to open the connector/splice entity (recommended default), unless the issue is explicitly catalog-item-targeted.
- Navigation behavior must remain consistent in desktop nav row and drawer/mobile navigation modes.

## E. Backward compatibility and legacy/import interplay (medium priority)
- Validation must work with:
  - post-`req_051` data,
  - legacy data that may still contain unresolved connector/splice records without `catalogItemId`,
  - imported data with partial corruption.
- If `req_052` (generated placeholder refs for missing legacy manufacturer references) is implemented later, validation should remain compatible and not duplicate/contradict its fallback behavior.

## F. Samples and fixtures adaptation (medium priority)
- Update sample/demo network data and test fixtures as needed so validation coverage includes catalog-related integrity scenarios.
- Keep at least one valid sample path unchanged (no accidental regression to the default happy-path demo experience).
- Add targeted fixture variants (or focused test data builders) for corrupted catalog/link cases rather than overloading all shared samples with invalid data.
- Ensure import/export portability fixtures remain representative for catalog-link validation cases when applicable.

# Non-functional requirements
- Validation scan should remain performant for typical network sizes (no pathological nested scans when checking duplicates/links).
- Deterministic issue grouping and messages (avoid ordering churn between runs on unchanged data).
- No regressions to existing validation groups, filters, or `Go to` actions.

# Validation and regression safety
- Add/extend tests for:
  - catalog item with empty `manufacturerReference` -> validation issue appears
  - duplicate catalog `manufacturerReference` -> validation issue(s) appear deterministically
  - invalid catalog `connectionCount` -> validation issue appears
  - invalid catalog URL -> validation issue appears
  - connector/splice missing `catalogItemId` -> validation issue appears
  - connector/splice with broken `catalogItemId` -> validation issue appears
  - connector/splice capacity mismatch vs linked catalog `connectionCount` -> validation issue appears
  - `Go to` on catalog issue opens `Catalog` screen and selects the item
  - existing non-catalog validation behavior remains unchanged
- Add/adjust sample/fixture-based coverage for:
  - validation execution against sample/demo network data after catalog introduction
  - portability/import fixtures containing catalog integrity/link issues (or dedicated fixture variants)

# Acceptance criteria
- AC1: Validation pipeline inspects `catalogItems` and emits catalog integrity issues for invalid catalog records.
- AC2: Validation pipeline emits connector/splice catalog-link integrity issues (missing/broken/mismatched links).
- AC3: Validation UI exposes catalog-related issues in a clear category/filterable group without regressing existing validation groups.
- AC4: Validation `Go to` supports catalog-targeted issues by navigating to the `Catalog` screen and selecting the catalog item.
- AC5: Existing connector/splice/node/segment/wire validation behavior and navigation remain functional.
- AC6: Validation remains compatible with legacy/imported datasets that may include unresolved catalog links.
- AC7: Sample/demo datasets and test fixtures used by validation/import regression suites are updated (or extended with variants) to cover catalog-related validation without regressing the default valid sample flows.

# Out of scope
- New reducer-level catalog integrity rules (this request is about Validation surfacing, not store mutation constraints).
- Catalog bulk-repair UI or automatic repair actions from the Validation screen.
- Extending Validation to audit catalog business fields beyond integrity (e.g. pricing completeness policies).

# References
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_052_legacy_catalog_fallback_generate_deterministic_manufacturer_reference_when_missing.md`
- `src/app/hooks/validation/buildValidationIssues.ts`
- `src/app/types/app-controller.ts`
- `src/app/hooks/useValidationHandlers.ts`
- `src/tests/app.ui.validation-panel.spec.tsx`
- `src/store/sampleNetwork.ts`
- `src/store/sampleNetworkAdditionalDemos.ts`
- `src/tests/sample-network.fixture.spec.ts`
- `src/tests/portability.network-file.spec.ts`
