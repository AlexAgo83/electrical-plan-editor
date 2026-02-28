# Changelog (`0.7.4 → 0.8.1`)

## Major Highlights

- Hardened persistence and compatibility with versioned local-storage envelopes, migration safety, and portability regression coverage.
- Improved creation ergonomics with technical ID suggestions and expanded auto-create linked-node controls for connector/splice workflows.
- Delivered a broad onboarding and contextual-help rollout (guided modal flow, persisted opt-out, and in-panel relaunch entry points).
- Added major wire-model capabilities: endpoint occupancy intelligence, section (`mm²`), mono/bi-color support, and endpoint-side metadata.
- Expanded themes and UX consistency across workspace panels, tables, canvas/inspector surfaces, and shared action/button styling.

## Data Safety, Persistence, and Compatibility

- Added **versioned persistence envelopes** for local storage data.
- Added **migration safety** paths for persisted data and network portability files.
- Improved backward compatibility handling for sample/demo networks and imported data.
- Extended regression coverage for persistence and portability migrations.

## Create Forms and ID Ergonomics

- Improved create flows with **technical ID suggestions**.
- Added/expanded **auto-create linked nodes** behavior for connector/splice creation flows.
- Added technical ID prefill for additional create forms:
  - nodes
  - segments
  - wires
- Added tests for ID suggestion and creation-flow ergonomics.

## Onboarding and Contextual Help

- Added a **step-by-step onboarding modal flow** (multi-step guided introduction).
- Onboarding can auto-open on startup and supports a persisted **opt-out** preference.
- Added `Help` relaunch entry points from `Home` and contextual help buttons in relevant panels.
- Added contextual onboarding launchers in both **Modeling** and **Analysis** panels (same placement/style).
- Shared `Connectors / Splices` onboarding step now includes:
  - `Open Connectors`
  - `Open Splices`
- CTA navigation supports in-app navigation plus best-effort panel focus/scroll.
- Onboarding copy and UI chrome aligned to **English**.
- Onboarding UI polish:
  - feature icons in steps (instead of placeholder badges),
  - improved `Next/Finish` button styling,
  - theme support for the onboarding modal.

## Modeling and Entity Editing

### Editable Node IDs (atomic rename)

- `Node ID` is now editable in edit mode.
- Implemented a safe **atomic node rename** flow in the store (instead of delete/recreate).
- Renaming updates dependent references consistently:
  - connected segments
  - node positions
  - selected entity state
  - local UI references (route preview, etc.)

### Connector / Splice Manufacturer References

- Added optional `manufacturerReference` on:
  - connectors
  - splices
- Available in create/edit forms.
- Normalization rules applied (`trim`, empty -> `undefined`).

### Connector / Splice Auto-create Node Option

- Added a per-form checkbox to enable/disable auto-creation of the linked node during create flows.
- Added a **global Settings default** to pre-set this checkbox (default ON).

### Save/Edit Panel Synchronization Improvements

- After `Save` in edit mode, the corresponding row is re-focused.
- The form/panel remains synchronized with the edited row (no unintended fallback to create mode).
- Behavior now matches the expected “stay on edited entity” UX.

## Wires: New Metadata and Creation Assist

### Wire Endpoint Occupancy Validation + Next Free Prefill

- Added endpoint occupancy validation (connector ways / splice ports) in wire forms.
- Added inline “already used” indicators.
- Added next free way/port suggestion and create-mode prefill.
- Manual edits are preserved until the endpoint context changes.
- Edit mode ignores the currently edited wire’s own slot to avoid false positives.

### Wire Section (mm²)

- Added `sectionMm2` on wires.
- Added `Section (mm²)` field in wire create/edit forms.
- Added Settings default value (global UI preference) used as **create prefill**.
- Added compatibility patching for older saves/imports that do not include the field.

### Wire Color Catalog (mono + bi-color)

- Added a canonical wire color catalog with:
  - 2-character IDs
  - labels
  - hex colors for UI swatches
- Added optional wire color support:
  - `primaryColorId`
  - `secondaryColorId` (optional)
- Supports no-color, mono-color, and bi-color wires.
- Duplicate bi-color values are normalized back to mono-color.
- Added swatches and color selectors in wire forms.

### Wire Endpoint Side Metadata (A/B)

- Added optional per-side references on wires:
  - connection reference
  - seal reference
- Available for both endpoint sides (`A` and `B`) in wire forms.
- Non-destructive behavior when endpoint type changes.

## Analysis and Occupancy Workflows

### Human-readable Occupancy Labels

- Occupancy labels in connector/splice analysis views now display a readable wire format:
  - `Wire <technicalId> / A`
  - `Wire <technicalId> / B`
- Internal backend/store reference format remains unchanged.

### Reserve Way / Reserve Port Validation

- Connector “reserve way” now validates whether a way is already occupied.
- Splice “reserve port” now validates whether a port is already occupied.
- Added next free slot suggestions and prefill behavior for manual reserve flows.
- Reserve actions are disabled when the target slot is invalid or already occupied.

## Tables, Filters, and Panel Toolbars

- Introduced a reusable **table filter bar** pattern:
  - `Filter` label
  - field selector
  - full-width text input
- Applied first to `Wires` and `Network Scope`, then extended to more panels (Modeling and Analysis).
- Added filter bars in **Analysis > Connectors** and **Analysis > Splices**.
- Ensured `Any` is always the **first option** in filter field selectors.
- Aligned filter field selector look & feel with the rest of the app controls.
- Matched filter textfield height to the filter field selector height.

## Home, Network Scope, and Settings Layout Polish

- `Open Network Scope` moved to the first position on `Home`.
- Home `Help` became a full-width standalone action button under `Import from file`.
- Added `Export` action in `Network Scope` (under `Duplicate`) and aligned icon usage.
- Reordered several `Settings` sections for better flow (render/tools/sample/global/shortcuts/import/export grouping).
- Updated `Network Scope` action row ordering (`CSV` / `Help`) and visual consistency.
- Aligned `Network Scope` table shell look & feel with other app tables (removed extra framed wrapper feel).

## Canvas, Selection, and Inspector UX

- Node selected stroke color now matches selected segment color across themes.
- Improved route preview and network summary theming coverage (texts, badges, info panels).
- Added/standardized Help buttons in Analysis panels with same style/placement as Modeling.

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

### Theme Selector and Settings Improvements

- Theme selector entries are grouped by **Light** then **Dark**.
- Theme labels include `(Light)` / `(Dark)` for non-base themes.

### Theme Coverage and Visual Consistency Fixes

- Fixed standalone theme page background continuity (no visible shell/page seam).
- Fixed theme-aware textfields and removed remaining hardcoded white field backgrounds.
- Fixed `meta-line` and muted text styling to respect active themes.
- Improved `Olive` theme coverage (settings, inspector, legends, overlays).
- Aligned legend colors (including wire-highlight legend line) with theme variables.
- Extended standalone theme coverage across many previously fallback-styled components:
  - inspector and context panels
  - legend and canvas info values
  - route preview empty state and status badge
  - wire endpoint fieldsets
  - delete buttons
  - release buttons in connector/splice analysis cards
  - validation severity badges (`ERROR` / `WARNING`)
  - left navigation subsection (`Entity navigation`)
  - subnetwork chips and `(default)`-style chips
  - selected / highlighted table row visuals

## Button and Action Styling

- Added shared dotted-border styling emphasis for:
  - `Help` buttons
  - `CSV` export buttons
  - `Export PNG` button
- Help buttons now use the shared `ico_help` icon across the app.

## Settings UI Density / Compaction Improvements

- Compacted the **shortcut list**:
  - tighter spacing and padding
  - smaller shortcut key badges
  - smaller descriptions
  - right-aligned shortcut descriptions
  - removed row borders/backgrounds for a lighter layout

- Compacted **Selected networks for export** list:
  - tighter row spacing
  - better checkbox alignment
  - smaller/denser technical ID line

## Documentation and Product Text

- README wording updated for theme support (`multiple light and dark themes`).
- Logics planning and orchestration docs extended for req/task waves (`req_036` through follow-up `req_043` / `task_044`).

## Testing, QA, and Delivery Hardening

- Added/updated tests across UI, reducer, portability, and creation ergonomics flows.
- E2E smoke tests updated to handle onboarding auto-open overlays.
- JSDOM canvas test noise reduced via `HTMLCanvasElement.getContext` mocking.
- Full delivery gates were run repeatedly during implementation:
  - logics lint
  - lint
  - typecheck
  - UI/store modularization checks
  - test:ci
  - build
  - PWA artifact quality
  - e2e

## Internal Delivery Notes (non-product)

- Added planning requests/backlog/tasks for `req_036` to `req_043`.
- Added super-orchestration and follow-up orchestration tasks (`task_043`, `task_044`).
- Delivered in multiple checkpoint commits with validation gates between waves.
