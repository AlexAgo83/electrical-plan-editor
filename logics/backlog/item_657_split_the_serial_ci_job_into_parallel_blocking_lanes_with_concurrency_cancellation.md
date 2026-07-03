## item_657_split_the_serial_ci_job_into_parallel_blocking_lanes_with_concurrency_cancellation - Split the serial CI job into parallel blocking lanes with concurrency cancellation
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: CI speed and feedback latency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The single validate job runs every ci:blocking step serially, so total wall-clock is the sum of lint, typecheck, seven gates, three test suites, the production build, and the PWA gate.
- Without a concurrency group, each push to an open PR queues a full new run behind the in-flight one instead of cancelling it.

# Scope
- In:
  - Record the pre-change baseline first: durations of the last five main/PR runs, per-step timings from one representative run.
  - Restructure .github/workflows/ci.yml into parallel jobs, for example: checks (logics gates, eslint, typecheck, dependency-audit, segmentation check, modularization/governance/boundary gates), unit (test:ci:fast), ui (test:ci:ui), e2e-build (vite build, test:e2e, quality:pwa, bundle metrics report); factor the shared setup (checkout, setup-node with npm cache, npm ci) into each job or a composite action.
  - Split the ci:blocking package script into per-lane scripts so each job runs exactly its slice and local ci:local still runs the full serial chain for developers.
  - Add a concurrency block: group per workflow+ref, cancel-in-progress true for pull requests, false for main.
  - Declare every new job a required status check (branch protection or merge queue configuration documented in the closeout) so the blocking set is provably unchanged.
  - Stay compatible with req_162: reference gate scripts through the per-lane npm scripts so their later replacement by eslint rules only shrinks the checks lane.
- Out:
  - Changing what any gate or test verifies.
  - Sharding within a lane (separate backlog item).
  - The release-deploy and Teams-notification workflows.

# Acceptance criteria
- AC1: PR CI wall-clock equals the slowest lane; a run's job graph shows the lanes executing concurrently.
- AC2: Every check that blocked merges before the split still blocks merges (required-checks list captured before/after in the closeout).
- AC3: Pushing twice in quick succession to a PR cancels the first run; two rapid pushes to main both complete.
- AC4: npm run ci:local still runs the full serial chain unchanged for local use.
- AC5: Baseline and post-change durations recorded; this item plus the coverage item together meet the 40% request-level target.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: PR CI wall-clock equals the slowest lane; a run's job graph shows the lanes executing concurrently.
- request-AC5 -> This backlog slice. Proof: AC2: Every check that blocked merges before the split still blocks merges (required-checks list captured before/after in the closeout).
- request-AC6 -> This backlog slice. Proof: AC3: Pushing twice in quick succession to a PR cancels the first run; two rapid pushes to main both complete.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)
- Request: `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`
- Primary task(s): `task_158_orchestrate_ci_wall_clock_reduction`

# AI Context
- Summary: Split the serial CI job into parallel blocking lanes with concurrency cancellation
- Keywords: scaffolded-backlog, split the serial ci job into parallel blocking lanes with concurrency cancellation, implementation-ready
- Use when: Implementing the scaffolded slice for Split the serial CI job into parallel blocking lanes with concurrency cancellation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
