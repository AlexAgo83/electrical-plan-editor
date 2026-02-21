## req_004_network_import_export_file_workflow - Network Import and Export File Workflow
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Complexity: High
> Theme: Data Portability
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Allow users to export networks to files for backup, sharing, and transfer.
- Allow users to import network files into the app with safe validation and deterministic conflict handling.
- Keep imported/exported data compatible with local-first schema evolution.

# Context
Current multi-network behavior is local-storage only. Users cannot move their networks between machines, create portable backups, or share network datasets in a controlled way.

This request introduces explicit file import/export workflows at network level, while preserving deterministic domain behavior and persistence guarantees.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Define a stable file payload contract for exported networks.
- Support export of active network and multi-network batches.
- Support import with schema validation, migration, and conflict resolution.
- Provide clear UX feedback for success, warnings, and failed imports.

## Functional Scope
### Export workflow
- Add export actions for:
  - active network
  - selected networks
  - all networks
- Export payload must include:
  - schema version
  - export timestamp
  - app/source metadata
  - network content (connectors, splices, nodes, segments, wires, layout/view state)
- Export format for this scope is JSON file-based and deterministic.

### Import workflow
- Add file picker import action for supported export files.
- Validate payload structure and schema version before state integration.
- Apply schema migration when importing older valid payload versions.
- Provide import summary:
  - imported networks
  - skipped networks
  - warnings/errors per network

### Conflict handling
- Detect `technicalId` conflicts on imported network IDs and owned entities.
- Define deterministic default strategy:
  - keep existing local network unchanged
  - import conflicting network with generated non-colliding ID suffix
- Prevent destructive overwrite unless explicit future option is introduced.

### State and integrity guarantees
- Imported networks must remain isolated and fully valid in multi-network model.
- No cross-network references may be introduced by import.
- Import/export must preserve route locks, occupancy-critical fields, and deterministic routing inputs.

### UX behavior
- Add import/export entry points in workspace settings/network management area.
- Show user-facing status messages (`success`, `partial`, `failed`) with actionable details.
- Keep current app context stable during import failures (no partial corrupt state commit).

## Acceptance criteria
- AC1: Users can export active network and all networks into valid JSON files.
- AC2: Users can import a valid export file and see imported networks in selector/workspace.
- AC3: Import supports older supported schema versions through migration path.
- AC4: `technicalId` conflicts are resolved deterministically without destructive overwrite.
- AC5: Imported networks preserve routing, occupancy, and validation behavior.
- AC6: Invalid files are rejected safely with clear error feedback and no state corruption.
- AC7: Automated tests cover export payload validity, import migration, conflict handling, and failure rollback.

## Non-functional requirements
- No regression on existing local-first persistence behavior.
- Deterministic serialization output for stable re-import and testability.
- Import processing remains responsive for typical project-sized network datasets.
- Keep current quality gates (`lint`, `typecheck`, `unit`, `integration`, `e2e`).

## Out of scope
- Cloud synchronization or remote repositories.
- Real-time collaborative merge/conflict resolution.
- Non-JSON proprietary exchange formats in this wave.

# Backlog
- To create from this request:
  - `item_025_network_export_schema_and_serializer.md`
  - `item_026_network_import_parser_validation_and_migration.md`
  - `item_027_import_conflict_resolution_and_id_deduplication.md`
  - `item_028_import_export_ui_flow_and_user_feedback.md`
  - `item_029_import_export_test_matrix_and_regression_coverage.md`

# References
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/tasks/task_004_network_import_export_orchestration_and_delivery_control.md`
- `README.md`
