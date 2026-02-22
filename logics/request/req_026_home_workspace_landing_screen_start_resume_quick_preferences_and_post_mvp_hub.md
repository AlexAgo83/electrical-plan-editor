## req_026_home_workspace_landing_screen_start_resume_quick_preferences_and_post_mvp_hub - Home Workspace Landing Screen for Start/Resume Flows, Quick Preferences, and Post-MVP Hub Evolution
> From version: 0.5.11
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Home / Entry Experience for Faster Start and Resume Flows
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Introduce a dedicated home screen that improves first interaction and return-to-work flows.
- Reduce friction before the user reaches a productive action (create/import/resume/open validation/settings, etc.).
- Provide a coherent entry point aligned with the existing workspace panel visual language.
- Prepare a path for post-MVP evolution (history, session summary, surfaced health/validation, release notes) without overloading the initial implementation.

# Context
The app is now feature-rich (modeling, analysis, validation, settings, network scope, floating ops/inspector panels) but has no dedicated landing experience. Users currently enter directly into operational screens, which is efficient once familiar but suboptimal for:

1. first-time orientation,
2. “what should I do next?” moments,
3. returning to continue a previous workspace,
4. quickly reaching common utility actions without navigating multiple screens.

A home screen can improve startup ergonomics if it stays tool-oriented (action-first) rather than becoming a decorative dashboard.

## Objectives
- Add a practical, low-friction home screen focused on immediate actions and resuming work.
- Preserve fast access to existing flows while keeping the visual system consistent with current panels.
- Make the home screen useful both when a workspace is empty and when work is already in progress.
- Design the MVP so post-MVP modules can be added incrementally without rewriting the screen.

## Functional Scope
### A. Home screen MVP (high priority)
Create a new top-level screen (e.g. `home`) with an action-first layout.

MVP content should include:
- **Start actions** (primary CTA area)
  - Create empty workspace
  - Import from file
  - Open Network Scope (or equivalent workspace-management entry point)
- **Resume section**
  - Continue with active network / current workspace
  - Compact summary (active network name/ID if available, network count, save status)
- **Quick shortcuts section**
  - A small curated set of high-value shortcuts/actions (navigation/settings/validation/undo-redo guidance)
- **Quick preferences section**
  - Theme selector (or theme quick-open)
  - Floating inspector visibility toggle
  - Optional canvas defaults shortcuts if low-cost (grid/snap/lock defaults)

### B. UX behavior and navigation integration (high priority)
- Integrate the home screen into the existing workspace navigation shell as a first-class top-level destination.
- Add an explicit menu/navigation button to return to the home screen (visible and consistent with other top-level screen entries).
- Define expected behavior when no active network exists versus when one exists.
- Keep keyboard and focus behavior consistent with the current app shell/panels.
- Ensure responsive layout (desktop 2-column / mobile 1-column recommended baseline).

### C. Visual and design-system alignment (medium priority)
- Reuse the existing panel/card/button design language (avoid a separate “marketing page” visual style).
- Maintain compatibility with all supported theme modes.
- Keep content density high enough for utility but not cluttered.

### D. Post-MVP extension hooks (planned, not all required in MVP)
Design the home screen structure to support future modules such as:
- Recent imports/exports history (local activity timeline)
- Last session summary (what was open / active / modified)
- Workspace health snapshot (issue counts, validation summary badges)
- Validation follow-up CTA (open validation with current visible issue context)
- “What’s new” / release notes panel
- Optional recent entities / recently edited items (only if signal is strong and implementation stays lightweight)

These modules should be considered in layout extensibility and data contracts, even if deferred.

### E. Documentation and delivery control (closure target)
- Document home-screen scope, decisions, and acceptance criteria traceability in Logics artifacts.
- Provide validation notes and regression coverage expectations.

## Non-functional requirements
- Do not degrade current workflows for experienced users (home screen should be additive and fast).
- Preserve app startup responsiveness; avoid heavy computations on the home screen.
- Keep state derivation explicit and maintainable (no monolithic “home mega-hook” without clear boundaries).
- Ensure theme coverage across all existing theme variants.
- Preserve passing `lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, and `quality:pwa` after delivery.

## Information Architecture / Suggested Layout (guidance)
- Desktop (recommended): 2 columns
  - Left: Start + Resume (primary actions)
  - Right: Quick shortcuts + Quick preferences
- Mobile (recommended): single stacked column
- Optional future expansion:
  - Secondary row/sections for post-MVP modules (history / health / what’s new)

## Validation and regression safety
- Targeted tests (minimum, if implemented with UI navigation changes):
  - Home navigation visibility/selection behavior tests
  - Home CTA action wiring tests (create/import/open target screens)
  - Theme rendering smoke coverage for the home screen
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: A dedicated home screen exists and is accessible as a top-level app screen.
- AC1b: The workspace menu/navigation includes an explicit control to return to the home screen.
- AC2: The home screen provides actionable MVP sections for Start, Resume, Quick shortcuts, and Quick preferences.
- AC3: The home screen is useful in both empty-workspace and active-workspace states.
- AC4: The layout is responsive and visually aligned with the existing panel system/themes.
- AC5: MVP implementation leaves clean extension points for post-MVP modules (history/session/health/what’s new) without structural rewrite.
- AC6: Validation suites and Logics documentation/lint pass.

## Out of scope
- Full analytics dashboard with broad metrics and charts.
- Heavy onboarding/tutorial system.
- Large animation/motion redesign for app startup.
- Mandatory implementation of all post-MVP modules in the first delivery.

# Backlog
- To be created from this request (proposed):
  - Home screen shell + navigation integration
  - Home MVP content modules (start/resume/shortcuts/preferences)
  - Home responsive/theme coverage and tests
  - Post-MVP layout extension hooks/data contracts
  - Closure validation + AC traceability

# References
- `src/app/AppController.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/workspace/OperationsHealthPanel.tsx`
