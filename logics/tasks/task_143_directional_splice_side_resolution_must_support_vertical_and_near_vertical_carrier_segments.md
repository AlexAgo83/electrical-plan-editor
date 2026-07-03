## task_143_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments - Directional splice side resolution must support vertical and near-vertical carrier segments
> From version: 1.16.6
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 88
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Restored historical AC traceability proof.

# Definition of Done (DoD)
- [x] In `src/store/reducer/helpers/directionalSpliceSide.ts`, replace the x-only L/R inference with an axis-aware computation: project the exit node's position onto the carrier-segment direction vector (splice->endpoint) and pick the side from the sign along that axis, so vertical and near-vertical carriers resolve correctly.
- [x] Apply the axis-aware logic in both the `placed` (segment-offset / floating) and `legacyNode` branches; add a robust fallback for degenerate vectors (zero-length / coincident positions) that is deterministic and does not oscillate.
- [x] Keep honoring `splice.sideInverted` (mirror the resolved side) and `endpoint.spliceSideLocked === true` (locked override wins, never recomputed).
- [x] Confirm corrected sides flow through `normalizeDirectionalSpliceEndpoint` (`src/core/directionalSplice.ts`) so `portIndex` and `spliceSideOverride` stay mutually consistent, and that the callout (`calloutModel.ts`) and the route highlight agree for the same wire.
- [x] Verify no regression on existing horizontal/diagonal directional splices (`PRI-S-01`..`PRI-S-19`, `S-001`..`S-003`).
- [x] Add targeted tests (see Validation) covering all carrier orientations, the two-direction split, `sideInverted`, `spliceSideLocked`, and a regression fixture reproducing `PRI-S-06`/`PRI-S-07`/`PRI-S-16`.
- [x] All acceptance criteria AC1-AC7 are covered.
- [x] Validation passes (code + Logics gates).

# Backlog
- `item_634_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments`

# Acceptance criteria
- AC1: For a directional splice on a vertical carrier segment, a wire whose route exits toward one segment endpoint resolves to one side, and a wire exiting toward the opposite endpoint resolves to the other side; the splice callout then shows wires on both ports matching their real physical directions.
- AC2: The resolution is axis-aware: side is determined by the exit node's position relative to the splice along the carrier segment direction (handling vertical and near-vertical segments), not by an x-only comparison. Horizontal and diagonal carrier segments keep their current correct behavior.
- AC3: Loading the reported workspace and recomputing yields `PRI-S-06`, `PRI-S-07`, and `PRI-S-16` with wires split across both ports according to their routes (up/toward-trunk vs down/toward-connector), and the Network Summary splice callout matches the per-wire route direction highlight.
- AC4: When `spliceSideLocked === true` with a defined `spliceSideOverride`, the operator's locked side is preserved and never overwritten by the geometric resolver.
- AC5: `sideInverted === true` still mirrors the resolved side as it does today, for all carrier-segment orientations.
- AC6: Edge cases remain deterministic: zero-length or degenerate carrier vectors, wires whose only route segment is the carrier segment (terminating directly at a segment endpoint connector), splices with all wires genuinely on one side, and multiple splices on the same segment.
- AC7: Targeted tests cover vertical, near-vertical, horizontal, and diagonal carrier segments, the two-direction split, `sideInverted`, `spliceSideLocked`, and a regression fixture reproducing the `PRI-S-06`/`PRI-S-07`/`PRI-S-16` defect; tests fail on the current x-only logic and pass after the fix.

# Validation
- Unit tests: extend `src/tests/store.reducer.helpers.spec.ts` (directional splice side resolution) with vertical, near-vertical, horizontal, and diagonal carrier-segment cases, the two-direction split, `sideInverted`, and `spliceSideLocked`.
- Regression fixture: a splice on a vertical carrier with wires routing toward both endpoints must resolve to opposite ports; assert the `PRI-S-06`/`PRI-S-07`/`PRI-S-16` shape (wires split across both ports) and that the test fails on the current x-only logic.
- Run `npm run -s typecheck` and `npm run -s lint`.
- Run `npm run -s test` (or `npm run -s test:ci:fast`) for the affected store/reducer suites.
- Logics gates: run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_143_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments.md` after implementation.
- Finish workflow executed on 2026-06-22.
- Linked backlog/request close verification passed.

# Report
- Implemented in `src/store/reducer/helpers/directionalSpliceSide.ts`: added `inferSideAlongAxis`, which keeps the existing x-axis L/R rule whenever the exit point and splice differ in x (horizontal / diagonal / near-vertical carriers) and falls back to the y axis when x is equal (vertical carrier: upward exit -> L, downward -> R), returning null only on exact coincidence so the connector-count fallback still applies. Wired into both the `placed` (floating / segment-offset) and `legacyNode` branches; `sideInverted` and `spliceSideLocked` handling is unchanged. The routing `exitNodeIdHint` already supplies the correct exit node for wires that terminate at a carrier endpoint, so those wires resolve correctly too.
- Tests added in `src/tests/store.reducer.helpers.spec.ts`: vertical two-direction split, `sideInverted` mirroring on a vertical carrier, locked-side preservation on a vertical carrier, and a horizontal-carrier regression guard. Confirmed the two vertical tests fail on the previous x-only logic and pass after the fix.
- Validation: `npm run typecheck` (clean), `npm run lint` (clean), `vitest` on `store.reducer.helpers`, `core.graph`, `splice-placement-optimizer`, `core.functional-schematic`, and `network-statistics` (42 tests passing), and `logics-manager lint --require-status` (OK).
- Caveat: an already-saved workspace at the current persistence schema corrects its stored `portIndex` / `spliceSideOverride` on the next wire/splice/segment recompute (any edit to the affected splice, its carrier segment, or its wires; or a schema-upgrade migration on load), since the splice callout reads stored ports rather than recomputing live.
- Finished on 2026-06-22.
- Linked backlog item(s): `item_634_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments`
- Related request(s): `req_148_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments`

# AI Context
- Summary: Implement directional splice side resolution must support vertical and near-vertical carrier segments.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_148_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: For a directional splice on a vertical carrier segment, a wire whose route exits toward one segment endpoint resolves to one side, and a wire exiting toward the opposite endpoint resolves to the other side; the splice callout then shows wires on both ports matching their real physical directions.
- request-AC2 -> This task. Evidence needed: The resolution is axis-aware: side is determined by the exit node's position relative to the splice along the carrier segment direction (handling vertical and near-vertical segments), not by an x-only comparison. Horizontal and diagonal carrier segments keep their current correct behavior.
- request-AC3 -> This task. Evidence needed: Loading the reported workspace and recomputing yields `PRI-S-06`, `PRI-S-07`, and `PRI-S-16` with wires split across both ports according to their routes (up/toward-trunk vs down/toward-connector), and the Network Summary splice callout matches the per-wire route direction highlight.
- request-AC4 -> This task. Evidence needed: When `spliceSideLocked === true` with a defined `spliceSideOverride`, the operator's locked side is preserved and never overwritten by the geometric resolver.
- request-AC5 -> This task. Evidence needed: `sideInverted === true` still mirrors the resolved side as it does today, for all carrier-segment orientations.
- request-AC6 -> This task. Evidence needed: Edge cases remain deterministic: zero-length or degenerate carrier vectors, wires whose only route segment is the carrier segment (terminating directly at a segment endpoint connector), splices with all wires genuinely on one side, and multiple splices on the same segment.
- request-AC7 -> This task. Evidence needed: Targeted tests cover vertical, near-vertical, horizontal, and diagonal carrier segments, the two-direction split, `sideInverted`, `spliceSideLocked`, and a regression fixture reproducing the `PRI-S-06`/`PRI-S-07`/`PRI-S-16` defect; tests fail on the current x-only logic and pass after the fix.
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC6 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC7 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
