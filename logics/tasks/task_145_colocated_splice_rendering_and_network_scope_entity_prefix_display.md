## task_145_colocated_splice_rendering_and_network_scope_entity_prefix_display - Colocated splice rendering and network-scope entity prefix display
> From version: 1.16.7
> Schema version: 1.0
> Status: In Progress
> Understanding: 95
> Confidence: 88
> Progress: 90%
> Complexity: High
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] Add a pure colocated-splice grouping/layout helper that resolves placed splices to physical segment positions, groups same-segment same-position splices, treats opposite `fromNodeId` descriptions as equivalent, and returns deterministic display-only offsets along the carrier segment normal.
- [ ] Integrate the helper into Network Summary 2D graph/callout rendering so colocated splice symbols render symmetrically on both sides of the carrier segment, with spacing derived from the rendered splice symbol size and no persisted `Splice.placement` mutation.
- [ ] Render a short colocated-splice link line by default, add a persistent settings toggle to hide it, and ensure SVG/PNG/PDF/human-readable plan exports honor the same setting.
- [ ] Anchor colocated splice labels and callouts to the displaced symbol positions rather than the true physical center point.
- [ ] Add `Network.entityPrefix` (or the final agreed field name) to the core model, persistence normalization, workspace save/load, network import/export, and Network scope form editing.
- [ ] Add prefix auto-detection for existing workspaces/imports when connector/node/splice/segment/wire IDs consistently share an obvious prefix such as `LAT-` or `PRI-`, leaving the field blank when detection is ambiguous.
- [ ] Add shared prefix-aware display helpers for connector, node, splice, segment, and wire IDs. The helpers must hide the active network prefix in UI and human-readable exports when the setting is off, but never alter canonical stored IDs or AI-agent JSON output.
- [ ] Update creation/edit flows and technical ID suggestion paths so new entities in a prefixed network store IDs with the prefix anchored in `technicalId`.
- [ ] Add a harness assembly / multi-network-only disambiguation hint when hidden prefixes produce duplicate-looking bare IDs across networks.
- [ ] Add i18n entries for the new settings, Network scope prefix field, and any visible disambiguation/link-line labels.
- [ ] All acceptance criteria AC1-AC16 are covered.
- [ ] Validation passes (code + Logics gates).

# Backlog
- `item_636_colocated_splice_rendering_and_network_scope_entity_prefix_display`

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

# Implementation plan
1. Inspect the current Network Summary splice rendering path and identify the single best place to apply display-only splice offsets before graph layers/callouts/export cloning consume positions.
2. Implement and unit-test colocated splice grouping/layout as a pure helper, including reverse-from-node equivalence and deterministic multi-splice ordering.
3. Wire the layout helper into graph/callout rendering and export paths, add the default-on link-line setting, and verify labels/callouts follow displaced symbols.
4. Extend the network data model with `entityPrefix`, update persistence/import/export normalization, and add safe auto-detection for existing prefixed IDs.
5. Add settings and Network scope UI for prefix visibility and prefix editing, with i18n.
6. Introduce shared prefix-aware ID display helpers and migrate the agreed UI/human-export surfaces to use them while leaving AI-agent JSON canonical.
7. Update entity creation/suggestion flows so prefixed networks store prefixed `technicalId` values.
8. Add harness assembly / multi-network-only disambiguation for hidden-prefix duplicate-looking IDs.
9. Add focused tests across pure helpers, persistence/import, settings, creation suggestions, representative UI labels, human export labels, and AI-agent JSON preservation.

# Validation
- Pure helper tests:
  - colocated splice grouping on the same segment/offset;
  - reverse `fromNodeId` physical equivalence;
  - two-splice symmetric normal offsets;
  - deterministic ordering for three or more colocated splices;
  - spacing derived from symbol size;
  - single placed splice returns its existing position unchanged.
- Rendering/UI tests:
  - Network Summary renders colocated splice symbols without overlap;
  - link line is visible by default and hidden when the setting is off;
  - labels/callouts follow displaced symbol positions;
  - zoom/pan/export rendering stays stable.
- Prefix tests:
  - `Network.entityPrefix` persists through workspace save/load and network import/export;
  - prefix auto-detection populates obvious `LAT-` / `PRI-` cases and leaves ambiguous cases blank;
  - settings toggle hides/shows prefixes in representative table, callout, inspector, and human export labels;
  - new entity creation stores prefixed `technicalId` values in prefixed networks;
  - AI-agent JSON keeps canonical full IDs regardless of the display setting;
  - harness assembly / multi-network duplicate-looking labels get a disambiguation hint, while ordinary single-network views do not.
- Run `npm run -s typecheck`, `npm run -s lint`, focused vitest suites for the new helpers and touched UI/persistence/export paths, and broader `npm run -s test:ci:fast` if feasible.
- Logics gates: run `logics-manager lint --require-status` and `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`.

# Report
- Implemented and validated (typecheck, eslint, `test:ci:fast`, `test:ci:ui`, Logics lint + audit all green).
- Colocated splice rendering: `buildRenderedFloatingSplices` now clusters placed splices into
  colocation groups by canonical along-segment ratio (reverse-`fromNodeId` equivalent), keeps
  distinct points on the existing even along-segment spread, and offsets truly colocated splices
  symmetrically along the carrier-segment normal with spacing derived from the splice symbol size
  (`COLOCATED_SPLICE_OFFSET_STEP`). Persisted placement is untouched.
- Link line: colocated members carry `isColocated`; the renderer draws a short link line back to the
  shared placement point, gated by the new `canvasShowColocatedSpliceLinkLine` setting (default on).
  SVG/PNG/PDF exports honor it automatically because they snapshot the live DOM.
- Network entity prefix: added `Network.entityPrefix` to the core model, persistence normalization,
  workspace save/load and network import/export (with conservative auto-detection on import), the
  Network scope form field, prefix-anchored `technicalId` creation suggestions, prefix-aware display
  helpers applied to canvas labels and the human-readable wire-list export (gated by
  `canvasShowNetworkEntityPrefix`), and a multi-network disambiguation hint in the functional
  analysis findings. AI-agent JSON keeps canonical full IDs (untouched).
- i18n: FR entries added for the new settings, scope field, hint, and validation strings.
- Tests: pure helpers (`network-entity-prefix`, colocated layout in `network-summary-graph-model`),
  prefix-anchored suggestions, wire-list prefix hiding, and portability prefix carry + import
  auto-detection.
- Scope note: prefix-hiding display helpers are shared and applied to representative UI/export
  surfaces (canvas labels + wire-list export) per AC16; remaining label surfaces can adopt the same
  `formatEntityIdForDisplay`/`buildRenderedNodes` `formatEntityId` seam incrementally.

# AI Context
- Summary: Implement readable colocated floating-splice rendering and network-scope ID prefix display/hide behavior.
- Keywords: task, implementation, colocated splices, floating splice, orthogonal layout, splice link line, network entity prefix, technicalId, prefix auto-detection, prefix display setting, harness assembly disambiguation
- Use when: Implementing the colocated splice display layout, network ID prefix model, prefix settings, prefix-aware label helpers, or related tests.
- Skip when: The work is still at request/backlog shaping stage or concerns unrelated routing, directional splice side inference, or destructive bulk rename tooling.

# Links
- Request: `req_150_colocated_splice_rendering_and_network_scope_entity_prefix_display`
- Backlog: `item_636_colocated_splice_rendering_and_network_scope_entity_prefix_display`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
