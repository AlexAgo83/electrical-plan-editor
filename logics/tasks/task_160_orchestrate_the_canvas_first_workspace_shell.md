## task_160_orchestrate_the_canvas_first_workspace_shell - Orchestrate the canvas-first workspace shell
> From version: 1.18.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
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
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate the canvas-first workspace shell
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_164_full_bleed_canvas_workspace_canvas_as_application_background_behind_a_feature_flag_docks_as_overlay_ui`
- Product brief(s): `prod_015_canvas_first_workspace_shell`
- Architecture decision(s): (none yet)
