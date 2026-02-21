## item_070_dev_server_port_env_resolution_and_default_5284 - Dev Server Port Env Resolution and Default 5284
> From version: 0.3.0
> Understanding: 100%
> Confidence: 99%
> Progress: 100%
> Complexity: Medium
> Theme: Runtime Endpoint Determinism
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dev/preview/E2E endpoints are hardcoded and disconnected, creating friction when teams need custom local ports/hosts and deterministic tooling alignment.

# Scope
- In:
  - Resolve `APP_PORT` with default `5284` for local dev server.
  - Resolve `APP_HOST` and `PREVIEW_PORT` with deterministic defaults.
  - Align Playwright runtime through `E2E_BASE_URL` coherence.
  - Keep behavior deterministic when env vars are missing.
- Out:
  - Advanced multi-host networking scenarios.
  - Reverse-proxy specific deployment rules.

# Acceptance criteria
- Running dev server without env starts on `127.0.0.1:5284`.
- Valid env override for host/port is applied in runtime config.
- Preview and E2E target URLs are aligned with configured defaults/overrides.
- Existing scripts continue to run without workflow regression.

# Priority
- Impact: High (core local execution reliability).
- Urgency: High after env contract bootstrap.

# Notes
- Dependencies: item_069.
- Blocks: item_073.
- Related AC: AC2, AC3, AC5, AC7.
- References:
  - `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
  - `src/config/environment.ts`
  - `vite.config.ts`
  - `playwright.config.ts`
  - `package.json`
