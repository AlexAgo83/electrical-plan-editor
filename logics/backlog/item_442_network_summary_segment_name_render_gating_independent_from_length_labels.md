## item_442_network_summary_segment_name_render_gating_independent_from_length_labels - network summary segment name render gating independent from length labels
> From version: 0.9.18
> Status: Ready
> Understanding: 100%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: UI
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Segment names are currently always rendered in `Network summary`. `req_087` requires independent control over segment-name visibility without impacting segment-length labels.

# Scope
- In:
  - add runtime state for segment-name visibility in canvas display state.
  - gate segment ID label rendering on this state.
  - preserve existing segment-length label behavior under `showSegmentLengths` state.
  - preserve combined matrix behavior (names only, lengths only, both, none).
- Out:
  - label rotation/size algorithm changes beyond gating.
  - node/callout label behavior changes.

# Acceptance criteria
- AC1: Segment name labels are hidden when `showSegmentNames` is false.
- AC2: Segment length labels remain controlled solely by `showSegmentLengths`.
- AC3: `showSegmentNames=false` and `showSegmentLengths=true` renders lengths without names.
- AC4: Existing segment selection/hit behavior remains non-regressed.

# AC Traceability
- AC1/AC3 -> `src/app/components/NetworkSummaryPanel.tsx` segment label rendering branches.
- AC2 -> `src/app/hooks/useAppControllerCanvasDisplayState.ts` and screen slice toggles.
- AC4 -> `src/tests/app.ui.navigation-canvas.spec.tsx` targeted rendering/interaction assertions.

# Priority
- Impact: High (core functional requirement of req_087).
- Urgency: High (depends on item_441, blocks closure).

# Notes
- Risks:
  - accidental coupling with length label offsets can break readability.
  - missing state propagation to panel props can silently ignore toggle.
- References:
  - `logics/request/req_087_canvas_tools_option_to_hide_segment_names_independently_from_segment_lengths.md`
  - `src/app/components/NetworkSummaryPanel.tsx`
  - `src/app/hooks/useAppControllerCanvasDisplayState.ts`
