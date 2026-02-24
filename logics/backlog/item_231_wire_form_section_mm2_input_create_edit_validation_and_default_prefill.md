## item_231_wire_form_section_mm2_input_create_edit_validation_and_default_prefill - Wire Form `Section (mm²)` Input, Create/Edit Validation, and Default Prefill
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Wire Form UX for Cable Section with Create Prefill and Edit Support
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire form has no field for cable section, so users cannot enter or edit `sectionMm2`, and new wire creation cannot prefill the field from the configured default.

# Scope
- In:
  - Add `Section (mm²)` input to the modeling wire form UI.
  - Add local form state/handler support for wire section value.
  - Create mode behavior:
    - prefill from global default wire section preference (initially `0.5` unless overridden)
  - Edit mode behavior:
    - load and allow editing of existing `sectionMm2`
  - Validate user input as a finite positive number (`> 0`) with inline/user-visible form error messaging.
  - Persist section through wire submit flow (`saveWire`) without regressing existing endpoint/routing fields.
  - Keep scope minimal to wire form UX (broader table/inspector/export display is optional and not required here).
- Out:
  - Settings preference persistence/normalization implementation (handled in item_232).
  - Legacy save/import patching (handled in item_233).
  - Electrical calculations based on section.

# Acceptance criteria
- Wire form exposes `Section (mm²)` in create and edit modes.
- Create mode pre-fills `Section (mm²)` from the configured default wire section preference.
- Edit mode loads existing `sectionMm2` and saves user changes.
- Invalid section input is blocked with user-visible validation feedback.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_038`, item_230, item_232 (for final default-prefill wiring).
- Blocks: item_234.
- Related AC: AC1, AC2, AC3, AC5, AC8.
- References:
  - `logics/request/req_038_wire_cable_section_mm2_field_default_preference_and_backward_compat_patch.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/app/hooks/controller/useAppControllerModelingAnalysisScreenDomains.tsx`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`

