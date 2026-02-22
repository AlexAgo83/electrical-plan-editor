## item_168_2d_label_preference_defaults_normalization_and_center_rotation_application - 2D Label Preference Defaults, Normalization, and Center-Rotation Application
> From version: 0.6.2
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Safe Preference Defaults and Correct Label Rotation Geometry for 2D Readability Controls
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Adding new UI preferences introduces risks around default values, stale stored values, and geometry correctness (rotation must happen around label center). Without explicit handling, existing users may see inconsistent behavior or label drift.

# Scope
- In:
  - Define defaults (`Normal`, `0°`) and ensure they apply for fresh users.
  - Add normalization/migration handling for invalid/stale stored values if needed.
  - Ensure label rotation is applied around label center (not top-left/origin drift).
  - Keep rotation behavior compatible with zoom-invariant sizing and anchoring.
- Out:
  - Backfilling historical data migrations unrelated to UI preferences.
  - Arbitrary/custom rotation values beyond the requested fixed options.

# Acceptance criteria
- Defaults are `Normal` (size) and `0°` (rotation) for fresh state.
- Invalid/stale stored values are safely normalized to supported options.
- Rotation is visually centered on labels and does not introduce noticeable anchor drift.
- Combined size + rotation preferences remain compatible with zoom-invariant labels.

# Priority
- Impact: Medium-high (correctness and upgrade safety).
- Urgency: Medium-high.

# Notes
- Dependencies: item_166, item_167.
- Blocks: item_169, item_170.
- Related AC: AC2, AC4, AC5, AC6.
- References:
  - `logics/request/req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/styles/canvas/canvas-diagram-and-overlays.css`

