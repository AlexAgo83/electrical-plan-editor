## item_395_req_071_analysis_go_to_wire_action_closure_validation_and_traceability - req_071 closure: analysis occupancy `Go to` wire action validation and AC traceability
> From version: 0.9.12
> Understanding: 95%
> Confidence: 91%
> Progress: 100%
> Complexity: Medium
> Theme: Delivery closure quality gate for connector/splice occupancy navigation ergonomics
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_071` changes action ordering and navigation behavior in two analysis surfaces (connector/splice occupancy cards). Without explicit closure checks, regressions can break wire focus routing or stale-reference safety.

# Scope
- In:
  - Confirm `Go to` is rendered before `Release` in connector and splice occupied cards.
  - Verify successful wire navigation and disabled-state fallback for missing wire references.
  - Sync request/backlog/task status indicators for req_071 closure.
- Out:
  - Analysis-table navigation redesign beyond req_071.
  - Occupant-reference schema changes.

# Acceptance criteria
- Automated coverage validates req_071 action ordering and navigation behavior.
- Missing-wire fallback remains stable (`Go to` disabled, `Release` available).
- Request/backlog/task docs reflect delivered status and AC coverage.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_071`.
- Blocks: `task_070` completion.
- Related AC: AC1, AC2, AC3, AC4, AC4a, AC5.
- References:
  - `logics/request/req_071_connector_and_splice_analysis_add_go_to_wire_action_before_release.md`
  - `src/tests/app.ui.analysis-go-to-wire.spec.tsx`
  - `package.json`
