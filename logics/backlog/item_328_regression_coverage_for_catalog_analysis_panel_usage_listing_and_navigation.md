## item_328_regression_coverage_for_catalog_analysis_panel_usage_listing_and_navigation - Regression Coverage for Catalog Analysis Panel Usage Listing and Navigation
> From version: 0.9.5
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Regression tests for Catalog analysis panel layout, empty states, usage sections, and navigation to connector/splice flows
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Catalog analysis changes the screen composition and cross-screen navigation behavior. Without tests, regressions can easily break layout, usage listings, or row navigation.

# Scope
- In:
  - Add UI regression tests for Catalog analysis panel presence and composition.
  - Add tests for no-selection / no-usage empty states.
  - Add tests for usage sections (`Connectors`, `Splices`) and row identity rendering (`name` + `technicalId`).
  - Add navigation tests from Catalog analysis rows to connector/splice modeling edit flows.
  - Add refresh tests for reassignment/deletion updates.
- Out:
  - Validation catalog integrity rule coverage (req_053).

# Acceptance criteria
- Regression tests cover catalog analysis panel presence, listing, and empty states.
- Regression tests cover row identity and navigation to connector/splice modeling.
- Regression tests cover reactive update behavior after connector/splice changes.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_055`, item_326, item_327.
- Blocks: item_332.
- Related AC: AC1-AC5.
- References:
  - `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
  - `src/tests/app.ui.catalog.spec.tsx`
  - `src/tests/app.ui.navigation-canvas.spec.tsx`


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The `Catalog` screen includes an analysis panel/column consistent with other modeling screens.
- request-AC2 -> This backlog slice. Evidence needed: Selecting a catalog item displays linked `Connectors` and `Splices` that reference that item.
- request-AC3 -> This backlog slice. Evidence needed: Analysis entries support navigation to the corresponding connector/splice edit flow.
- request-AC4 -> This backlog slice. Evidence needed: The analysis panel handles no-selection and no-usage cases with clear empty states.
- request-AC5 -> This backlog slice. Evidence needed: Catalog CRUD behavior and catalog-first connector/splice creation workflow remain functional after the layout change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
