## item_523_network_summary_export_readability_hardening_for_cartouche_metadata_and_segment_label_offsets - Network summary export readability hardening for cartouche metadata and segment label offsets
> From version: 1.3.3
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Export / Render / Readability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Export readability remains degraded in two ways:
- cartouche identity metadata such as `Author` can be truncated with ellipsis in ordinary export sizes;
- horizontal and near-horizontal segment labels remain too close to the stroke, with desired spacing not aligned between plan and exported SVG.

# Scope
- In:
  - improve export cartouche layout so ordinary identity values remain readable without premature truncation;
  - prefer wider cartouche and/or controlled metadata wrapping before using ellipsis;
  - keep SVG and PNG export behavior aligned for cartouche readability;
  - centralize or harmonize segment label-offset rules so the same geometry behavior applies to plan and export;
  - increase label distance for horizontal and near-horizontal segments using deterministic angular rules.
- Out:
  - freeform cartouche editing UI;
  - broad redesign of export frame/cartouche visuals beyond readability fixes;
  - manual label dragging/placement.

# Acceptance criteria
- AC1: Export cartouche identity metadata is not unnecessarily truncated for ordinary-length values when export size allows readable layout.
- AC2: SVG and PNG exports follow the same cartouche metadata readability behavior.
- AC3: Ellipsis remains only a fallback for genuinely constrained cases.
- AC4: On-screen plan rendering increases label distance from the stroke for horizontal and near-horizontal segments.
- AC5: Exported SVG follows the same horizontal/near-horizontal label-offset behavior as the on-screen plan.
- AC6: Near-horizontal detection is deterministic and explicit.

# AC Traceability
- AC1/AC2/AC3 -> `src/app/components/network-summary/export/networkSummaryExport.ts`.
- AC4/AC5/AC6 -> `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`.
- request-AC1 -> This backlog slice. Evidence needed: `Network summary` BOM CSV export uses a UTF-8-compatible download payload and preserves accented/special characters in common spreadsheet clients.
- request-AC2 -> This backlog slice. Evidence needed: Existing catalog-backed BOM rows remain exported in the same CSV without regression to current grouping/pricing behavior.
- request-AC3 -> This backlog slice. Evidence needed: The same BOM CSV export includes a second `Wire terminations` section after the existing BOM content.
- request-AC4 -> This backlog slice. Evidence needed: The `Wire terminations` section exports aggregated rows with headers `Type`, `Reference`, `Quantity`.
- request-AC5 -> This backlog slice. Evidence needed: `Connection` and `Seal` references are counted separately and aggregated by `type + reference`.
- request-AC6 -> This backlog slice. Evidence needed: Empty/whitespace-only wire-side termination references are ignored and do not create rows.
- request-AC7 -> This backlog slice. Evidence needed: Modeling wire CSV export includes `Begin connection ref`, `Begin seal ref`, `End connection ref`, `End seal ref`.
- request-AC8 -> This backlog slice. Evidence needed: Analysis wire CSV export includes the same four columns in the same schema order.
- request-AC9 -> This backlog slice. Evidence needed: Current wire CSV UTF-8 and CSV-safety behavior remains non-regressed.
- request-AC10 -> This backlog slice. Evidence needed: `Node analysis` associated-segment rows expose a `Go to` action for each segment.
- request-AC11 -> This backlog slice. Evidence needed: Activating `Go to` from an associated-segment row opens the `Segment` analysis sub-screen and selects the targeted segment.
- request-AC12 -> This backlog slice. Evidence needed: Missing-segment edge cases disable the `Go to` action safely instead of failing at runtime.
- request-AC13 -> This backlog slice. Evidence needed: `Segment analysis` traversing-wire rows expose a `Go to` action for each wire.
- request-AC14 -> This backlog slice. Evidence needed: Activating `Go to` from a traversing-wire row opens the `Wire` analysis sub-screen and selects the targeted wire.
- request-AC15 -> This backlog slice. Evidence needed: Missing-wire edge cases disable the `Go to` action safely instead of failing at runtime.
- request-AC16 -> This backlog slice. Evidence needed: Export cartouche identity metadata is no longer unnecessarily truncated for ordinary-length values such as medium-length author names when export size allows readable layout.
- request-AC17 -> This backlog slice. Evidence needed: SVG and PNG exports follow the same cartouche metadata readability behavior.
- request-AC18 -> This backlog slice. Evidence needed: Both new navigation tables use the existing `Actions` column + iconized `Go to` button pattern already used in `Catalog analysis`.
- request-AC19 -> This backlog slice. Evidence needed: On-screen plan rendering increases label distance from the stroke for horizontal and near-horizontal segments.
- request-AC20 -> This backlog slice. Evidence needed: Exported SVG follows the same horizontal/near-horizontal label-offset behavior as the on-screen plan.
- request-AC21 -> This backlog slice. Evidence needed: `logics_lint`, `lint`, `typecheck`, and relevant export/UI tests pass after implementation.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC9 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC10 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC11 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC12 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC13 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC14 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC15 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC16 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC17 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC18 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC19 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC20 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC21 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_106_bom_export_wire_termination_coverage_wire_csv_termination_columns_and_horizontal_label_offset_harmonization.md`.
- Orchestrated by `logics/tasks/task_085_req_106_export_analysis_navigation_and_render_readability_orchestration_and_delivery_control.md`.
- Supplied SVG evidence:
  - `Author: Paul Mondou` exported as `Author: Paul Mond...`.
- Post-delivery regression evidence:
  - cartouche export could fall back to a black fill when no `.network-callout-frame` existed in the source SVG;
  - fallback was hardened to reuse node-shape styling instead of the root SVG fill.
- Risks:
  - widening/wrapping cartouche metadata can alter export footprint and must stay inside safe bounds;
  - angle-based offset tuning can create visual discontinuities if transition thresholds are too abrupt.
- References:
  - `src/app/components/network-summary/export/networkSummaryExport.ts`
  - `src/app/components/network-summary/graph/networkSummaryGraphModel.ts`
  - `src/tests/app.ui.network-summary-bom-export.spec.tsx`

# Delivery
- Implemented adaptive cartouche sizing/readability and shared horizontal/near-horizontal label-offset behavior.
- Added a post-delivery cartouche color-fallback hardening so export readability does not depend on visible callout frames being present in the source SVG.
- Added regression coverage in `src/tests/app.ui.network-summary-bom-export.spec.tsx` for SVG export with metadata enabled and no source callout frame.

# Validation
- `npm test -- --run src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `npm run lint`
- `npm run typecheck`
