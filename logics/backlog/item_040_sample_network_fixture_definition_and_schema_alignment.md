## item_040_sample_network_fixture_definition_and_schema_alignment - Sample Network Fixture Definition and Schema Alignment
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Demo Data Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without a stable fixture contract, sample network bootstrap can drift over time and become incompatible with schema/routing/occupancy expectations.

# Scope
- In:
  - Define a deterministic comprehensive sample network fixture.
  - Align fixture payload with current multi-network schema contracts.
  - Include coherent IDs/technical IDs and representative entity topology.
  - Document fixture intent (demo coverage and expected behavior).
- Out:
  - Startup bootstrap triggers.
  - UI actions for reset/recreate.

# Acceptance criteria
- Fixture content is deterministic and version-compatible.
- Fixture includes connectors, splices, nodes, segments, and wires with valid references.
- At least one locked-route scenario is included and valid.
- Fixture can be loaded without violating core domain invariants.

# Priority
- Impact: Very high (foundation for sample onboarding).
- Urgency: Immediate.

# Notes
- Dependencies: item_014, item_017.
- Blocks: item_041, item_042, item_043, item_044.
- Related AC: AC3, AC5.
- References:
  - `logics/request/req_007_bootstrap_with_comprehensive_sample_network.md`
  - `src/core/schema.ts`
  - `src/core/entities.ts`

