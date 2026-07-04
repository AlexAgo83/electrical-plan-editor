## item_663_dock_content_system_container_queries_inspector_host_drill_in_stack - Dock content system: container queries, inspector host, drill-in stack
> From version: 1.18.1
> Schema version: 1.0
> Status: Archived
> Understanding: 95
> Confidence: 90
> Progress: 0
> Complexity: High
> Theme: Canvas-first workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- **BRANCH RULE: implement on the dedicated branch `feat/canvas-fullbleed`, never on `main` — this experiment may not be validated and must be droppable by deleting the branch. See `task_160` Implementation notes before writing any code.**
- Responsive panel styles key on @media viewport width (900 px breakpoint), so a panel placed in a 340 px dock on a wide screen keeps its wide layout and overflows; the app already owns narrow renderings but measures the wrong dimension.
- Detail chains today spread horizontally as stacked side-by-side panels; a dock cannot afford columns, so depth must replace width or the inspector becomes unusable.
- Embedded wide tables (an entity's attached wires, occupancy grids) physically cannot fit a dock; at real scale the densest connector carries 27 wires.

# Scope
- In:
  - Give docks container-type: inline-size and migrate the panel-level responsive rules consumed inside docks from @media to @container, including the ConfigurableTableColumns visible-column threshold.
  - Two fixed dock widths: ~340 px standard (analysis sheets), ~440 px wide (heavy entity forms); the dock picks per content type, no free resize.
  - Make InspectorContextPanel the right dock's single host: clickable breadcrumb, drill-in stack with Back/Escape navigation, accordion sections for sub-details, the drilled entity highlighted on the canvas.
  - Transformation rules as reusable dock primitives: embedded wide tables render as key-value rows with truncation ('view all' opens the real table as a central panel); 2D content (connector physical view, grids) is never docked — it stays a background mode or floating card.
  - Pinning: detach the current detail sheet as a small floating card to compare two entities without a second column.
- Out:
  - Converting the Modeling forms column or any screen's actual content to the dock — this item builds the system; screens adopt it in their own items.
  - The AI agent panel relocation (folds in when its screen converts).
  - Batch-selection floating bar (belongs to the screen that needs it).

# Acceptance criteria
- AC1: A panel rendered inside a 340 px dock on a wide viewport uses its narrow layout, driven by container width; the same panel full-width still renders wide.
- AC2: A three-level drill-in (entity, sub-entity, sub-sub-entity) navigates via breadcrumb clicks, Back, and Escape, with the parent entity staying highlighted on the canvas and never a third column.
- AC3: A sheet embedding a 27-row wide table shows truncated key-value rows with a working view-all escape to a central panel.
- AC4: A pinned sheet persists as a floating card while the dock navigates to another entity, and both remain readable and dismissable.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A panel rendered inside a 340 px dock on a wide viewport uses its narrow layout, driven by container width; the same panel full-width still renders wide.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- Archived on 2026-07-04: redesign idea rejected by product owner after visual review; implementation branch feat/canvas-fullbleed was deleted and no code from this chain should be pursued.

# Links
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)
- Request: `req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui`
- Primary task(s): `task_160_orchestrate_the_canvas_first_workspace_shell`

# AI Context
- Summary: Dock content system: container queries, inspector host, drill-in stack
- Keywords: scaffolded-backlog, dock content system: container queries, inspector host, drill-in stack, implementation-ready
- Use when: Implementing the scaffolded slice for Dock content system: container queries, inspector host, drill-in stack.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
