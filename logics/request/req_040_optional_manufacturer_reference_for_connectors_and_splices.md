## req_040_optional_manufacturer_reference_for_connectors_and_splices - Optional Manufacturer Reference for Connectors and Splices
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Complexity: Medium-High
> Theme: Real-World Component Identification via Optional Manufacturer References
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add an optional reference field on `Connector` and `Splice` to store the real-world component reference.
- The field is intended to capture the actual manufacturer/object reference (part reference).
- The reference must be optional (empty allowed).
- The reference must not be unique (multiple connectors/splices may share the same manufacturer reference).

# Context
The app already distinguishes internal/domain identifiers (e.g. entity `id`, project-facing `technicalId`) from display names. However, there is currently no dedicated field to store the actual manufacturer reference of a connector or splice.

This makes it harder to:
- identify real physical parts across similar modeled components,
- distinguish project technical IDs from external product references,
- prepare future BOM/export workflows that may need manufacturer part references.

This request introduces a dedicated optional `manufacturerReference` field on connector and splice entities (component library entities, not network nodes).

## Implementation decisions (confirmed)
- The field is added on `Connector` and `Splice` entities (not on `NetworkNode`).
- Field name: `manufacturerReference`.
- The field is optional.
- The field is not unique.
- Empty values are allowed and represent "not specified".
- Format is free-text (no strict regex/pattern validation in this request).
- Normalization behavior:
  - trim leading/trailing whitespace
  - empty/whitespace-only value normalizes to `undefined` (recommended canonical empty state)
- Maximum length is `120` characters (UI + validation guardrail).
- UI label is `Manufacturer reference`.
- Scope baseline is form-first:
  - connector/splice create/edit forms are required
  - table/inspector/search display is optional unless trivial
- Duplicate manufacturer references are allowed without warning (across connectors and/or splices).

## Objectives
- Add a clear, explicit place to store real manufacturer references for connectors and splices.
- Keep existing connector/splice workflows functional while extending forms and persistence.
- Maintain backward compatibility for existing saves/imports that do not contain the field.
- Keep the field available for future filtering/search/export enhancements.

## Functional Scope
### A. Domain model and store contract updates (high priority)
- Extend `Connector` and `Splice` entities with optional `manufacturerReference`.
- Update relevant action payloads, reducers, and store flows so the value is persisted on create/edit.
- Normalize empty/whitespace-only values to `undefined` (recommended) or another consistent empty representation.
- Do not enforce uniqueness across connectors or splices.
- Validate max length (`<= 120`) if validation is implemented at reducer/form level.

### B. Connector and splice form UI/handlers (high priority)
- Add `Manufacturer reference` input to connector and splice create/edit forms.
- Create mode:
  - field starts empty by default
- Edit mode:
  - existing value loads and can be edited/cleared
- Preserve current connector/splice validation behavior for other fields.
- Keep `manufacturerReference` validation lightweight (optional free-text field).
- Form UX recommendations for this request:
  - label: `Manufacturer reference`
  - placeholder example such as `e.g. TE-1-967616-1`
  - trim normalization on submit/change pipeline
  - max length guardrail `120`

### C. Display/search usage audit (medium priority)
- Minimum requirement:
  - adding the field must not regress existing connector/splice tables, inspectors, or entity flows
- Optional (if trivial and low-risk during implementation):
  - display `manufacturerReference` in connector/splice tables/details
  - include field in entity search/filter text
- Any display/search additions beyond core create/edit persistence should be documented as explicit scope decisions.

### D. Persistence/import backward compatibility (high priority)
- Patch/migrate loaded/imported data so older connectors/splices without `manufacturerReference` remain valid.
- Legacy compatibility requirements:
  - missing field remains absent/empty (no invented default reference)
  - old saves/imports continue to load successfully
- Apply compatibility handling across:
  - local persistence restore
  - file import / portability normalization paths (if separate)

### E. Regression tests (high priority)
- Add targeted tests covering:
  - connector create/edit persists `manufacturerReference`
  - splice create/edit persists `manufacturerReference`
  - clearing a manufacturer reference works (optional field behavior)
  - duplicate manufacturer references across entities are allowed
  - legacy saved/imported data without field still loads correctly
- Add/extend UI/store/persistence tests as needed.

## Non-functional requirements
- Preserve existing connector/splice workflows and validations.
- Keep persistence/import compatibility for pre-feature saves.
- Keep field semantics clear (manufacturer reference vs project technical ID).
- Avoid over-constraining the field (no uniqueness requirement).

## Validation and regression safety
- Targeted tests (minimum, depending on implementation):
  - connector/splice form UI tests
  - store/reducer entity lifecycle tests
  - persistence/import compatibility tests
- Closure validation (recommended):
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run build`

## Acceptance criteria
- AC1: `Connector` and `Splice` entities support an optional `manufacturerReference` field.
- AC2: Connector and splice create/edit forms allow entering, editing, and clearing `manufacturerReference`.
- AC3: Empty `manufacturerReference` is allowed and persists as an empty/absent value consistently (recommended normalized state: `undefined` after trim).
- AC4: Duplicate `manufacturerReference` values are allowed across connectors and/or splices.
- AC4a: No duplicate-warning behavior is introduced for matching manufacturer references in this request.
- AC5: Existing connector/splice workflows remain functional after the field is added.
- AC5a: `manufacturerReference` accepts free text (no strict regex) with trimming and a `120`-character maximum guardrail.
- AC6: Legacy saves/imports without `manufacturerReference` continue to load successfully.
- AC7: Regression tests cover create/edit/clear behavior, duplicate allowance, and legacy compatibility.

## Out of scope
- Enforcing manufacturer-reference uniqueness.
- Manufacturer reference validation against external catalogs/APIs.
- Full BOM/export redesign (though this field may support future BOM work).
- Adding the field to `NetworkNode` entities.

# Backlog
- `logics/backlog/item_240_connector_splice_manufacturer_reference_entity_contract_and_reducer_updates.md`
- `logics/backlog/item_241_connector_and_splice_form_manufacturer_reference_input_create_edit_clear_flow.md`
- `logics/backlog/item_242_connector_splice_manufacturer_reference_legacy_persistence_import_compatibility_patch.md`
- `logics/backlog/item_243_connector_splice_manufacturer_reference_regression_tests.md`
- `logics/backlog/item_244_req_040_manufacturer_reference_for_connectors_and_splices_closure_ci_build_and_ac_traceability.md`

# References
- `src/core/entities.ts`
- `src/store/actions.ts`
- `src/store/reducer/connectorReducer.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/app/hooks/useConnectorHandlers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
