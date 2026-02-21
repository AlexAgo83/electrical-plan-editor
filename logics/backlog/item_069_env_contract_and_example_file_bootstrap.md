## item_069_env_contract_and_example_file_bootstrap - Env Contract and Example File Bootstrap
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Configuration Contract Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The project lacks an explicit environment configuration contract, which makes local setup inconsistent and onboarding less predictable.

# Scope
- In:
  - Define the initial env contract for local runtime configuration.
  - Add tracked `.env.example` with documented defaults and comments.
  - Ensure `.env` stays ignored from source control.
  - Include base variables:
    - `APP_HOST` (`127.0.0.1`)
    - `APP_PORT` (`5284`)
    - `PREVIEW_PORT` (`5285`)
    - `E2E_BASE_URL` (`http://127.0.0.1:5284`)
    - `VITE_STORAGE_KEY` (`electrical-plan-editor.state`)
- Out:
  - Production secret management.
  - Runtime feature flag framework.

# Acceptance criteria
- `.env.example` exists and documents supported variables/defaults.
- `.env` is not tracked by git.
- Contract naming is consistent with Vite/Playwright/runtime usage.
- Setup remains backward compatible when `.env` is absent.

# Priority
- Impact: High (baseline for all env-driven behavior).
- Urgency: High (required before implementation waves).

# Notes
- Blocks: item_070, item_071, item_072, item_073.
- Related AC: AC1.
- References:
  - `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
  - `.gitignore`
  - `README.md`

