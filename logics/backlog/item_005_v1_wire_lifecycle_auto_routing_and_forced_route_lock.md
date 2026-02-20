## item_005_v1_wire_lifecycle_auto_routing_and_forced_route_lock - V1 Wire Lifecycle Auto Routing and Forced Route Lock
> From version: 0.1.0
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wires are the core business entity. V1 needs full lifecycle support: endpoint assignment, occupancy checks, automatic route/length computation, forced route lock, and dynamic recalculation on segment updates.

# Scope
- In:
  - Create/edit/delete wire (`functionalName`, `technicalId`, endpoint A/B).
  - Endpoint types: connector+cavity or splice+port.
  - Occupancy enforcement for cavities and splice ports.
  - Auto-route on creation using shortest-path engine.
  - Forced route selection, validation, and lock/reset behavior.
  - Dynamic wire length recomputation when impacted segments change.
- Out:
  - Slack/margin/rounding additions.
  - Industrial export formatting.

# Acceptance criteria
- New wire gets an automatic shortest path proposal.
- User can force a valid alternative route and lock it until reset.
- Updating segment length recomputes all impacted wire lengths.
- Invalid occupancy or invalid forced routes are blocked with clear errors.

# Priority
- Impact: Critical (AC1, AC2, AC3).
- Urgency: Critical.

# Notes
- Dependencies: item_001, item_002, item_003, item_004.
- Blocks: item_006, item_008.
- Related AC: AC1, AC2, AC3.
- References:
  - `src/store/reducer.ts`
  - `src/store/actions.ts`
  - `src/store/selectors.ts`
  - `src/core/pathfinding.ts`
  - `src/app/App.tsx`
  - `src/tests/store.reducer.spec.ts`
