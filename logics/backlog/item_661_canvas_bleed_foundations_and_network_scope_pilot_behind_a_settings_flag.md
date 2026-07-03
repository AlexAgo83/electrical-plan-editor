## item_661_canvas_bleed_foundations_and_network_scope_pilot_behind_a_settings_flag - Canvas-bleed foundations and Network Scope pilot behind a settings flag
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
- The canvas is a grid child inside workspace-content, so it can never act as the spatial background the workflows want; every screen frames it differently and selection lives in tables.
- Fit-to-content, zoom, and centering measure the canvas container; if the canvas becomes the full viewport with docks floating over it, all of them mis-target unless they learn about occluded edges.
- Any layout inversion attempted without a hard flag-off guarantee risks the working product for every user.

# Scope
- In:
  - Add a persisted canvasFullBleed boolean to the UI preferences (localStorage hydration like existing booleans) with a toggle in Settings, default off.
  - Emit a canvas-bleed token from the appShellClassName token list only when the flag is on and the active screen is Network Scope.
  - Write the mode CSS: under .app-shell.canvas-bleed the network summary canvas panel goes position: fixed; inset: 0; z-index 0; the Network Scope panels (network table left, scope form right) become floating dock cards; an overlay container uses pointer-events: none with panels restoring pointer-events: auto.
  - Implement dynamic safe-area insets: measure open dock widths and feed them to the viewport-size hook and fit-to-content so fit, zoom, and centering target the visible area; insets are zero when the flag is off.
  - Define unambiguous wheel routing: wheel over a dock scrolls the dock, wheel over the canvas zooms.
  - Dock collapse/expand with edge handles when collapsed.
  - Add a flag-on pass to the shell regression suite asserting callout and node dragging on Network Scope (acceptance test #1), plus the safe-area fit assertions; the existing flag-off suite stays untouched and green.
- Out:
  - Any other screen (Analysis, Validation, Harness Assembly, Modeling).
  - The icon rail, thin header, Cmd+K palette, and hide-all shortcut — navigation chrome comes after the pilot proves the layer model.
  - Theme surface derivation (own backlog item).
  - Wide-panel content transformation (own backlog item) — the scope form already fits a dock as-is.

# Acceptance criteria
- AC1: Flag off produces a byte-identical class list and unchanged rendering; the pre-existing shell regression suite passes unmodified.
- AC2: Flag on, Network Scope shows the canvas as full-viewport background with both docks floating over it; toggling the flag live switches modes without losing selection or canvas state.
- AC3: Fit-to-content and centering land the network inside the visible area between open docks, and re-fit correctly when a dock collapses or expands.
- AC4: Callout dragging, node dragging, canvas click-to-select, dock scrolling, and canvas wheel-zoom all work in bleed mode, verified by the new flag-on regression pass.
- AC5: Reverting the experiment is a deletion-only diff: preference, token, mode CSS, insets parameter.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Flag off produces a byte-identical class list and unchanged rendering; the pre-existing shell regression suite passes unmodified.
- request-AC2 -> This backlog slice. Proof: AC2: Flag on, Network Scope shows the canvas as full-viewport background with both docks floating over it; toggling the flag live switches modes without losing selection or canvas state.
- request-AC3 -> This backlog slice. Proof: AC3: Fit-to-content and centering land the network inside the visible area between open docks, and re-fit correctly when a dock collapses or expands.
- request-AC7 -> This backlog slice. Proof: AC4: Callout dragging, node dragging, canvas click-to-select, dock scrolling, and canvas wheel-zoom all work in bleed mode, verified by the new flag-on regression pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)
- Request: `req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui`
- Primary task(s): `task_160_orchestrate_the_canvas_first_workspace_shell`

# AI Context
- Summary: Canvas-bleed foundations and Network Scope pilot behind a settings flag
- Keywords: scaffolded-backlog, canvas-bleed foundations and network scope pilot behind a settings flag, implementation-ready
- Use when: Implementing the scaffolded slice for Canvas-bleed foundations and Network Scope pilot behind a settings flag.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
