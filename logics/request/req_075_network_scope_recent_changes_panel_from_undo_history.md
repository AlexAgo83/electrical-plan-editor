## req_075_network_scope_recent_changes_panel_from_undo_history - Add a recent changes panel in Network Scope
> From version: 0.9.14
> Understanding: 97% (add a new panel between Network Scope and Edit network to show latest changes from Undo history tracking)
> Confidence: 95% (layout insertion is straightforward; history display requires enriching current undo snapshot tracking with readable metadata)
> Complexity: Medium
> Theme: Network-level observability and operator auditability
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- Network Scope currently shows network list and edit form but no visibility on recent modeling/catalog mutations.
- Operators need a quick audit trail to understand what changed recently without switching screens.
- The list must be based on the same tracked mutation flow used by Undo (not on ad-hoc logs).

# Context
- Network Scope screen layout currently renders:
  - `Network Scope` panel
  - `Edit network` / `Create network` panel
- Current file:
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- Current grid/layout styles:
  - `src/app/styles/workspace/workspace-panels-and-responsive/workspace-panels-and-actions.css`
- Undo/Redo tracking exists but stores state snapshots only:
  - `src/app/hooks/useStoreHistory.ts`
  - `src/app/AppController.tsx`

# Objective
- Insert a new panel between `Network Scope` and `Edit network`.
- Recommended wording for V1: `Recent changes` (clearer than “audit” for operators).
- Display the last `X` tracked mutations, ordered from most recent to oldest, aligned with Undo history tracking rules.

# Default decisions (V1)
- Panel title:
  - `Recent changes`.
- Placement:
  - In `Network Scope` screen only.
  - Located between existing `Network Scope` panel and `Edit network` panel.
- Data source contract:
  - Reuse Undo tracking scope: entries exist only for actions tracked in history (`trackHistory: true`).
  - UI-only actions excluded (same rule as Undo stack today).
  - Scope list to the active network only.
- Entry count:
  - Show last `10` entries by default (`X = 10`).
  - Newest first.
- Entry content (minimal but useful):
  - action label (human-readable),
  - target kind (network/catalog/connector/splice/node/segment/wire/layout),
  - optional target identifier when available,
  - timestamp (local short time, `HH:mm:ss`).
- Empty state:
  - If history count for active network is `0`, hide the panel entirely (no empty-state panel rendered).
- Undo/Redo line policy:
  - Do not render dedicated `Undo` or `Redo` rows.
  - Render only business mutations (create/update/delete/import...) tracked in history.
- Label verbosity:
  - Use detailed labels with identifier when available (example: `Wire W-001 updated`).

# Functional scope
## A. History metadata sidecar for display (high priority)
- Extend history tracking to keep a lightweight metadata stack in parallel to snapshot undo stack.
- Keep the metadata bounded by same history limit policy.
- Ensure Undo/Redo updates metadata stacks consistently.

## B. Network Scope panel insertion (high priority)
- Add a new panel component in `NetworkScopeWorkspaceContent` between existing panels.
- Render scrollable list for last `X` changes.
- Keep responsive behavior aligned with current grid breakpoints.
- Hide the panel when active-network recent history is empty.

## C. Copy and label mapping (medium-high priority)
- Map internal action types to readable labels (example: `wire/save` -> `Wire updated`).
- Keep labels deterministic and testable.

## D. Regression safety (medium priority)
- No change to undo/redo behavior itself.
- No change to mutation reducers/business rules.

# Non-functional requirements
- Bounded memory usage: no unbounded activity log growth.
- No expensive full-state diffing for V1.
- Keyboard/screen-reader readable structure for entries.

# Validation and regression safety
- Add/update tests to validate:
  - panel visibility and placement in Network Scope,
  - ordering (most recent first),
  - capped list size (`X`),
  - undo/redo synchronization of displayed entries,
  - panel hidden behavior when active-network history is empty.
- Run quality/test matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test -- src/tests/app.ui.networks.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.undo-redo-global.spec.tsx`
  - `npm run -s test:ci`

# Acceptance criteria
- AC1: Network Scope screen contains a `Recent changes` panel between `Network Scope` and `Edit network`.
- AC2: Panel lists last `10` tracked mutations for the active network, newest first.
- AC3: Listed entries are derived from Undo-tracked business mutations only (no standalone Undo/Redo rows).
- AC4: If active-network history size is `0`, the `Recent changes` panel is not rendered.
- AC5: Entries display local short time (`HH:mm:ss`) and include identifier-rich labels when available.
- AC6: Undo/Redo operations keep panel content coherent with current history state.

# Out of scope
- Full forensic/audit compliance logging.
- Persistent cross-session server audit trail.
- Deep visual diff of state before/after each change.

# References
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/styles/workspace/workspace-panels-and-responsive/workspace-panels-and-actions.css`
- `src/app/hooks/useStoreHistory.ts`
- `src/app/AppController.tsx`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.undo-redo-global.spec.tsx`
