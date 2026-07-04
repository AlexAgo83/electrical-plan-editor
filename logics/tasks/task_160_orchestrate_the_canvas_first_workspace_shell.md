## task_160_orchestrate_the_canvas_first_workspace_shell - Orchestrate the canvas-first workspace shell
> From version: 1.18.1
> Schema version: 1.0
> Status: Archived
> Understanding: 96
> Confidence: 91
> Progress: 0
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- **BRANCH RULE (read first): all implementation work for this chain happens on a dedicated branch (suggested: `feat/canvas-fullbleed`), never on `main`. This is an exploratory UX mode that may NOT be validated — the whole experiment can be dropped after review. Commit early and often on the branch; do not merge, rebase onto main, or open a PR until the product owner explicitly approves the pilot. If the experiment is rejected, the branch is deleted and `main` stays untouched.**
- The design exploration behind this chain lives in `logics/external/` (CR, mockups, real network exports) — unversioned and possibly absent on your machine. Everything needed to implement is restated in `req_164`'s context and the backlog items; do not block on that folder.

# Plan
- [ ] 0. Create the working branch `feat/canvas-fullbleed` from current `main` and verify you are on it before any code change; every subsequent step commits to this branch only.
- [ ] 1. Land the foundations + Network Scope pilot first: flag, token, mode CSS, safe-area insets, wheel/pointer routing, and the flag-on regression pass (acceptance test #1: callout/node dragging). Nothing else starts until the pilot proves the three-layer model on real interactions.
- [ ] 2. Land the theme variables + contact sheet immediately after the pilot renders: it is the cheapest item and unblocks honest visual review of everything that follows.
- [ ] 3. Build the dock content system next (container queries, InspectorContextPanel host, drill-in, truncation, pinning) — it gates Analysis and every future screen conversion.
- [ ] 4. Convert Analysis last, on top of the dock system, including low-zoom decluttering; validate at real scale and record the findings.
- [ ] 5. Hold the line on scope: mobile bottom sheets, onboarding spotlight rewrite, Settings/Home reorganization, and further screen conversions are recorded non-goals — spin them as new requests, do not let them creep in.
- [ ] 6. Close out with the flag-on/flag-off regression evidence, the all-themes contact sheet, the real-scale validation screenshots, and a keep/expand/remove recommendation for the flag; validate and close the request chain.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_661_canvas_bleed_foundations_and_network_scope_pilot_behind_a_settings_flag`
- `item_662_derived_dock_surface_theme_variables_with_all_themes_contact_sheet_validation`
- `item_663_dock_content_system_container_queries_inspector_host_drill_in_stack`
- `item_664_analysis_screen_full_bleed_with_route_highlighting_and_low_zoom_decluttering`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Archive validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC2 -> This task. Proof: archived by product-owner rejection on 2026-07-04 after visual review; no implementation from this rejected redesign chain should be pursued.
- request-AC3 -> This task. Proof: archived by product-owner rejection on 2026-07-04 after visual review; no implementation from this rejected redesign chain should be pursued.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC5 -> This task. Proof: archived by product-owner rejection on 2026-07-04 after visual review; no implementation from this rejected redesign chain should be pursued.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC7 -> This task. Proof: implementation branch `feat/canvas-fullbleed` was deleted on 2026-07-04; the experiment is rejected and no code remains on that branch.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Implementation notes for the executing agent
Code entry points (all verified against the current tree):
- **Flag**: add a persisted `canvasFullBleed` boolean in `src/app/hooks/useUiPreferences.ts` (mirror `showShortcutHints`: state + localStorage hydration + Settings toggle wiring).
- **Class token**: `src/app/hooks/useAppControllerShellDerivedState.ts` builds `appShellClassName` as a token list — append `canvas-bleed` when the flag is on AND the active screen supports it. Do not invent a parallel mechanism.
- **Mode CSS**: one new file scoped under `.app-shell.canvas-bleed`; canvas panel `position: fixed; inset: 0; z-index: 0`; overlay container `pointer-events: none`, each dock `pointer-events: auto`. Existing drawers already use `backdrop-filter: blur(5px/9px)` — reuse that pattern.
- **Safe area** (the only JS crossing): feed measured open-dock widths as insets into `useNetworkSummaryViewportSizeChange` / fit-to-content; `insets = flag ? measuredDockInsets : 0`. All centering paths (fit, quick-nav, center-on-issue) must go through the same insets.
- **Dock content**: docks get `container-type: inline-size`; migrate panel rules from `@media (max-width: 900px)` (see `action-icons-and-responsive-overrides.css:187` and siblings) to `@container`; `ConfigurableTableColumns` thresholds index on container width. `InspectorContextPanel.tsx` is the single right-dock host.
- **Themes**: define `--dock-surface/--dock-border/--dock-blur/--canvas-scrim` once, derived via `color-mix(in srgb, <existing panel bg var> 85%, transparent)`; opacity floor ≥85%; honor `prefers-reduced-transparency` (opaque, no blur). ~30 `ThemeMode` values in `src/store/types.ts:81` — never edit the 27 theme override files except recorded one-line point overrides.
- **Tests**: `src/tests/app.ui.workspace-shell-regression.spec.tsx` guards flag-off and must pass UNMODIFIED; add a separate flag-on pass (acceptance test #1: callout + node dragging via `useNetworkSummaryCalloutDragging`). Run suites with `rtk vitest run` / `rtk playwright test`.

Hard interdictions:
- No `AppShellLayoutV2` or any second shell/component fork — one shell, one CSS mode, one insets parameter. Removal must be a deletion-only diff (preference + token + CSS file + insets param).
- No `Tab` keybinding for hide-all panels (breaks keyboard-accessibility focus traversal); use `Cmd+\`.
- Flag off = byte-identical class list, zero render diff, at every commit on the branch.
- Wide content is transformed, never compressed: full tables never render inside a dock (key-value rows + "view all" to a central panel); 2D content (connector physical view) is never docked.
- Real names from user data exports must not leak into code, fixtures, or docs — anonymize.

Definition of "ready for review": pilot + themes items done on the branch, flag-on regression pass green, contact sheet generated, short demo notes in the task Report. Stop there and request product-owner review before items 663/664 if signal is doubtful — the cheapest outcome of an experiment is stopping it early.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Confirm every code commit for this chain is on `feat/canvas-fullbleed` (never `main`).

# Report
- Implementation stopped.
- Archived on 2026-07-04: redesign idea rejected by product owner after visual review; implementation branch feat/canvas-fullbleed was deleted and no code from this chain should be pursued.
- Post-rejection redesign note recorded on 2026-07-04: the better target is a Modeling-first shell with header navigation, full-screen canvas background, expandable compact/wide left tables, expandable compact/wide right details, and relocated canvas controls. This is retained only as historical guidance for a future replacement request.

# AI Context
- Summary: Orchestrate the canvas-first workspace shell. BRANCH RULE: all code on the dedicated branch feat/canvas-fullbleed, never main — the experiment may be dropped without trace.
- Keywords: scaffolded-task, request-chain-scaffold, orchestration, canvas-bleed, feature-flag, feat/canvas-fullbleed
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui`
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)
