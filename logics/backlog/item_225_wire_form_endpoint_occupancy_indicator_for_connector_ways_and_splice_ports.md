## item_225_wire_form_endpoint_occupancy_indicator_for_connector_ways_and_splice_ports - Wire Form Endpoint Occupancy Indicator for Connector Ways and Splice Ports
> From version: 0.7.3
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Proactive Wire Endpoint Occupancy Feedback in Form UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The wire form does not proactively indicate when a selected connector `way` or splice `port` is already occupied, so users often discover conflicts only after submit/store validation.

# Scope
- In:
  - Add endpoint occupancy indicator UX in `ModelingWireFormPanel` for endpoints A and B.
  - Support both endpoint types:
    - connector `way` (`C{index}`)
    - splice `port` (`P{index}`)
  - Show user-visible occupancy status before submit (inline help/error/warning near endpoint index inputs).
  - Support create mode and edit mode.
  - In edit mode, exclude the current wire assignment from occupancy checks to avoid false positives on unchanged endpoints.
  - Keep terminology consistent with existing UI (`way` / `port`).
- Out:
  - Next-free slot auto-prefill logic and touched-guard behavior (handled separately).
  - Changes to connector/splice manual occupancy panels.
  - Submit-time auto-correction of invalid endpoint indices.

# Acceptance criteria
- Endpoint A and B can show occupancy state for selected `way`/`port` before submit.
- Edit mode occupancy indicator excludes the current wire’s own endpoint assignments (no false-positive occupied state on unchanged endpoints).
- Existing wire submit flow and field interactions remain functional.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_037`, item_227.
- Blocks: item_226, item_228, item_229.
- Related AC: AC1, AC5a.
- References:
  - `logics/request/req_037_wire_creation_endpoint_occupancy_validation_and_next_free_way_port_prefill.md`
  - `src/app/components/workspace/ModelingWireFormPanel.tsx`
  - `src/app/hooks/useWireHandlers.ts`
  - `src/store/types.ts`
  - `src/app/hooks/validation/buildValidationIssues.ts`

