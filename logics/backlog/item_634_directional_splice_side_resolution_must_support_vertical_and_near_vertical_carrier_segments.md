## item_634_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments - Directional splice side resolution must support vertical and near-vertical carrier segments
> From version: 1.16.6
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 88
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
For directional splices placed on a vertical (or near-vertical) carrier segment, all wires are assigned to the same port/side, so the Network Summary splice callout draws every wire on one side even when the wires physically branch in two opposite directions along the segment.
The splice side resolution must derive each wire's side from the wire's actual exit direction along the carrier segment axis, not from a hardcoded horizontal (x-only) comparison. Wires leaving toward one end of the carrier segment must land on one port/side; wires leaving toward the other end must land on the other.
The fix must be geometric and automatic so it corrects existing affected splices on load/recompute and prevents the defect for any future splice on a vertical, horizontal, or diagonal carrier segment, without requiring the operator to manually lock each wire's side.
The splice callout/port grouping and the Network Summary route highlighting must agree on direction for the same wire, removing the current inconsistency where the route shows two directions but the splice symbol shows one.

# Scope
- In:
  - Make `resolveDirectionalSpliceEndpointSide` (`src/store/reducer/helpers/directionalSpliceSide.ts`) axis-aware: derive L/R from the exit node's position projected onto the carrier-segment direction instead of an x-only comparison, covering vertical, near-vertical, horizontal, and diagonal segments.
  - Apply the axis-aware logic in both the `placed` (segment-offset / floating) and `legacyNode` branches, and keep honoring `sideInverted`.
  - Re-derive and correct stored `portIndex` / `spliceSideOverride` for affected wires through the existing `normalizeDirectionalSpliceEndpoint` path on recompute/reroute, keeping `portIndex` and `spliceSideOverride` mutually consistent so the callout and route highlight agree.
  - Preserve explicit operator choice when `spliceSideLocked === true` (never overwrite a locked side).
  - Targeted unit tests for vertical/near-vertical/horizontal/diagonal carriers, two-direction split, `sideInverted`, `spliceSideLocked`, plus a regression fixture reproducing `PRI-S-06`/`PRI-S-07`/`PRI-S-16`.
- Out:
  - Persisted splice placement (`segmentId`, `fromNodeId`, `offsetMm`), routing / shortest-path semantics, wire length calculation, and the splice port-mode model.
  - Splice callout layout redesign or drag-to-assign side interactions.
  - Port assignment for non-directional (bounded / unbounded) splices.

# Acceptance criteria
- AC1: For a directional splice on a vertical carrier segment, a wire whose route exits toward one segment endpoint resolves to one side, and a wire exiting toward the opposite endpoint resolves to the other side; the splice callout then shows wires on both ports matching their real physical directions.
- AC2: The resolution is axis-aware: side is determined by the exit node's position relative to the splice along the carrier segment direction (handling vertical and near-vertical segments), not by an x-only comparison. Horizontal and diagonal carrier segments keep their current correct behavior.
- AC3: Loading the reported workspace and recomputing yields `PRI-S-06`, `PRI-S-07`, and `PRI-S-16` with wires split across both ports according to their routes (up/toward-trunk vs down/toward-connector), and the Network Summary splice callout matches the per-wire route direction highlight.
- AC4: When `spliceSideLocked === true` with a defined `spliceSideOverride`, the operator's locked side is preserved and never overwritten by the geometric resolver.
- AC5: `sideInverted === true` still mirrors the resolved side as it does today, for all carrier-segment orientations.
- AC6: Edge cases remain deterministic: zero-length or degenerate carrier vectors, wires whose only route segment is the carrier segment (terminating directly at a segment endpoint connector), splices with all wires genuinely on one side, and multiple splices on the same segment.
- AC7: Targeted tests cover vertical, near-vertical, horizontal, and diagonal carrier segments, the two-direction split, `sideInverted`, `spliceSideLocked`, and a regression fixture reproducing the `PRI-S-06`/`PRI-S-07`/`PRI-S-16` defect; tests fail on the current x-only logic and pass after the fix.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: For a directional splice on a vertical carrier segment, a wire whose route exits toward one segment endpoint resolves to one side, and a wire exiting toward the opposite endpoint resolves to the other side; the splice callout then shows wires on both ports matching their real physical directions.
- request-AC2 -> This backlog slice. Proof: AC2: The resolution is axis-aware: side is determined by the exit node's position relative to the splice along the carrier segment direction (handling vertical and near-vertical segments), not by an x-only comparison. Horizontal and diagonal carrier segments keep their current correct behavior.
- request-AC3 -> This backlog slice. Proof: AC3: Loading the reported workspace and recomputing yields `PRI-S-06`, `PRI-S-07`, and `PRI-S-16` with wires split across both ports according to their routes (up/toward-trunk vs down/toward-connector), and the Network Summary splice callout matches the per-wire route direction highlight.
- request-AC4 -> This backlog slice. Proof: AC4: When `spliceSideLocked === true` with a defined `spliceSideOverride`, the operator's locked side is preserved and never overwritten by the geometric resolver.
- request-AC5 -> This backlog slice. Proof: AC5: `sideInverted === true` still mirrors the resolved side as it does today, for all carrier-segment orientations.
- request-AC6 -> This backlog slice. Proof: AC6: Edge cases remain deterministic: zero-length or degenerate carrier vectors, wires whose only route segment is the carrier segment (terminating directly at a segment endpoint connector), splices with all wires genuinely on one side, and multiple splices on the same segment.
- request-AC7 -> This backlog slice. Proof: AC7: Targeted tests cover vertical, near-vertical, horizontal, and diagonal carrier segments, the two-direction split, `sideInverted`, `spliceSideLocked`, and a regression fixture reproducing the `PRI-S-06`/`PRI-S-07`/`PRI-S-16` defect; tests fail on the current x-only logic and pass after the fix.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_148_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Directional splice side resolution must support vertical and near-vertical carrier segments
- Keywords: backlog-groom, request, directional splice side resolution must support vertical and near-vertical carrier segments, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Directional splice side resolution must support vertical and near-vertical carrier segments.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_148_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_148_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments.md`.
- Generated locally by logics-manager.
- Task `task_143_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments` was finished via `logics-manager flow finish task` on 2026-06-22.

# Tasks
- `task_143_directional_splice_side_resolution_must_support_vertical_and_near_vertical_carrier_segments`
