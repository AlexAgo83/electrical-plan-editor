## item_418_network_summary_callout_render_filter_bound_to_selection - Network summary callout render filter bound to selection
> From version: 0.9.18
> Status: Done
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Selection-driven callout visibility override behavior
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Callout rendering currently favors full visibility. The new focused mode must strictly bind visible callouts to current connector/splice selection.

# Scope
- In:
  - apply selected-callout-only override in callout rendering pipeline;
  - enforce zero callout when no eligible selection is present;
  - preserve global `Callouts` toggle precedence.
- Out:
  - callout geometry drag/pinning policy changes;
  - broader label-layer behavior changes.

# Acceptance criteria
- AC1: In selected-only mode, at most one eligible callout is rendered.
- AC2: Non-callout entity selections render no callout.
- AC3: Disabling selected-only restores full callout behavior.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_081`, `item_417`.
- Blocks: `item_420`, `task_073`.
- Related AC: `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/AppController.tsx`
