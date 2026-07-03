## task_158_orchestrate_ci_wall_clock_reduction - Orchestrate CI wall-clock reduction
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Capture the baseline first: last five run durations plus per-step timings from one representative run; store in the task journal (AC6 depends on it).
- [x] 2. Land the parallel-lanes split with concurrency cancellation; implementation is published and verified by the `validate` aggregator.
- [x] 3. Land the coverage-off-PR item immediately after — PR units run without coverage and main retains the coverage gate.
- [x] 4. Land caching (Playwright + pip) next; GitHub evidence captured cold and warm behavior.
- [x] 5. Land worker-count raise and UI-lane sharding last; three consecutive PR CI attempts passed.
- [x] 6. Close out with before/after wall-clock table (per lane and total), the required-checks diff, and the e2e placement decision; validate and close the request chain.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_657_split_the_serial_ci_job_into_parallel_blocking_lanes_with_concurrency_cancellation`
- `item_658_scope_coverage_instrumentation_to_main_and_drop_it_from_pr_runs`
- `item_659_match_test_runner_parallelism_to_runner_hardware_and_shard_the_ui_lane`
- `item_660_cache_playwright_browsers_and_pip_setup_gate_e2e_cost_on_the_pr_path`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: PR CI run 28677985470 attempt 1 and main CI run 28678288559 passed quality, unit, three UI shards, E2E, build, and `validate`.
- request-AC2 -> This task. Proof: PR run 28677985470 ran `Fast tests without PR coverage overhead`; main run 28678288559 skipped that step and ran `Fast tests with main coverage`.
- request-AC3 -> This task. Proof: PR run 28677985470 attempts 1, 2, and 3 passed all UI shards with four-worker sharding.
- request-AC4 -> This task. Proof: PR attempt 1 saved the pip cache after a cold miss; PR attempts 1-3 hit the Playwright cache and skipped browser install. Main run 28678288559 exercised a cold Playwright cache on main and saved it.
- request-AC5 -> This task. Proof: the workflow concurrency expression cancels pull-request supersessions while assigning unique non-cancelling groups to main runs.
- request-AC6 -> This task. Proof: baseline PR validate was 9m59s; post-change PR attempts completed in 2m21s, 2m02s, and 1m47s.

# Validation
- Local validation passed on 2026-07-03: YAML parsing, UI shard 1/3 (23 files, 138 tests), and the complete `npm run -s ci:local` portal (1,055 Vitest tests, 3 E2E tests, coverage, build, PWA gate).
- Remote validation passed on 2026-07-03: draft PR #15 merged by fast-forward after PR CI run 28677985470 passed three consecutive attempts, then main CI run 28678288559 passed.
- Finish workflow executed on 2026-07-03.
- Linked backlog/request close verification passed.

# Report
- Baseline captured from PR run 28352671607: validate ran 9m59s total; setup 20s, Playwright install 24s, serial Blocking project CI 9m06s. Last five CI runs took 8m08s, 10m04s, 9m51s, 10m19s, and 10m02s.
- Published implementation: parallel quality/unit/ui(3 shards)/e2e/build lanes with `validate` aggregator, PR-only cancellation, coverage-free PR unit tests, main coverage retention, Playwright browser cache, pip cache, and 4-worker UI shards. E2E stayed in its own blocking lane.
- Publication repair: the first PR run failed because `actions/setup-python` cannot use `cache: pip` without a dependency file. Added `.github/requirements-ci.txt` and `cache-dependency-path`; no broader CI redesign was needed.
- Required-checks diff: branch protection API returned `Branch not protected` before publication, so there were no configured required checks to preserve. The workflow now exposes the stable `validate` check plus visible lane checks.
- Remote timing table: baseline 9m59s; PR attempt 1 2m21s with lanes quality 1m22s, unit 1m21s, ui 1m46s/1m44s/1m50s, e2e 47s, build 22s, validate 4s; PR attempt 2 2m02s with lanes quality 1m14s, unit 1m21s, ui 1m32s/1m55s/1m39s, e2e 43s, build 18s, validate 2s; PR attempt 3 1m47s with lanes quality 1m16s, unit 1m23s, ui 1m13s/1m43s/1m37s, e2e 45s, build 22s, validate 2s. Best PR reduction: 82%.
- Cache evidence: Playwright restored `playwright-Linux-20b231...` on PR attempts and skipped `Install Chromium`; pip missed on PR attempt 1 and saved `setup-python-Linux-x64-24.04-Ubuntu-python-3.14.6-pip-1d3b...`; subsequent quality lanes completed with the cache configured. Main run 28678288559 confirmed the main-only coverage path and passed in 1m55s total.
- Finished on 2026-07-03.
- Linked backlog item(s): `item_657_split_the_serial_ci_job_into_parallel_blocking_lanes_with_concurrency_cancellation`, `item_658_scope_coverage_instrumentation_to_main_and_drop_it_from_pr_runs`, `item_659_match_test_runner_parallelism_to_runner_hardware_and_shard_the_ui_lane`, `item_660_cache_playwright_browsers_and_pip_setup_gate_e2e_cost_on_the_pr_path`
- Related request(s): `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`

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
