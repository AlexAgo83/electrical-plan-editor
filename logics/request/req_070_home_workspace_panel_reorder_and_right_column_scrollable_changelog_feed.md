## req_070_home_workspace_panel_reorder_and_right_column_scrollable_changelog_feed - Home workspace panel reorder and right-column scrollable changelog feed
> From version: 0.9.12
> Understanding: 100% (scope and delivered behavior are confirmed: Home now stacks `Workspace` under `Quick start` and renders a right-column scrollable changelog feed)
> Confidence: 99% (implemented behavior is covered by targeted Home/changelog tests and integrated in production UI)
> Complexity: Medium
> Theme: Home information architecture and release-notes discoverability
> Reminder: Update Understanding/Confidence and references when you edit this doc.

# Needs
- Users want a clearer Home hierarchy:
  - `Workspace` panel should be visually placed under `Quick start`.
- Users want changelog visibility directly from Home:
  - show changelogs sequentially in the right column,
  - because changelogs are long, use a dedicated scrollable container,
  - this container should occupy the full right column height across two vertical cells.

# Context
Current Home content is rendered by:
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/styles/home.css`

Existing layout behavior:
- Home is a responsive grid (`.home-workspace-grid`),
- `Quick start` and `Workspace` are currently two independent top-level panels,
- extension modules (`postMvpModules`) are optional and not currently used for a first-class changelog feed.

The request introduces a more intentional two-column structure:
- left column focused on workspace actions and resume context,
- right column dedicated to release notes/changelogs.

# Objective
- Reorganize Home so `Workspace` is directly below `Quick start` in the left column.
- Add a right-column changelog panel that:
  - displays multiple changelogs one after another,
  - spans the equivalent of two stacked panel cells,
  - has internal vertical scrolling for long content.

# Default decisions (V1)
- Changelog feed order:
  - auto-detect changelog files from repository root only (`CHANGELOGS_*.md`), then sort by version descending (newest -> oldest).
- Changelog rendering:
  - render as styled markdown (headings/lists/code blocks/links styled for Home readability).
  - introducing dedicated markdown-rendering dependencies is allowed in V1 (example: `react-markdown`, `remark-gfm`).
- Scroll behavior:
  - scroll only inside the changelog panel content area (not whole page lock).
- Desktop layout:
  - right changelog panel spans two rows in the grid.
- Mobile layout:
  - changelog panel collapses to normal flow below primary action panels, with safe max-height behavior.
- Changelog density:
  - show all detected changelogs in sequence in a single scrollable feed (no collapse by default in V1).
- Panel title:
  - `What’s new`.

# Functional scope
## A. Home panel ordering and column structure (high priority)
- Update Home composition so left column reads:
  1. `Quick start`
  2. `Workspace`
- Ensure both remain stretch-aligned and visually coherent with existing panel styling.
- Preserve existing actions and semantics in both panels (no behavior regression, only layout changes unless explicitly needed for structure).

## B. Right-column changelog feed panel (high priority)
- Add a dedicated Home panel for changelogs in the right column.
- Panel behavior:
  - shows multiple changelog entries sequentially in one container,
  - content area is vertically scrollable,
  - panel spans two vertical cells/rows on desktop grid.
- Expected to handle long content safely without breaking overall Home layout.

## C. Changelog feed data contract (medium-high priority)
- Define V1 source strategy for changelog content in Home:
  - auto-discover files matching `CHANGELOGS_*.md` at repository root only,
  - parse/extract version for ordering,
  - stable descending version order (latest first).
- Ensure missing/empty changelog sources fail gracefully (panel still renders with a fallback message).
- Keep this V1 source strategy simple and maintainable (no backend dependency).

## D. Responsive and accessibility behavior (medium-high priority)
- Desktop:
  - maintain two-column Home layout with right panel row span.
- Tablet/mobile:
  - changelog panel appears after `Quick start` and `Workspace`,
  - avoid layout overflow and horizontal scroll,
  - maintain readable scroll area and touch-friendly behavior.
- Accessibility:
  - changelog section must remain keyboard scrollable/readable,
  - heading hierarchy and panel labeling should remain coherent.

## E. Non-regression for Home interactions (medium priority)
- Preserve:
  - import/create/open actions in `Quick start`,
  - `Resume`/`Validation` actions in `Workspace`,
  - status summary and active-network copy.
- No regression to onboarding help entry points currently exposed from Home.

# Non-functional requirements
- The Home screen should remain performant despite large changelog text blocks.
- Styling should remain aligned with existing workspace panel language.
- The solution should avoid brittle CSS coupling and keep maintainable grid semantics.

# Validation and regression safety
- Add/extend UI integration coverage for Home layout:
  - `Workspace` panel appears below `Quick start` (desktop structure assertion),
  - changelog panel exists and is positioned in right column with row-span semantics on desktop,
  - changelog content container is scrollable for long content,
  - mobile fallback order/layout remains usable.
- Re-run standard quality matrix after implementation:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - `npm run -s quality:pwa`
  - `npm run -s test:ci`
  - `npm run -s test:e2e`

# Acceptance criteria
- AC1: On Home, `Workspace` is displayed under `Quick start` in the left column.
- AC2: A right-column changelog panel is displayed and spans two vertical cells on desktop layout.
- AC3: The changelog panel auto-detects available `CHANGELOGS_*.md` files and renders them in descending version order.
- AC4: The changelog content area is internally scrollable, displays all detected changelogs, and handles long text safely.
- AC5: Home actions and status panels remain functional and non-regressed.
- AC6: Responsive behavior remains usable on tablet/mobile without overflow regressions, with changelog panel positioned after left-column panels.

# Out of scope
- Full markdown feature parity rendering (tables/code blocks/theme plugins) in V1.
- External changelog fetching from remote APIs.
- Home redesign beyond the specific panel ordering and changelog-feed layout request.

# Delivery status
- Status: delivered.
- Task: `logics/tasks/task_070_super_orchestration_closure_validation_for_req_070_to_req_073.md`.

# Backlog
- `logics/backlog/item_394_req_070_home_workspace_changelog_feed_closure_validation_and_traceability.md` (done)

# References
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/styles/home.css`
- `src/app/AppController.tsx`
- `CHANGELOGS_0_9_12.md`
- `CHANGELOGS_0_9_6.md`
- `CHANGELOGS_0_9_0.md`
- `CHANGELOGS_0_8_1.md`
