## item_505_ui_preferences_schema_versioning_and_forward_migration_matrix - UI preferences schema versioning and forward migration matrix
> From version: 1.3.1
> Status: Draft
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Persistence / Reliability
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
UI preferences persistence has no explicit schema version contract, which makes evolution fragile and introduces unpredictable fallback behavior on legacy payloads.

# Scope
- In:
  - add explicit `version` field on persisted UI preferences payload;
  - define forward-only migration pipeline (`vN -> vN+1`) for all known versions;
  - document deterministic defaults for newly introduced preference keys;
  - add migration matrix tests for legacy payloads.
- Out:
  - network/domain model migrations;
  - unrelated UI feature changes.

# Acceptance criteria
- AC1: Persisted preferences include explicit version metadata.
- AC2: Known legacy versions are migrated deterministically to current schema.
- AC3: Missing keys in legacy payloads are defaulted predictably.
- AC4: Migration matrix tests cover representative payloads and edge cases.

# AC Traceability
- AC1 -> Schema identity is explicit.
- AC2 -> Forward compatibility is deterministic.
- AC3 -> Defaulting behavior is stable.
- AC4 -> Regression safety exists for future evolutions.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_104_post_release_architecture_and_runtime_hardening_for_preferences_measurement_and_controller_split.md`.
- Orchestrated by `logics/tasks/task_080_req_104_post_release_architecture_and_runtime_hardening_orchestration_and_delivery_control.md`.
