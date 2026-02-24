## item_314_catalog_list_edit_form_crud_validation_url_and_v1_ergonomics - Catalog List/Edit Form CRUD, Validation, URL Handling, and V1 Ergonomics
> From version: 0.9.4
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Implement catalog CRUD UI with required fields, strict URL validation, and practical V1 list ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The new Catalog screen requires a usable catalog table and create/edit panel with strict required-field validation, optional metadata support, and V1 ergonomics (sort/filter/link actions). These behaviors do not exist yet.

# Scope
- In:
  - Implement `Catalog` list/table panel with selection behavior.
  - Implement `Create/Edit catalog item` form panel with required validation:
    - `Manufacturer reference` required + unique per network
    - `Connection count` required, integer >= 1
  - Support optional fields:
    - `Name`
    - `Unit price (excl. tax)` (numeric >= 0, no currency schema)
    - `URL` (empty or strict absolute http/https URL)
  - V1 list ergonomics:
    - default sort by `manufacturerReference` asc
    - basic filter/search on `manufacturerReference` and `name`
  - V1 affordances:
    - `Open link` action when URL is valid
    - optional duplicate action if included
  - Expose row/selection actions to launch connector/splice creation prefilled from `catalogItemId` (if implemented in same UI slice).
- Out:
  - Legacy bootstrap migration behavior.
  - Connector/splice safe reassignment/propagation rules (handled in dedicated integration item).

# Acceptance criteria
- Catalog CRUD UI is functional with required validation and optional metadata fields.
- URL validation is strict (`http/https`) with clear feedback.
- Default sort and basic filter/search work for Catalog (recommended V1).
- `Open link` action is available when URL is valid (recommended V1).
- Catalog selected-item actions can launch connector/splice creation with prefilled `catalogItemId` (recommended V1 if included).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_051`, item_311, item_313.
- Blocks: item_317, item_318.
- Related AC: AC5-AC7, AC16-AC17.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
