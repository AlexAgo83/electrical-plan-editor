## item_496_persistence_and_network_file_migration_coverage_for_new_network_metadata_fields - Persistence and network file migration coverage for new network metadata fields
> From version: 1.3.0
> Status: In Progress
> Understanding: 96%
> Confidence: 90%
> Progress: 65%
> Complexity: High
> Theme: Persistence / Portability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
New network metadata fields introduce schema-evolution risk for local storage and import/export payloads.

# Scope
- In:
  - add migration/normalization support for new network metadata fields;
  - preserve backward compatibility with legacy payloads missing these fields;
  - ensure deterministic defaults during hydration/import;
  - add regression fixtures/tests for local persistence and network-file portability.
- Out:
  - breaking schema changes requiring manual user intervention;
  - external migration tooling.

# Acceptance criteria
- AC1: Local persistence hydration supports old payloads and defaults missing metadata safely.
- AC2: Network import/export supports old/new payloads with deterministic metadata normalization.
- AC3: Unsupported malformed metadata payloads fail safely without corrupting workspace state.
- AC4: Regression test coverage exists for migration and portability contracts.

# AC Traceability
- AC1 -> Local backward compatibility is maintained.
- AC2 -> File portability compatibility is maintained.
- AC3 -> Failure handling remains safe.
- AC4 -> Compatibility behavior is guarded by tests.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Depends on `item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.
- Implemented baseline:
  - persistence schema version bumped to `v3` with migration step `v2 -> v3`;
  - legacy/current payload hydration now normalizes network metadata fields and drops invalid metadata safely;
  - network-file portability schema bumped to `v3` with import/export metadata normalization.
- Remaining:
  - dedicated regression coverage completion (tests) and closure evidence update.
