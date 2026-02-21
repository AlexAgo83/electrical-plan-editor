## item_071_env_validation_fallback_and_error_handling - Env Validation Fallback and Error Handling
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: Defensive Configuration Safety
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Env support without strong validation introduces ambiguous startup behavior when values are malformed (non-numeric ports, out-of-range inputs, invalid URLs).

# Scope
- In:
  - Define parsing/validation rules for env-backed numeric values.
  - Define deterministic fallback/error policy for invalid values.
  - Validate `VITE_STORAGE_KEY` fallback to default namespace.
  - Keep browser-exposed env usage explicit and client-safe.
- Out:
  - Generic schema validator framework rollout.
  - Secret management beyond current local baseline.

# Acceptance criteria
- Invalid `APP_PORT`/`PREVIEW_PORT` input follows documented deterministic behavior.
- Invalid or absent `VITE_STORAGE_KEY` falls back to `electrical-plan-editor.state`.
- Startup behavior is consistent across shells/OS.
- No accidental leakage pattern beyond intended `VITE_*` exposure.

# Priority
- Impact: High (stability and supportability).
- Urgency: High once env resolution is introduced.

# Notes
- Dependencies: item_069, item_070.
- Blocks: item_073.
- Related AC: AC4, AC6, AC7, AC8.
- References:
  - `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
  - `vite.config.ts`
  - `src/adapters/persistence/localStorage.ts`
  - `README.md`

