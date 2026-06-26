## item_641_connector_synthesis_parity_with_splice_add_section_color_twist_tag - Connector synthesis: parity with splice (add section, color, twist, tag)
> From version: 1.16.10
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
In a connector's synthesis, get closer to the level of information available on a splice — notably by adding the wire **section**.
If visible-column selection is available, this information should be toggleable on/off.
Goal: more homogeneous and more usable synthesis.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: The connector synthesis table shows a Section (mm²) column populated from `wire.sectionMm2`, plus Color, Twist group, and Functional tag columns.
- AC2: New columns are sortable (sort field type extended; `sortByTableColumns()` handles them).
- AC3: CSV export of the connector synthesis includes the new columns in matching order.
- AC4: Color rendering reuses the existing `renderWireColorPrefixMarker()` helper for consistency with other wire displays.
- AC5: When configurable column visibility ([[req_153_configurable_table_columns]]) is available, the new synthesis columns are individually toggleable; otherwise they render by default.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The connector synthesis table shows a Section (mm²) column populated from `wire.sectionMm2`, plus Color, Twist group, and Functional tag columns.
- request-AC2 -> This backlog slice. Proof: AC2: New columns are sortable (sort field type extended; `sortByTableColumns()` handles them).
- request-AC3 -> This backlog slice. Proof: AC3: CSV export of the connector synthesis includes the new columns in matching order.
- request-AC4 -> This backlog slice. Proof: AC4: Color rendering reuses the existing `renderWireColorPrefixMarker()` helper for consistency with other wire displays.
- request-AC5 -> This backlog slice. Proof: AC5: When configurable column visibility ([[req_153_configurable_table_columns]]) is available, the new synthesis columns are individually toggleable; otherwise they render by default.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_155_connector_synthesis_parity.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Connector synthesis: parity with splice (add section, color, twist, tag)
- Keywords: backlog-groom, request, connector synthesis: parity with splice (add section, color, twist, tag), bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Connector synthesis: parity with splice (add section, color, twist, tag).
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_155_connector_synthesis_parity` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_155_connector_synthesis_parity.md`.
- Generated locally by logics-manager.

# Tasks
- `task_150_connector_synthesis_parity_with_splice_add_section_color_twist_tag`
