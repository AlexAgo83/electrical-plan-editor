## task_111_appcontroller_decomposition_plan - AppController decomposition plan
> From version: 1.10.4
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

```mermaid
%% logics-kind: task
%% logics-signature: task|appcontroller-decomposition-plan|deliver-wave-1-networksummary-screen-controller|dod-quality-hooks-modularization-shrinks
flowchart LR
    Start[Task start] --> Wave1[Wave 1 NetworkSummaryScreenController]
    Wave1 --> Allowlist[Update ALLOWED_HOOKS_OVERSIZE]
    Allowlist --> Specs[New controller boundary spec]
    Specs --> Validation[npm run ci:blocking]
```

# Definition of Done (DoD)
- [ ] The backlog scope is implemented.
- [ ] Acceptance criteria are covered.
- [ ] Validation passes.

# Backlog
- `item_600_appcontroller_decomposition_plan`

# Acceptance criteria
- AC1: The request states the bounded need for appcontroller decomposition plan.
- AC2: Scope boundaries and operator impact are explicit.
- AC3: The request is ready to be promoted into a backlog slice.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_111_appcontroller_decomposition_plan.md` after implementation.

# Report
- Implementation complete.

# AI Context
- Summary: Implement appcontroller decomposition plan.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_129_app_controller_decomposition_plan`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: Each wave defined in ADR-009 has a corresponding task or follow-up doc when work starts.
- request-AC2 -> This task. Evidence needed: After each wave, the retired controller hook(s) are removed from `ALLOWED_HOOKS_OVERSIZE` and the gate still passes.
- request-AC3 -> This task. Evidence needed: After each wave, the corresponding `app.ui.*` Vitest specs stay green and at least one controller-boundary spec is added or extended.
- request-AC4 -> This task. Evidence needed: After Wave 4, the locked budget for `src/app/AppController.tsx` in `LOCKED_LINE_BUDGETS` is lowered to the new ceiling (rounded up to the next 50-line boundary).
- request-AC5 -> This task. Evidence needed: The dual-state invariant (`networkStates[activeNetworkId]` synchronized with root slices) remains covered by `store.reducer.sync-invariant.spec.ts` and continues to pass.
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This task. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
