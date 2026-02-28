## req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint - App-wide mobile mode enablement with removal of global 700px minimum width constraint
> From version: 0.9.18
> Status: Draft
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: UI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Introduce a true mobile mode for the application.
- Remove the global layout constraint that currently enforces `min-width: 700px`.
- Ensure the app remains usable when viewport width is below `700px`.

# Context
- The global stylesheet currently defines `body { min-width: 700px; }`, which blocks real narrow-screen behavior and forces horizontal overflow on phones.
- Several screens already include responsive rules, but they are constrained by the global minimum width lock.
- Product direction now requires mobile usability rather than desktop-only compaction.

# Objective
- Enable end-to-end mobile usability on narrow viewports while preserving existing desktop behavior.
- Replace hard minimum-width locking with responsive/adaptive layout behavior.

# Scope
- In:
  - remove global `body` minimum width lock (`700px`);
  - define mobile behavior contract for app shell, workspace panels, settings/validation sections, and key action rows;
  - ensure no mandatory horizontal page scroll in primary user flows on narrow screens;
  - preserve existing desktop/tablet layout quality and interaction behavior.
- Out:
  - native mobile app packaging;
  - full redesign of information architecture;
  - touch-gesture feature expansion beyond current web interactions.

# Locked execution decisions
- Decision 1: The global `min-width: 700px` constraint is removed.
- Decision 2: Two-column patterns remain the default when space allows and collapse to one column only when required by available width.
- Decision 3: Mobile mode is CSS/UX responsive behavior, not a separate code path or feature flag.
- Decision 4: Keep a single mobile breakpoint contract (baseline `<= 900px`) shared by CSS rules and any JS viewport logic to avoid drift.
- Decision 5: Use overflow-safe grid/flex patterns (`minmax(0, 1fr)`, `min-width: 0` on shrinking children) as default in mobile refactors.
- Decision 6: Any mobile drawer/overlay introduced in this wave must include deterministic body scroll lock/unlock cleanup.
- Decision 7: Mobile validation baseline includes both viewport profiles:
  - `360x800`,
  - `390x844`.

# Proven mobile patterns to reuse
- Breakpoint contract:
  - one mobile threshold used consistently in layout CSS and runtime viewport checks.
- Layout overflow safety:
  - prefer `minmax(0, 1fr)` tracks and explicit `min-width: 0` on child containers that must shrink;
  - avoid fixed-width desktop assumptions in action rows and panel shells.
- Mobile navigation ergonomics:
  - compact top action rows with equal-width controls where relevant;
  - keep touch targets readable and prevent cramped horizontal controls.
- Overlay/drawer behavior:
  - bounded panel width on mobile overlays (for example `min(360px, 90vw)` style pattern);
  - lock body scroll while open, and always clear classes/styles on close/unmount.
- Safe-area and input ergonomics:
  - preserve `env(safe-area-inset-*)` handling for top/bottom fixed UI;
  - keep form control font-size mobile-safe (notably avoid iOS zoom traps).

# Functional behavior contract
- Desktop/tablet:
  - keep current panel hierarchy and multi-column layouts where readable.
- Mobile/narrow widths:
  - app shell and core panels reflow without forcing horizontal viewport overflow;
  - dense action groups wrap/stack into tap-friendly rows;
  - settings and import/export sections collapse to single-column when two readable columns are no longer possible.
- Cross-cutting:
  - import/export, modeling, analysis/network summary, and settings remain functionally equivalent.

# Acceptance criteria
- AC1: Global `body` style no longer enforces `min-width: 700px`.
- AC2: Main app flows are usable on narrow viewport widths (baseline profiles: `360x800` and `390x844`) without mandatory horizontal page scroll.
- AC3: Existing responsive components preserve desktop behavior and collapse gracefully on narrow screens.
- AC4: Import/export/settings and network summary controls remain accessible and operable in mobile mode.
- AC5: No critical visual clipping/overlap regressions are introduced in supported themes for targeted screens.
- AC6: `lint`, `typecheck`, and relevant UI/integration tests pass after mobile-mode changes.
- AC7: Mobile breakpoint contract is explicit and consistent between CSS and JS behaviors involved in the shell/navigation flow.
- AC8: Mobile overlay/drawer flows (if present) lock body scroll only while open and always release lock on close/unmount.

# Validation and regression safety
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted responsive/UI checks around:
  - settings/import-export panel composition
  - workspace navigation + drawer behavior
  - network summary toolbar/panel usability on narrow widths
  - narrow viewport smoke baseline at `390x844` and `360x800` for critical flows
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Removing global minimum width can reveal latent overflow issues in legacy desktop-first sections.
- Theme overrides may require additional responsive tuning for consistent spacing and contrast.
- UI test snapshots/selectors tied to fixed desktop composition may need controlled updates.

# Backlog
- To create from this request:
  - `item_425_remove_global_min_width_lock_and_define_mobile_shell_baseline.md`
  - `item_426_mobile_responsive_pass_for_settings_validation_and_import_export_surfaces.md`
  - `item_427_mobile_responsive_pass_for_workspace_navigation_and_network_summary_controls.md`
  - `item_428_req_083_mobile_mode_validation_matrix_and_closure_traceability.md`

# References
- `src/app/styles/base/base-foundation.css`
- `src/app/styles/validation-settings/validation-and-settings-layout.css`
- `src/app/styles/workspace/workspace-shell-and-nav/analysis-route-responsive-and-inspector-shell.css`
- `src/app/styles/workspace/workspace-panels-and-responsive/workspace-panels-and-actions.css`
- `logics/request/req_082_import_export_networks_panel_two_column_compaction_and_right_side_selected_export_list.md`

# External inspiration snapshot
- `https://github.com/AlexAgo83/sentry/blob/main/styles/global.css`
- `https://github.com/AlexAgo83/sentry/blob/main/src/app/AppView.tsx`
- `https://github.com/AlexAgo83/sentry/blob/main/tests/app/appView.mobileRoster.test.tsx`
- `https://github.com/AlexAgo83/sentry/blob/main/tests/e2e/smoke.spec.ts`
