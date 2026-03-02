## item_436_req_085_mobile_compaction_validation_matrix_and_closure_traceability - Req 085 mobile compaction validation matrix and closure traceability
> From version: 0.9.18
> Status: Draft
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Closure governance for req_085 mobile compaction rollout
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Req_085 spans onboarding, list headers, table columns, and mobile label contracts. Without explicit closure evidence, regressions and AC drift are likely.

# Scope
- In:
  - produce req_085 AC traceability matrix linked to code/tests;
  - capture validation command evidence for mobile viewport checks and targeted suites;
  - synchronize request/backlog/task status and references at closure.
- Out:
  - new feature scope beyond req_085;
  - unrelated architecture/process changes.

# Acceptance criteria
- AC1: Req_085 AC matrix is complete and auditable.
- AC2: Validation matrix includes mobile viewport checks (`390x844`, `360x800`) and targeted UI suites.
- AC3: Request/backlog/task statuses and cross-links are synchronized at closure.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `item_433`, `item_434`, `item_435`.
- Blocks: `task_074` completion.
- Related AC: `AC1` to `AC13`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/styles/onboarding.css`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.onboarding.spec.tsx`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.list-ergonomics.spec.tsx`
  - `src/tests/app.ui.catalog.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
