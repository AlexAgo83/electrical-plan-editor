## item_241_connector_and_splice_form_manufacturer_reference_input_create_edit_clear_flow - Connector and Splice Form `Manufacturer reference` Input (Create/Edit/Clear Flow)
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium-High
> Theme: Form-First UX for Optional Manufacturer References on Connectors and Splices
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with domain support, users cannot set or clear manufacturer references without form UI and handler wiring in connector/splice create/edit flows.

# Scope
- In:
  - Add `Manufacturer reference` input to connector and splice forms (create + edit).
  - Label: `Manufacturer reference`.
  - Placeholder example (recommended): `e.g. TE-1-967616-1`.
  - Create mode behavior:
    - field defaults to empty
  - Edit mode behavior:
    - existing value loads
    - value can be edited or cleared
  - Apply lightweight validation/normalization in form submit pipeline:
    - free-text
    - trim
    - max length `120`
    - empty -> `undefined`
  - Preserve existing connector/splice form behavior for other fields and errors.
  - Form-only baseline scope (table/inspector/search display not required here).
- Out:
  - Domain/reducer contract changes (handled in item_240).
  - Legacy persistence/import compatibility patching (handled in item_242).
  - Search/indexing/table display enhancements unless trivial and explicitly added later.

# Acceptance criteria
- Connector and splice forms allow entering, editing, and clearing `manufacturerReference`.
- Empty manufacturer reference remains valid and clears persistently.
- Trim and max-length guard behavior is applied consistently without breaking other form validations.
- Existing create/edit workflows remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_040`, item_240.
- Blocks: item_243, item_244.
- Related AC: AC2, AC3, AC5, AC5a, AC7.
- References:
  - `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`

