## item_327_catalog_analysis_row_navigation_to_connector_splice_modeling_and_reactive_usage_refresh - Catalog Analysis Row Navigation to Connector/Splice Modeling and Reactive Usage Refresh
> From version: 0.9.5
> Status: Done
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Enable navigation from Catalog analysis usage rows to connector/splice modeling flows with reactive updates
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Usage visibility alone is insufficient; users need fast navigation from a catalog item to linked connectors/splices for edits and troubleshooting.

# Scope
- In:
  - Add row click / `Go to` actions in Catalog analysis usage list.
  - Navigate to `Modeling` mode on the correct connector/splice sub-screen.
  - Focus/select the target entity and open the corresponding edit flow.
  - Keep Catalog analysis data reactive when connectors/splices are created/deleted/reassigned.
  - Ensure safe behavior when stale/broken references are encountered (no crash).
- Out:
  - Dedicated Analysis-screen navigation mode for this interaction.

# Acceptance criteria
- Catalog analysis rows navigate to the correct connector/splice in `Modeling`.
- Reactive usage updates reflect connector/splice create/delete/reassignment events.
- Broken/stale links do not crash the panel.

# Priority
- Impact: Medium-High.
- Urgency: Medium.

# Notes
- Dependencies: `req_055`, item_326.
- Blocks: item_328, item_332.
- Related AC: AC3, AC3a, AC5.
- References:
  - `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
  - `src/app/hooks/useCatalogHandlers.ts`
  - `src/app/hooks/useSelectionHandlers.ts`
  - `src/app/AppController.tsx`


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
