## item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability - Core model: array occupancy, allowSharedCavity flag, migration and portability
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: wiring-modeling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- connectorCavityOccupancy stores a single occupant ref per way (types.ts:140,175), hard-encoding the one-wire-per-way invariant into state, persistence, and the portability file format.

# Scope
- In:
  - Widen connectorCavityOccupancy values to occupant-ref arrays in AppState and NetworkScopedState.
  - Add optional allowSharedCavity to the connectorCavity WireEndpoint variant (entities.ts).
  - Rework occupancy helpers (occupancy.ts get/set/release) into list operations preserving ref format wire:<id>:<A|B>.
  - Schema version bump + migration string -> [string] in migrations.ts; portability serialization/parse in networkFile.ts; round-trip tests old->new.
- Out:
  - Reducer gating and UI (next slices).
  - splicePortOccupancy stays as-is.

# Acceptance criteria
- AC1: Occupancy values are arrays end-to-end; loading a legacy file yields one-element arrays with identical assignments; JSON export/import round-trips arrays; all existing tests pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Occupancy values are arrays end-to-end; loading a legacy file yields one-element arrays with identical assignments; JSON export/import round-trips arrays; all existing tests pass.
- request-AC2 -> This backlog slice. Evidence needed: Saving a wire endpoint onto an occupied way succeeds if and only if the incoming endpoint has allowSharedCavity=true; without the flag the existing 'already occupied' rejection is preserved verbatim, and there is no upper bound on occupants per way.
- request-AC3 -> This backlog slice. Evidence needed: The wire endpoint form shows an 'allow overload' checkbox next to the way index for connector endpoints; when the selected way is occupied and the box is unchecked the hint suggests a free way (current behavior), when checked the hint states the way is shared and with whom.
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
- Summary: Core model: array occupancy, allowSharedCavity flag, migration and portability
- Keywords: scaffolded-backlog, core model: array occupancy, allowsharedcavity flag, migration and portability, implementation-ready
- Use when: Implementing the scaffolded slice for Core model: array occupancy, allowSharedCavity flag, migration and portability.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_161_orchestrate_shared_connector_way_multi_wire_crimp`

# Notes
- Task `task_161_orchestrate_shared_connector_way_multi_wire_crimp` was finished via `logics-manager flow finish task` on 2026-07-12.
