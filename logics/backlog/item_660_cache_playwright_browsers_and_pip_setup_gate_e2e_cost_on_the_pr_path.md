## item_660_cache_playwright_browsers_and_pip_setup_gate_e2e_cost_on_the_pr_path - Cache Playwright browsers and pip setup; gate e2e cost on the PR path
> From version: 1.18.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: CI speed and feedback latency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- npx playwright install --with-deps chromium re-downloads the browser on every run (roughly one to two minutes) because ~/.cache/ms-playwright is never cached.
- logics-manager is pip-installed from the network on every run.
- The e2e step forces a production build and browser boot on every PR while the two existing e2e specs mostly duplicate flows the vitest UI suites already cover in jsdom.

# Scope
- In:
  - Cache ~/.cache/ms-playwright with actions/cache keyed on the @playwright/test version from package-lock.json; on cache hit run npx playwright install chromium (no --with-deps re-download) or skip install entirely if the binary check passes; keep --with-deps only for the cold path.
  - Cache the pip install (actions/setup-python built-in pip cache keyed on the logics-manager version, or pin the version for cache stability).
  - Decide and implement the e2e placement on the PR path: keep it blocking (default, since the parallel-lanes item removes it from the critical path if another lane is slower) or move it to main-only/non-blocking on PRs — decide from the measured lane timings after the parallel split lands, and record the decision and numbers in the closeout.
  - Verify cold-path behavior: a cache miss still produces a green run.
- Out:
  - Removing or rewriting any e2e spec.
  - Caching node_modules beyond the existing setup-node npm cache.

# Acceptance criteria
- AC1: A cache-hit run performs no Playwright browser download and no pip network install, visible in step logs and timings.
- AC2: A cache-miss (cold) run still completes green.
- AC3: The e2e placement decision is recorded with the lane timings that justify it, and merges remain blocked by e2e wherever it is declared blocking.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A cache-hit run performs no Playwright browser download and no pip network install, visible in step logs and timings.
- request-AC6 -> This backlog slice. Proof: AC2: A cache-miss (cold) run still completes green.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- DECIDED: e2e STAYS BLOCKING on PRs, in its own parallel lane (item_657 already takes it off the critical path); do not move it to main-only. Cache config: actions/cache on ~/.cache/ms-playwright with key playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}; on cache hit run npx playwright install chromium (no --with-deps), on miss run npx playwright install --with-deps chromium. Pip: use actions/setup-python built-in pip cache and pin logics-manager to the version currently in CI logs. Verify one cold run (delete cache in Actions UI) and one warm run are both green before closing.

# Links
- Product brief(s): `prod_014_ci_speed_and_developer_feedback_latency`
- Architecture decision(s): (none yet)
- Request: `req_163_ci_wall_clock_reduction_parallel_jobs_pr_scoped_coverage_runner_utilization_cached_browsers`
- Primary task(s): `task_158_orchestrate_ci_wall_clock_reduction`

# AI Context
- Summary: Cache Playwright browsers and pip setup; gate e2e cost on the PR path
- Keywords: scaffolded-backlog, cache playwright browsers and pip setup; gate e2e cost on the pr path, implementation-ready
- Use when: Implementing the scaffolded slice for Cache Playwright browsers and pip setup; gate e2e cost on the PR path.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_158_orchestrate_ci_wall_clock_reduction` was finished via `logics-manager flow finish task` on 2026-07-03.
