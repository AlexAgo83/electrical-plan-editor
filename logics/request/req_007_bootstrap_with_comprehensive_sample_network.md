## req_007_bootstrap_with_comprehensive_sample_network - Bootstrap with Comprehensive Sample Network
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Complexity: Medium
> Theme: Onboarding and Demo Data
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Initialize the app with a realistic example network so users can explore features immediately.
- Provide a complete demo dataset that exercises connectors, splices, nodes, segments, wires, occupancy, and routing.
- Keep deterministic behavior and avoid overwriting existing user data.

# Context
Current startup experience may open on an empty state, which slows onboarding and makes it harder to validate feature flows quickly.

This request introduces a built-in comprehensive sample network for first-run experience and demo/testing workflows, while preserving local-first persistence and data safety.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Define a stable sample network fixture with coherent IDs and routing graph.
- Bootstrap this sample deterministically on first launch (or when explicitly requested).
- Ensure sample data works across modeling, analysis, validation, and future import/export flows.
- Keep sample lifecycle explicit so users can keep, duplicate, or remove it.

## Functional Scope
### Sample dataset definition
- Add one comprehensive sample network fixture containing:
  - multiple connectors
  - multiple splices
  - intermediate nodes
  - segments with lengths and sub-network tags
  - wires with valid endpoints and computed routes
  - at least one locked route scenario
- Fixture must use deterministic IDs/technical IDs and human-readable names.

### Bootstrap behavior
- On first run with no persisted networks, auto-create the sample network and set it active.
- If persisted user data already exists, bootstrap must not overwrite or mutate existing networks.
- Provide deterministic naming for sample network (for example `Sample network` with fixed technical ID pattern).

### User controls for sample data
- Add explicit action(s) in UI/settings to:
  - recreate sample network when missing
  - reset sample network to original fixture state
- Ensure reset/recreate actions are safe and scoped to sample network only.

### Integrity and compatibility
- Sample network must satisfy current validation rules by default (or provide intentionally documented warnings if chosen).
- Sample data must remain compatible with multi-network behavior and selector navigation.
- Sample data must be exportable/importable through file workflows without breaking consistency.

## Acceptance criteria
- AC1: On a clean first launch (no persisted data), the app starts with one active comprehensive sample network.
- AC2: Existing user data is never overwritten by sample bootstrap.
- AC3: Sample network contains enough entities to demonstrate core workflows end-to-end.
- AC4: Sample network can be recreated/reset via explicit user action.
- AC5: Sample network behaves correctly in routing, occupancy, and validation screens.
- AC6: Sample network is compatible with network import/export and multi-network navigation.
- AC7: Automated tests cover first-run bootstrap, no-overwrite behavior, and sample reset/recreate flows.

## Non-functional requirements
- Keep startup performance acceptable when loading sample fixture.
- Preserve deterministic fixture content and stable IDs across runs.
- Maintain existing quality gates (`lint`, `typecheck`, `unit`, `integration`, `e2e`).

## Out of scope
- Multiple sample templates in this wave.
- Remote sample catalogs or downloadable presets.
- Tutorial overlay/coachmarks content design.

# Backlog
- To create from this request:
  - `item_040_sample_network_fixture_definition_and_schema_alignment.md`
  - `item_041_first_run_bootstrap_and_no_overwrite_guards.md`
  - `item_042_sample_network_recreate_and_reset_user_actions.md`
  - `item_043_sample_data_multi_network_and_import_export_compatibility.md`
  - `item_044_sample_bootstrap_test_matrix_and_regression_coverage.md`

# References
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/request/req_004_network_import_export_file_workflow.md`
- `README.md`
