# Changelog (since version `0.8.1` to  version `0.9.0`)

This changelog summarizes **product-visible changes** delivered since commit `0a53bd1ceb7c27516bcfd84e7f6a83251c7c31b0`, up to the current repository state (`0.9.0`).

## Guided Onboarding and In-App Help

- Added a **step-by-step onboarding modal flow** with contextual guidance for first-time usage.
- Onboarding can auto-open on startup and supports a persisted **opt-out** preference.
- Added **Help** relaunch entry points from `Home` and contextual Help buttons in Modeling and Analysis panels.
- Shared `Connectors / Splices` onboarding step now includes separate CTAs for:
  - `Open Connectors`
  - `Open Splices`
- CTA navigation supports best-effort screen switching and panel focus/scroll behavior.
- Onboarding visuals were polished:
  - icon-based step markers,
  - improved `Next` / `Finish` button styling,
  - theme-aware onboarding modal rendering.
- Onboarding copy and UI chrome were aligned to **English**.

## Modeling and Entity Editing UX

### Editable IDs (safe rename)

- `Node ID` is now editable in edit mode via a safe **atomic rename** flow.
- `Segment ID` is now editable in edit mode via a safe **atomic rename** flow.
- Renames update dependent references consistently (selection state, route references, related entities/positions).

### Save/Edit Form Behavior

- After `Save` in edit mode, the corresponding row is re-focused.
- Edit forms stay synchronized with the saved row (no unwanted fallback to create mode).
- Save focus behavior was stabilized across Modeling entity forms.

### Connector / Splice Metadata and Create Behavior

- Added optional `manufacturerReference` to:
  - connectors
  - splices
- Added create-form checkbox to enable/disable **auto-create linked node** for connectors/splices.
- Added a **global Settings default** to pre-set the auto-create linked node checkbox.

## Wires: New Metadata, Validation, and Ergonomics

### Endpoint Occupancy and Next-Free Prefill

- Added endpoint occupancy validation for wire endpoints (connector ways / splice ports).
- Added inline occupancy hints (`already used`) in wire create/edit forms.
- Added next-free way/port suggestion and create-mode prefill.
- Manual edits are preserved until endpoint context changes.
- Edit mode excludes the currently edited wire slot to avoid false positives.

### Wire Section (mm²)

- Added `sectionMm2` on wires.
- Added `Section (mm²)` field in wire create/edit forms.
- Added Settings default value (used as a create-form prefill).
- Added compatibility patching for older saves/imports missing wire section.

### Wire Colors (mono / bi-color)

- Added a canonical cable color catalog (2-character IDs, labels, hex colors).
- Added optional wire color support with:
  - `primaryColorId`
  - `secondaryColorId` (optional)
- Supports no-color, mono-color, and bi-color wires.
- Duplicate bi-color values are normalized back to mono-color.
- Added wire color selectors and swatches in wire forms.

### Wire Endpoint Side Metadata

- Added optional per-side metadata on wires:
  - connection reference
  - seal reference
- Available for both endpoint sides (`A` and `B`) in wire forms.
- Endpoint side metadata is preserved when endpoint type changes.

## Analysis Workflows and Occupancy Views

### Connectors / Splices Analysis Improvements

- Occupancy labels now display human-readable wire references:
  - `Wire <technicalId> / A`
  - `Wire <technicalId> / B`
  (internal backend/store references remain unchanged)
- Connector `Reserve way` and splice `Reserve port` now validate occupied slots.
- Reserve actions now suggest and prefill the next free slot.
- Reserve buttons are disabled when the selected slot is invalid/occupied.
- Added wire **color swatches** alongside wire labels in connector/splice analysis views (matching wire table swatch design).

### New Analysis Panels: Nodes and Segments

- Added **Nodes analysis** view/panel with associated segment listing and lengths.
- Added **Segments analysis** view/panel with traversing wires listing.
- Added sorting support within these new analysis tables.
- Added stable navigation into `Analysis > Nodes` and `Analysis > Segments` from:
  - inspector `Analysis` button,
  - workspace entity navigation,
  - quick entity navigation strip.

### Wires Analysis Enrichment

- Enriched `Wires` analysis with additional wire metadata, including:
  - cable section,
  - colors,
  - endpoint-side references (when present).

## Tables, Sorting, Filters, and Column Layouts

### Sortability Completion

- Completed sortable columns across workspace tables (Modeling / Analysis / Network Scope / Validation tabular views).
- Column header sort controls now support consistent sorting behavior, including empty-value handling.

### Filter Bar Pattern Expansion

- Introduced and expanded a reusable **table filter bar** pattern with:
  - `Filter` label
  - field selector
  - full-width text input
- Deployed across Modeling, Analysis, and Network Scope tables.
- `Any` is now consistently prioritized as the **first filter field option**.
- Filter field selector styling was aligned with the app’s existing control style.
- Filter text input height was aligned with the filter field selector height.

### Table Content / Column Changes

- `Connectors` / `Splices` tables now include `Mfr Ref` (`manufacturerReference`) column.
- In `Wires` tables, `Section` now appears immediately **before** `Length`.
- Column headers (including **sort chevrons**) now apply the active theme correctly.

## 2D Render, Callouts, and Network Summary UX

- Wire callouts now display **cable section after length**.
- Clicking items in the 2D render no longer forces disruptive auto-scroll jumps to table rows (selection sync remains).
- `(default)` sub-network label is now hidden in:
  - segment `Sub-network` table cells
  - render/summary sub-network info controls
- `Enable all` sub-network button is hidden when no sub-network other than `default` exists.
- Quick entity navigation strip after route preview now supports `Nodes` and `Segments` in Analysis mode.

## Home, Network Scope, and Settings UX Polish

- `Open Network Scope` moved to the first position on `Home`.
- Home `Help` was promoted to a standalone action button under `Import from file`.
- Added `Export` action in `Network Scope` (under `Duplicate`) with aligned icon usage.
- `Network Scope` action row ordering and table shell styling were aligned with the rest of the app.
- Multiple `Settings` sections were reordered for a smoother information flow.
- Settings shortcut and export network selection lists were compacted for better density/readability.

## Themes and Visual System (Major Expansion)

### New Standalone Dark Themes

Added 8 standalone dark themes (single-class themes, no theme mixing):

- `Steel Blue`
- `Forest Graphite`
- `Petrol Slate`
- `Copper Night`
- `Moss Taupe`
- `Navy Ash`
- `Charcoal Plum`
- `Smoked Teal`

### New Standalone Light Themes

Added 8 standalone light themes:

- `Mist Gray`
- `Sage Paper`
- `Sand Slate`
- `Ice Blue`
- `Soft Teal`
- `Dusty Rose`
- `Pale Olive`
- `Cloud Lavender`

### Theme Selector and Theme Coverage Improvements

- Theme selector entries are grouped by **Light** then **Dark**.
- Non-base theme labels include `(Light)` / `(Dark)`.
- Fixed page/shell background continuity for standalone themes (no visible seam).
- Removed hardcoded white textfield backgrounds and made form fields theme-aware.
- Expanded standalone theme coverage across many workspace components, including:
  - inspector/context panels,
  - legends and canvas info values,
  - route preview empty state and badges,
  - validation severity badges,
  - release buttons in analysis cards,
  - delete buttons,
  - subnetwork chips,
  - navigation subsections,
  - selected/highlighted row visuals,
  - settings panels and controls.
- Improved `Olive` theme coverage (settings, inspector, legends, overlays).
- Aligned selected node stroke color with selected segment color across themes.
- Aligned legend segment/wire-highlight colors with network theme variables.

## Button Styling and Visual Consistency

- `Help` buttons now share a stronger dotted/dashed border treatment across panels.
- `CSV` export buttons now use the same dotted border treatment as Help buttons.
- `Export PNG` now uses the same dotted border treatment as `CSV` / `Help`.
- All onboarding/contextual help buttons now use the shared `ico_help` icon.

## Accessibility and Data Integrity Hardening

- Hardened reducer invariants so required text/ID fields are normalized and validated after `trim` (store remains a final guardrail).
- Improved `TableFilterBar` accessibility by ensuring explicit labeling of the text input (not placeholder-only).
- Strengthened theme UI regression tests beyond shell class wiring (representative rendered surfaces are checked).

## Testing, Quality Gates, and Delivery Hardening

- Added and updated regression tests for:
  - onboarding,
  - analysis/navigation,
  - table sorting/filtering,
  - creation flow ergonomics,
  - wire metadata,
  - theme rendering,
  - persistence and portability compatibility.
- E2E smoke coverage was updated to account for onboarding auto-open behavior.
- Repeated full validation runs were performed during delivery:
  - `logics_lint`
  - `lint`
  - `typecheck`
  - UI/store modularization quality gates
  - `test:ci`
  - `build`
  - `quality:pwa`
  - `test:e2e`
