## item_556_replace_pathfinding_queue_sort_with_min_heap_priority_queue - Replace pathfinding queue.sort with a min-heap priority queue
> From version: 1.4.4
> Schema version: 1.0
> Status: Draft
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Performance / algorithmic complexity
> Reminder: Update understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The Dijkstra implementation in `src/core/pathfinding.ts` calls `queue.sort(compareCandidates)` inside the main loop. This makes the algorithm O(E² log E) instead of the expected O(E log E). On networks with 50+ nodes and 200+ segments, the UI freezes during automatic wire routing updates.

# Scope
- In:
  - implement a `MinHeap<Candidate>` generic priority queue (in `src/core/minHeap.ts` or co-located);
  - replace the `queue.sort()` call in the Dijkstra loop with heap `push` / `pop` operations;
  - preserve the existing deterministic tie-breaking semantics (`compareSegmentIdArrays`, `compareCandidates`) so all outputs remain byte-identical for all existing test inputs;
  - confirm `core.pathfinding.spec.ts` passes without modification after the change.
- Out:
  - changes to the graph construction path (covered in `item_557`);
  - UI-level loading indicators for slow routing (not in scope).

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|replace-pathfinding-queue-sort-with-min|dijkstra-implementation-calls-queue-sor|ac1-core-pathfinding-spec-ts-passes-with|minimum-step-gate
flowchart LR
    Before[queue.sort each iteration O(E² log E)] --> Heap[MinHeap push/pop O(E log E)]
    Heap --> Determinism[Preserve tie-breaking comparators]
    Determinism --> Tests[core.pathfinding.spec.ts unchanged and passing]
```

# Acceptance criteria
- AC1: `core.pathfinding.spec.ts` passes without modification and produces byte-identical outputs for all existing test inputs.
- AC2: No `queue.sort()` call remains in the Dijkstra loop in `pathfinding.ts`.
- AC3: The `MinHeap` implementation correctly orders candidates by the existing `compareCandidates` comparator.
- AC4: A benchmark or manual verification with a 100-node network confirms no UI-observable freeze during routing.

# AC Traceability
- AC1 → output correctness. Proof: CI run of `core.pathfinding.spec.ts` passes green.
- AC2 → call-site hygiene. Proof: grep confirms no `queue.sort` in the Dijkstra loop.
- AC3 → heap correctness. Proof: unit test for `MinHeap` covering push/pop ordering with the comparator.
- AC4 → perf verification. Proof: manual test or perf spec note recorded in task report.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Request: `logics/request/req_113_technical_debt_hardening_persistence_safety_performance_and_architecture_quality.md`
- Primary task(s): `logics/tasks/task_091_orchestration_delivery_execution_for_req_113_technical_debt_hardening.md`

# AI Context
- Summary: Replace the O(E² log E) queue.sort in the Dijkstra pathfinder with a min-heap to restore O(E log E) complexity while preserving deterministic tie-breaking.
- Keywords: Dijkstra, pathfinding, min-heap, priority queue, O(E log E), performance, routing
- Use when: Implementing or reviewing the pathfinding algorithm in `src/core/pathfinding.ts`.
- Skip when: Working on graph construction, UI routing triggers, or features unrelated to algorithmic performance.

# Priority
- Impact: High.
- Urgency: Soon.

# Notes
- Derived from `logics/request/req_113_...` audit item B1.
- Depends on: none.
- References:
  - `src/core/pathfinding.ts`
  - `src/tests/core.pathfinding.spec.ts`

# Validation
- `npm run -s lint`
- `npm run -s typecheck`
- `npm test -- --run src/tests/core.pathfinding.spec.ts`
- `npm run -s build`
