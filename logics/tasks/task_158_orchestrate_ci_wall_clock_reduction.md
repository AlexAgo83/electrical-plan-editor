## task_158_orchestrate_ci_wall_clock_reduction - Orchestrate CI wall-clock reduction
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Capture the baseline first: last five run durations plus per-step timings from one representative run; store in the task journal (AC6 depends on it).
- [ ] 2. Land the parallel-lanes split with concurrency cancellation (biggest structural win); update branch-protection required checks the same day so merges stay gated.
- [ ] 3. Land the coverage-off-PR item immediately after — it is a one-line-per-lane change once the lanes exist.
- [ ] 4. Land caching (Playwright + pip) next; verify one cold and one warm run.
- [ ] 5. Land worker-count raise and UI-lane sharding last, with the three-green-runs validation window; coordinate the shard mechanics with req_162's segmented-runner refactor to avoid double work.
- [ ] 6. Close out with before/after wall-clock table (per lane and total), the required-checks diff, and the e2e placement decision; validate and close the request chain.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_657_split_the_serial_ci_job_into_parallel_blocking_lanes_with_concurrency_cancellation`
- `item_658_scope_coverage_instrumentation_to_main_and_drop_it_from_pr_runs`
- `item_659_match_test_runner_parallelism_to_runner_hardware_and_shard_the_ui_lane`
- `item_660_cache_playwright_browsers_and_pip_setup_gate_e2e_cost_on_the_pr_path`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate CI wall-clock reduction
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)

# Notes
- IMPLEMENTER RULES (mandatory): work ONE backlog item at a time, in the plan order; read each item's Decision notes first — lane layout, cache keys, worker counts, and e2e placement are already decided, do not re-decide them. Record the baseline run durations BEFORE any change (AC6 is unverifiable otherwise). Every currently blocking check must still block merges after your changes — diff the required-checks list before/after and paste it in the task report. Test workflow changes on a draft PR before merging. If a decision note contradicts the actual repo state, STOP and record it instead of improvising.
