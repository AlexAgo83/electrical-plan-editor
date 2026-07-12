## item_666_assignment_gate_reducer_exclusivity_bypass_and_overload_checkbox_in_wire_form - Assignment gate: reducer exclusivity bypass and overload checkbox in wire form
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: wiring-modeling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- wireReducer.ts:262-276 hard-rejects any occupied way and the wire form (ModelingWireFormPanel.tsx) offers no way to opt into sharing; the hint (wireEndpointFormHelpers.ts:78-86) always steers to a free way.

# Scope
- In:
  - Extend the exclusivity gate (wireEndpointOccupancyGuards.ts pattern) so wire/save accepts an occupied way when the incoming endpoint has allowSharedCavity=true; no occupant cap.
  - Add the overload checkbox next to the way index input for both endpoints A and B (reuse the splice lock-forced-side checkbox pattern at ModelingWireFormPanel.tsx:564-572).
  - Adapt computeWireEndpointSlotHint: unchecked+occupied keeps the free-way suggestion; checked+occupied states the way is shared and lists current occupants.
  - Align aiAgentApply.ts endpoint validation with the new rule.
  - Reducer unit tests: flag off -> rejected, flag on -> accepted, edit-self unaffected, release removes only the targeted ref.
- Out:
  - Display surfaces and stats (next slice).
  - connector/occupyCavity manual reservation stays exclusive.

# Acceptance criteria
- AC1: With the checkbox unchecked, saving onto an occupied way fails with the current message; checked, it succeeds and both wires keep their assignment.
- AC2: The checkbox is only relevant for connectorCavity endpoints and its state persists through form edit sessions of the same wire.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: With the checkbox unchecked, saving onto an occupied way fails with the current message; checked, it succeeds and both wires keep their assignment.
- request-AC3 -> This backlog slice. Proof: AC2: The checkbox is only relevant for connectorCavity endpoints and its state persists through form edit sessions of the same wire.
- request-AC4 -> This backlog slice. Evidence needed: The validation center reports a shared way as a non-blocking warning-level notice (not an error) when at least one occupant endpoint carries the flag, and keeps the 'multiple wire assignments' error when none does. (Implemented as severity "warning" rather than a new "info" level, to avoid rippling a new severity through the validation filters/counts/chips; the warning is visible and non-blocking, matching the intent.)
- request-AC5 -> This backlog slice. Evidence needed: Physical view and connector analysis panel display every occupant of a shared way with a visible shared-way indicator, and the per-way release action targets a specific occupant.
- request-AC6 -> This backlog slice. Evidence needed: Network statistics count a shared way as one occupied way (occupancy percent unchanged) and expose a shared-way count; the functional view merges shared-way wires into one node (regression test); wire list export emits one row per wire with a shared marker on the position; BOM still resolves a single terminal per shared way; JSON export/import round-trips the array occupancy.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_shared_connector_way_multi_wire_crimp`
- Architecture decision(s): (none yet)
- Request: `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`
- Primary task(s): `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# AI Context
- Summary: Assignment gate: reducer exclusivity bypass and overload checkbox in wire form
- Keywords: scaffolded-backlog, assignment gate: reducer exclusivity bypass and overload checkbox in wire form, implementation-ready
- Use when: Implementing the scaffolded slice for Assignment gate: reducer exclusivity bypass and overload checkbox in wire form.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# Notes
- Task `task_161_orchestrate_shared_connector_way_multi_wire_crimp` was finished via `logics-manager flow finish task` on 2026-07-12.
