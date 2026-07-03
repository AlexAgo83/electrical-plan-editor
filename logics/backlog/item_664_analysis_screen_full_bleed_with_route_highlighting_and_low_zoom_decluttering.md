## item_664_analysis_screen_full_bleed_with_route_highlighting_and_low_zoom_decluttering - Analysis screen full-bleed with route highlighting and low-zoom decluttering
> From version: 1.18.1
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0%
> Complexity: High
> Theme: Canvas-first workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- **BRANCH RULE: implement on the dedicated branch `feat/canvas-fullbleed`, never on `main` — this experiment may not be validated and must be droppable by deleting the branch. See `task_160` Implementation notes before writing any code.**
- Analysis is the biggest payoff of the model: the graph already supports highlighted wires/routes, but the highlight lives inside a boxed panel next to tables instead of lighting up the actual network on screen.
- At real scale the fit lands near 23% zoom: dimension labels turn to noise, a five-connector co-located cluster overlaps unreadably, and flat lists of attached entities exceed what any dock can show.
- Entity lists across five analysis sub-screens (connectors, wires, splices, nodes, segments) each frame their own tables, multiplying navigation instead of funneling through one canvas.

# Scope
- In:
  - Extend the canvas-bleed token to the Analysis screen: entity lists in the left dock with search and entity-type filter chips, analysis detail sheets in the right-dock drill-in (built on the dock content system), route/entity highlighting rendered on the background canvas.
  - Zoom-level decluttering on the summary canvas: hide dimension labels below a zoom threshold, soften splice labels, collapse co-located connector clusters into a count badge below a threshold with expansion on zoom-in or click.
  - Selection loop: choosing an entity in the left dock or on the canvas centers/highlights it and opens its sheet; wire selection lights the full route across the background.
  - Validate the whole screen against a real-scale network (30+ connectors, 150+ wires, 18+ splices) and record findings in the closeout.
  - Add the flag-on regression pass for Analysis (selection loop, highlighting, decluttering thresholds).
- Out:
  - Validation, Harness Assembly, and Modeling screen conversions (later requests; audit verdicts recorded in the product brief).
  - The Cmd+K palette and icon rail (navigation chrome, separate effort).
  - Changes to analysis computations or route models — presentation only.

# Acceptance criteria
- AC1: Flag on, every Analysis sub-screen renders full-bleed: left-dock lists with type chips and search, right-dock drill-in sheets, canvas as background; flag off, the current Analysis layout is untouched.
- AC2: Selecting a wire highlights its complete route on the background canvas while its sheet opens in the dock; selecting from the canvas drives the same loop.
- AC3: Below the decluttering thresholds, dimension labels hide and co-located connector clusters render as a count badge that expands on zoom or click; above the thresholds, current rendering is unchanged.
- AC4: The real-scale validation run is recorded with screenshots at fit zoom, confirming readable orientation at ~23% zoom on a 30-connector/150-wire network.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Flag on, every Analysis sub-screen renders full-bleed: left-dock lists with type chips and search, right-dock drill-in sheets, canvas as background; flag off, the current Analysis layout is untouched.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)
- Request: `req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui`
- Primary task(s): `task_160_orchestrate_the_canvas_first_workspace_shell`

# AI Context
- Summary: Analysis screen full-bleed with route highlighting and low-zoom decluttering
- Keywords: scaffolded-backlog, analysis screen full-bleed with route highlighting and low-zoom decluttering, implementation-ready
- Use when: Implementing the scaffolded slice for Analysis screen full-bleed with route highlighting and low-zoom decluttering.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
