## item_668_exports_and_functional_view_shared_way_correctness - Exports and functional view: shared-way correctness
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: wiring-modeling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Exports iterate wires so they tolerate shared ways, but nothing marks sharing (wireListExport.ts position column) and the physically-correct single-terminal BOM behavior plus functional-node merging (functionalSchematic.ts:214) are untested emergent behaviors.

# Scope
- In:
  - Wire list CSV/XLSX: shared marker on the position label when the way has multiple occupants.
  - Test: BOM CSV resolves exactly one terminal per shared way.
  - Regression test: functional schematic merges shared-way endpoints into one node (electrically commoned).
  - Test: PDF/summary rendering path does not crash with shared ways.
- Out:
  - No BOM quantity or seal logic changes.

# Acceptance criteria
- AC1: Wire list export emits one row per wire with a shared marker on shared positions; BOM counts one terminal per shared way (test-locked); functional view single-node merge is test-locked.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Wire list export emits one row per wire with a shared marker on shared positions; BOM counts one terminal per shared way (test-locked); functional view single-node merge is test-locked.
- request-AC2 -> This backlog slice. Evidence needed: Saving a wire endpoint onto an occupied way succeeds if and only if the incoming endpoint has allowSharedCavity=true; without the flag the existing 'already occupied' rejection is preserved verbatim, and there is no upper bound on occupants per way.
- request-AC3 -> This backlog slice. Evidence needed: The wire endpoint form shows an 'allow overload' checkbox next to the way index for connector endpoints; when the selected way is occupied and the box is unchecked the hint suggests a free way (current behavior), when checked the hint states the way is shared and with whom.
- request-AC4 -> This backlog slice. Evidence needed: The validation center reports a shared way as a non-blocking warning-level notice (not an error) when at least one occupant endpoint carries the flag, and keeps the 'multiple wire assignments' error when none does. (Implemented as severity "warning" rather than a new "info" level, to avoid rippling a new severity through the validation filters/counts/chips; the warning is visible and non-blocking, matching the intent.)
- request-AC5 -> This backlog slice. Evidence needed: Physical view and connector analysis panel display every occupant of a shared way with a visible shared-way indicator, and the per-way release action targets a specific occupant.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_shared_connector_way_multi_wire_crimp`
- Architecture decision(s): (none yet)
- Request: `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`
- Primary task(s): `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# AI Context
- Summary: Exports and functional view: shared-way correctness
- Keywords: scaffolded-backlog, exports and functional view: shared-way correctness, implementation-ready
- Use when: Implementing the scaffolded slice for Exports and functional view: shared-way correctness.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# Notes
- Task `task_161_orchestrate_shared_connector_way_multi_wire_crimp` was finished via `logics-manager flow finish task` on 2026-07-12.
