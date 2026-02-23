## req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch - Wire Cable Section (mm²) Field, Default Preference, and Backward-Compatibility Patch
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Complexity: High
> Theme: Cable Section Domain Attribute, Settings Default, and Legacy Save Compatibility
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add cable section (`mm²`) to `Wire` (instead of treating this as vague "thickness").
- The wire form must expose the cable section field.
- New wires should default to a cable section of `0.5 mm²`.
- The default cable section value must be user-configurable in `Settings`.
- Existing saved wires that do not yet have a cable section must be patched so they receive the default value.

# Context
The current `Wire` model stores identifiers, endpoints, route, length, and route-lock state, but it does not store the cable section (`section` in square millimeters). This prevents modeling a common cable attribute directly in the wire entity and forces implicit assumptions.

The requested behavior spans:
- domain model (`Wire` field addition),
- wire create/edit form UX,
- user preferences (`Settings`) for the default value,
- persistence compatibility for previously saved data.

This request should preserve existing wire creation/edit flows while adding a clear, explicit cable section value in `mm²`.

## Implementation decisions (recommended baseline)
- The wire field should be modeled as a numeric domain property named `sectionMm2`.
- The cable section is a per-wire editable value (create + edit), not just a global display preference.
- Default value for new wires is `0.5` (`mm²`) unless overridden by the user preference.
- The default value must be editable in `Settings` as a global user/UI preference and persisted with the existing preferences persistence layer.
- The default wire section preference is used to prefill the wire section field when creating a new wire (create-form prefill behavior).
- Changing the default wire section preference affects future wire creation only and must not mutate existing wires.
- Backward compatibility patch/migration should normalize missing wire sections from legacy saves/imports to a constant fallback baseline (`0.5`) to avoid `undefined` wire sections.
  - This legacy fallback normalization must not depend on the current user preference value.
  - Implementation may additionally normalize at save/write time as a defense-in-depth step, but load/import migration is the primary compatibility requirement.

## Objectives
- Introduce an explicit cable section (`mm²`) on each wire.
- Make wire creation/editing ergonomically support this value with a sensible default.
- Allow users to configure their preferred default cable section in Settings.
- Maintain backward compatibility for old saved/imported data that lacks the field.
- Add regression coverage for model/form/settings/persistence behavior.

## Functional Scope
### A. Wire domain model: cable section field in `mm²` (high priority)
- Extend the `Wire` entity with a numeric cable section field (recommended: `sectionMm2`).
- Update any wire creation/save/upsert paths to require/populate this field.
- Keep terminology explicit in code and UI (`Section (mm²)` / `Cable section (mm²)`).
- Validate the value as a finite positive number (`> 0`).
- No upper bound is required in this request unless implementation discovers a concrete product constraint.

### B. Wire form UI/handlers: create + edit support (high priority)
- Add a wire form field for cable section (`mm²`) in the modeling wire form.
- Create mode behavior:
  - prefill `Section (mm²)` with the default cable section from settings/preferences
- Edit mode behavior:
  - load and allow editing of the wire’s existing section value
- Wire submit handling must persist the section value in `saveWire` / `upsertWire` flow.
- Add user-visible validation messaging if the section value is invalid.

### C. Settings preference: default wire cable section (high priority)
- Add a settings preference for default wire cable section (`mm²`) with initial value `0.5`.
- Expose the preference in `Settings` UI and persist it via the app’s existing preferences persistence mechanism.
- Preference behavior requirements:
  - changing the default affects future new wires
  - changing the default does not silently rewrite existing wires
- This preference is global (user/UI preference), not per-network.
- Include safe normalization/parsing when reading persisted preferences (invalid values fallback to `0.5`).

### D. Backward compatibility patch for existing saves/imports (high priority)
- Patch/migrate loaded/imported workspace data so wires missing cable section receive a default value.
- This applies to:
  - local persistence restore
  - file import / portability flow (if it uses the same or parallel normalization path)
- Migration/patch requirements:
  - no runtime `undefined` cable section values remain after normalization
  - missing legacy wire section values normalize to `0.5` (`mm²`) regardless of current user preference
  - legacy snapshots remain loadable
  - diagnostics/versioning behavior should follow existing persistence migration patterns
- If schema version bump is required, implement/document it according to the current migration framework.

### E. Display/export/secondary usages audit (medium priority)
- Audit wire displays that may need to show or export cable section (if applicable to current UX).
- Minimum requirement:
  - ensure adding the field does not regress existing wire tables, summaries, or exports
- Scope baseline for this request:
  - wire form create/edit support is required
  - broader wire table / inspector / export display of section is optional unless trivial and explicitly included during implementation
- Optional (if included in scope during implementation):
  - display section in wire tables / inspectors / exports where useful
- Any display/export additions beyond core form/model compatibility should be documented as explicit scope decisions.

### F. Regression tests for wire section + default preference + compatibility patch (high priority)
- Add targeted tests covering:
  - wire creation uses default section (`0.5` by default)
  - settings default section preference persistence + reload normalization
  - changing settings default affects future creates only
  - wire edit persists updated section value
  - legacy saved wire without section is patched on load/import
- Add/extend reducer/store/persistence tests if model changes require them.

## Non-functional requirements
- Preserve existing wire creation/edit and routing behavior (section field addition must not break endpoint/routing flows).
- Keep numeric parsing/validation deterministic and user-friendly (`mm²` units explicit).
- Maintain backward compatibility for previously saved data.
- Keep preference and persistence normalization resilient to invalid/missing values.

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - wire form UI regression tests in relevant app UI specs
  - settings/preferences persistence tests
  - persistence migration/import tests for legacy wires without section
  - store/reducer tests if wire entity contracts are updated
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: `Wire` entities include a cable section field in `mm²` (recommended `sectionMm2`) and wire save flows persist it.
- AC2: The wire form allows viewing/editing the cable section value and validates invalid numeric input.
- AC3: New wires default to `0.5 mm²` unless the user-configured default wire section preference overrides it.
- AC4: Settings includes an editable default wire cable section (`mm²`) preference that persists across reloads.
- AC5: Changing the default wire section preference affects future wire creation only and does not mutate existing wires.
- AC6: Legacy saved/imported wires missing cable section are patched/migrated to `0.5 mm²` during load/import normalization (independent of current user preference).
- AC7: Backward-compatible loading/import remains functional for older save data after the feature is added.
- AC8: Regression tests cover wire form behavior, settings default preference persistence, and legacy save patch/migration behavior.

## Out of scope
- Automatic derivation of cable section from current/length/routing rules.
- Electrical calculations or validation based on cable section ampacity.
- Bulk-editing cable section for existing wires.
- Full UX redesign of wire tables/analysis screens to heavily feature cable section (beyond compatibility or explicit small additions).

# Backlog
- `logics/backlog/item_230_wire_entity_section_mm2_field_and_wire_save_flow_contract_update.md`
- `logics/backlog/item_231_wire_form_section_mm2_input_create_edit_validation_and_default_prefill.md`
- `logics/backlog/item_232_settings_default_wire_section_preference_persistence_and_normalization.md`
- `logics/backlog/item_233_legacy_wire_section_backward_compat_patch_for_persistence_and_import_paths.md`
- `logics/backlog/item_234_req_038_wire_section_mm2_default_preference_and_compatibility_closure_ci_build_and_ac_traceability.md`

# References
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/hooks/useEntityFormsState.ts`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
