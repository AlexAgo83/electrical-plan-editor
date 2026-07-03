## task_158_orchestrate_ci_wall_clock_reduction - Orchestrate CI wall-clock reduction
> From version: 1.18.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 85
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Capture the baseline first: last five run durations plus per-step timings from one representative run; store in the task journal (AC6 depends on it).
- [ ] 2. Land the parallel-lanes split with concurrency cancellation; implementation is committed, but the required-check configuration must be verified after publication.
- [x] 3. Land the coverage-off-PR item immediately after — PR units run without coverage and main retains the coverage gate.
- [ ] 4. Land caching (Playwright + pip) next; implementation is committed, but cold/warm GitHub cache evidence requires publication.
- [ ] 5. Land worker-count raise and UI-lane sharding last; local sharding is green, while the required three consecutive GitHub runs remain pending.
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
- request-AC1 -> This task. Proof pending publication: the workflow now defines parallel quality, unit, three UI shards, E2E, and build lanes behind the stable `validate` aggregator.
- request-AC2 -> This task. Proof: workflow conditions run unit coverage on main only; pull requests use the non-instrumented unit command.
- request-AC3 -> This task. Proof pending publication: UI shards use four workers and pass locally; three consecutive GitHub runs are still required.
- request-AC4 -> This task. Proof pending publication: Playwright and pip cache steps are defined; one cold and one warm GitHub run must confirm cache hits.
- request-AC5 -> This task. Proof: the workflow concurrency expression cancels pull-request supersessions while assigning unique non-cancelling groups to main runs.
- request-AC6 -> This task. Proof pending publication: baseline is recorded below; a post-change pull-request run must demonstrate the requested 40% wall-clock reduction.

# Validation
- Local validation passed on 2026-07-03: YAML parsing, UI shard 1/3 (23 files, 138 tests), and the complete `npm run -s ci:local` portal (1,055 Vitest tests, 3 E2E tests, coverage, build, PWA gate).
- Remote validation is intentionally pending because the commits have not been pushed: required-check preservation, three green runs, cache hit behavior, and post-change wall-clock cannot be proven locally.

# Report
- Implementation complete.
- Baseline captured from PR run 28352671607: validate ran 9m59s total; setup 20s, Playwright install 24s, serial Blocking project CI 9m06s. Last five CI runs took 8m08s, 10m04s, 9m51s, 10m19s, and 10m02s. Implemented parallel quality/unit/ui(3 shards)/e2e/build lanes with validate aggregator, PR-only cancellation, coverage-free PR unit tests, main coverage retention, Playwright browser cache, pip cache, and 4-worker UI shards. Local shard 1/3: 23 files, 138 tests, 25.22s.
- Local closeout gate passed in full. The task remains open at 85% solely for publication-dependent evidence; no remote timing or cache claim is inferred from local results.

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
