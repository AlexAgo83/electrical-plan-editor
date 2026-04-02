## item_558_appcontroller_decomposition_context_providers_and_derived_state_memoization - AppController decomposition: Context providers and derived state memoization
> From version: 1.4.4
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Architecture quality / component structure
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.

# Problem
`AppController.tsx` (1 099 lines) is a God Component: it aggregates 50+ hooks, derives 100+ values, and passes them as props through 4+ levels of the component tree. Derived state objects (`selectionEntities`, `forms`, `canvas`) are not memoized, causing unnecessary re-renders of all child screens on every state change. There are no Context providers, so any new handler or selector addition requires threading through every intermediate layer.

# Scope
- In:
  - add React Context providers for at minimum: store dispatch, connector handlers, wire handlers, and segment handlers; update at least one deeply nested consumer to use context instead of props;
  - wrap `selectionEntities`, `forms`, and `canvas` in `useMemo` with correct and minimal dependency arrays;
  - extract a `ModelingController` sub-component responsible for modeling-screen state assembly, leaving `AppController` as a thin orchestrator;
  - each increment must leave all `app.ui.*.spec.tsx` tests passing.
- Out:
  - extracting `AnalysisController` or `ValidationController` (deferred to a follow-up);
  - full elimination of all prop drilling (this item delivers the first safe increment only);
  - changes to the store or reducers.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|appcontroller-decomposition-context-prov|req-113-technical-debt-hardening-persist|appcontroller-tsx-1-099-lines-is-a|ac1-react-context-providers-exist-for
flowchart LR
    Before[AppController 1099 lines, no context, no memo] --> Contexts[Context providers for dispatch and handlers]
    Before --> Memo[useMemo on selectionEntities, forms, canvas]
    Contexts --> Modeling[Extract ModelingController]
    Memo --> Modeling
    Modeling --> Tests[All app.ui specs pass]
```

# Acceptance criteria
- AC1: React Context providers exist for store dispatch and the connector, wire, and segment handler namespaces; at least one previously prop-drilled consumer is updated to use them.
- AC2: `selectionEntities`, `forms`, and `canvas` are wrapped in `useMemo` with dependency arrays that exclude unrelated state slices.
- AC3: A `ModelingController` component exists and owns the modeling-screen state assembly; `AppController` no longer assembles it directly.
- AC4: All existing `app.ui.*.spec.tsx` integration tests pass without modification after each increment.
- AC5: `AppController.tsx` line count is measurably reduced relative to the v1.4.4 baseline.

# AC Traceability
- AC1 → prop drilling reduction. Proof: context consumer updated, grep shows context usage in nested component.
- AC2 → re-render reduction. Proof: `useMemo` wrappers present with correct deps, reviewable in diff.
- AC3 → structural separation. Proof: `ModelingController.tsx` exists and is used by `AppController`.
- AC4 → non-regression. Proof: CI run of all `app.ui.*.spec.tsx` passes green.
- AC5 → size reduction. Proof: line count diff recorded in task report.

# Decision framing
- Product framing: Not needed
- Architecture framing: May warrant an ADR for the Context strategy if it diverges from existing patterns.

# Links
- Request: `logics/request/req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality.md`
- Primary task(s): `logics/tasks/task_091_orchestration_delivery_execution_for_req_113_technical_debt_hardening.md`

# AI Context
- Summary: Reduce AppController from a God Component to a thin orchestrator by adding Context providers, memoizing derived state objects, and extracting ModelingController.
- Keywords: AppController, God Component, React Context, useMemo, prop drilling, ModelingController, re-render
- Use when: Refactoring AppController or reviewing the component composition strategy.
- Skip when: Working on store reducers, persistence, or features unrelated to the UI controller layer.

# Priority
- Impact: High.
- Urgency: Soon.

# Notes
- Derived from `logics/request/req_113_...` audit item C1.
- Depends on: none (can be delivered independently).
- Blocks: nothing currently, but unblocks future controller extractions.
- References:
  - `src/app/AppController.tsx`
  - `src/app/hooks/` (controller hooks)
  - `src/tests/app.ui.*.spec.tsx`

# Validation
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/app.ui`
- `npm run -s build`
