## item_600_appcontroller_decomposition_plan - AppController decomposition plan
> From version: 1.10.4
> Schema version: 1.0
> Status: Done
> Understanding: 100%
> Confidence: 88%
> Progress: 100%
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
- Delivered on 2026-06-09 as the first shell-runtime decomposition wave.
- Evidence:
  - AC1: Wave 1 was re-scoped against the current controller layout. The large hook-impl bodies remain as follow-up targets, while the shell runtime cluster was selected because `AppController.tsx` was closest to its locked budget.
  - AC2: `AppController.tsx` now delegates workspace runtime wiring to `useAppControllerWorkspaceRuntime`, shrinking the shell to 1077 lines and preserving `<AppController store={...} />`.
  - AC3: `src/tests/app-controller-workspace-runtime.hook.spec.tsx` adds controller-boundary coverage; affected UI tests passed.
  - AC4: `quality:hooks-modularization` and `quality:ui-modularization` passed. The UI gate records explicit exceptions for two pre-existing oversize files rather than failing silently with an empty allowlist.
  - AC5: Remaining decomposition waves are recorded on the source request as follow-up work.
- Validation:
  - `npm run -s typecheck`
  - `npm run -s lint`
  - `npm run -s quality:hooks-modularization`
  - `npm run -s quality:ui-modularization`
  - `npm run -s test -- src/tests/app-controller-workspace-runtime.hook.spec.tsx src/tests/app.ui.functional-schematic-electrical-overlay.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx`

# Tasks
- `task_111_appcontroller_decomposition_plan`
