## item_376_form_validation_consistency_doctrine_and_wire_catalog_targeted_harmonization - Form validation consistency doctrine and wire/catalog targeted harmonization
> From version: 0.9.10
> Understanding: 95%
> Confidence: 89%
> Progress: 0%
> Complexity: Medium
> Theme: Validation consistency between native required fields and custom inline business-rule feedback
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app mixes native HTML validation and custom inline validation. This is acceptable, but inconsistent application can confuse users and complicate tests/maintenance.

# Scope
- In:
  - Document and apply validation doctrine (native for simple required fields, custom inline for business/cross-field rules).
  - Start with recently touched forms (`wire`, `catalog`) for targeted harmonization.
  - Document expected test behavior when native validation blocks submit before inline errors render.
  - Preserve accessibility semantics and save/cancel workflow behavior.
- Out:
  - Full form-system redesign
  - Harmonizing every form in one pass
  - Replacing native validation everywhere

# Acceptance criteria
- Validation doctrine is explicit and reflected in targeted wire/catalog forms.
- Tests clearly reflect expected native-vs-inline behavior for touched flows.
- No regression in wire/catalog create/edit workflows.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_068`.
- Blocks: `item_377`, `task_066`.
- Related AC: AC6.
- References:
  - `logics/request/req_068_review_followups_hardening_coverage_bundle_perf_and_test_reliability.md`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/components/workspace/ModelingCatalogListPanel.tsx`
  - `src/tests/app.ui.creation-flow-wire-endpoint-refs.spec.tsx`
  - `src/tests/app.ui.catalog-csv-import-export.spec.tsx`
