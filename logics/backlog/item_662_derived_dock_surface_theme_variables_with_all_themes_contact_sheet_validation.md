## item_662_derived_dock_surface_theme_variables_with_all_themes_contact_sheet_validation - Derived dock-surface theme variables with all-themes contact-sheet validation
> From version: 1.18.1
> Schema version: 1.0
> Status: Archived
> Understanding: 95
> Confidence: 90
> Progress: 0
> Complexity: Medium
> Theme: Canvas-first workspace UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- **BRANCH RULE: implement on the dedicated branch `feat/canvas-fullbleed`, never on `main` — this experiment may not be validated and must be droppable by deleting the branch. See `task_160` Implementation notes before writing any code.**
- The app ships ~30 themes across ~27 override CSS files; translucent docks over an arbitrary themed canvas can silently become unreadable in any of them, and a per-theme styling pass is unaffordable and unmaintainable.
- Midrange themes are the danger zone: canvas and panel surfaces converge in luminance, so blur alone does not guarantee text contrast.

# Scope
- In:
  - Define the mode's semantic variables once at shell level: --dock-surface, --dock-border, --dock-blur, --canvas-scrim, derived from existing theme surface variables via color-mix with an opacity floor of at least ~85%.
  - Honor prefers-reduced-transparency by resolving --dock-surface to fully opaque and --dock-blur to none through the same variables.
  - Build a rerunnable Playwright contact-sheet script: screenshot the pilot screen flag-on in every ThemeMode value, compose a thumbnail grid artifact for review.
  - Apply point overrides (one --dock-surface line per failing theme) only for themes the contact sheet proves unreadable, and record which themes needed them and why.
- Out:
  - Any new theme, any change to existing theme palettes or canvas entity colors.
  - Automated contrast scoring — a human reviews the contact sheet; automation can come later if reviews become frequent.

# Acceptance criteria
- AC1: All dock/overlay surfaces in bleed mode style exclusively through the semantic variables; no theme-specific selectors inside the mode CSS beyond recorded point overrides.
- AC2: The contact-sheet script runs from the repo and outputs one labeled screenshot per shipped theme of the flag-on pilot screen.
- AC3: Every theme is readable on the contact sheet (dock text on dock surface, header legible over canvas), with point overrides listed in the closeout for any theme that needed one.
- AC4: With reduced transparency requested, docks render fully opaque with no blur.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: All dock/overlay surfaces in bleed mode style exclusively through the semantic variables; no theme-specific selectors inside the mode CSS beyond recorded point overrides.

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
- Summary: Derived dock-surface theme variables with all-themes contact-sheet validation
- Keywords: scaffolded-backlog, derived dock-surface theme variables with all-themes contact-sheet validation, implementation-ready
- Use when: Implementing the scaffolded slice for Derived dock-surface theme variables with all-themes contact-sheet validation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
