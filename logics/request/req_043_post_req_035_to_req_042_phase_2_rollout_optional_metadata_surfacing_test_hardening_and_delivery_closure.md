## req_043_post_req_035_to_req_042_phase_2_rollout_optional_metadata_surfacing_test_hardening_and_delivery_closure - Post req_035-042 Follow-up: Phase-2 Rollout, Optional Metadata Surfacing, Test Hardening, and Delivery Closure
> From version: 0.8.0
> Understanding: 97%
> Confidence: 95%
> Complexity: Medium-High
> Theme: Follow-up Delivery Completion and Quality Hardening After req_035-042 Baseline Implementation
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Formalize the remaining non-blocking work after the successful implementation of `req_035` through `req_042`.
- Complete the planned phase-2 rollout of the reusable table filter bar pattern introduced for `Wires` and `Network Scope`.
- Surface newly added optional metadata fields in additional UI views (table/inspector/export/search) where valuable and low-risk.
- Polish onboarding UX details that were identified after baseline delivery (icons, CTA layout/visual consistency, step navigation actions, contextual panel scrolling behavior).
- Refresh onboarding step descriptions/content so they reflect the new fields and capabilities added in the recently delivered reqs/tasks (`req_036`-`req_042`).
- Improve edit-form save ergonomics by restoring focus to the edited table row after successful save.
- Add configurable auto-node creation toggles to connector/splice forms and expose the default value in Settings.
- Keep `Help` button placement consistent in table-panel action rows while expanding filter bars to additional panels.
- Add a `Network Scope` export action in the panel actions area (under `Duplicate`).
- Reduce test noise and improve test harness resilience after onboarding auto-open and new UI behaviors.
- Capture delivery closure hygiene tasks (traceability/status updates in `logics`) and a manual QA pass checklist for the delivered bundle.
- Review and update `README.md` documentation where needed to reflect the delivered features and any follow-up UX behavior changes.

# Context
`req_035` through `req_042` have been implemented and validated (including lint, typecheck, `test:ci`, build, PWA quality, and E2E). The delivered baseline includes:
- onboarding modal flow and contextual help (`req_035`)
- editable `nodeId` via atomic rename (`req_036`)
- wire endpoint occupancy validation + next-free prefill (`req_037`)
- wire `sectionMm2` + default setting + compatibility patch (`req_038`)
- wire color catalog + optional mono/bi-color support (`req_039`)
- optional `manufacturerReference` for connectors/splices (`req_040`)
- optional per-side wire connection/seal references (`req_041`)
- reusable table filter bar pilot for `Wires` + `Network Scope` (`req_042`)

What remains is intentionally outside the baseline acceptance scope, but still important for product completeness, UX consistency, and engineering hygiene.

## Follow-up scope principles (recommended)
- Do not reopen baseline functional scope already accepted for `req_035`-`req_042` unless a regression is identified.
- Prioritize low-risk, high-visibility improvements that build on the shipped model changes.
- Keep the work decomposed into independent increments with commits and validation gates between steps.
- Treat this request as a post-delivery follow-up bundle (phase 2 rollout + surfacing + hardening + closure), not a reimplementation of the original features.

## Implementation strategy decisions (recommended baseline)
- Execute in waves with checkpoint commits (recommended), not as one monolithic implementation pass.
- Recommended wave order:
  1. onboarding UX polish and onboarding copy refresh
  2. edit-form `Save` focus restoration ergonomics
  3. connector/splice auto-node checkbox + Settings default preset
  4. panel action-row consistency (`Help` placement) + `Network Scope` export
  5. table filter-bar phase-2 rollout (`Connectors`, `Splices`, `Nodes`, `Segments`)
  6. optional metadata surfacing (wire/connector/splice views and optional exports)
  7. test hardening + docs/closure (`README`, `logics`, QA checklist)
- Continue the validation-gate discipline between waves (same pattern as `task_043` super orchestration).
- Prefer low-risk alignment with existing product UI/components over introducing onboarding-specific or panel-specific visual variants.

## Clarified UX/behavior decisions (recommended)
- Onboarding icons:
  - reuse existing in-app feature icons where possible
  - allow documented fallback badge/icon only when no suitable icon exists
- Onboarding `Next` / `Finish`:
  - align with the standard primary action look-and-feel already used in the product
- Shared `Connectors / Splices` onboarding step:
  - show both `Open Connectors` and `Open Splices` CTAs side-by-side
  - keep `Next` / `Finish` as the separate flow action
- Edit-form focus restoration after `Save`:
  - scope to table-backed entity forms (recommended baseline)
  - exclude panels without a meaningful row target (for example `Settings`)
- Connector/splice auto-node creation default:
  - use one shared Settings preference for connector + splice create flows (recommended simplicity baseline)
  - checkbox is primarily a create-flow control; edit flows must not unexpectedly create nodes
- `Network Scope` export button:
  - export the selected/active network only (recommended baseline)
  - reuse existing export pipeline/format where possible
- Metadata surfacing priority:
  - wire `sectionMm2` + colors: prioritize wire table and/or inspector
  - longer references (`manufacturerReference`, endpoint connection/seal refs): prioritize inspector first, table/export only if low-risk
- README updates:
  - prefer a targeted accuracy refresh over a broad README restructure
- Test hardening:
  - implement early in the follow-up (recommended) to reduce noise during later UI iterations

## Objectives
- Extend the table filter-bar pattern to the remaining high-value tabular panels.
- Improve visibility and usability of newly stored optional metadata in day-to-day views.
- Polish onboarding UX so the modal visual language and in-step actions align better with the rest of the product UI.
- Keep onboarding instructional copy aligned with the current product capabilities (new wire fields, references, color/section, filter behavior, etc.).
- Improve save/edit ergonomics and creation-flow configurability for connector/splice workflows.
- Make automated test output cleaner and E2E flows more resilient to onboarding overlays.
- Ensure `logics` documentation reflects actual delivery status and traceability for the req/task/item bundle.
- Ensure top-level project documentation (`README.md`) stays accurate after the delivered and follow-up changes.
- Provide a repeatable manual QA checklist for validating cross-feature behavior added in `req_035`-`req_042`.

## Functional Scope
### A. Table filter-bar phase-2 rollout (high priority)
- Extend the `req_042` reusable filter-bar pattern beyond `Wires` and `Network Scope` to the next recommended panel set:
  - `Connectors`
  - `Splices`
  - `Nodes`
  - `Segments`
- Preserve panel widths (no panel growth) while adopting:
  - `Filter` label
  - field selector
  - full-width text input within available row space
- Support panel-specific field option sets (recommended) rather than one global selector list.
- Preserve existing sort/filter controls and list interactions in each upgraded panel.

### B. Optional metadata surfacing in additional UI views (high priority)
- Surface newly introduced optional fields in additional views where they improve usability and are low-risk:
  - `req_038` wire `sectionMm2`: add display in wire table and/or inspector (and optionally export if trivial)
  - `req_039` wire colors (`primaryColorId` / `secondaryColorId`): add display in wire table and/or inspector, keeping swatch + no-color fallback
  - `req_040` connector/splice `manufacturerReference`: add display in table and/or inspector; search/filter support optional if low-risk
  - `req_041` wire endpoint connection/seal references: add display in inspector and/or export where practical
- Keep create/edit form support as the source of truth and avoid duplicating formatting logic inconsistently across surfaces.
- Preserve `No color` / empty-state semantics for optional values; do not invent data for legacy entities.
- Recommended surfacing priority:
  - wire `sectionMm2` / colors -> wire table and/or inspector first
  - connector/splice manufacturer references and wire endpoint refs -> inspector first (tables/exports optional if low-risk)

### C. Export and portability surfacing follow-up (medium priority)
- Where metadata surfacing extends to export paths (CSV/export views), ensure:
  - deterministic column naming
  - stable ordering
  - sensible empty values for optional fields
- If export changes are deferred, document the explicit defer rationale and impacted fields.

### D. Onboarding UX polish follow-up (`req_035`) (high priority)
- Replace onboarding step badge placeholders (e.g. textual badges like `N1`, `LIB`, etc.) with the corresponding existing feature icons used elsewhere in the application, where available.
  - Use the same icon assets/components already present in the codebase (e.g. connectors, segments, wires, etc.) to maintain visual consistency.
  - If a step has no suitable existing icon, use a documented fallback badge/icon strategy for that step.
- Update the onboarding `Next` / `Finish` action button styling so it matches the intended product look-and-feel (consistent with primary actions used elsewhere).
- In the shared `Connectors / Splices` onboarding step:
  - keep `Open Connectors`
  - add `Open Splices` adjacent to it
  - ensure both actions are available and correctly navigate/scroll to the relevant panel
- When contextual onboarding is opened from the `Splices` screen/panel, support the same best-effort panel scroll/focus behavior used for other panels (including `Splices`).
- Update onboarding step descriptions/copy to include the newly introduced fields and workflows from recent deliveries where relevant (for example: editable node ID, wire section, wire colors, endpoint references, manufacturer references, enhanced wire filtering).
  - Keep onboarding copy concise and accurate; avoid referencing outdated form structures or missing fields.
- Preserve all existing onboarding functionality (auto-open, opt-out, contextual help, CTA behavior) while applying these UX improvements.

### E. Edit-form save focus ergonomics (high priority)
- Across edit forms (table-backed entity forms in scope; recommended baseline includes connectors, splices, nodes, segments, wires, and `Network Scope` where row-targeted editing exists), after a successful `Save`:
  - return focus to the row corresponding to the entity that was just edited
  - preserve expected list selection/edit mode transitions
- Behavior should be consistent with existing create-flow row focus ergonomics where a created row is focused after creation.
- Panels without a meaningful row target (for example `Settings`) are out of scope for this focus-restoration behavior.
- If any in-scope entity panel cannot safely support this due to current architecture, document a specific defer rationale per panel.

### F. Connector/Splice auto-node creation toggle + Settings default (high priority)
- In connector and splice create/edit forms, add an explicit checkbox to enable/disable automatic linked node creation.
- Checkbox default behavior:
  - enabled by default (current behavior preserved)
  - prefilled from a Settings preference when creating entities
- In Settings, add preferences to pre-set the default value for this checkbox (connector and splice; shared or separate setting depending on implementation choice, but the choice must be documented).
- Recommended baseline: one shared Settings preference for connector + splice create flows (simpler UX and lower implementation risk).
- Editing existing entities should not unexpectedly create nodes; checkbox behavior must be scoped to create flows (or clearly disabled/informational in edit mode if rendered there).

### G. Panel action-row layout consistency (`Help` placement) and `Network Scope` export action (medium-high priority)
- In `Wires`, keep the `Help` button on the same action row as `ALL`, `Auto`, `Locked`, and `CSV`.
- As filter bars are rolled out to more table panels, preserve the pattern that `Help` remains aligned with the panel’s filter/action chips row (do not strand `Help` on a separate row unless unavoidable and documented).
- In `Network Scope`, add an `Export` button in the panel actions area under `Duplicate`.
  - Recommended baseline: export the selected/active network only.
  - Export behavior should align with current project export conventions and reuse the existing export pipeline/format where possible.
  - If multiple export modes are possible, the initial implementation should choose one deterministic baseline and document it.

### H. README documentation review and update (medium priority)
- Review `README.md` against the actual shipped feature set after `req_035`-`req_042` and this follow-up work.
- Update `README.md` where necessary to reflect:
  - onboarding/help behavior (if user-facing and documented)
  - new wire metadata capabilities (section, colors, endpoint references)
  - connector/splice manufacturer reference support
  - filter bar UX changes (`Wires`, `Network Scope`, and phase-2 rollout panels)
  - any relevant settings additions (default wire section, auto-node creation defaults if implemented here)
- If no README changes are needed, document that the review was performed and why no updates were required.
- Recommended baseline: targeted accuracy update only (feature bullets / UX behavior notes), not a broad README restructuring.

### I. Automated test hardening and noise reduction (medium-high priority)
- Reduce non-actionable JSDOM test noise caused by `HTMLCanvasElement.getContext` not being implemented:
  - recommended: add a stable test setup mock/stub in `src/tests/setup.ts`
  - avoid changing production behavior for test-only concerns
- Factor reusable E2E onboarding-dismiss logic for smoke flows and other specs that can be impacted by onboarding auto-open:
  - reduce duplication
  - keep tests deterministic on first launch
- Preserve existing coverage of onboarding auto-open behavior (`req_035`) while avoiding brittle cross-test interference.
- Recommended timing: implement this hardening early in the follow-up sequence to reduce noise during subsequent UI work.

### J. `logics` delivery closure hygiene / traceability updates (medium priority)
- Update `task_035` through `task_042` and corresponding backlog items to reflect implementation completion, validation status, and any defer notes (if this is part of the team workflow).
- Ensure any deferred follow-up work is clearly referenced from the original tasks/items or from this request’s future backlog.
- Keep traceability auditable: what shipped in baseline vs what is moved to follow-up.

### K. Manual QA checklist and execution notes (medium priority)
- Add a concise manual QA checklist for the delivered bundle (`req_035`-`req_042`), including at minimum:
  - onboarding auto-open, opt-out, Help relaunch, contextual buttons, CTA navigation
  - onboarding icon badges, `Next` button styling, `Open Splices` in shared connector/splice step, contextual scroll on `Splices`, and updated onboarding descriptions matching current fields/features
  - node ID rename and route preview/local-state continuity
  - wire occupancy hint + next-free prefill (create) + edit-mode occupancy behavior
  - wire section default prefill/settings + legacy behavior sanity
  - wire color optional mono/bi-color + duplicate normalization + no-color display
  - manufacturer reference (connector/splice) create/edit/clear
  - wire side connection/seal references create/edit/clear + non-destructive endpoint type changes
  - edit-form `Save` returns focus to edited row
  - connector/splice auto-node creation checkbox + Settings pre-set defaults
  - `Wires` action-row `Help` placement consistency and `Network Scope` `Export` button placement/behavior
  - filter bar behavior in `Wires`, `Network Scope`, and phase-2 adopted table panels
- The checklist may be documented in `logics` (task/item closure notes) or a project QA note file, but the destination should be explicit.

## Non-functional requirements
- Keep follow-up changes incremental and low-risk; preserve behavior delivered in the baseline reqs.
- Maintain UI consistency across panels adopting the shared filter-bar pattern.
- Maintain consistent action-row layout hierarchy (filters/chips/help/export actions) across table-based panels.
- Avoid significant panel layout regressions or new overflows at common viewport widths.
- Keep optional metadata rendering performant and deterministic.
- Maintain accessibility of any newly surfaced UI fields/badges/columns (labels, keyboard, focus order).
- Preserve keyboard/focus usability when implementing row-focus restoration after `Save`.

## Validation and regression safety
- Minimum validation gates per implementation wave/commit (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py` (when editing `logics`)
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - targeted tests for touched panels/features
- Final closure validation (required):
  - `npm run -s test:ci`
  - `npm run -s build`
  - `npm run -s quality:pwa`
  - `npm run -s test:e2e`
- Continue the checkpoint-commit discipline between waves (same approach used in `task_043` super orchestration).
- Recommended execution style: waves with commits + targeted validations after each wave, then one full closure gate at the end.

## Acceptance criteria
- AC1: A follow-up phase-2 rollout plan is implemented for the reusable table filter bar on at least the next target panel set (`Connectors`, `Splices`, `Nodes`, `Segments`) or a concrete defer rationale is documented per panel.
- AC2: The adopted phase-2 panels use the same filter-bar UX pattern (`Filter` + field selector + full-width input without panel growth) with panel-specific field options where appropriate.
- AC3: Newly introduced optional metadata from `req_038`-`req_041` is surfaced in at least one additional non-form user-facing view per relevant feature family (wire, connector/splice), or explicit defer rationale is documented.
- AC4: Optional metadata surfacing preserves empty/none semantics and does not fabricate legacy values.
- AC5: Automated test noise from canvas measurement in JSDOM is reduced via test-harness hardening (or an explicit documented reason is provided for keeping current behavior).
- AC6: E2E onboarding auto-open interactions are handled robustly in shared test helpers/utilities (or equivalent deduplicated handling) without masking onboarding feature coverage.
- AC7: `logics` delivery closure/traceability for the `req_035`-`req_042` bundle is updated/documented per team workflow, including any defers moved into this follow-up scope.
- AC8: A manual QA checklist covering the delivered `req_035`-`req_042` bundle plus follow-up additions is documented in an explicit location.
- AC9: Final validation gates (`test:ci`, build, PWA quality, E2E) pass after the follow-up work.
- AC10: Onboarding step badges use the corresponding existing feature icons (or documented fallback per step), the `Next`/`Finish` action matches the intended primary button look-and-feel, and the shared `Connectors / Splices` step exposes both `Open Connectors` and `Open Splices`.
- AC11: Contextual onboarding opened from `Splices` supports best-effort navigation/scroll to the `Splices` panel just like other contextual onboarding entry points.
- AC12: Successful `Save` in edit forms restores focus to the edited entity row (for the supported table-backed forms in scope), without breaking selection/edit state.
- AC13: Connector and splice forms expose an auto-node creation checkbox (default on) and Settings provides a pre-set default used for create flows.
- AC13: Connector and splice forms expose an auto-node creation checkbox (default on) and Settings provides a pre-set default used for create flows (recommended baseline: one shared preference unless a different choice is documented).
- AC14: `Wires` keeps `Help` on the same action row as `ALL` / `Auto` / `Locked` / `CSV`, and `Network Scope` exposes an `Export` action under `Duplicate`.
- AC15: Onboarding descriptions are updated to reflect the current feature set introduced by `req_036`-`req_042` (or documented per-step defer rationale is provided).
- AC16: `README.md` is reviewed and updated where needed to reflect shipped/follow-up behavior, or the no-change review outcome is documented.
- AC17: The follow-up implementation is delivered in checkpointed waves with per-wave validation and commits, with a final full validation gate documented at closure.

## Out of scope
- Reworking the core data-model decisions already accepted in `req_035`-`req_042`.
- Large redesign of workspace panels beyond the shared filter-bar rollout and metadata surfacing follow-up.
- Advanced query/filter syntax or search indexing.
- Mandatory export-schema expansion for every new field if the product decides to defer export surfacing.

# Backlog
- `logics/backlog/item_255_table_filter_bar_phase_2_rollout_to_connectors_splices_nodes_and_segments_panels.md`
- `logics/backlog/item_256_wire_metadata_follow_up_surfacing_for_section_mm2_and_color_in_tables_inspector_and_optional_exports.md`
- `logics/backlog/item_257_connector_splice_and_wire_optional_reference_metadata_follow_up_surfacing_in_views_and_optional_exports.md`
- `logics/backlog/item_258_test_hardening_canvas_jsdom_mock_and_e2e_onboarding_dismiss_helper_refactor.md`
- `logics/backlog/item_259_req_035_to_req_042_logics_closure_traceability_status_updates_and_defer_mapping.md`
- `logics/backlog/item_260_manual_qa_checklist_for_req_035_to_req_042_follow_up_bundle.md`
- `logics/backlog/item_261_req_043_follow_up_rollout_hardening_and_closure_ci_build_pwa_e2e_traceability.md`
- `logics/backlog/item_262_onboarding_follow_up_icon_badges_primary_next_button_and_connectors_splices_dual_cta_polish.md`
- `logics/backlog/item_263_contextual_onboarding_splices_panel_scroll_parity_and_navigation_focus_behavior.md`
- `logics/backlog/item_264_edit_forms_save_restores_focus_to_edited_table_row_ergonomics.md`
- `logics/backlog/item_265_connector_splice_auto_node_creation_checkbox_and_settings_default_preset.md`
- `logics/backlog/item_266_table_panel_action_row_help_button_alignment_and_network_scope_export_action.md`
- `logics/backlog/item_267_onboarding_copy_refresh_for_req_036_to_req_042_feature_additions.md`
- `logics/backlog/item_268_readme_review_and_feature_documentation_refresh_for_req_035_to_req_043_changes.md`

# References
- `logics/tasks/task_043_super_orchestration_delivery_execution_for_req_035_to_req_042_with_validation_gates_and_stepwise_commits.md`
- `logics/request/req_035_step_by_step_onboarding_modal_flow_for_first_network_creation_and_contextual_help.md`
- `logics/request/req_036_node_id_editability_via_atomic_node_rename_and_reference_remap.md`
- `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
- `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
- `logics/request/req_039_wire_color_catalog_two_character_codes_and_bicolor_primary_secondary_support.md`
- `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
- `logics/request/req_041_wire_endpoint_connection_reference_and_seal_reference_per_side.md`
- `logics/request/req_042_wire_list_filter_bar_field_selector_and_full_width_input_without_panel_growth.md`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/lib/onboarding.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/components/workspace/TableFilterBar.tsx`
- `README.md`
- `src/tests/setup.ts`
- `tests/e2e/smoke.spec.ts`
