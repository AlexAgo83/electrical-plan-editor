## item_046_app_helpers_types_and_validation_hook_extraction - App Helpers, Types and Validation Hook Extraction
> From version: 0.2.0
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Core Extraction Wave
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`App.tsx` still embeds pure helpers, local UI types, and large validation-model logic in one file, which increases cognitive load and slows safe review.

# Scope
- In:
  - Extract pure app helpers into dedicated utility modules.
  - Extract local app UI types into dedicated type modules.
  - Extract validation computation/navigation/filtering model into a dedicated hook with explicit API.
  - Keep existing behavior and issue semantics unchanged.
- Out:
  - Network lifecycle orchestration extraction.
  - Entity form controller extraction.
  - Canvas interaction controller extraction.

# Acceptance criteria
- Helper/type modules are consumed by `App.tsx` without behavior drift.
- Validation model logic is isolated in a dedicated hook with clear inputs/outputs.
- Validation filters, counts, cursor behavior, and issue navigation remain functionally equivalent.
- Resulting modules are testable and free of circular import patterns.

# Priority
- Impact: Very high (largest early reduction of `App.tsx` complexity).
- Urgency: High immediately after baseline freeze.

# Notes
- Dependencies: item_045.
- Blocks: item_048, item_049.
- Related AC: AC2, AC3, AC6.
- References:
  - `logics/request/req_008_app_orchestration_shell_completion_and_final_line_budget.md`
  - `src/app/App.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
  - `src/tests/helpers/app-ui-test-utils.tsx`
