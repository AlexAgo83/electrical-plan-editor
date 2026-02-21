## req_012_environment_configuration_and_runtime_defaults - Environment Configuration and Runtime Defaults
> From version: 0.3.0
> Understanding: 100%
> Confidence: 98%
> Complexity: Medium
> Theme: Configuration Reliability and Developer Experience
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Add environment-based configuration for project runtime settings.
- Introduce `.env.example` to document required/optional variables and defaults.
- Define a configurable dev server port with default value `5284`.
- Add host/preview/E2E URL configurability to remove hardcoded local runtime values.
- Add configurable persistence storage key for local data isolation when needed.
- Keep startup behavior deterministic when env variables are absent or invalid.
- Improve onboarding clarity by documenting environment setup expectations.

# Context
The project currently runs with implicit runtime defaults and no explicit environment contract. This creates avoidable friction when onboarding, sharing local setups, or aligning team-wide development behavior.

This request introduces a lightweight environment configuration layer focused on local development reliability, with a clear default behavior and explicit documentation.

Architecture references to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`
- `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
- `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`

## Objectives
- Add a documented `.env` configuration entrypoint with a committed `.env.example`.
- Make dev server port configurable through env, defaulting to `5284`.
- Externalize other local runtime constants (`host`, `preview port`, `E2E base URL`) into env-backed defaults.
- Make browser persistence key configurable via `VITE_STORAGE_KEY` with a safe default.
- Ensure robust fallback semantics when env values are missing or malformed.
- Keep local dev and CI pipelines stable after configuration changes.

## Functional Scope
### Environment file setup
- Add support for project-level `.env` runtime configuration for local development.
- Add `.env.example` with clear comments/defaults for supported variables.
- Keep `.env` excluded from git and `.env.example` tracked.
- Initial supported variables:
  - `APP_HOST` (default `127.0.0.1`)
  - `APP_PORT` (default `5284`)
  - `PREVIEW_PORT` (default `5285`)
  - `E2E_BASE_URL` (default `http://127.0.0.1:5284`)
  - `VITE_STORAGE_KEY` (default `electrical-plan-editor.state`)

### Dev server port configuration
- Introduce dedicated env variable for dev server port (`APP_PORT`).
- Default port must be `5284` when variable is not set.
- If variable is invalid (non-numeric/out-of-range), apply deterministic fallback behavior (default or explicit startup error, but documented and tested).
- Align `APP_HOST` and `PREVIEW_PORT` usage with Vite dev/preview commands.
- Align `E2E_BASE_URL` with Playwright runtime and keep it coherent with host/port defaults.

### Runtime validation and safety
- Define parsing and validation rules for env-backed numeric values.
- Keep behavior deterministic across OS/shell differences.
- Ensure configuration resolution does not leak non-public variables into browser runtime unintentionally.
- Keep `VITE_*` exposure explicit and limited to non-sensitive client-safe values.
- Explicitly document that UI preference defaults (theme/snap) remain application settings, not env-driven toggles.

### Persistence storage key configuration
- Add optional `VITE_STORAGE_KEY` override for local storage namespace isolation.
- Preserve default key `electrical-plan-editor.state` when variable is absent/invalid.
- Keep backward compatibility behavior explicit when storage key changes (fresh namespace vs migration expectations).

### Documentation and onboarding
- Document how to create `.env` from `.env.example`.
- Document supported variables, defaults, and validation behavior.
- Update run instructions to reflect default dev URL/port expectations.
- Document that secrets must not be stored in `VITE_*` variables.

## Acceptance criteria
- AC1: Project includes `.env.example` with documented variables and defaults.
- AC2: Running dev server without `.env` starts on port `5284`.
- AC3: Setting env port overrides the default and starts server on configured value.
- AC4: Invalid env port input follows documented deterministic behavior.
- AC5: `APP_HOST`, `PREVIEW_PORT`, and `E2E_BASE_URL` are applied by dev/preview/E2E tooling with deterministic defaults.
- AC6: `VITE_STORAGE_KEY` can override local storage namespace while preserving default behavior when absent.
- AC7: Existing scripts (`dev`, `build`, `test`, `lint`, `typecheck`) remain operational.
- AC8: Documentation clearly explains env setup, defaults, and `VITE_*` safety constraints.

## Non-functional requirements
- Keep configuration behavior simple and predictable.
- Avoid introducing secrets into source-controlled files.
- Avoid placing secrets in client-exposed env variables (`VITE_*`).
- Maintain compatibility with existing quality gates: `lint`, `typecheck`, `test:ci`, `test:e2e`.

## Out of scope
- Production secret management and external vault integration.
- Multi-environment deployment matrix beyond local dev baseline.
- Runtime feature-flag framework rollout.

# Backlog
- To create from this request:
  - `item_069_env_contract_and_example_file_bootstrap.md`
  - `item_070_dev_server_port_env_resolution_and_default_5284.md`
  - `item_071_env_validation_fallback_and_error_handling.md`
  - `item_072_docs_and_onboarding_update_for_environment_setup.md`
  - `item_073_env_configuration_regression_and_ci_stability_checks.md`

# References
- `package.json`
- `vite.config.ts`
- `playwright.config.ts`
- `README.md`
- `.gitignore`
- `index.html`
- `src/adapters/persistence/localStorage.ts`
