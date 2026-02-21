## item_072_docs_and_onboarding_update_for_environment_setup - Docs and Onboarding Update for Environment Setup
> From version: 0.3.0
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Low
> Theme: Developer Experience Documentation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without explicit docs, env support remains underused and can create confusion around defaults, overrides, and safety constraints.

# Scope
- In:
  - Update onboarding docs for `.env` creation from `.env.example`.
  - Document all supported variables and defaults.
  - Document fallback behavior for invalid values.
  - Document `VITE_*` safety rule (no secrets in client-exposed env).
  - Update local run examples with default `127.0.0.1:5284`.
- Out:
  - Full docs site redesign.
  - Non-English localization effort.

# Acceptance criteria
- README/run instructions include env setup and defaults.
- Docs explain host/port/e2e/storage key behavior clearly.
- Safety guidance for client-visible env variables is explicit.
- New contributors can run app/tests with deterministic defaults.

# Priority
- Impact: Medium-high (onboarding and team consistency).
- Urgency: Medium after technical env behavior is implemented.

# Notes
- Dependencies: item_069, item_070, item_071.
- Blocks: item_073.
- Related AC: AC6, AC8.
- References:
  - `logics/request/req_012_environment_configuration_and_runtime_defaults.md`
  - `README.md`
  - `.env.example`
  - `CONTRIBUTING.md`

