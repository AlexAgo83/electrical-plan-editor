## item_636_colocated_splice_rendering_and_network_scope_entity_prefix_display - Colocated splice rendering and network-scope entity prefix display
> From version: 1.16.7
> Schema version: 1.0
> Status: Done
> Understanding: 92
> Confidence: 85
> Progress: 100%
> Complexity: High
> Theme: Modeling display and network identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Operators need the 2D plan to clearly represent multiple floating splices that share the same physical position on the same segment. In the reported AMIPI workspace, EP 2 and EP 3 on the lateral harness occupy the same segment location and should not draw on top of each other. The visual layout must keep the true physical colocated placement while making each splice visible.

Operators also need network-level ID prefixes such as `LAT-` and `PRI-` to be explicit metadata. Prefixes should remain anchored in stored entity IDs for uniqueness, but the UI and human-readable exports should be able to hide them for readability. AI-agent JSON must keep canonical full IDs.

# Scope
- In:
  - Detect colocated floating splices by physical segment position, including placements expressed from opposite segment endpoints.
  - Offset colocated splice symbols symmetrically on both sides of the carrier segment along the orthogonal direction.
  - Derive spacing from rendered splice symbol size, keep the group centered on the true physical point, and keep labels/callouts anchored to the displaced symbol positions.
  - Render a short colocated-splice link line by default and add a persistent settings option to hide it.
  - Add a network-scope entity prefix field for connector, node, splice, segment, and wire IDs / `technicalId` values.
  - Auto-detect obvious existing prefixes during load/import/migration when safe.
  - Keep generated/stored IDs prefixed in prefixed networks to avoid duplicate bare IDs such as `N-01` or `CT1`.
  - Add a persistent setting to show/hide network prefixes across UI and human-readable exports, while preserving full IDs in AI-agent JSON.
  - Add harness assembly / multi-network-only disambiguation when hidden prefixes produce duplicate-looking bare IDs.
- Out:
  - Changing physical splice placement, wire routes, route lengths, or splice side inference because of colocated rendering.
  - Merging colocated splices into one entity.
  - Destructive bulk renaming of existing workspaces.
  - Hiding canonical full IDs from AI-agent JSON.
  - Applying duplicate-ID disambiguation in ordinary single-network views.

# Acceptance criteria
- AC1: Colocated floating splices on the same segment point are both visible in the 2D plan and no longer draw directly on top of each other.
- AC2: The visual separation direction is orthogonal to the carrier segment and remains stable when the viewport is zoomed, panned, exported, or re-rendered.
- AC3: A colocated group with two splices is arranged symmetrically around the true placement point, with one splice on each side of the carrier segment; groups with more than two splices use a deterministic ordering and spacing that avoids overlap.
- AC4: A short linking line is rendered for colocated groups by default, can be hidden from settings, and does not obscure wires, labels, or callouts.
- AC5: The stored splice placement is unchanged after rendering: same `segmentId`, same physical offset, same wire routes, and same route lengths before and after display.
- AC6: Placements expressed from opposite segment nodes but describing the same physical location are detected as colocated.
- AC7: Network scope exposes an editable entity prefix field, and the value persists in workspace save/load and network import/export.
- AC8: Settings expose a persistent show/hide toggle for network entity prefixes.
- AC9: When prefix display is hidden, connector, node, splice, segment, and wire ID labels in UI surfaces and human-readable exports omit the active network prefix, while AI-agent JSON continues to expose canonical full IDs.
- AC10: When prefix display is shown, existing labels remain backward-compatible and continue to include the stored prefix.
- AC11: Prefix hiding does not break selection, navigation, sorting, filtering, validation, exports, imports, AI-agent operations, or uniqueness checks because those continue to use canonical IDs internally.
- AC12: New entity creation in a prefixed network stores IDs with the network prefix anchored in the entity `technicalId`, preventing repeated bare IDs such as `N-01` or `CT1` across networks.
- AC13: Existing workspaces auto-detect obvious network prefixes during load/import/migration, populate the network prefix field when safe, and avoid double-prefix display.
- AC14: Colocated splice spacing is derived from rendered symbol size, and colocated splice labels/callouts follow the displaced symbol positions.
- AC15: If hidden prefixes create duplicate-looking bare IDs across networks, a disambiguation hint is shown only in harness assembly / multi-network contexts.
- AC16: Targeted tests cover colocated splice grouping, reverse-from-node equivalence, orthogonal display offsets, symbol-size-derived spacing, displaced callout/label anchoring, single-splice non-regression, link-line settings behavior, prefix auto-detection, prefix persistence, the settings toggle, prefixed new-ID creation, harness-assembly-only disambiguation, and at least one table/callout/inspector/export label path plus AI-agent JSON canonical-ID preservation.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Colocated floating splices on the same segment point are both visible in the 2D plan and no longer draw directly on top of each other.
- request-AC2 -> This backlog slice. Proof: AC2: The visual separation direction is orthogonal to the carrier segment and remains stable when the viewport is zoomed, panned, exported, or re-rendered.
- request-AC3 -> This backlog slice. Proof: AC3: A colocated group with two splices is arranged symmetrically around the true placement point, with one splice on each side of the carrier segment; groups with more than two splices use a deterministic ordering and spacing that avoids overlap.
- request-AC4 -> This backlog slice. Proof: AC4: A short linking line is rendered for colocated groups by default, can be hidden from settings, and does not obscure wires, labels, or callouts.
- request-AC5 -> This backlog slice. Proof: AC5: The stored splice placement is unchanged after rendering: same `segmentId`, same physical offset, same wire routes, and same route lengths before and after display.
- request-AC6 -> This backlog slice. Proof: AC6: Placements expressed from opposite segment nodes but describing the same physical location are detected as colocated.
- request-AC7 -> This backlog slice. Proof: AC7: Network scope exposes an editable entity prefix field, and the value persists in workspace save/load and network import/export.
- request-AC8 -> This backlog slice. Proof: AC8: Settings expose a persistent show/hide toggle for network entity prefixes.
- request-AC9 -> This backlog slice. Proof: AC9: When prefix display is hidden, connector, node, splice, segment, and wire ID labels in UI surfaces and human-readable exports omit the active network prefix, while AI-agent JSON continues to expose canonical full IDs.
- request-AC10 -> This backlog slice. Proof: AC10: When prefix display is shown, existing labels remain backward-compatible and continue to include the stored prefix.
- request-AC11 -> This backlog slice. Proof: AC11: Prefix hiding does not break selection, navigation, sorting, filtering, validation, exports, imports, AI-agent operations, or uniqueness checks because those continue to use canonical IDs internally.
- request-AC12 -> This backlog slice. Proof: AC12: New entity creation in a prefixed network stores IDs with the network prefix anchored in the entity `technicalId`, preventing repeated bare IDs such as `N-01` or `CT1` across networks.
- request-AC13 -> This backlog slice. Proof: AC13: Existing workspaces auto-detect obvious network prefixes during load/import/migration, populate the network prefix field when safe, and avoid double-prefix display.
- request-AC14 -> This backlog slice. Proof: AC14: Colocated splice spacing is derived from rendered symbol size, and colocated splice labels/callouts follow the displaced symbol positions.
- request-AC15 -> This backlog slice. Proof: AC15: If hidden prefixes create duplicate-looking bare IDs across networks, a disambiguation hint is shown only in harness assembly / multi-network contexts.
- request-AC16 -> This backlog slice. Proof: AC16: Targeted tests cover colocated splice grouping, reverse-from-node equivalence, orthogonal display offsets, symbol-size-derived spacing, displaced callout/label anchoring, single-splice non-regression, link-line settings behavior, prefix auto-detection, prefix persistence, the settings toggle, prefixed new-ID creation, harness-assembly-only disambiguation, and at least one table/callout/inspector/export label path plus AI-agent JSON canonical-ID preservation.

# Decision framing
- Product framing: Not needed
- Product signals: User clarified all open product decisions in `req_150`.
- Product follow-up: No separate product brief is expected for this slice.
- Architecture framing: Not needed
- Architecture signals: Data-model change (`Network.entityPrefix`) plus display resolver and migration touch persistence, but the change fits the existing network-scoped model.
- Architecture follow-up: No ADR expected unless implementation discovers prefix migration or export compatibility risk beyond this scope.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_150_colocated_splice_rendering_and_network_scope_entity_prefix_display.md`
- Primary task(s): `logics/tasks/task_145_colocated_splice_rendering_and_network_scope_entity_prefix_display.md`

# AI Context
- Summary: Delivery slice for readable colocated floating-splice rendering plus network-scoped ID prefixes that can be hidden in UI/human exports while canonical IDs remain stored and exposed to AI-agent JSON.
- Keywords: backlog-groom, colocated splices, floating splice, orthogonal display offset, splice link line, network entity prefix, technicalId, prefix auto-detection, harness assembly disambiguation
- Use when: Implementing or reviewing colocated splice rendering, network entity prefix persistence, prefix display settings, or prefix-aware label rendering.
- Skip when: The change concerns directional splice side inference, wire routing algorithms, destructive bulk rename tools, or unrelated export schema changes.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Hybrid rationale: Derived from request `req_150_colocated_splice_rendering_and_network_scope_entity_prefix_display` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_150_colocated_splice_rendering_and_network_scope_entity_prefix_display.md`.
- Created manually because `logics-manager flow` is unavailable in this environment.
- Implementation should use the provided AMIPI workspace or a reduced fixture before closing DoR.
- Task `task_145_colocated_splice_rendering_and_network_scope_entity_prefix_display` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_145_colocated_splice_rendering_and_network_scope_entity_prefix_display`
