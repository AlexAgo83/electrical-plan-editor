# Changelog (`0.9.0 → 0.9.6`)

## Major Highlights

- **Modeling / Analysis workflow unification**
  - The standalone primary `Analysis` entry was removed.
  - Analysis is now integrated into the `Modeling` workspace flow.
  - Detail/form/analysis panels are shown only when the current selection is relevant.
  - Selection context is preserved when switching between modeling/analysis-oriented views.

- **New network-scoped `Catalog` with a catalog-first workflow**
  - New `Catalog` sub-screen in Modeling (navigation, quick nav, and menu integration).
  - Catalog item CRUD with:
    - manufacturer reference
    - connection count
    - optional name
    - optional unit price (excl. tax)
    - optional URL
  - `Connectors` / `Splices` forms now rely on a catalog selector instead of free manufacturer/count entry.
  - Connector way count / splice port count is derived from the selected catalog item.

- **Per-network 2D view persistence**
  - Zoom and pan are persisted per network.
  - Display toggles are persisted per network:
    - `Info`
    - `Length`
    - `Callouts`
    - `Grid`
    - `Snap`
    - `Lock`
  - View state is restored on reload and when switching active networks.

- **Catalog ecosystem expansion**
  - Legacy fallback bootstraps catalog items from existing connectors/splices.
  - Additional legacy fallback generates deterministic `LEGACY-NOREF-*` catalog references when manufacturer reference is missing.
  - New `Catalog analysis` panel lists connectors/splices using the selected catalog item.
  - Validation now includes `Catalog integrity` issues.
  - New `BOM` CSV export is available from the 2D `Network summary` header (next to `PNG`).

## UX / Navigation / Workspace

### Home Workspace Polish

- `Start` panel renamed to `Quick start`.
- `Workspace` status badge renamed to `ACTIVE`.
- `Quick start` and `Workspace` panels stretch to full cell height.
- `Quick start` actions are bottom-aligned within the panel.
- Intro text spacing under panel descriptions was fixed.
- `Active network` line styling was improved for readability.

### Shell / Navigation Behavior

- Navigation drawer and ops panel close behavior was hardened.
- Focus restoration and `Escape` handling were improved.
- `Ops & Health` no longer blocks clicks through empty panel space.
- Analysis/detail panel visibility now follows real selection state more consistently.

### Validation `Go to` Behavior

- `Go to` now opens the correct Modeling context.
- Validation `Go to` exposes the analysis panel with the same behavior as table-row selection.
- Edit panels are refreshed through the actual edit handlers (avoids stale form state).

## Catalog (Functional Details)

### Catalog Screen

- Added dedicated `ico_catalog` icon.
- Catalog form panel is hidden when nothing is selected (no empty `Catalog item form` / `Edit catalog item` panel shown).
- `Delete` is disabled when the selected catalog item is in use by connectors/splices.

### Catalog Analysis Panel

- Separate `Connectors` and `Splices` usage sections.
- `Create Connector` / `Create Splice` actions were moved under their respective usage lists.
- Usage rows navigate directly to Modeling create/edit flows.

### Connector / Splice Form Integration

- `Manufacturer` selector labels now include the connection count in parentheses.
- Immediate validation is shown when selecting an incompatible catalog item in edit mode (breaking capacity reduction is blocked).

### Default Catalog Seeds

- New networks now start with **3 default catalog items** (deterministic names + unit prices).
- No re-seeding on reload, import, or migration.

## Validation / Integrity

### Theme and Readability Fixes

- Fixed hardcoded colors that were not theme-aware in Validation (including `Issue filters`, `Route lock validity`, and group headings).
- Vertically centered Validation table cell content.

### Catalog Integrity Validation

- Added validation surfacing for catalog item issues and broken `catalogItemId` links.
- Added `Go to` support into `Catalog` for catalog-related validation issues.

### Validation Samples

- Validation sample data now includes catalog items and catalog-linked connectors/splices.

## Network Scope / Networks

### Network Scope Table and Actions

- Removed forced table scrolling in `Network Scope`.
- Stretched action rows across the panel width.
- Added `Catalog` count badge in the `Edit network` panel counters.

### Network Scope Form Visibility

- Removed implicit `Edit network` panel opening.
- Network form panel stays hidden until explicit user selection / create action.
- Fixed runtime CSS so `hidden` panels are actually hidden (this was visible in browser runtime but not caught by jsdom-based tests).

## Network Summary / 2D Rendering

### Header Actions

- `Export PNG` renamed to `PNG`.
- `Export BOM CSV` renamed to `BOM`.
- BOM button uses the shared CSV export icon.

### 2D Rendering Workflow

- Deeper zoom-out is supported.
- Callout positions persist.
- Callout spacing and dense callout rendering were improved.
- Per-network viewport/toggle persistence improves multi-network continuity.

## Connectors / Splices / Wires / Filters

- `Catalog-first` workflow is enforced for new connector/splice creation (outside legacy fallback scenarios).
- Wire filter field selector defaults to `Any`.
- Shared filter clear action added to table filter bars.
- Free wire color mode support was extended, including a distinct `unspecified` state.

## Settings / Onboarding

### Onboarding

- Added a `Catalog` onboarding step before the connectors/splices library step (catalog-first workflow).
- Removed the `Scroll to Edit catalog item` CTA.

### Settings

- `Workspace panels layout` setting is now disabled (still visible, not editable).

## Product-Impacting Compatibility and Quality Hardening

- Persistence and migration coverage was extended for:
  - catalog data
  - legacy fallback conversion
  - per-network 2D view state
- UI/E2E regressions and fixtures were expanded for:
  - Catalog
  - BOM export
  - Validation `Go to`
  - Network Scope panel visibility
