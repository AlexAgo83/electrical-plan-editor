## item_600_appcontroller_decomposition_plan - AppController decomposition plan
> From version: 1.10.4
> Schema version: 1.0
> Status: Ready
> Understanding: 100%
> Confidence: 88%
> Progress: 0%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|appcontroller-decomposition-plan|req-129-app-controller-decomposition-pla|deliver-the-incremental-appcontroller-de|ac1-wave-1-is-re-scoped-against
flowchart LR
    Source[req_129 source] --> Slice[item_600 bounded slice]
    Slice --> Task[task_111 first delivery wave]
    Task --> Evidence[CI evidence per wave]
```

# Problem
Deliver the incremental AppController decomposition roadmap defined in `adr_009_app_controller_decomposition_plan`. The shell `src/app/AppController.tsx` and the largest controller hooks currently allow-listed in `quality:hooks-modularization` must shrink wave by wave.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: Wave 1 is re-scoped against the current controller layout (`src/app/hooks/controller/*` wrappers plus `src/app/hook-impl/controller/*` implementation bodies).
- AC2: The first delivery wave removes or materially shrinks at least one of the large controller implementation bodies without changing the public `<AppController store={...} />` contract.
- AC3: The corresponding controller-boundary tests are added or extended, and the relevant `app.ui.*` tests remain green.
- AC4: The hooks and UI modularization gates remain green after the wave, with any stale or misleading allowlist/budget entries updated.
- AC5: The request/backlog/task chain records which ADR-009 wave was delivered and what remains.

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: a concrete task/follow-up exists for the current Wave 1 scope before implementation starts.
- request-AC2 -> This backlog slice. Evidence needed: at least one large controller implementation body is removed from the active refactor target or materially shrunk, and the gate output stays green.
- request-AC3 -> This backlog slice. Evidence needed: controller-boundary coverage is added or extended and the affected `app.ui.*` specs pass.
- request-AC4 -> This backlog slice. Evidence needed: only after Waves 1-4, the locked AppController budget is lowered from 1100 to the new measured ceiling.
- request-AC5 -> This backlog slice. Evidence needed: `store.reducer.sync-invariant.spec.ts` continues to pass after each wave that touches controller state assembly.

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
- Request: `logics/request/req_129_app_controller_decomposition_plan.md`
- Primary task(s): (none yet)

# AI Context
- Summary: AppController decomposition plan
- Keywords: backlog-groom, request, appcontroller decomposition plan, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for AppController decomposition plan.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_129_app_controller_decomposition_plan` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_129_app_controller_decomposition_plan.md`.
- Generated locally by logics-manager.
- Real-status audit on 2026-06-09: the generated backlog framing was not sufficient as implementation scope. No ADR-009 wave can be considered delivered from current evidence. Keep this item open and re-scope the first wave before coding.

# Tasks
- `task_111_appcontroller_decomposition_plan`
