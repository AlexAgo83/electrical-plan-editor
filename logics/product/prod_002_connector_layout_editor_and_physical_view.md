## prod_002_connector_layout_editor_and_physical_view - Connector Layout Editor and Physical Connector View
> Date: 2026-05-19
> Status: Validated
> Related request: TBD
> Related backlog: TBD
> Related task: TBD
> Related architecture: TBD
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
The product direction is to let users define and reuse the physical face layout of catalog-backed connectors, then inspect real connector instances through that layout.
The current application already supports schematic connector analysis, catalog association, way count, wire occupancy, terminal/seal overrides, and catalog material defaults.
The missing capability is a layout editor that captures where each way physically appears on the connector face.

The proposed feature separates two concerns:
- `Catalog layout editor`: defines the reusable physical geometry for a connector catalog item.
- `Connector physical view`: renders a selected connector instance using that geometry with live occupancy, terminal, seal, plug, and wire context.

Expected outcomes are faster pinout review, fewer way-ordering mistakes, and a clearer bridge between electrical data and the physical connector face.

```mermaid
flowchart LR
    Problem[Connector way order is hard to verify physically] --> Direction[Catalog-backed layout editor]
    Direction --> Data[Reusable connector layout on catalog item]
    Data --> View[Physical connector view for instances]
    View --> Outcome[Faster pinout review and fewer cavity assignment errors]
```

# Product Problem
Users can currently model connector ways and analyze occupancy, but the UI does not capture the physical arrangement of those ways.
A connector with 12 ways may be electrically valid while still being physically confusing: row order, numbering direction, keying, cavities, and visual grouping are not represented.

The product problem is that connector verification still requires the user to mentally map table rows or schematic cells onto a real connector face.
That mapping is error-prone during pinout review, terminal/seal checks, and catalog-backed reuse.

# Target Users and Situations
- Harness designers defining a connector catalog reference from a datasheet or existing pinout.
- Operators reviewing whether wires are assigned to the expected physical ways.
- Reviewers validating terminal/seal/plug defaults against an actual connector face.
- Users who need a more realistic connector face than the existing schematic `Connector analysis` table.

# Goals
- Add a reusable connector layout model to catalog items.
- Provide an editor for placing, numbering, and shaping connector ways.
- Render selected connector instances in a physical view using the catalog layout.
- Preserve schematic analysis as the default quick data view.
- Make physical review useful even before perfect manufacturer-accurate geometry is available.
- Keep electrical occupancy and connector layout as separate but synchronized concepts.

# Non-Goals
- Build a full mechanical CAD editor.
- Replace the existing schematic `Connector analysis` view.
- Make each connector instance silently diverge from its catalog item layout by default.
- Add 3D connector modeling in the first release.
- Infer manufacturer layouts automatically from datasheets in V1.

# Scope and Guardrails
- In:
  - catalog-level `connectorLayout` data owned by `CatalogItem`;
  - visual layout editor for catalog-backed connector ways;
  - automatic starter layouts generated from `connectionCount`;
  - explicit way positioning, labels, shape, and numbering order;
  - physical view toggle inside `Connector analysis`;
  - live rendering of occupied/free ways, wire links, terminal/seal overrides, catalog defaults, and plugs;
  - persistence, import/export, and migration compatibility for saved layouts.
- Out:
  - free-form instance-only layout editing in V1;
  - automatic OCR/datasheet parsing;
  - arbitrary vector drawing tools unrelated to connector ways;
  - physical packaging constraints such as shell dimensions, mounting clips, or 3D fit checks.

# Proposed Data Model Direction
`CatalogItem` should gain an optional `connectorLayout`.
The layout should be normalized and resilient to `connectionCount` changes.

Candidate shape:

```ts
interface ConnectorLayout {
  version: 1;
  units: "grid";
  width: number;
  height: number;
  ways: ConnectorLayoutWay[];
  keying?: ConnectorLayoutKeying;
}

interface ConnectorLayoutWay {
  cavityIndex: number;
  x: number;
  y: number;
  shape: "round" | "square" | "slot";
  label?: string;
  rotationDeg?: number;
  size?: "sm" | "md" | "lg";
}
```

The exact TypeScript contract can evolve during implementation, but the product decision should stay stable: geometry belongs to the catalog reference, while occupancy belongs to connector and wire instances.

# Experience Direction
The user should encounter the feature in two places.

1. Catalog item editing:
   - open `Edit connector layout`;
   - start from an auto-generated layout based on `connectionCount`;
   - drag ways on a grid;
   - select a way to edit index, label, shape, size, and rotation;
   - run layout actions such as auto layout, mirror, rotate, reset, or compact rows.

2. Connector analysis:
   - keep the current schematic view;
   - add a `Schematic / Physical` segmented switch;
   - in physical mode, render the selected connector using its catalog layout;
   - display occupied/free ways and material states;
   - allow safe contextual edits that affect connector data, not catalog geometry, unless the user explicitly opens the catalog layout editor.

# Editing Contract
- A catalog layout must contain exactly one way for each valid `cavityIndex` from `1..connectionCount`.
- Reducing `connectionCount` must reject or repair layouts that contain now-invalid ways, following the existing catalog safety pattern.
- Increasing `connectionCount` should preserve existing way positions and append missing ways through a deterministic placement rule.
- The editor should make unsaved changes explicit and reversible.
- Layout edits should participate in the same persistence/import/export contract as catalog edits.

# Visual Semantics
- Free way: neutral cavity.
- Occupied way: stronger outline or fill tied to the connected wire context.
- Selected way: clear focus ring and details panel synchronization.
- Catalog terminal/seal default: subtle material indicators.
- Connector override: distinct indicator from catalog default.
- Plugged unused way: visible plug state, separate from occupied-by-wire state.
- Missing or inconsistent layout data: validation warning and safe fallback grid.

# Key Product Decisions
- Store connector layout on the catalog item because physical geometry is a property of the manufacturer reference, not each connector instance.
- Keep instance-level physical view read-focused in V1; instance edits should adjust wire/material assignment, not physical geometry.
- Use SVG or DOM/SVG hybrid rendering for V1 because the editor needs precise interactive geometry but not full canvas-level free drawing.
- Use grid snapping by default to keep layouts tidy and editable without requiring pixel-perfect work.
- Provide automatic fallback layouts so existing catalog data remains usable immediately after migration.
- Keep schematic and physical views side by side as modes, not replacements.

# Success Signals
- Users can create a physical layout for a catalog item and reuse it across multiple connectors.
- Connector analysis can switch between schematic and physical view without losing selection context.
- Physical view makes occupied, free, plugged, terminal default, seal default, and override states distinguishable.
- Existing catalog import/export and persistence flows remain backward compatible.
- Tests cover layout normalization, migration, catalog edits, physical rendering, and interaction basics.

# Open Questions
- Should V1 allow row templates such as `2x6`, `3x4`, or should templates be purely generated from `connectionCount`?
- Should instance-level layout overrides ever be supported, or should divergence require a separate catalog item?
- Should physical view support drag-and-drop reassignment of wire endpoints in V1, or should that wait until the read/edit boundary is proven?
- How much manufacturer-realistic keying should V1 include: simple notch marker, orientation marker, or none?
- Should connector layout be included in CSV catalog import/export immediately, or only in JSON import/export first?

# References
- Existing catalog feature family:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `logics/request/req_055_catalog_analysis_panel_linked_connectors_and_splices_usage_listing.md`
  - `logics/request/req_125_connector_catalog_terminal_seal_and_plug_defaults.md`
- Existing architecture context:
  - `logics/architecture/adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming.md`
  - `logics/architecture/adr_007_harness_assembly_and_physical_interconnector_contract.md`
