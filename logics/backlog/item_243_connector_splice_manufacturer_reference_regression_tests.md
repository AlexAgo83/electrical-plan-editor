## item_243_connector_splice_manufacturer_reference_regression_tests - Connector/Splice Manufacturer Reference Regression Tests
> From version: 0.7.3
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Regression Coverage for Optional Manufacturer Reference Form/Store/Compatibility Behavior
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`manufacturerReference` touches domain contracts, form submit normalization, and persistence/import compatibility. Without regression coverage, trimming/clearing behavior and duplicate allowance can regress silently.

# Scope
- In:
  - Add store/reducer tests for connector/splice persistence of `manufacturerReference`.
  - Add tests for normalization behavior:
    - trim applied
    - empty -> `undefined`
    - max length guard behavior (if enforced in form/reducer)
  - Add tests confirming duplicate manufacturer references are allowed without warnings/errors.
  - Add UI regression tests for connector/splice create/edit/clear flows.
  - Add persistence/import compatibility tests for legacy data missing `manufacturerReference`.
- Out:
  - Full end-to-end BOM/export behavior tests.
  - Broad UI search/table display tests unless feature was explicitly included.

# Acceptance criteria
- Regression tests cover create/edit/clear behavior for connector/splice manufacturer references.
- Tests confirm duplicate values are allowed and no duplicate-warning behavior is introduced.
- Legacy persistence/import compatibility tests cover missing-field payloads.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_040`, item_240, item_241, item_242.
- Blocks: item_244.
- Related AC: AC2, AC3, AC4, AC4a, AC5a, AC6, AC7.
- References:
  - `logics/request/req_040_optional_manufacturer_reference_for_connectors_and_splices.md`
  - `src/tests/store.reducer.entities.spec.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/portability.network-file.spec.ts`

