## item_442_network_summary_segment_name_render_gating_independent_from_length_labels - network summary segment name render gating independent from length labels
> From version: 0.9.18
> Status: Done
> Understanding: 100%
> Confidence: 95%
> Progress: 100%
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
- request-AC1 -> This backlog slice. Evidence needed: `Canvas tools preferences` includes a new segment-name visibility option above `Show segment lengths by default`.
- request-AC2 -> This backlog slice. Evidence needed: The new segment-name preference default is `enabled` when no prior stored value exists.
- request-AC3 -> This backlog slice. Evidence needed: Disabling segment names hides segment name/ID labels in the 2D `Network summary`.
- request-AC4 -> This backlog slice. Evidence needed: Disabling segment names does not disable or alter segment-length visibility behavior.
- request-AC5 -> This backlog slice. Evidence needed: Enabling segment lengths while segment names are disabled renders lengths without rendering names.
- request-AC6 -> This backlog slice. Evidence needed: The new segment-name preference is persisted and restored across reload/relaunch.
- request-AC7 -> This backlog slice. Evidence needed: `Apply canvas defaults now` applies the segment-name default consistently with other canvas defaults.
- request-AC8 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI tests pass after the change.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`

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
