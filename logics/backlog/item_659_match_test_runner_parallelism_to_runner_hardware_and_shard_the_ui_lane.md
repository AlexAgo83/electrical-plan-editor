## item_659_match_test_runner_parallelism_to_runner_hardware_and_shard_the_ui_lane - Match test-runner parallelism to runner hardware and shard the UI lane
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
- Both vitest lanes pin --maxWorkers=2 on 4-vCPU runners with no documented justification, leaving half the cores idle during the longest steps.
- The UI lane (71 jsdom-heavy spec files) is the single longest test lane and runs its 8-file chunks sequentially inside one job, while vitest --shard could split it across parallel matrix jobs.

# Scope
- In:
  - Raise --maxWorkers to match runner cores (4, or unset to let vitest decide) for both lanes; validate over at least three consecutive green CI runs watching for OOM kills, worker crashes, and new flaky failures; if instability appears, bisect (3 workers) and document the ceiling with the observed failure mode.
  - Shard the UI lane across a 2-3 job matrix using vitest --shard=i/n once the lane's file list is glob-derived (coordinate with req_162 item on run-vitest-segmented.mjs; if that lands later, shard over the existing lane list without duplicating its refactor).
  - Keep the segmentation check green: total spec coverage across shards must equal the unsharded lane (no file skipped, none double-counted as a gap).
  - Record per-lane before/after durations in the closeout.
- Out:
  - Changing --pool=forks or testTimeout values.
  - Rewriting run-vitest-segmented.mjs beyond what sharding strictly needs (owned by req_162).
  - Sharding the fast lane or e2e (not the bottleneck).

# Acceptance criteria
- AC1: Worker count matches runner capacity or the lower pin is documented with observed evidence; three consecutive green runs at the chosen setting.
- AC2: The UI lane runs as parallel shards whose union covers exactly the same spec files as before, verified by the segmentation check.
- AC3: UI-lane wall-clock (longest shard) is at least 40% below the unsharded baseline.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Worker count matches runner capacity or the lower pin is documented with observed evidence; three consecutive green runs at the chosen setting.
- request-AC6 -> This backlog slice. Proof: AC2: The UI lane runs as parallel shards whose union covers exactly the same spec files as before, verified by the segmentation check.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)
- Request: `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`
- Primary task(s): `task_158_orchestrate_ci_wall_clock_reduction`

# AI Context
- Summary: Match test-runner parallelism to runner hardware and shard the UI lane
- Keywords: scaffolded-backlog, match test-runner parallelism to runner hardware and shard the ui lane, implementation-ready
- Use when: Implementing the scaffolded slice for Match test-runner parallelism to runner hardware and shard the UI lane.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
