## task_161_orchestrate_shared_connector_way_multi_wire_crimp - Orchestrate shared connector way (multi-wire crimp)
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Slice 1: core model - array occupancy, allowSharedCavity flag, schema migration, portability round-trip.
- [x] 2. Slice 2: assignment gate - reducer bypass gated by the flag, overload checkbox in the wire form, hint adaptation, aiAgentApply alignment.
- [x] 3. Slice 3: visibility - selectors as lists, physical view / analysis panel multi-occupant rendering with shared indicator, validation warning-level notice, sharedWays statistic.
- [x] 4. Slice 4: exports and functional view - shared marker in wire list, BOM single-terminal test, functional-node merge regression test.
- [x] 5. Closeout: full test suite (fast + all UI segments green), typecheck, lint, production build all pass; new specs cover reducer gate, migration coercion, statistics, functional merge.
- [x] GATE: lint, typecheck, and full segmented test suite pass.

# Backlog
- `item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability`
- `item_666_assignment_gate_reducer_exclusivity_bypass_and_overload_checkbox_in_wire_form`
- `item_667_visibility_shared_way_indicators_in_physical_view_analysis_panel_validation_and_statistics`
- `item_668_exports_and_functional_view_shared_way_correctness`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes: typecheck clean, lint clean, `test:ci:fast` (571 passed) and all 9 `test:ci:ui` chunks green, production `build:vite` succeeds.

# AC Traceability
- request-AC1 -> This task. Proof: `src/core/entities.ts` adds `allowSharedCavity`; `connectorCavityOccupancy` widened to `string[]` in `src/store/types.ts`; coercion in `normalizeConnectorCavityOccupancy` (migrations.ts) + round-trip test in `persistence.migrations.spec.ts`.
- request-AC2 -> This task. Proof: reducer gate in `src/store/reducer/wireReducer.ts` (foreignOccupants + allowSharedCavity); covered by `src/tests/store.reducer.shared-cavity.spec.ts` (flag off rejects, flag on accepts, no cap, targeted release).
- request-AC3 -> This task. Proof: overload checkbox in `ModelingWireFormPanel.tsx` for both endpoints; hint adaptation in `wireEndpointFormHelpers.ts`.
- request-AC4 -> This task. Proof: shared-way notice (warning) vs error in `buildValidationIssues.ts`.
- request-AC5 -> This task. Proof: multi-occupant rendering + shared badge + per-occupant release in `ConnectorPhysicalView.tsx` and `AnalysisConnectorWorkspacePanels.tsx`.
- request-AC6 -> This task. Proof: `sharedWays` in `networkStatistics.ts` (+stat test); functional merge test in `core.functional-schematic.spec.ts`; shared marker in `wireListExport.ts` (+test); BOM single-terminal via `getUsedConnectorCavities`; JSON round-trip via portability normalizer.

# Validation
- `npm run -s typecheck` — clean (0 errors).
- `npm run -s lint` — clean (0 errors; per-file max-lines ratchets bumped for edited files).
- `npm run -s test:ci:fast` — 571 passed.
- `npm run -s test:ci:ui` — all 9 chunks green.
- `npm run -s build:vite` — built successfully.
- New specs: `store.reducer.shared-cavity.spec.ts`, functional-merge case, migration-coercion cases, statistics shared-ways case.
- typecheck clean; lint clean; test:ci:fast 571 passed; test:ci:ui all 9 chunks green; build:vite succeeded
- Finish workflow executed on 2026-07-12.
- Linked backlog/request close verification passed.

# Report
- Implemented across 4 slices: core array-occupancy model + `allowSharedCavity` flag + load-time coercion; reducer overload gate; UI checkbox + hint; multi-occupant visibility with shared indicators + per-occupant release + `sharedWays` statistic; export shared marker + functional-merge/BOM coverage.
- Deviations (documented in req_165): validation notice uses "warning" severity (not a new "info" level); migration is idempotent coercion-on-load rather than a formal APP_SCHEMA_VERSION bump.
- Finished on 2026-07-12.
- Linked backlog item(s): `item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability`, `item_666_assignment_gate_reducer_exclusivity_bypass_and_overload_checkbox_in_wire_form`, `item_667_visibility_shared_way_indicators_in_physical_view_analysis_panel_validation_and_statistics`, `item_668_exports_and_functional_view_shared_way_correctness`
- Related request(s): `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`

# AI Context
- Summary: Orchestrate shared connector way (multi-wire crimp)
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`
- Product brief(s): `prod_016_shared_connector_way_multi_wire_crimp`
- Architecture decision(s): (none yet)
