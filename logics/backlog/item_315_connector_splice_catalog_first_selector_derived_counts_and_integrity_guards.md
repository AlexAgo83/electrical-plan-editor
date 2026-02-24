## item_315_connector_splice_catalog_first_selector_derived_counts_and_integrity_guards - Connector/Splice Catalog-First Selector Integration, Derived Counts, and Integrity Guards
> From version: 0.9.4
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: High
> Theme: Replace connector/splice free-text manufacturer/count inputs with catalog-backed selection and enforce safe propagation/reassignment rules
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` changes connector/splice creation and editing to a catalog-first workflow. The existing forms still rely on free-text manufacturer reference and manual way/port counts, and they lack the required safety guards for derived count reductions and catalog reassignment.

# Scope
- In:
  - Replace connector/splice `Manufacturer reference` free-text with a catalog selector displaying `manufacturerReference`.
  - Replace manual way/port count input with derived value from selected catalog item `connectionCount`.
  - Persist `catalogItemId` for connector/splice create/edit flows.
  - Enforce catalog-first restriction for new connector/splice creation (no creation without valid catalog selection).
  - Implement empty-state blocking UX when no catalog item exists (message + CTA to Catalog).
  - Allow catalog reassignment in edit mode subject to safety checks.
  - Enforce integrity guards when catalog updates or reassignment would reduce usable indices below current occupancy/wire endpoint references.
  - Block deletion of referenced catalog items and surface clear feedback.
  - Propagate catalog item edits to linked connectors/splices (total propagation) when safe.
- Out:
  - Legacy fallback bootstrap data migration logic (handled elsewhere).
  - Catalog screen navigation/panel composition.

# Acceptance criteria
- Connector/splice forms use catalog selector + derived count instead of free-text/manual count.
- New connector/splice creation is blocked without valid catalog selection.
- Empty-state blocking UX guides users to create/open catalog items first.
- Catalog reassignment in edit mode is allowed only when safe.
- Reducing connection capacity (catalog edit or reassignment) is blocked when occupancy or wire endpoints exceed the new count.
- Referenced catalog items cannot be deleted.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_051`, item_311, item_312, item_314.
- Blocks: item_317, item_318.
- Related AC: AC9-AC14, AC18.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/app/components/workspace/ModelingConnectorFormPanel.tsx`
  - `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
  - `src/app/hooks/useConnectorHandlers.ts`
  - `src/app/hooks/useSpliceHandlers.ts`
  - `src/tests/app.ui.creation-flow-ergonomics.spec.tsx`

