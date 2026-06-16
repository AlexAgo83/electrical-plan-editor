## adr_007_harness_assembly_and_physical_interconnector_contract - Harness Assembly and Physical Interconnector Contract
> Date: 2026-05-11
> Status: Settled
> Drivers: multi-harness grouping, physical-only connector links, symmetric pin continuity, migration-safe persistence, cross-harness functional tracing
> Related request: `req_122_multi_harness_super_category_and_cross_harness_functional_schematic`
> Related backlog: `item_591_harness_assembly_data_model_persistence_and_migration`, `item_592_inter_harness_connector_links_and_symmetric_pin_continuity`, `item_593_cross_harness_functional_trace_derivation_from_master_connectors`, `item_594_aggregated_functional_schematic_ui_interconnector_blocks_and_harness_coloring`, `item_595_multi_harness_validation_import_export_and_regression_coverage`
> Related task: `task_105_multi_harness_assembly_and_cross_harness_functional_schematic_orchestration`
> Reminder: Update status, linked refs, decision rationale, consequences, migration plan, and follow-up work when you edit this doc.

# Overview
Add a persisted `Harness assembly` level above existing `Network` entities.
Keep `Network` as the harness-level model and let assemblies reference multiple networks.
Represent inter-harness continuity with physical-only connector links that map symmetric pins.
Derive cross-harness functional traces from wires, connectors, and link mappings instead of manually declaring logical signals on links.

```mermaid
flowchart LR
    Current[Single network trace] --> Assembly[Harness assembly]
    Assembly --> Links[Physical connector links]
    Links --> Trace[Cross harness trace]
    Trace --> UI[Aggregated functional schematic]
```

# Context
- Operators need to group several harnesses and follow a signal or command across connector boundaries.
- The current `Network` model already owns connector, wire, splice, segment, and functional schematic data for one harness.
- The request confirms that a `Network` is a harness and that the new level should be called `Harness assembly`.
- The request also confirms that interconnector links are physical-only in the first version: signal or command continuity is derived from actual wire and pin data.

# Decision
Adopt this contract:
- keep `Network` as the single-harness entity;
- add `HarnessAssembly` as a global entity that references networks by ID;
- store per-harness display colors on the assembly membership;
- store inter-harness connector links on the assembly;
- enforce one inter-harness link per connector in V1;
- use symmetric pin continuity: pin `1` maps to pin `1`, pin `2` to pin `2`, and so on;
- allow mismatched connector pin counts as warnings while tracing only valid shared pin indexes;
- keep connector links physical-only and derive functional continuity from wires plus mappings.

# Alternatives considered
- Rename `Network` to `Harness` everywhere.
  Rejected because it would widen the migration and UI surface without changing the underlying model needed for V1.
- Store logical signal names directly on connector links.
  Rejected for V1 because it creates a second source of truth that can diverge from wire and pin data.
- Block links when connector pin counts differ.
  Rejected because real interconnect situations may be partially populated; warnings plus valid-pair-only tracing are more useful.
- Allow multi-mate connectors in V1.
  Rejected because one connector to one interconnector relation keeps validation and trace behavior deterministic.

# Consequences
- Existing single-network data remains valid because assemblies are additive global data.
- Cross-harness traversal needs network-qualified node and edge identities to avoid collisions across harnesses.
- Import/export and persistence must preserve assemblies and reject or warn on broken references.
- UI rendering can use assembly-owned harness colors to show trace ownership clearly.

# Migration and rollout
- Add empty assembly state by default during persistence normalization.
- Preserve legacy payloads by treating missing assembly data as an empty collection.
- Export assemblies only when their referenced networks are included in the export scope.
- Import should preserve assembly data when all required references can be resolved or warn when links are incomplete.

# References
- `logics/request/req_122_multi_harness_super_category_and_cross_harness_functional_schematic.md`
- `logics/backlog/item_591_harness_assembly_data_model_persistence_and_migration.md`
- `logics/backlog/item_592_inter_harness_connector_links_and_symmetric_pin_continuity.md`
- `logics/backlog/item_593_cross_harness_functional_trace_derivation_from_master_connectors.md`
- `logics/backlog/item_594_aggregated_functional_schematic_ui_interconnector_blocks_and_harness_coloring.md`
- `logics/backlog/item_595_multi_harness_validation_import_export_and_regression_coverage.md`
- `logics/tasks/task_105_multi_harness_assembly_and_cross_harness_functional_schematic_orchestration.md`

# Follow-up work
- Keep the task and backlog docs linked to this ADR as schema and traversal implementation progresses.
- Revisit the ADR if V2 needs multi-mate connectors, non-symmetric pin mapping, or logical continuity declarations.
