## item_135_network_summary_panel_remaining_compute_scoping_and_active_screen_assembly_alignment - NetworkSummaryPanel Remaining Compute Scoping and Active-Screen Assembly Alignment
> From version: 0.5.8
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Remove Residual Heavy Assembly Work Outside Modeling/Analysis Paths
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`NetworkSummaryPanel` is still assembled eagerly in `AppController` even when the active screen/path cannot render it (network scope, settings, validation, empty-state). This leaves residual heavy composition work after prior compute-scoping refactors.

# Scope
- In:
  - Scope `NetworkSummaryPanel` assembly to only paths that render it.
  - Preserve modeling and analysis behavior.
  - Keep explicit wiring and readability.
- Out:
  - Broad AppController decomposition unrelated to this panel.
  - NetworkSummaryPanel feature changes.

# Acceptance criteria
- `NetworkSummaryPanel` is not assembled on paths that do not render it.
- Modeling/analysis behavior remains correct.
- Changes remain explicit and reviewable.
- Related regressions/tests pass.

# Priority
- Impact: Medium-high (runtime compute hygiene).
- Urgency: Medium-high (follow-up to compute scoping wave).

# Notes
- Dependencies: item_134 not strict, but same delivery wave.
- Blocks: item_138.
- Related AC: AC3, AC6, AC7.
- References:
  - `logics/request/req_023_post_req_022_review_followup_settings_empty_state_precedence_remaining_compute_scoping_lazy_registry_tla_portability_and_test_helper_signal.md`
  - `src/app/AppController.tsx`
  - `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
