## item_321_validation_catalog_target_selection_kind_and_go_to_navigation_support - Validation Catalog Target Selection Kind and Go-to Navigation Support
> From version: 0.9.5
> Status: Done
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Extend validation issue target typing/navigation to support catalog items and preserve correct go-to behavior for connector/splice catalog-link issues
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Validation cannot currently target `Catalog` items, so catalog integrity issues cannot use native `Go to` navigation. Catalog-link issues also need explicit go-to semantics to avoid opening the wrong screen.

# Scope
- In:
  - Extend validation issue target typing to support `catalog`.
  - Add catalog selection navigation support for Validation `Go to`.
  - Route catalog-targeted issues to `Catalog` modeling sub-screen and select the matching item.
  - Preserve connector/splice-targeted catalog-link issue behavior (open affected connector/splice record).
  - Keep drawer/desktop navigation behavior consistent.
- Out:
  - Validation rule generation for catalog integrity (handled in item_322).

# Acceptance criteria
- Validation issues can target catalog items.
- `Go to` on catalog-targeted issues opens `Catalog` and selects the item.
- `Go to` on connector/splice catalog-link issues opens the affected connector/splice (not `Catalog`).
- Existing non-catalog validation `Go to` flows remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_053`, `req_051`.
- Blocks: item_322, item_323, item_332.
- Related AC: AC2, AC4, AC5.
- References:
  - `logics/request/req_053_validation_catalog_integrity_issues_and_catalog_go_to_navigation_support.md`
  - `src/app/types/app-controller.ts`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Validation pipeline inspects `catalogItems` and emits catalog integrity issues for invalid catalog records.
- request-AC2 -> This backlog slice. Evidence needed: Validation pipeline emits connector/splice catalog-link integrity issues (missing/broken/mismatched links).
- request-AC3 -> This backlog slice. Evidence needed: Validation UI exposes catalog-related issues in a clear category/filterable group without regressing existing validation groups.
- request-AC4 -> This backlog slice. Evidence needed: Validation `Go to` supports catalog-targeted issues by navigating to the `Catalog` screen and selecting the catalog item.
- request-AC5 -> This backlog slice. Evidence needed: Existing connector/splice/node/segment/wire validation behavior and navigation remain functional.
- request-AC6 -> This backlog slice. Evidence needed: Validation remains compatible with legacy/imported datasets that may include unresolved catalog links.
- request-AC7 -> This backlog slice. Evidence needed: Sample/demo datasets and test fixtures used by validation/import regression suites are updated (or extended with variants) to cover catalog-related validation without regressing the default valid sample flows.
- request-AC8 -> This backlog slice. Evidence needed: Duplicate catalog `manufacturerReference` validation emits one issue per offending catalog item (deterministic ordering), each with a usable `Go to` target.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
