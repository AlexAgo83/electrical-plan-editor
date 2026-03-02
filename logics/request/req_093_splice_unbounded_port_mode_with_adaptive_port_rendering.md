## req_093_splice_unbounded_port_mode_with_adaptive_port_rendering - Splice unbounded port mode with adaptive port rendering
> From version: 1.1.0
> Status: Draft
> Understanding: 97%
> Confidence: 93%
> Complexity: High
> Theme: Modeling and UI contract for realistic splice capacity semantics
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Support real-world splice modeling where a splice is not always constrained by a strict maximum port count.
- Keep splice visualization usable in UI while avoiding infinite port rendering.
- Preserve existing bounded splice behavior and backward compatibility.

# Context
- Current splice contract enforces a finite `portCount` and most splice workflows derive ranges from `1..portCount`.
- This assumption is deeply embedded in:
  - splice form validation,
  - wire endpoint validation,
  - occupancy helpers,
  - splice analysis/port listing,
  - network summary callout grouping.
- For field modeling, this strict upper bound can be unrealistic: users often need logical splices that grow with topology and do not map to a fixed hardware port limit.
- The team wants to enable this model without breaking the existing connector-like splice experience.

# Objective
- Introduce an explicit splice capacity mode with two behaviors:
  - `bounded` (existing finite `portCount`),
  - `unbounded` (no hard max port index).
- Ensure UI remains clear and performant by rendering adaptive visible ports instead of an infinite list.
- Keep existing projects and catalog-linked splice behavior stable.

# Scope
- In:
  - extend splice domain contract with a capacity mode (`bounded` | `unbounded`);
  - maintain finite mode behavior as-is for existing splices;
  - implement unbounded splice behavior in:
    - splice create/edit form,
    - splice analysis port workflow,
    - wire endpoint splice-port selection/validation,
    - occupancy helper logic,
    - network summary splice callout grouping;
  - define adaptive rendering strategy for unbounded splice ports;
  - update persistence/import normalization and compatibility handling;
  - apply export contract changes to splice-bearing outputs:
    - network JSON/state exports,
    - splice CSV/list exports;
  - add regression coverage for bounded/unbounded parity and edge cases.
- Out:
  - connector capacity model changes (connectors remain bounded);
  - generic “unbounded connector” support;
  - redesign of unrelated entity forms/panels;
  - BOM schema or BOM export changes for this request.

# Locked execution decisions
- Decision 1: A new splice capacity discriminator is introduced (`portMode: "bounded" | "unbounded"`).
- Decision 2: Existing persisted splices default/migrate to `bounded` mode, preserving current behavior.
- Decision 3: `portCount` remains required and validated (`integer >= 1`) only for `bounded` splices.
- Decision 4: For `unbounded` splices, port indexes are valid for any positive integer (`>= 1`) without upper-bound rejection.
- Decision 5: Catalog-linked splices stay bounded and continue deriving capacity from catalog `connectionCount`.
- Decision 6: `unbounded` mode is only allowed for splices without catalog link (`catalogItemId` absent).
- Decision 7: Unbounded UI uses adaptive finite rendering (never attempts full infinite expansion).
- Decision 8: Connector behavior is unchanged.
- Decision 9: If a user selects a catalog item while splice mode is `unbounded`, the splice is automatically switched to `bounded` and `portCount` is synchronized from catalog `connectionCount` with explicit UI feedback.
- Decision 10: Default unbounded visible free-port buffer is `2` (occupied ports + next two free ports).
- Decision 11: UI displays splice capacity as `∞` for unbounded mode.
- Decision 12: Export/list contracts include `portMode`; when `portMode = unbounded`, numeric `portCount` export column remains empty.
- Decision 13: Rollout is direct (no temporary feature flag).

# Functional behavior contract
## A. Entity/store model
- `Splice` gains `portMode`.
- `bounded` splice:
  - uses `portCount` as authoritative max.
- `unbounded` splice:
  - has no effective maximum index for occupancy/wire endpoint validation.
- Occupancy maps keep current keying by explicit port index, regardless of mode.

## B. Form behavior (Modeling Splice)
- Capacity mode selector is exposed in splice form.
- `bounded` mode:
  - editable `portCount`, required `>= 1` (unless derived by catalog when linked).
- `unbounded` mode:
  - `portCount` input hidden/disabled (or displayed as N/A),
  - save does not require a max port value.
- Catalog interaction:
  - selecting a catalog item enforces `bounded` mode and derived `portCount = connectionCount`;
  - if current mode is `unbounded`, selecting catalog item performs automatic mode switch to `bounded` and shows a non-blocking info message;
  - switching to `unbounded` requires clearing catalog selection first (or action is blocked with explicit message).

## C. Wire endpoint behavior
- For wire endpoints targeting a `bounded` splice:
  - existing range check remains (`portIndex <= portCount`).
- For wire endpoints targeting an `unbounded` splice:
  - only positive-integer validation applies (`portIndex >= 1`);
  - occupancy conflict rules remain unchanged (single occupant per explicit port index).
- Suggested-next-free logic:
  - bounded: first free index within `1..portCount`;
  - unbounded: first free positive integer with no upper cap.

## D. Splice analysis panel behavior
- `bounded` splice panel remains unchanged.
- `unbounded` splice panel:
  - displays an `∞` capacity indicator;
  - renders a finite adaptive set of visible ports:
    - occupied ports always visible,
    - plus default free-port buffer of exactly two upcoming free slots,
    - plus manual expansion control (`+ Add visible port(s)`).
- Reserve-port validation:
  - bounded: range + occupancy checks;
  - unbounded: occupancy check only (no max-range error).

## E. Network summary / callout behavior
- Callout group generation for `unbounded` splices is based on occupied/used indexes and adaptive visible-window rules, not on `Array.from({ length: portCount })`.
- Dense/high-index datasets remain readable via compaction strategy (example: summarized hidden ranges) while keeping deterministic access to explicitly used ports.

## F. Persistence and import/export compatibility
- Migration/defaulting:
  - legacy splices without `portMode` become `bounded`.
- Round-trip:
  - both modes serialize/deserialize safely.
- Export/list semantics:
  - include explicit `portMode` in all splice-bearing machine-readable exports;
  - network JSON/state exports include `portMode` and keep numeric `portCount` empty/omitted for unbounded splices according to serializer conventions;
  - splice CSV/list exports include `portMode` column and keep numeric `portCount` cell empty when `portMode = unbounded`;
  - UI tables show `∞` in port-count cell for unbounded splices;
  - BOM exports are unchanged in this request.
- Import normalization:
  - invalid mode values fall back to safe default (`bounded`) with validation issue signaling when needed.

## G. Validation contract
- Remove max-index validation errors for unbounded splice references.
- Keep all existing integrity checks:
  - unknown splice references,
  - non-positive indexes,
  - occupancy mismatches,
  - wire/link consistency.
- Catalog integrity checks remain unchanged for linked (bounded) splices.

# Acceptance criteria
- AC1: Splice domain contract supports both `bounded` and `unbounded` capacity modes.
- AC2: Existing splices load as `bounded` without behavior regression.
- AC3: Users can create/edit an unbounded splice without specifying a max port count.
- AC4: Wire endpoint validation accepts positive splice port indexes beyond previous `portCount` limits when target splice is `unbounded`.
- AC5: Wire endpoint validation for bounded splices remains unchanged.
- AC6: Catalog-linked splice behavior remains bounded with derived `portCount` from catalog `connectionCount`.
- AC7: Selecting a catalog item on an unbounded splice automatically switches it to bounded mode and applies catalog-derived `portCount`, with explicit UX feedback.
- AC8: Unbounded splice analysis UI shows adaptive finite port rendering with explicit `∞` indicator and default `+2` free-slot buffer.
- AC9: Network summary splice callouts remain performant and readable for unbounded mode (no infinite rendering loops).
- AC10: Occupancy and conflict detection remains correct in both modes.
- AC11: Persistence/import round-trip supports mixed bounded/unbounded splice datasets.
- AC12: Export behavior distinguishes unbounded capacity for all splice-bearing outputs in scope (`portMode` present; numeric `portCount` empty/omitted for unbounded in JSON/CSV splice exports).
- AC13: BOM exports remain unchanged by this request.
- AC14: Change is delivered without temporary feature flag.
- AC15: Connector flows are non-regressed.
- AC16: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci`
- targeted regression matrix:
  - splice form (bounded/unbounded mode toggling and save paths),
  - wire endpoint save/edit against bounded and unbounded splices,
  - splice analysis reserve/release workflow in both modes,
  - network summary callout rendering for unbounded high-index scenarios,
  - persistence and import normalization for mixed-mode datasets.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Unbounded mode touches multiple cross-cutting contracts (forms, reducers, validation, rendering), increasing regression surface.
- Adaptive rendering must avoid UI ambiguity between “not shown yet” and “does not exist”.
- Very high explicit port indexes can degrade readability if compaction rules are weak.
- Existing tests and helper assumptions based on `portCount`-bounded arrays will require broad updates.

# Backlog
- To create from this request:
  - `item_465_splice_entity_capacity_mode_contract_and_migration_defaulting.md`
  - `item_466_splice_form_and_wire_endpoint_support_for_unbounded_port_mode.md`
  - `item_467_splice_analysis_and_network_summary_adaptive_unbounded_port_rendering.md`
  - `item_468_validation_and_occupancy_rule_updates_for_unbounded_splices.md`
  - `item_469_req_093_closure_validation_matrix_and_traceability.md`

# References
- `src/core/entities.ts`
- `src/store/reducer/spliceReducer.ts`
- `src/store/reducer/helpers/wireTransitions.ts`
- `src/store/reducer/wireReducer.ts`
- `src/store/selectors.ts`
- `src/app/lib/wire-endpoint-slot-helpers.ts`
- `src/app/hooks/useSpliceHandlers.ts`
- `src/app/hooks/useWireHandlers.ts`
- `src/app/components/workspace/ModelingSpliceFormPanel.tsx`
- `src/app/components/workspace/ModelingWireFormPanel.tsx`
- `src/app/components/workspace/AnalysisSpliceWorkspacePanels.tsx`
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
- `logics/request/req_092_optional_catalog_association_for_splices.md`
