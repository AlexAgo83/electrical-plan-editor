## item_493_export_frame_toggle_and_segment_style_aligned_border_rendering_for_svg_png - Export frame toggle and segment-style-aligned border rendering for SVG/PNG
> From version: 1.3.0
> Status: Draft
> Understanding: 95%
> Confidence: 90%
> Progress: 0%
> Complexity: Medium
> Theme: UI / Export rendering
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Exports currently lack an optional outer frame, reducing document framing and visual professionalism for shared artifacts.

# Scope
- In:
  - add dedicated Settings toggle to enable/disable export outer frame;
  - render export frame in both SVG and PNG outputs;
  - align frame visual language with segment style/tokens;
  - keep default `off` to preserve existing export visuals for current users.
- Out:
  - cartouche metadata content/layout;
  - runtime canvas frame rendering outside export context.

# Acceptance criteria
- AC1: A dedicated settings toggle controls export frame rendering.
- AC2: Frame renders in SVG and PNG only when toggle is enabled.
- AC3: Frame style follows segment visual language coherently across themes.
- AC4: Default state is disabled for backward compatibility.

# AC Traceability
- AC1 -> User control is explicit and persistent.
- AC2 -> Output parity across formats is maintained.
- AC3 -> Visual consistency requirement is satisfied.
- AC4 -> Non-regression on existing exports.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.

