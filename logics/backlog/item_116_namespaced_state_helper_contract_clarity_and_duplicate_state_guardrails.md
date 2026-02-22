## item_116_namespaced_state_helper_contract_clarity_and_duplicate_state_guardrails - Namespaced State Helper Contract Clarity and Duplicate-State Guardrails
> From version: 0.5.4
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Make Namespaced Helper Intent Unambiguous
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Wave-5 introduced namespaced forms/canvas helpers, but `useAppControllerNamespacedFormsState()` and `useAppControllerNamespacedCanvasState()` allocate fresh local state internally. Their names suggest they adapt existing state, which creates a future misuse risk (accidental duplicate local state trees).

# Scope
- In:
  - Clarify namespaced helper API contracts (builder/adaptor vs state-allocating hook) to avoid accidental duplicate state allocation.
  - Rename/remove/deprecate misleading wrappers or add guardrails/documentation as needed.
  - Preserve current `AppController` behavior and typing ergonomics.
- Out:
  - Broad rearchitecture of forms/canvas state hooks.
  - New state-management framework changes.

# Acceptance criteria
- Namespaced helper intent is explicit and difficult to misuse.
- `AppController` behavior remains unchanged while using safe helper contracts.
- Type exports/usages remain coherent for controller-domain hooks.
- Follow-up reviewers can distinguish builder helpers from state-allocating hooks at a glance.

# Priority
- Impact: Medium (maintainability + future refactor safety).
- Urgency: Medium (not a current runtime bug, but a likely source of future regressions).

# Notes
- Dependencies: wave-5 namespaced helpers.
- Blocks: item_118.
- Related AC: AC5, AC6, AC7.
- References:
  - `logics/request/req_019_app_controller_post_wave_5_hardening_accessibility_loading_and_contract_clarity.md`
  - `src/app/hooks/useAppControllerNamespacedFormsState.ts`
  - `src/app/hooks/useAppControllerNamespacedCanvasState.ts`
  - `src/app/hooks/useEntityFormsState.ts`
  - `src/app/hooks/useCanvasState.ts`
  - `src/app/AppController.tsx`
