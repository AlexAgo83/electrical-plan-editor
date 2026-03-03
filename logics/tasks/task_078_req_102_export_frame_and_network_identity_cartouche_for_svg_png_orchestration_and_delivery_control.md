## task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control - Req 102 export frame and network identity cartouche orchestration and delivery control
> From version: 1.3.0
> Status: Draft
> Understanding: 99% (orchestration constraints and defaults fully clarified)
> Confidence: 94%
> Progress: 5%
> Complexity: High
> Theme: UI / Export / Persistence
> Reminder: Update status/understanding/confidence/progress and dependencies/references when you edit this doc.

# Context
- Orchestration task to deliver:
  - `req_102_export_frame_and_network_identity_cartouche_for_svg_png`
- Backlog execution scope:
  - `item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes`
  - `item_492_network_scope_form_controls_for_export_identity_metadata_and_multiline_notes`
  - `item_493_export_frame_toggle_and_segment_style_aligned_border_rendering_for_svg_png`
  - `item_494_export_cartouche_layout_bottom_right_with_name_author_project_code_created_at_logo_and_notes`
  - `item_495_logo_loading_failure_and_cors_safe_png_export_fallback_behavior`
  - `item_496_persistence_and_network_file_migration_coverage_for_new_network_metadata_fields`
  - `item_497_req_102_validation_matrix_and_traceability_closure`
- Hard constraints carried from request:
  - `Creation date` is editable in `Network Scope`, stored via `network.createdAt`, and exported as local-time `YYYY-MM-DD`;
  - both `Export frame` and `Export cartouche` are controlled by dedicated Settings toggles, defaults:
    - `frame=off`,
    - `cartouche=on`;
  - logo fallback in exports must show `Logo indisponible` without failing SVG/PNG export;
  - network identity cartouche includes network name + author + project code + creation date + logo (if available) + notes;
  - notes in cartouche are visually clamped to `8` lines with ellipsis;
  - field limits are enforced:
    - `author` <= `80`,
    - `projectCode` <= `40`,
    - `logoUrl` <= `2048`,
    - `exportNotes` <= `2000`;
  - `projectCode` allowed characters: `[A-Za-z0-9 _./-]`;
  - `logoUrl` allowed schemes: `http`, `https`, `data:image/*`.

# Plan
- [ ] 1. Implement network metadata contract extension and compatibility baseline (`item_491`, `item_496`)
  - extend domain/store/adapters contracts with deterministic defaults and normalization;
  - add migration/portability coverage for legacy payload compatibility.
- [ ] 2. Deliver authoring surfaces in Network Scope (`item_492`)
  - add/edit controls for author/project code/logo URL/notes + creation date behavior;
  - enforce field limits and validation feedback.
- [ ] 3. Deliver export rendering options and visuals (`item_493`, `item_494`)
  - add settings toggles for frame/cartouche with documented defaults;
  - render frame + bottom-right cartouche in SVG/PNG with bounded layout.
- [ ] 4. Harden logo fallback robustness (`item_495`)
  - guarantee non-failing export path when logo cannot be loaded/CORS-restricted;
  - render `Logo indisponible` placeholder in cartouche fallback.
- [ ] 5. Validate and close traceability (`item_497`)
  - execute validation matrix and capture evidence;
  - update linked request/backlog/task docs and finalize closure status.
- [ ] FINAL: Update related Logics docs

# AC Traceability
- AC1 (`item_491`, `item_492`) -> Metadata authoring and constraints are implemented.
- AC2 (`item_493`) -> Export frame toggle/visual contract is implemented.
- AC3 (`item_494`) -> Export cartouche content/layout contract is implemented.
- AC4 (`item_495`) -> Logo failure/CORS fallback is robust and non-blocking.
- AC5 (`item_496`) -> Persistence/import/export compatibility is preserved.
- AC6 (`item_497`) -> Validation matrix and traceability closure are complete.

# Validation
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] Linked request/backlog/task docs updated.
- [ ] Status is `Done` and progress is `100%`.

# Report
- Pending implementation.
