## item_448_req_088_export_quality_validation_matrix_and_closure_traceability - req 088 export quality validation matrix and closure traceability
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`req_088` has UX, runtime export, and persistence facets. Closure requires explicit AC proof, especially around vector quality and single-button behavior.

# Scope
- In:
  - run closure validation matrix for req_088 AC1-AC8.
  - compile AC-to-evidence mapping for items 445-447.
  - update request/backlog/task statuses at closure.
  - document residual limitations for SVG consumer compatibility if observed.
- Out:
  - additional export formats or follow-up features.

# Acceptance criteria
- AC1: Required quality gates pass (`lint`, `typecheck`, `test:ci`, `logics_lint`).
- AC2: Traceability links each req AC to concrete code and tests.
- AC3: Closure confirms single export button + setting-driven format behavior.
- AC4: Documentation statuses/progress are synchronized at completion.

# AC Traceability
- AC1 -> command evidence log.
- AC2 -> outputs from item_445/item_446/item_447.
- AC3 -> `src/app/components/NetworkSummaryPanel.tsx` markup/handler evidence.
- AC4 -> `logics/request/req_088_*.md` and related backlog/task docs.
- request-AC1 -> This backlog slice. Evidence needed: `Canvas tools preferences` includes an export format selector with `SVG` and `PNG`.
- request-AC2 -> This backlog slice. Evidence needed: Default export format is `SVG` when no prior preference exists.
- request-AC3 -> This backlog slice. Evidence needed: Export action produces an SVG file when `SVG` is selected.
- request-AC4 -> This backlog slice. Evidence needed: Export action produces a PNG file when `PNG` is selected.
- request-AC5 -> This backlog slice. Evidence needed: SVG export output remains visually sharp at high zoom (vector quality; no raster blur from export pipeline).
- request-AC6 -> This backlog slice. Evidence needed: Export format preference persists and restores across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: Existing PNG background inclusion behavior remains functional for PNG mode.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

# Priority
- Impact: High (release readiness).
- Urgency: Medium (end-of-wave item).

# Notes
- Risks:
  - inadequate proof for vector quality may delay closure.
  - doc traceability drift can reduce auditability.
- References:
  - `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
  - `logics/backlog/item_445_canvas_tools_export_format_preference_svg_png_with_svg_default.md`
  - `logics/backlog/item_446_network_summary_export_action_format_switch_and_svg_download_path.md`
  - `logics/backlog/item_447_export_preferences_persistence_and_png_background_option_compatibility.md`
