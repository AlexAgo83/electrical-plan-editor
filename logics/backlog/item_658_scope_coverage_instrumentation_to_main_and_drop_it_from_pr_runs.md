## item_658_scope_coverage_instrumentation_to_main_and_drop_it_from_pr_runs - Scope coverage instrumentation to main and drop it from PR runs
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: CI speed and feedback latency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- test:ci:fast always runs with --coverage, paying V8 instrumentation and report generation on every PR while the coverage output is only consumed on main (informational UI coverage report is already workflow_dispatch-only).
- Coverage instrumentation typically adds 30-60% to unit-lane duration, sitting directly on the PR critical path.

# Scope
- In:
  - Run the unit lane without --coverage on pull_request events; keep coverage (with the existing thresholds and reporters, including the @vitest/coverage-v8 config in vite.config.ts) on main pushes and workflow_dispatch.
  - Express the split via workflow-level conditionals or two npm scripts (test:ci:fast vs test:ci:fast:coverage) so the intent is readable in package.json.
  - Document the policy with a comment in ci.yml stating where coverage runs and why.
  - Measure and record unit-lane duration with and without coverage in the closeout.
- Out:
  - Changing coverage thresholds, reporters, or included files.
  - Adding coverage gating that does not exist today.

# Acceptance criteria
- AC1: PR runs execute the unit lane with no coverage artifacts produced; main runs still produce them and fail on regression exactly as today.
- AC2: Unit-lane duration on PRs drops measurably versus the recorded coverage-on baseline.
- AC3: The policy is documented in ci.yml and package.json scripts are self-describing.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: PR runs execute the unit lane with no coverage artifacts produced; main runs still produce them and fail on regression exactly as today.
- request-AC6 -> This backlog slice. Proof: AC2: Unit-lane duration on PRs drops measurably versus the recorded coverage-on baseline.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- DECIDED: add package.json script test:ci:fast:coverage = current fast lane with --coverage; test:ci:fast loses --coverage. In ci.yml the unit job runs test:ci:fast:coverage when github.event_name != 'pull_request', else test:ci:fast. That is the whole change; do not touch vitest coverage config in vite.config.ts.

# Links
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)
- Request: `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`
- Primary task(s): `task_158_orchestrate_ci_wall_clock_reduction`

# AI Context
- Summary: Scope coverage instrumentation to main and drop it from PR runs
- Keywords: scaffolded-backlog, scope coverage instrumentation to main and drop it from pr runs, implementation-ready
- Use when: Implementing the scaffolded slice for Scope coverage instrumentation to main and drop it from PR runs.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
