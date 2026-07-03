## req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers - CI wall-clock reduction: parallel jobs, PR-scoped coverage, runner utilization, cached browsers
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: CI speed and feedback latency
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Pull-request CI feedback must get dramatically faster: today a single ubuntu-latest job runs the entire ci:blocking chain serially (lint, typecheck, seven quality gates, unit tests with coverage, UI tests, Playwright e2e, production build, PWA gate), so wall-clock time is the sum of every step instead of the slowest parallel lane.
- Coverage instrumentation must stop taxing every pull request: test:ci:fast always runs with --coverage, which slows the unit lane substantially while the coverage numbers are only consumed on main.
- The test runners must actually use the runner hardware: vitest lanes are pinned to --maxWorkers=2 on 4-vCPU ubuntu-latest runners.
- Repeated per-run setup cost must be cached: Playwright chromium (--with-deps) is downloaded on every run and logics-manager is pip-installed from scratch.
- Superseded runs must not consume queue time: pushing a new commit to a PR must cancel the in-flight run for that PR.

# Context
- .github/workflows/ci.yml defines a single job named validate (timeout 30 minutes) that checks out, installs Node 20 + Python + logics-manager, npm ci, runs informational logics lint/audit steps, installs the Playwright chromium browser with system deps, then runs npm run ci:blocking followed by informational bundle metrics and the PWA gate.
- ci:blocking in package.json chains: logics-manager lint/sync/audit, eslint, tsc --noEmit, dependency-audit gate, vitest segmentation check, four modularization/governance gates, the exceljs boundary gate, the pin-role release gate, test:ci:fast -- --coverage, test:ci:ui, test:e2e, vite build (build:vite), and the PWA artifact gate — strictly serial.
- test:ci:fast and test:ci:ui both pass --pool=forks --maxWorkers=2 --testTimeout=15000; ubuntu-latest standard runners expose 4 vCPUs, so half the cores sit idle during the longest steps. The maxWorkers=2 choice is not documented anywhere as a flakiness or memory mitigation, so it must be validated rather than assumed safe to raise.
- scripts/quality/run-vitest-segmented.mjs splits specs into a fast lane and a UI lane (71 app.ui.*.spec.tsx files) and runs UI chunks of 8 files sequentially in-process; vitest natively supports --shard for splitting a lane across parallel jobs.
- The workflow has no concurrency group, so superseded PR pushes queue full runs behind each other; there is no cache for ~/.cache/ms-playwright (browser re-downloaded every run, roughly one to two minutes) nor for the pip install.
- The e2e step (tests/e2e, 2 Playwright specs today) requires the production build via run-playwright-e2e.mjs; the vitest UI suites already cover most user flows in jsdom, so e2e on every PR is the slowest step with the least marginal signal.
- A companion request (req_162, over-engineering reduction) already covers replacing the bespoke quality-gate scripts with eslint rules and de-hardcoding run-vitest-segmented.mjs; this request must not duplicate that scope — it may only exploit vitest --shard once available, and its job layout must stay correct whether req_162 lands before or after.
- Constraint: the set of blocking checks must not weaken — every currently blocking verification must still block merges after the split; only scheduling, caching, and coverage placement change.

# Acceptance criteria
- AC1: The CI workflow runs ci:blocking's verifications as parallel jobs (at minimum: static checks + quality gates, unit lane, UI lane, e2e + build + PWA) with wall-clock time equal to the slowest lane, and every previously blocking check still required for merge.
- AC2: Pull-request runs execute the unit lane without coverage instrumentation; coverage still runs (and can fail) on main pushes or a scheduled job, with the coverage-off-PR policy documented in the workflow.
- AC3: vitest worker count matches runner capacity: --maxWorkers raised from 2 (to 4 or unset) after a validation pass confirming no new flakiness or OOM across three consecutive green runs, or the 2-worker pin is kept and documented with the observed failure that justifies it.
- AC4: Playwright browser binaries are cached keyed on the @playwright/test version, and the logics-manager pip install is cached; cache-hit runs skip both downloads.
- AC5: A concurrency group cancels in-flight runs for the same PR ref on new pushes, while main runs are never cancelled.
- AC6: End-to-end wall-clock for a typical PR run drops by at least 40% versus the recorded pre-change baseline, with before/after run durations recorded in the task closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)

# References
- .github/workflows/ci.yml
- package.json
- scripts/quality/run-vitest-segmented.mjs
- scripts/quality/run-playwright-e2e.mjs
- playwright.config.ts
- vite.config.ts

# AI Context
- Summary: CI wall-clock reduction: parallel jobs, PR-scoped coverage, runner utilization, cached browsers
- Keywords: request-chain-scaffold, ci wall-clock reduction: parallel jobs, pr-scoped coverage, runner utilization, cached browsers, development-ready
- Use when: You need to implement or review the scaffolded workflow for CI wall-clock reduction: parallel jobs, PR-scoped coverage, runner utilization, cached browsers.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_657_split_the_serial_ci_job_into_parallel_blocking_lanes_with_concurrency_cancellation`
- `item_658_scope_coverage_instrumentation_to_main_and_drop_it_from_pr_runs`
- `item_659_match_test_runner_parallelism_to_runner_hardware_and_shard_the_ui_lane`
- `item_660_cache_playwright_browsers_and_pip_setup_gate_e2e_cost_on_the_pr_path`
