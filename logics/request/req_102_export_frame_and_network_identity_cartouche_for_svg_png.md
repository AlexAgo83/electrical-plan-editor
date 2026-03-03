## req_102_export_frame_and_network_identity_cartouche_for_svg_png - Export frame and network identity cartouche for SVG/PNG
> From version: 1.3.0
> Status: Draft
> Understanding: 97%
> Confidence: 94%
> Complexity: High
> Theme: UI / Export / Network metadata
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Add an option to render a frame around the network schema in SVG/PNG export.
- Add editable network identity fields in `Network Scope`:
  - `Author`
  - `Project code`
  - `Logo URL`
  - multi-line free information paragraph
- Include these fields in an export cartouche shown at bottom-right, with `Network name` and `Creation date`.

# Context
- Export quality/features already evolved (SVG/PNG selection and related settings), but exports still miss project-documentation context.
- Users need generated plans to carry identity metadata directly in the exported artifact:
  - what project/network it belongs to,
  - who authored it,
  - when it was created,
  - optional logo,
  - optional descriptive notes.
- Existing network model already stores `name` and `createdAt`, but there is no dedicated export identity cartouche.

# Objective
- Produce export-ready documents (SVG/PNG) that can be shared as standalone artifacts with project identity and contextual notes.
- Keep cartouche layout deterministic and readable.
- Keep behavior backward-compatible for existing workspaces/imports.

# Scope
- In:
  - add an export option to enable/disable outer frame rendering around the schema;
  - frame styling reuses the segment visual language (stroke/tokens) for consistency;
  - add/edit network-level fields in `Network Scope`:
    - `author` (string),
    - `projectCode` (string),
    - `logoUrl` (string URL),
    - `exportNotes` (multi-line paragraph);
  - expose `Network name` and `Creation date` in export cartouche using network model values;
  - render bottom-right export cartouche containing:
    - top zone: logo (if available), network name, author, project code, creation date,
    - lower zone: free information paragraph;
  - keep cartouche/frame behavior coherent for both SVG and PNG exports;
  - persist/restore metadata and export options in existing storage/import/export flows.
- Out:
  - rich text editor/markdown in notes (plain text only for this request);
  - image upload pipeline/storage backend (URL-only logo source in this scope);
  - full print layout engine (pages, headers/footers, tiling);
  - unrelated redesign of `Network Scope` or `Settings` information architecture.

# Locked execution decisions
- Decision 1: `Network name` and `Creation date` come from the network model (`name`, `createdAt`), with `createdAt` initialized at network creation as today.
- Decision 2: New fields (`author`, `projectCode`, `logoUrl`, `exportNotes`) are network-scoped metadata editable in `Network Scope`.
- Decision 3: Export frame is controlled by an explicit export setting/toggle and defaults to `off` for backward visual compatibility.
- Decision 4: Cartouche rendering is deterministic and anchored bottom-right in export output.
- Decision 5: Cartouche always includes network name and creation date; optional fields render only when non-empty.
- Decision 6: Logo loading failure (invalid URL, network error, CORS restriction) must not break export; export continues without logo.
- Decision 7: Notes are plain text with multi-line support and wrapping/clamping safeguards to prevent cartouche overflow.
- Decision 8: Existing export format behavior (`SVG`/`PNG`) remains unchanged apart from frame/cartouche additions.
- Decision 9: Field limits are enforced for deterministic layout and data hygiene:
  - `Author` max length: `80` chars,
  - `Project code` max length: `40` chars,
  - `Logo URL` max length: `2048` chars,
  - `Export notes` max length: `2000` chars.
- Decision 10: Export date format is fixed to `YYYY-MM-DD` (derived from `createdAt`) for deterministic output independent of current UI locale.

# Functional behavior contract
## A. Metadata authoring in Network Scope
- `Network Scope` exposes editable controls for:
  - `Author`
  - `Project code`
  - `Logo URL`
  - `Export notes` (textarea, multi-line)
- `Creation date` is displayed from network data; if editability is allowed later, it is outside this request unless explicitly required.
- Metadata updates are persisted with network state.
- Input constraints:
  - `Author` <= `80` chars,
  - `Project code` <= `40` chars,
  - `Logo URL` <= `2048` chars,
  - `Export notes` <= `2000` chars.

## B. Export frame behavior
- New export setting toggles frame around the schema.
- Frame visual style aligns with segment design language (color/stroke family and theme behavior).
- Frame is included consistently in both SVG and PNG outputs when enabled.

## C. Export cartouche behavior
- Bottom-right cartouche is rendered in export output with:
  - `Network name`
  - `Author` (if provided)
  - `Project code` (if provided)
  - `Creation date`
  - `Logo` (if URL resolvable and renderable)
  - free notes paragraph (if provided)
- Cartouche has bounded layout (max width/height strategy, wrapping, clipping safeguards) to preserve schema readability.
- If notes are empty, cartouche still renders core identity lines (name/date and available optional metadata).
- `Creation date` display uses fixed `YYYY-MM-DD` format.

## D. SVG/PNG reliability and fallback
- SVG export embeds cartouche and frame deterministically.
- PNG export includes cartouche and frame when enabled and remains successful even when logo cannot be rendered.
- On logo failure, export should degrade gracefully (logo omitted; other metadata preserved).

## E. Compatibility
- Existing saved workspaces without new metadata fields remain loadable.
- Import/export network file compatibility remains preserved (legacy payloads normalized with safe defaults).

# Acceptance criteria
- AC1: A user can edit `Author`, `Project code`, `Logo URL`, and multi-line `Export notes` in `Network Scope`.
- AC2: `Network name` and `Creation date` are available for export cartouche rendering by default.
- AC3: Export frame toggle exists and controls frame rendering in both SVG and PNG exports.
- AC4: Exported SVG includes bottom-right cartouche with core identity fields and optional metadata when provided.
- AC5: Exported PNG includes the same cartouche/frame contract as SVG.
- AC6: Invalid/unreachable/CORS-blocked logo URLs do not fail export; export succeeds without logo.
- AC7: Input-length constraints for author/project code/logo URL/export notes are enforced as defined.
- AC8: Legacy persisted/imported payloads without new metadata fields load correctly with deterministic defaults.
- AC9: `Creation date` in export cartouche is rendered in fixed `YYYY-MM-DD` format.
- AC10: `logics_lint`, `lint`, `typecheck`, and relevant export/UI tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - metadata edit/persist/restore in `Network Scope`;
  - SVG export with frame/cartouche on/off;
  - PNG export with frame/cartouche on/off;
  - long-note wrapping/clamping behavior;
  - logo success/failure fallback behavior;
  - backward compatibility with legacy storage/import payloads.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- PNG export may hit cross-origin restrictions for remote logos (canvas tainting risk) if not handled defensively.
- Cartouche overflow risks on very long notes or narrow export bounds if layout constraints are not explicit.
- Schema versioning/migration updates are required for new network metadata fields and can introduce import edge cases.

# Backlog
- To create from this request:
  - `item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes.md`
  - `item_492_network_scope_form_controls_for_export_identity_metadata_and_multiline_notes.md`
  - `item_493_export_frame_toggle_and_segment_style_aligned_border_rendering_for_svg_png.md`
  - `item_494_export_cartouche_layout_bottom_right_with_name_author_project_code_created_at_logo_and_notes.md`
  - `item_495_logo_loading_failure_and_cors_safe_png_export_fallback_behavior.md`
  - `item_496_persistence_and_network_file_migration_coverage_for_new_network_metadata_fields.md`
  - `item_497_req_102_validation_matrix_and_traceability_closure.md`

# Orchestration task
- `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`

# References
- `src/core/entities.ts`
- `src/store/types.ts`
- `src/store/actions.ts`
- `src/store/reducer/networkReducer.ts`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useNetworkScopeFormState.ts`
- `src/app/hooks/useNetworkScopeFormOrchestration.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/app.ui.networks.spec.tsx`
- `src/tests/app.ui.settings-canvas-render.spec.tsx`
- `src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `src/tests/network-import-export.spec.ts`
- `logics/request/req_088_network_summary_export_quality_with_svg_default_and_png_switch_in_canvas_tools.md`
