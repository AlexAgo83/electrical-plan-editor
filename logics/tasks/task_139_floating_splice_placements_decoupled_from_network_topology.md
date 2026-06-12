## task_139_floating_splice_placements_decoupled_from_network_topology - Floating splice placements decoupled from network topology
> From version: 1.15.6 (ADR companion linked on 2026-06-10; amended 2026-06-10 after pre-implementation review)
> Schema version: 1.0
> Status: In progress
> Understanding: 96% (task scopes one coordinated implementation of req_144/item_630/adr_012)
> Confidence: 90% (amendment resolves migration safety, determinism, visibility, and feedback-channel questions; AC21-AC30 added)
> Progress: 5%
> Complexity: High
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Definition of Done (DoD)
- [ ] `Splice` has canonical segment-offset placement support with normalization and persistence/import/export compatibility.
- [ ] Legacy splice-node workspaces and network imports migrate automatically on load.
- [ ] Derived routing supports virtual splice points, partial endpoint segment lengths, deterministic tie-breaks, and locked-route conversion/diagnostics.
- [ ] Store reducers prevent invalid wire connections to unplaced splices, block host-segment deletion, and handle segment length edits with offset preservation/clamping feedback.
- [ ] Splice forms expose host segment, reference node, offset, and conversion workflows required by the request.
- [ ] Network Summary renders floating splices without splice nodes, with current splice styling, selection, activation, highlighting, and callouts.
- [ ] Analysis/tables expose host segment, distance from reference node, and relevant partial length details.
- [ ] Migration rewrites all affected wire routes (locked and unlocked) during segment fusion, enforces the safe-fusion predicate with intermediate-node fallback, and handles degree-0/1 legacy splice nodes.
- [ ] Constructed/converted nodes carry reserved `MIG-SPLICE-*` labels and a modal migration report with explicit dismissal is shown on both load paths.
- [ ] Floating splice markers never render hidden under nodes or other splices (deterministic render-only anti-superposition offset).
- [ ] Offset clamping and relative-position feedback use the new non-blocking warning channel.
- [ ] Acceptance criteria AC1-AC30 are covered by targeted tests or documented validation evidence.
- [ ] Logics lint, TypeScript, lint, targeted unit/UI tests, and relevant persistence/import/export tests pass.

# Backlog
- `item_630_floating_splice_placements_decoupled_from_network_topology`


```mermaid
%% logics-kind: task
%% logics-signature: task|floating-splice-placements-decoupled-fro|item-630-floating-splice-placements-deco|1-confirm-scope|run-python3-m-logics-manager-lint-requi
flowchart TD
    Backlog[Backlog item] --> Build[Implementation]
    Build --> Validate[Validation]
    Validate --> Close[Finish workflow]
```

# Acceptance criteria
- AC1: `Splice` supports a canonical segment placement model using `segmentId`, `fromNodeId`, and `offsetMm`; `0 mm` and `lengthMm` offsets are allowed and must be displayed explicitly.
- AC2: A central resolver can resolve splice placement from new placement metadata or migrated legacy splice nodes, and returns enough information for routing, validation, and rendering.
- AC3: Wire routing supports endpoints connected to floating splice ports by using a derived routing graph with virtual splice points and correct partial segment lengths.
- AC4: Route length calculation accounts for partial segment traversal when a wire starts or ends at a floating splice.
- AC5: `Wire.routeSegmentIds` remains the primary public route summary, with additional route detail only where a start or end endpoint lies part-way through a segment.
- AC6: Network Summary renders floating splices without requiring `NetworkNode.kind === "splice"`, including selection, focus/activation behavior, selected-state styling, and the same splice visual treatment as today.
- AC7: Splice callouts remain available for every placed splice and can anchor to resolved splice positions instead of requiring a node position.
- AC8: Legacy workspaces with splice nodes migrate automatically on load and continue to behave correctly after migration.
- AC9: Network import/export persists the new splice placement metadata and continues to accept older files that lack it; newly exported files should not emit legacy splice nodes.
- AC10: Validation and UI feedback prevent invalid connected splices: a splice must be placed before it can be connected to a wire, and unplaced splices are not visible or connectable.
- AC11: Host segment deletion is blocked while a splice is placed on that segment, with user-facing feedback that the splice must be moved or deleted first.
- AC12: Segment length edits preserve the splice `offsetMm` when possible, show user-facing warning feedback when the relative position changes, and clamp/report when the offset would become out of range.
- AC13: Segment placements cannot target `rearBackshellLink` segments.
- AC14: Directional splice L/R inference remains aligned with current behavior, including manual side locking, while adapting the physical side inference to the resolved floating placement.
- AC15: Multiple splices may share the same segment offset; no explicit ordering between same-segment splices is required.
- AC16: Degree-2 legacy splice nodes migrate by fusing adjacent segments and placing the splice on the fused segment while preserving segment IDs where possible.
- AC17: Degree-greater-than-2 legacy splice nodes migrate by replacing the splice node with a structural intermediate node and placing the splice on an adjacent segment at `0 mm` from that intermediate node where possible.
- AC18: Connector-to-floating-splice and connector-to-floating-splice-to-connector routes remain deterministic using the current segment-ID tie-break behavior.
- AC19: Analysis views and splice tables expose host segment, distance from node, and partial length information needed to understand routed wires.
- AC20: Local persisted workspaces and network export files are supported at equal priority.
- AC21: Migration rewrites `routeSegmentIds` for ALL wires affected by segment fusion (locked and unlocked), deduplicating consecutive surviving IDs; no persisted route is left referencing a removed segment ID, and unfixable routes stay loadable with diagnostics.
- AC22: Degree-2 fusion happens only under the safe-fusion predicate (distinct far endpoints, no `rearBackshellLink` involvement, identical `subNetworkTag`/`sheathType`/`insulation`/`lineStyle`/`internalPartReference`); otherwise migration falls back to a structural intermediate node with a `0 mm` placement.
- AC23: Fusion outcomes are deterministic: the surviving segment ID is the lexicographically smaller, `fromNodeId` is the surviving segment's non-junction endpoint, `offsetMm` is the surviving segment's pre-fusion length, and chains of adjacent degree-2 splice nodes are processed in lexicographic node ID order.
- AC24: Degree-1 legacy splice nodes migrate to an intermediate node with a `0 mm` placement on the single adjacent segment; degree-0 legacy splice nodes become unplaced drafts with a validation diagnostic.
- AC25: Every node created or converted by migration carries a clearly distinguishable reserved label (`MIG-SPLICE-<spliceTechnicalId>`, numeric suffix on collision) and is listed in the migration report.
- AC26: A single modal migration report with explicit dismissal is shown after any migrating load or import, on both load paths, listing created/converted nodes, fused segments, rewritten routes, clamped/unresolved placements, unplaced splices, locked-route conversion failures, metadata-divergence fallbacks, and directional L/R side changes.
- AC27: Anti-superposition rendering: a floating splice marker is never hidden under a node or another splice; coinciding resolved positions get a deterministic render-only offset with a visible anchor tick, including `0 mm` placements and same-offset splices, without altering persisted `offsetMm`.
- AC28: Zero-length routes are represented as `routeSegmentIds = [hostSegmentId]` with `0 mm` partial detail — never as an empty route — and validation accepts them as valid.
- AC29: Placement removal is blocked while wires are connected to the splice; placement moves recompute routes and are blocked when they would invalidate a locked route.
- AC30: Offset clamping and relative-position feedback use a non-blocking warning channel (action succeeds, warning surfaced) distinct from blocking errors; migration-time clamps are reported in the migration report.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `npm run -s lint`.
- Run `npm run -s typecheck`.
- Run targeted tests covering at least:
- `src/tests/core.pathfinding.spec.ts`
- `src/tests/store.reducer.entities.spec.ts`
- `src/tests/store.reducer.wires.spec.ts`
- `src/tests/persistence.migrations.spec.ts`
- `src/tests/network-import-export.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/app.ui.creation-flow-splice-ergonomics.spec.tsx`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/network-summary-callouts-layer.spec.tsx`
- Run broader segmented tests when implementation touches shared routing/rendering behavior:
- `npm run -s test:ci:fast -- --coverage`
- `npm run -s test:ci:ui`
- Run `python3 -m logics_manager flow finish task task_139_floating_splice_placements_decoupled_from_network_topology.md` after implementation and evidence capture.

# Implementation plan
- Phase 1: Add the placement entity contract, normalization helpers, and central `resolveSplicePlacement` API; rename the existing canvas-position "placement" naming (`splicePlacementReducer.ts`, `splice/applyOptimizedPlacement`) to canvas-layout wording.
- Phase 2: Implement load-time migration for degree-0/1/2 and branch legacy splice nodes in deterministic node ID order: safe-fusion predicate with intermediate-node fallback, deterministic surviving-ID/`fromNodeId`/offset rules, global wire route rewriting (locked and unlocked), reserved `MIG-SPLICE-*` labels, orphan `nodePositions` cleanup, and migration report data collection.
- Phase 3: Introduce the derived routing graph with virtual splice points (wire-endpoint scope only) and partial endpoint route detail while preserving `routeSegmentIds`: host-ID-based tie-breaks, consecutive host-ID dedup, zero-length sub-edges, and zero-length route representation.
- Phase 4: Update reducers and validation for unplaced splice rejection, host-segment delete blocking, placement removal/move guards, `rearBackshellLink` exclusion, offset clamping, and the new non-blocking warning channel for user-facing feedback.
- Phase 5: Update splice forms and analysis/table surfaces for host segment, reference node, offset, and partial length information; add the modal migration report UI (explicit dismissal) wired to both load paths.
- Phase 6: Add Network Summary floating-splice overlay rendering and callout anchoring from resolved placement geometry, including the deterministic anti-superposition render-only offset (splice/node and splice/splice) and host-segment sub-network de-emphasis.
- Phase 7: Update local persistence and network file import/export schemas (workspace v3 -> v4, network file v3 -> v4), fixtures, and compatibility/parity tests for both load paths.
- Phase 8: Close AC traceability with targeted tests and complete validation gates.

# Report
- Pending implementation.

# AI Context
- Summary: Implement the full floating-splice placement architecture: segment-offset placement, load-time legacy migration, derived virtual routing points, Network Summary overlay rendering, form editing, validation, and import/export compatibility.
- Keywords: floating splice, segment offset, virtual splice point, derived routing graph, partial segment route, splice migration, Network Summary overlay, splice callout, placement validation
- Use when: Executing or reviewing the implementation task for req_144/item_630/adr_012.
- Skip when: The work only edits unrelated splice metadata, catalog behavior, or non-placement UI.

# Links
- Request: `req_144_floating_splice_placements_decoupled_from_network_topology`
- Product brief(s): (none yet)
- Architecture decision(s): `logics/architecture/adr_012_floating_splice_placement_architecture.md`
