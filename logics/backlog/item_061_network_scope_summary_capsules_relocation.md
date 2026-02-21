## item_061_network_scope_summary_capsules_relocation - Network Scope Summary Capsules Relocation
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Information Density and Context Placement
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Top summary capsules consume premium header space and compete with shell controls, while their meaning is tied to network-management context.

# Scope
- In:
  - Move summary capsules (item/entity counters and quick metrics) into `Network Scope`.
  - Remove summary capsule rendering from header area.
  - Preserve metric definitions and refresh behavior when active network changes.
  - Keep capsule readability and responsive wrapping in the dedicated screen.
- Out:
  - New metric model definitions.
  - Historical trend visualizations.

# Acceptance criteria
- Header no longer renders the summary capsule strip.
- `Network Scope` renders the summary capsules in a stable dedicated section.
- Displayed values remain consistent with previous metrics for the same state.
- Capsule updates stay synchronized with active network changes.

# Priority
- Impact: Medium-high (header clarity and context alignment).
- Urgency: Medium-high (aligns with req_010 shell direction).

# Notes
- Dependencies: item_055.
- Blocks: item_059.
- Related AC: AC10.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.networks.spec.tsx`

