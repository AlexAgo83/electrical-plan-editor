## req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox - Shared connector way (multi-wire crimp) with opt-in overload checkbox
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: wiring-modeling
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- As a harness designer, I can assign a wire endpoint to a connector way that is already occupied, which physically represents crimping 2+ wires into the same terminal.
- Overload is opt-in: a checkbox next to the way selector in the wire endpoint form must be checked for an occupied way to be accepted; without it the current exclusive behavior is unchanged.
- Only the incoming wire needs the overload flag; wires already assigned to the way do not need to be edited.
- No hard limit on the number of wires sharing a way; no seal/terminal warning (rare case, handled case by case by the user).
- Shared ways are visually indicated (physical view, connector analysis panel, validation center info) so the overload stays deliberate and traceable.

# Context
- Occupancy state is Record<ConnectorId, Record<number, string>> (single occupant ref per way) in src/store/types.ts:140,175 - the root single-wire invariant. Decision: widen the value to string[] (occupant ref list) rather than a side-channel map.
- Occupancy is persisted (not recomputed): serialized in networkFile.ts:419-465 and validated in migrations.ts - the shape change requires a schema version bump plus a trivial string -> [string] migration.
- A precedent for shared occupancy already exists: directional splice ports bypass exclusivity via isEndpointOccupancyExclusive (wireEndpointOccupancyGuards.ts:15-17); the same conditional gate extends to the new per-endpoint flag.
- Validation is 3-layered: hard block in wireReducer.ts:262-276, soft form hint in wireEndpointFormHelpers.ts:78-86, and 'multiple wire assignments' error in buildValidationIssues.ts:145-161. All three relax only when the incoming endpoint carries the flag.
- Functional view (functionalSchematic.ts:214) already dedups nodes by (connector, cavity), so shared-way wires are automatically electrically commoned - desired behavior, lock it with a test.
- BOM CSV resolves one terminal per (connector, way) which is physically correct for a shared crimp - keep, but verify with a test.
- Physical view and analysis panel build last-wins Maps keyed by cavityIndex (ConnectorPhysicalView.tsx:277, AnalysisConnectorWorkspacePanels.tsx:233) and must render all occupants of a shared way.

# Acceptance criteria
- AC1: The connectorCavity variant of WireEndpoint carries an optional allowSharedCavity boolean, and connectorCavityOccupancy values are occupant-ref arrays; loading legacy single-string occupancy coerces to one-element arrays with no data loss (load old file -> identical assignments). Implemented via an idempotent normalizeConnectorCavityOccupancy applied on every load/import path (migrations + portability) rather than a formal APP_SCHEMA_VERSION bump, since coercion-on-load is the codebase's existing shape-evolution idiom and runs regardless of stored version - a safer guarantee than a one-shot version step.
- AC2: Saving a wire endpoint onto an occupied way succeeds if and only if the incoming endpoint has allowSharedCavity=true; without the flag the existing 'already occupied' rejection is preserved verbatim, and there is no upper bound on occupants per way.
- AC3: The wire endpoint form shows an 'allow overload' checkbox next to the way index for connector endpoints; when the selected way is occupied and the box is unchecked the hint suggests a free way (current behavior), when checked the hint states the way is shared and with whom.
- AC4: The validation center reports a shared way as a non-blocking warning-level notice (not an error) when at least one occupant endpoint carries the flag, and keeps the 'multiple wire assignments' error when none does. (Implemented as severity "warning" rather than a new "info" level, to avoid rippling a new severity through the validation filters/counts/chips; the warning is visible and non-blocking, matching the intent.)
- AC5: Physical view and connector analysis panel display every occupant of a shared way with a visible shared-way indicator, and the per-way release action targets a specific occupant.
- AC6: Network statistics count a shared way as one occupied way (occupancy percent unchanged) and expose a shared-way count; the functional view merges shared-way wires into one node (regression test); wire list export emits one row per wire with a shared marker on the position; BOM still resolves a single terminal per shared way; JSON export/import round-trips the array occupancy.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_016_shared_connector_way_multi_wire_crimp`
- Architecture decision(s): (none yet)

# References
- src/store/types.ts
- src/store/reducer/wireReducer.ts
- src/store/reducer/helpers/occupancy.ts
- src/store/reducer/helpers/wireEndpointOccupancyGuards.ts
- src/app/components/workspace/ModelingWireFormPanel.tsx
- src/app/hooks/wireEndpointFormHelpers.ts
- src/app/hooks/validation/buildValidationIssues.ts
- src/app/lib/networkStatistics.ts
- src/app/lib/networkSummaryBomCsv.ts
- src/app/lib/wireListExport.ts
- src/adapters/portability/networkFile.ts
- src/adapters/persistence/migrations.ts
- src/core/functionalSchematic.ts
- src/app/components/workspace/ConnectorPhysicalView.tsx
- src/app/components/workspace/AnalysisConnectorWorkspacePanels.tsx

# AI Context
- Summary: Shared connector way (multi-wire crimp) with opt-in overload checkbox
- Keywords: request-chain-scaffold, shared connector way (multi-wire crimp) with opt-in overload checkbox, development-ready
- Use when: You need to implement or review the scaffolded workflow for Shared connector way (multi-wire crimp) with opt-in overload checkbox.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability`
- `item_666_assignment_gate_reducer_exclusivity_bypass_and_overload_checkbox_in_wire_form`
- `item_667_visibility_shared_way_indicators_in_physical_view_analysis_panel_validation_and_statistics`
- `item_668_exports_and_functional_view_shared_way_correctness`
