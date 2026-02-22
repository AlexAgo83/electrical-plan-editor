## item_090_empty_workspace_persistence_contract_and_sample_bootstrap_rule_fix - Empty Workspace Persistence Contract and Sample Bootstrap Rule Fix
> From version: 0.5.0
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: Medium
> Theme: Persistence Semantics Correctness
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
A valid persisted snapshot with an intentionally empty workspace is currently treated as a sample bootstrap trigger on reload, which silently discards user intent.

# Scope
- In:
  - Redefine persistence load behavior to respect valid empty snapshots.
  - Keep sample bootstrap only for first-run (no payload) and invalid/corrupted/unrecoverable payloads.
  - Preserve sample bootstrap behavior where it is currently expected (on fresh start).
  - Document the empty-workspace contract in code comments/tests.
- Out:
  - Changes to sample network fixture contents.
  - Settings UX redesign around sample network actions.

# Acceptance criteria
- Valid persisted empty workspace remains empty after reload.
- Sample bootstrap still occurs on empty storage and invalid/corrupted payloads.
- Existing sample-network onboarding behavior remains stable for first-run.
- Regression tests explicitly cover the new semantics.

# Priority
- Impact: High (user-intent preservation / persistence correctness).
- Urgency: High (behavior correctness issue).

# Notes
- Dependencies: item_089 (recommended if persistence adapter is touched in same wave).
- Blocks: item_093.
- Related AC: AC2, AC3, AC6, AC7.
- References:
  - `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/store/sampleNetwork.ts`
  - `src/tests/persistence.localStorage.spec.ts`
  - `src/tests/app.ui.settings.spec.tsx`
