# Network Statistics Dashboard Release Brief

## Objective

Add a dedicated **Statistics** tab that gives users a fast, read-only quantitative view of one network or several manually selected networks: connector count, splice count, wire count, routed length, occupancy, section distribution, catalog usage, and other engineering indicators useful for review and harness comparison.

The feature should answer two common questions without requiring export to a spreadsheet:

- "What does this network contain?"
- "How do these networks compare?"

## User Problem

Today, the app exposes detailed entity tables and analysis views, but there is no consolidated statistical summary. A user who wants to know the total number of connectors, splices, wires, or total wire length must manually inspect lists, export data, or infer values from multiple screens.

This is slow for everyday engineering tasks:

- estimating harness complexity before handoff;
- comparing two network variants;
- checking whether a network is complete enough for quoting;
- spotting unusually long wires, unused connector ways, or missing route lengths;
- preparing a lightweight report for a project review.

The app already owns the normalized network state, computed routes, wire metadata, catalog links, and harness assembly membership. The missing piece is a clear dashboard that turns those data into reliable, scoped statistics.

## Scope

### Statistics tab
- Add a top-level **Statistics** tab to the workspace navigation, positioned between **Modeling** and **Validation**.
- The tab is read-only. It does not mutate network data.
- The first view shows the active network by default.
- The user can change the scope to:
  - active network;
  - manual multi-network selection.
- When several networks are selected, the dashboard shows both:
  - an aggregated total;
  - a per-network comparison table.

### Core entity counts
- Connector count.
- Splice count.
- Routing node count, split by connector nodes, splice nodes, and intermediate nodes.
- Segment count.
- Wire count.
- Catalog item count.

### Wire length and routing metrics
- Total wire length in meters, computed from `Wire.lengthMm` when present.
- Total routed segment length fallback when a wire has route segment IDs but no stored `lengthMm`.
- Wires without a physical route or explicit physical length are excluded from length calculations.
- Routed wire count included in length calculations.
- Average, minimum, maximum, and median wire length.
- Longest wires table, limited to the top 10 by length.
- Route lock count and percentage.
- Segment total length in meters.

### Electrical and material distribution
- Wire section distribution (`sectionMm2` count and total length per section).
- Wire material distribution (`copper`, `aluminum`, unspecified).
- Wire color distribution, including free color labels.
- Wire current metadata coverage: count of wires with `currentA` set and max declared current.
- Fuse-protected wire count.
- Optional pin-role coverage when pin electrical roles exist: declared connector pins by role (`source`, `consumer`, `passive`, `bidirectional`).

### Connector and splice utilization
- Total connector way capacity.
- Occupied connector ways.
- Connector occupancy percentage.
- Connectors with unused ways, top 10 by unused count.
- Total splice port capacity for bounded/directional splices.
- Occupied splice ports and occupancy percentage where capacity is finite.
- Directional splice count.

### Catalog indicators
- Connectors linked to catalog items vs. unlinked connectors.
- Splices linked to catalog items vs. unlinked splices.
- Catalog manufacturer reference distribution.
- Estimated catalog-backed component count.

### Presentation
- Summary metric tiles for the most important numbers.
- Per-network comparison table for multi-network scopes.
- Distribution tables for sections, materials, colors, catalog references, and pin roles.
- Empty states explain why a metric is unavailable, for example "No routed wire length available".
- Values use existing locale preferences for number formatting where available.
- Lengths are displayed in meters with millimeter precision preserved in the underlying calculation.

## Out Of Scope

- Editing entities from the Statistics tab.
- New persistence schema fields.
- New third-party charting dependencies.
- Server-side analytics, telemetry, or cloud reporting.
- PDF report generation.
- Statistics CSV export in the first release. This can be handled as a follow-up.
- Changing existing network, BOM, or wire CSV export schemas.
- Pricing rollups or cost statistics in the first release.
- AI Agent integration.
- Release version bump, changelog, or Logics workflow updates.

## Acceptance Criteria

- The workspace navigation includes a **Statistics** tab.
- The **Statistics** tab is positioned between **Modeling** and **Validation**.
- Opening the tab on a workspace with an active network shows active-network statistics by default.
- The user can switch the statistics scope between active network and a manual selection of one or more networks.
- The dashboard displays connector, splice, routing node, segment, wire, and catalog item counts.
- The dashboard displays total wire length, average wire length, min/max/median wire length, routed wire count included in length calculations, route lock count, and top 10 longest wires.
- Wire length calculation uses stored wire length when available and falls back to summed route segment length when route segments are available.
- Wires without a physical route or explicit physical length are ignored by length metrics and are never counted as `0 m`.
- Multi-network scopes show both an aggregated total and a per-network comparison table.
- Wire section, material, color, fuse-protection, and pin-role distributions are shown when data exists.
- Connector way capacity, occupied ways, occupancy percentage, and top unused-way connectors are shown.
- Splice port capacity and occupancy are shown for bounded or directional splices; unbounded splices are excluded from finite-capacity percentages.
- Catalog-linked vs. unlinked connector/splice counts are shown.
- Statistics are deterministic and derived from current store state without mutating the workspace.
- Empty or incomplete data produces clear empty states instead of `NaN`, crashes, or misleading zero totals.
- Unit tests cover the statistics calculator for active-network, manual multi-network, ignored-unrouted-wire, route-length fallback, occupancy, and catalog-linkage cases.
- UI tests cover tab navigation, scope switching, empty state, and multi-network comparison.

## Resolved Decisions

- The Statistics tab is read-only.
- The UI label is English: **Statistics**.
- The active network is the default scope.
- Multi-network scope is manual free selection, not a dedicated all-networks or harness-assembly shortcut in the first release.
- Multi-network statistics must include both totals and per-network comparison.
- Lengths are normalized to meters in the UI, while calculations preserve millimeter values internally.
- Wires with no physical route or explicit physical length are ignored by length metrics.
- No charting dependency is introduced in the first release; tables and compact visual bars are enough.
- CSV export is deferred to a follow-up.
- Pricing and cost rollups are deferred to a follow-up.
