## item_313_catalog_modeling_subscreen_navigation_icon_quick_nav_and_panel_composition - Catalog Modeling Sub-screen Navigation, Icon/Quick-Nav Integration, and Panel Composition
> From version: 0.9.4
> Understanding: 97%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium-High
> Theme: Add Catalog as a first-class modeling sub-screen with connector-like workspace composition and no analysis panel
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` requires a new `Catalog` sub-screen in the modeling navigation, with a specific position, icon usage, and panel composition mirroring connector workflows (minus analysis). The current modeling screen navigation and composition do not expose this surface.

# Scope
- In:
  - Add `Catalog` modeling sub-screen to nav row and drawer menu.
  - Position `Catalog` before `Connectors`, `Splices`, and other entity sub-screens.
  - Use `public/icons/ico_catalog.svg` for the Catalog nav entry.
  - Add `Catalog` to the quick entity navigation strip (recommended V1 behavior accepted in req).
  - Compose the Catalog workspace screen with `Network summary`, `Route preview`, `Catalog`, and `Edit catalog item` panels.
  - Omit the analysis panel/column for Catalog.
  - Keep responsive behavior aligned with existing modeling/drawer rules.
- Out:
  - Catalog CRUD form internals and validation logic.
  - Connector/splice catalog-backed form behavior.

# Acceptance criteria
- Catalog sub-screen is accessible in nav row and drawer menu.
- Catalog entry order is correct (before connectors/splices).
- Catalog uses `ico_catalog.svg` in navigation.
- Catalog workspace composition includes expected panels and excludes analysis panel.
- Catalog appears in quick nav strip in the intended position (if implemented per req recommended V1 scope).

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_051`, item_311.
- Blocks: item_316, item_317, item_318.
- Related AC: AC1-AC4, AC16-AC17.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `public/icons/ico_catalog.svg`
  - `src/app/components/workspace/ModelingPrimaryTables.tsx`
  - `src/app/components/workspace/ModelingFormsColumn.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`

