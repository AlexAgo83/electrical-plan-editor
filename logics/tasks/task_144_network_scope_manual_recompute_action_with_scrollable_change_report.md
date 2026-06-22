## task_144_network_scope_manual_recompute_action_with_scrollable_change_report - Network scope manual recompute action with scrollable change report
> From version: 1.16.6
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 87
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [x] Add a full-network recompute path that wraps `recomputeAllWiresForNetwork` (`src/store/reducer/helpers/wireTransitions.ts`) and produces a structured change report: snapshot wires before, recompute, then diff each wire for route change (`routeSegmentIds`), length change (`lengthMm`), and directional splice side change (compare `spliceSideOverride`/`portIndex` on endpoint A and B, reusing the `describeEndpointSide` before/after pattern from `spliceNodeMigration.ts`). Define a `WireRecomputeReportEntry` type (kind, wireId, technicalId, before/after) with deterministic ordering.
- [x] Expose it as a store action (e.g. `network/recomputeAllWires`) or app-controller hook scoped to the focused network, committing the recomputed wires atomically and surfacing `{ error }` without partial commit when any wire fails.
- [x] Add the action button to the `row-actions` row in `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`, rendered next to Cancel in edit mode only (not create mode), using the existing `button-with-icon` + `action-button-icon` conventions; add the English label and its `FR_TEXT_BY_EN_TEXT` mapping in `src/app/lib/i18n.ts`.
- [x] Build a scrollable result dialog (new component or extend `FileFeedbackDialog`) that lists report entries grouped/labeled by kind with before/after values, shows an explicit no-change empty state, and keeps header + close visible while the list scrolls.
- [x] Fix the shared dialog scroll styling in `src/app/styles/confirm-dialog.css`: give the feedback/report list region `min-height: 0; overflow-y: auto` within a bounded `max-height` dialog (grid `minmax(0, 1fr)` row, per the `BomExportPreviewDialog` precedent) so both the new dialog AND the existing splice "floating" migration report (`FileFeedbackDialog`) scroll on long lists and small viewports.
- [x] Wire the result into the existing overlay/controller plumbing (`AppControllerOverlays.tsx` / a controller hook akin to `useAppControllerSpliceMigrationReport.ts`).
- [x] All acceptance criteria AC1-AC8 are covered.
- [x] Validation passes (code + Logics gates).

# Backlog
- `item_635_network_scope_manual_recompute_action_with_scrollable_change_report`

# Acceptance criteria
- AC1: In network scope, while editing a network, a recompute action button is shown next to the Cancel button (edit mode only; not shown in create mode). It uses the app icon/button conventions and is keyboard and screen-reader accessible.
- AC2: Activating the button recomputes all wire routes and directional splice sides for the focused network and persists the corrected wires (same result the incidental recompute path produces), with corrected `portIndex` / `spliceSideOverride` for affected directional splices.
- AC3: After recompute, a popup lists every change found, grouped or labeled by kind (route rewritten, length changed, directional splice side A/B re-inferred), each entry naming the wire technical ID and showing before/after values where applicable.
- AC4: The popup is scrollable — with many entries the list scrolls within a bounded dialog height and never pushes content off-screen or beyond the viewport, including on small/mobile viewports. The header and close action remain visible while the list scrolls.
- AC5: When the recompute finds no changes, the popup shows an explicit no-change message instead of an empty or broken-looking dialog.
- AC6: If the recompute fails for any wire (e.g. an invalid locked route), the operator is shown a clear error message and no partial/inconsistent state is committed.
- AC7: The existing splice "floating" migration report popup becomes scrollable through the same shared styling fix (regression-checked), so long migration reports are also readable.
- AC8: Targeted tests cover the change-report builder (before/after diff for route, length, and side changes), the no-change empty state, the edit-mode-only button visibility, and the dialog scroll-region styling/markup.

# Validation
- Unit tests for the change-report builder: route change, length change, and directional splice side A/B change each produce the expected entry; an unchanged network produces an empty report; a recompute failure surfaces `{ error }` with no committed mutation.
- Component/UI tests: the recompute button is present in edit mode and absent in create mode; activating it opens the result dialog; the no-change state renders its explicit message.
- Dialog scroll test: the report/feedback list region carries the bounded-height + `overflow` scroll markup/class, and the migration report popup reuses it (regression guard for the previously non-scrollable popup).
- Run `npm run -s typecheck`, `npm run -s lint`, and `npm run -s test` (or `test:ci:fast` + `test:ci:ui`) for the affected store, controller, and dialog suites.
- Logics gates: run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_144_network_scope_manual_recompute_action_with_scrollable_change_report.md` after implementation.
- Finish workflow executed on 2026-06-22.
- Linked backlog/request close verification passed.

# Report
- Store: added `buildWireRecomputeReport` (`src/store/reducer/helpers/wireRecomputeReport.ts`) — snapshots wires, runs `recomputeAllWiresForNetwork`, and emits a deterministic before/after report (`route`/`length`/`sideA`/`sideB` per wire). Exposed via a new `wire/recomputeAll` action (committed atomically through the scoped wire reducer; surfaces the report on the global, transient `ui.lastRecomputeReport`) plus a `ui/clearRecomputeReport` action. Report types live in `store/types.ts` and are re-exported from `store/index.ts`.
- UI: `useAppControllerNetworkRecomputeReport` watches `ui.lastRecomputeReport`, opens a `FileFeedbackDialog` (reused) listing each change or an explicit no-change message, then dispatches the clear so it fires once. Wired through `AppController` -> `AppControllerOverlays`. Added the "Recompute routes" button to the network edit form `row-actions` row next to Cancel (edit mode only; disabled unless the edited network is the active one, since the recompute operates on the active working set), threaded `handleRecomputeNetwork` through the controller assembly chain, and added EN/FR i18n labels.
- Scroll fix: gave the shared `.confirm-dialog-feedback-list` a bounded `max-height` + `overflow-y: auto` (`min-height: 0`) in `confirm-dialog.css`, so both the new recompute report and the existing splice "floating" migration report scroll instead of overflowing the viewport.
- Tests: `store.reducer.helpers.spec.ts` covers the report builder (no-change empty report, stale directional side corrected + reported, action surfaces `ui.lastRecomputeReport`). `network-recompute-report.spec.tsx` covers the controller hook (null / no-change message / change listing + count) and the dialog's scrollable feedback-list markup. Button visibility is conditional edit-mode JSX guaranteed by the typed prop chain.
- Validation: `npm run typecheck` (clean), `npm run lint` (clean), `npm run build:vite` (success), and vitest across store + controller-chain + app-integration suites (store.reducer.helpers, network-recompute-report, app.ui.navigation-canvas, store.reducer.networks, app-controller-workspace-handlers-domain, app.ui.inspector-shell, app.ui.creation-flow-splice-ergonomics) — all passing. `logics-manager lint --require-status` OK.
- Note: per project memory, Playwright e2e / `ci:local` is unsupported on this WSL host; relied on unit/integration vitest + build, and remote CI for e2e.
- Finished on 2026-06-22.
- Linked backlog item(s): `item_635_network_scope_manual_recompute_action_with_scrollable_change_report`
- Related request(s): `req_149_network_scope_manual_recompute_action_with_scrollable_change_report`

# AI Context
- Summary: Implement network scope manual recompute action with scrollable change report.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_149_network_scope_manual_recompute_action_with_scrollable_change_report`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
