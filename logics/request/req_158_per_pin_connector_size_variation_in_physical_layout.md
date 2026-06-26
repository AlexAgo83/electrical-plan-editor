## req_158_per_pin_connector_size_variation_in_physical_layout - Per-pin connector size variation in physical layout
> From version: 1.16.11
> Schema version: 1.0
> Status: Draft
> Understanding: 85%
> Confidence: 70%
> Complexity: Low
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a per-way (per-pin) size variation in the connector physical layout so a single cavity can be drawn smaller or larger than the others, without changing the grid footprint.
- Goal: visually distinguish power vs signal cavities at a glance, improving plan readability, without forcing the user into the existing `big` (2x2) size that changes grid occupancy and can break the layout.

# Context
- Connector size already exists as a per-way enum: `ConnectorLayoutWaySize = "normal" | "big"` (`src/core/entities.ts:140`, field `ConnectorLayoutWay.size` at `:165`).
- `big` couples two effects: it spans an extra grid cell **and** scales the drawn shape x2. Both come from the same function `getConnectorLayoutWaySpan(way)` which returns `2` for `big`, `1` otherwise (`src/core/connectorLayout.ts:90-92`).
- That single span value is reused directly as the visual multiplier (`sizeScale` / `waySizeScale`) in all three render sites:
  - `src/app/components/workspace/ConnectorPhysicalView.tsx:82` (`renderPhysicalWayShape`)
  - `src/app/components/workspace/connectorLayoutEditorPreview.tsx:45`
  - `src/app/components/network-summary/callouts/NetworkSummaryCalloutsLayer.tsx:262`
- Because grid span and visual scale are the same value, any new "smaller" size is impossible without first decoupling the visual multiplier from the grid footprint. A `small` size must keep span = 1 (no grid impact — this is exactly what avoids breaking the layout) while shrinking only the drawn shape.
- The size selector UI already lists size options: `WAY_SIZE_OPTIONS` in `src/app/components/workspace/ConnectorLayoutEditor.tsx:80` (`normal`, `big (2x2)`).
- Serialization/normalization of the size value: `normalizeWaySize` (`src/core/connectorLayout.ts:83`) and the move/patch validation at `:718`. Both currently only recognize `"big"`.
- Note on intent: the original phrasing of the need was a global -20% / +20% slider. A global scale does **not** meet the goal — it scales every pin equally and so cannot differentiate power from signal. The need is genuinely **per-pin**, which the existing per-way `size` enum already models. This request therefore extends that enum rather than adding a global preference.
- Power vs signal is not a first-class concept in the data model today; the closest is `PinElectricalRole` (`source`/`consumer`/`passive`/`bidirectional`, `src/core/entities.ts:38-45`). This request does NOT auto-map roles to sizes — it gives the operator a manual per-pin size, leaving any role-driven automation to a later slice.

# Decisions
- Add a third value `"small"` to `ConnectorLayoutWaySize` -> `"small" | "normal" | "big"`.
- `small` keeps grid span = 1 (no footprint change, never breaks layout); only the drawn shape shrinks.
- Visual multiplier for `small` = **x0.5** (symmetric with `big` = x2; chosen over x0.25 to keep the pin legible and clickable as a hit target).
- Decouple visual scale from grid span: introduce a dedicated visual-scale helper (e.g. `getConnectorLayoutWayVisualScale`) returning `0.5 / 1 / 2`, used only by the three render sites; `getConnectorLayoutWaySpan` stays the grid-footprint authority and continues to return `1` for `small`.
- Surface `small` in the existing `WAY_SIZE_OPTIONS` selector (no new panel).

# Acceptance criteria
- AC1: A way can be set to `small` and is drawn at half the normal shape size in the physical view, the layout editor preview, and the network-summary callout — all three render sites consistent.
- AC2: A `small` way occupies exactly one grid cell (span unchanged); placement, overlap detection, and move/clamp behave identically to a `normal` way (no layout breakage).
- AC3: `big` is unaffected — still spans 2x2 and draws at x2.
- AC4: `small` persists through save/load and import/export (normalization recognizes `"small"`; unknown legacy values still fall back to `normal`).
- AC5: The size selector lets the user choose Small / Normal / Big for a way.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: add `small` to the size enum; decouple visual scale from grid span across the three render sites; recognize `small` in normalization + move/patch validation; add `small` to the size selector; persistence/import-export round-trip.
- Out: global plan-wide size slider; automatic role-driven sizing (power/signal auto-detection from `PinElectricalRole`); any size beyond the discrete small/normal/big set (e.g. free-form percentage per pin); changes to keying or shell sizing.

# Risks / Open questions
- Decoupling must be surgical: only the visual multiplier moves to the new helper. If a grid-math call site (`clampWayX/Y`, `getConnectorLayoutWayOccupiedCells`, `getConnectorLayoutWayRenderCenter` — `src/core/connectorLayout.ts:94-118`) is changed by mistake, a `small` pin would wrongly occupy a fractional/extra cell. Verify span call sites stay on `getConnectorLayoutWaySpan`.
- Legibility / hit target: x0.5 is the agreed floor. If the smallest readable size in real plans is still too small at high pin counts, revisit the multiplier (do not go below x0.5 without a usability check).
- Three render sites use slightly different base constants (0.6 / 0.56 / 0.56 etc.) — confirm each multiplies the new visual scale, not the span, so they stay visually consistent.
- Confirm whether the callout layer (`NetworkSummaryCalloutsLayer`) should reflect `small`, or only the main physical view — assumed yes (all three) for consistency.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/core/entities.ts:140` (`ConnectorLayoutWaySize`), `:165` (`ConnectorLayoutWay.size`)
- `src/core/connectorLayout.ts:83` (`normalizeWaySize`), `:90` (`getConnectorLayoutWaySpan`), `:718` (move/patch size validation)
- `src/app/components/workspace/ConnectorPhysicalView.tsx:82` (physical render visual scale)
- `src/app/components/workspace/connectorLayoutEditorPreview.tsx:45` (editor preview visual scale)
- `src/app/components/network-summary/callouts/NetworkSummaryCalloutsLayer.tsx:262` (callout visual scale)
- `src/app/components/workspace/ConnectorLayoutEditor.tsx:80` (`WAY_SIZE_OPTIONS` selector)

# AI Context
- Summary: Add a per-way `small` connector size (visual x0.5, grid span unchanged) to the physical layout by decoupling the visual scale from the grid span, so operators can shrink individual pins (e.g. signal vs power) without switching to the footprint-changing `big` 2x2 size.
- Keywords: connector-layout, physical-layout, way-size, small-pin, visual-scale, grid-span, edition-plan
- Use when: implementing per-pin size variation or touching connector physical-view sizing.
- Skip when: working on grid footprint/occupancy math, keying/shell sizing, or a global plan-wide scale.

# Backlog
- none
- `item_644_per_pin_connector_size_variation_in_physical_layout`
