## item_043_sample_data_multi_network_and_import_export_compatibility - Sample Data Multi Network and Import Export Compatibility
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Compatibility Assurance
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Sample data can become a special-case that breaks with multi-network navigation or import/export flows unless compatibility is explicitly validated.

# Scope
- In:
  - Validate sample network compatibility with multi-network selector and isolation rules.
  - Ensure sample data can be exported/imported through file workflows.
  - Verify route locks/occupancy integrity survive sample import/export roundtrip.
  - Keep technical ID conflict behavior deterministic for duplicated sample scenarios.
- Out:
  - Cloud sync compatibility.
  - External third-party format mappings.

# Acceptance criteria
- Sample network behaves as a normal network in multi-network workflows.
- Sample export/import roundtrip keeps coherent references and constraints.
- Sample duplication/import conflict paths are deterministic and safe.
- Validation and synthesis views remain consistent after roundtrip.

# Priority
- Impact: High (prevents hidden integration gaps).
- Urgency: High before release of sample bootstrap feature.

# Notes
- Dependencies: item_018, item_025, item_026, item_027, item_040.
- Blocks: item_044.
- Related AC: AC5, AC6.
- References:
  - `logics/request/req_007_bootstrap_with_comprehensive_sample_network.md`
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `logics/request/req_004_network_import_export_file_workflow.md`
  - `src/store/selectors.ts`

