## item_492_network_scope_form_controls_for_export_identity_metadata_and_multiline_notes - Network Scope form controls for export identity metadata and multiline notes
> From version: 1.3.0
> Status: Draft
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: UI / Forms
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Users need to author export identity metadata directly from `Network Scope`, but no dedicated controls currently exist for these fields.

# Scope
- In:
  - add/edit `Network Scope` controls for:
    - `Author`,
    - `Project code`,
    - `Logo URL`,
    - `Export notes` (textarea, multiline);
  - display `Creation date` using fixed `YYYY-MM-DD` format;
  - preserve existing network name editing behavior and include it in export identity workflow;
  - enforce input constraints and user feedback for invalid/too-long values.
- Out:
  - export rendering implementation;
  - rich text/markdown editor behavior.

# Acceptance criteria
- AC1: `Network Scope` exposes editable controls for author/project code/logo URL/export notes.
- AC2: Input constraints are enforced consistently with model contract.
- AC3: `Creation date` is displayed in fixed `YYYY-MM-DD` format.
- AC4: Metadata changes persist and restore correctly per network.

# AC Traceability
- AC1 -> Authoring surface is available for req_102.
- AC2 -> UI respects model-level constraints.
- AC3 -> Date display is deterministic.
- AC4 -> Workflow remains usable across app relaunches/network switches.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Depends on `item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.

