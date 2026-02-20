## req_001_v1_ux_ui_operator_workspace - UX/UI V1 Operator Workspace Overhaul
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: UX/UI Information Architecture
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve the whole application UX/UI so electrical modeling and routing workflows are faster, clearer, and less error-prone.
- Replace fragmented screen switching with a consistent operator workspace where modeling and analysis happen in one continuous flow.
- Keep technical rigor (technical IDs, occupancy, route constraints, validation) visible at all times without overloading users.

# Context
The current V1 is functionally complete but interaction cost is still high:
- Entity management is distributed across multiple panels and selectors.
- The 2D network view is present but not yet the central workspace.
- Editing actions and validation feedback are not grouped around user intent (select, edit, connect, route, validate).

This request introduces a UX/UI redesign focused on speed, readability, and deterministic operations for electrical design users.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Build a persistent, task-oriented navigation model.
- Make the 2D network canvas the center of the experience.
- Provide a single contextual inspector for create/edit operations.
- Surface validation continuously while users model the network.
- Improve list ergonomics (sort/search/filter/actions) for all entities.

## Functional Scope
### Navigation and information architecture
- Replace `Screen` and `Sub-screen` dropdown selectors with a persistent left navigation.
- Top-level sections:
  - `Modeling`
  - `Analysis`
  - `Validation`
  - `Settings`
- Preserve current domain entities (`Connector`, `Splice`, `Node`, `Segment`, `Wire`) as sub-views within this navigation.

### Workspace layout
- Introduce a fixed 3-column workspace pattern:
  - Left: entity list + filters + quick actions.
  - Center: interactive 2D network canvas.
  - Right: contextual inspector (details, edit form, constraints, route actions).
- Keep the canvas visible in all modeling sub-views.

### Contextual editing and actions
- Move create/edit forms into the right inspector to avoid context switches.
- Support explicit interaction modes on canvas:
  - `Select`
  - `Add Node`
  - `Add Segment`
  - `Connect`
  - `Route`
- Add global `Undo` / `Redo` and autosave state indicator (`Saved`, `Unsaved`, `Error`).

### Lists and data ergonomics
- For all entity lists, keep sortable headers and add fast text search.
- Add filter chips (kind/status/sub-network/occupancy depending on entity).
- Keep `Name` as primary text and `Technical ID` as secondary monospace text.
- Ensure row actions are consistent across entities (`Select`, `Edit`, `Delete`, context-specific actions).

### Canvas and visual system
- Improve network canvas interactions:
  - Pan and zoom.
  - Optional subtle grid.
  - Snap-to-grid toggle.
  - Persistent legend for node/segment/wire states.
- Keep selected wire route highlighting and improve contrast for selected vs highlighted vs default.

### Validation UX
- Add a dedicated `Validation` screen with grouped issues:
  - Occupancy conflicts.
  - Missing route / invalid route lock.
  - Invalid segment/node references.
  - Incomplete mandatory fields.
- Each validation issue must offer `go to entity` navigation and focus the relevant context.

## Acceptance criteria
- AC1: Users can navigate all main workflows from persistent left navigation without using dropdown screen selectors.
- AC2: The 2D network canvas remains visible while creating/editing connectors, splices, nodes, segments, and wires.
- AC3: The inspector supports create/edit for all core entities and keeps technical constraints visible.
- AC4: Undo/redo and autosave status are visible and operational for modeling actions.
- AC5: Entity lists support at minimum sort + search, and preserve technical ID readability.
- AC6: Validation view groups issues and supports one-click navigation to impacted entities.
- AC7: Existing routing, occupancy, and deterministic behavior remain unchanged functionally.

## Non-functional requirements
- No regression on local-first behavior and persistence schema guarantees.
- Keep deterministic behavior for routing and tie-break logic.
- Maintain keyboard accessibility for navigation and critical actions.
- Responsive behavior must remain usable on desktop and laptop resolutions.

## Out of scope
- New routing mathematics or alternative shortest path algorithms.
- 3D geometry, bend radius, or manufacturing-specific physical constraints.
- BOM/export redesign in this wave.

# Backlog
- To create from this request:
  - `item_009_v1_workspace_navigation_and_layout_refactor.md`
  - `item_010_v1_contextual_inspector_and_interaction_modes.md`
  - `item_011_v1_canvas_usability_zoom_pan_grid_and_legend.md`
  - `item_012_v1_validation_center_and_issue_navigation.md`
  - `item_013_v1_list_ergonomics_search_filter_action_consistency.md`

# References
- `logics/request/req_000_kickoff_v1_electrical_plan_editor.md`
- `logics/tasks/task_000_v1_backlog_orchestration_and_delivery_control.md`
- `README.md`
