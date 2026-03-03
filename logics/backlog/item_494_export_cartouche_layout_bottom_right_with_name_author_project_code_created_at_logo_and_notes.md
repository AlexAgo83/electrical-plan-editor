## item_494_export_cartouche_layout_bottom_right_with_name_author_project_code_created_at_logo_and_notes - Export cartouche layout bottom-right with name, author, project code, creation date, logo, and notes
> From version: 1.3.0
> Status: Done
> Understanding: 98% (cartouche toggle default and notes clamp behavior clarified)
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: UI / Export layout
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Export artifacts currently miss a structured bottom-right identity block, making them harder to use as standalone project documents.

# Scope
- In:
  - add dedicated Settings toggle to enable/disable export cartouche, default `on`;
  - render deterministic bottom-right export cartouche for SVG and PNG;
  - top section content:
    - network name,
    - author (if provided),
    - project code (if provided),
    - creation date (`YYYY-MM-DD` from local-time conversion at export),
    - logo (if available);
  - lower section content:
    - multiline notes paragraph (if provided);
  - enforce layout bounds/wrapping/clamping to avoid overflow and protect schema readability (`8` visible lines max + ellipsis for notes).
- Out:
  - advanced page-layout/print templates;
  - multiple cartouche positions.

# Acceptance criteria
- AC1: A dedicated settings toggle controls cartouche rendering and defaults to `on`.
- AC2: Cartouche appears at bottom-right in SVG and PNG exports when toggle is enabled.
- AC3: Cartouche includes required identity fields and optional fields when present.
- AC4: Notes render as multiline plain text with deterministic wrapping and `8`-line clamp + ellipsis.
- AC5: Layout bounds prevent cartouche overflow and preserve diagram readability.

# AC Traceability
- AC1 -> Visibility control contract is delivered.
- AC2 -> Placement contract is delivered.
- AC3 -> Content contract is delivered.
- AC4 -> Free-text block usability is delivered.
- AC5 -> Readability/non-overflow contract is delivered.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Depends on `item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.
- Implemented:
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx` toggle `Include identity cartouche in SVG/PNG export` (default on);
  - `src/app/components/NetworkSummaryPanel.tsx` bottom-right cartouche overlay containing network name, author, project code, local `YYYY-MM-DD` creation date, logo area, and notes block;
  - deterministic notes wrapping/clamping (`8` lines max with ellipsis) and bounded layout sizing;
  - regression tests in `src/tests/app.ui.network-summary-bom-export.spec.tsx` validating cartouche presence/absence and notes clamp behavior.
