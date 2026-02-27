## req_072_replace_system_modals_with_styled_app_dialogs - Replace system modals with styled in-app dialogs
> From version: 0.9.13
> Understanding: 98% (the ask is to stop using browser/system confirmation dialogs and use styled app dialogs aligned with onboarding modal UX)
> Confidence: 95% (scope is clear and mostly UI orchestration with existing modal patterns)
> Complexity: Medium
> Theme: UX consistency, accessibility, and deterministic modal behavior
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- Current destructive/sensitive actions still rely on browser system modals (`window.confirm`), creating inconsistent UI/UX versus the product style.
- Users want all confirmation interactions to use a styled modal experience similar to onboarding.
- The modal layer should feel cohesive, theme-aware, and accessible across screens.

# Context
Current code uses system confirmation dialogs at multiple call sites:
- `src/app/AppController.tsx`
  - regenerate 2D layout when manual positions exist,
  - catalog CSV import confirmation when catalog is non-empty,
  - create empty workspace replacement confirmation.
- `src/app/hooks/useWorkspaceHandlers.ts`
  - delete network confirmation,
  - reset sample network confirmation,
  - replace current workspace confirmation before recreating sample variants.

Current app already includes a styled modal implementation:
- `src/app/components/onboarding/OnboardingModal.tsx`

This request is to align all system confirmations with an app-level modal pattern.

# Objective
- Replace system confirmation modals with styled, reusable in-app confirmation dialogs.
- Keep existing business semantics unchanged (same guard points, same outcome on confirm/cancel).
- Ensure dialog behavior is accessible and consistent with current modal patterns.

# Default decisions (V1)
- Dialog model:
  - Create one reusable confirmation modal primitive (`ConfirmDialog`) for app-wide use.
  - Reuse onboarding modal visual language and interaction standards (overlay, panel, buttons, focus behavior).
- Invocation model:
  - Replace all `window.confirm` call sites in app code with promise/callback-based confirm flow.
  - Only one confirmation dialog is active at a time (queue or reject concurrent requests deterministically).
- Content model:
  - Title + message + optional severity/variant (`info`, `warning`, `danger`) for visual emphasis.
  - Primary action label defaults to `Confirm`; secondary label defaults to `Cancel`.
- Accessibility:
  - `role="dialog"` + `aria-modal="true"` with labeled title/message.
  - Focus trap, Escape to cancel, deterministic focus restore to opener.
- Non-stylable browser-native prompts:
  - Browser-managed prompts that cannot be custom-styled (for example PWA install prompt API) remain native and out of scope.

# Functional scope
## A. Shared styled confirmation dialog primitive (high priority)
- Add a reusable dialog component with:
  - portal/layered render,
  - backdrop dismiss behavior (configurable),
  - keyboard handling (Escape cancel),
  - focus trap and focus return.
- Provide API for:
  - title/message,
  - action labels,
  - visual intent (`warning`/`danger`),
  - optional disable backdrop dismiss per action risk profile.

## B. Replace all `window.confirm` usage in workspace flows (high priority)
- Replace current confirmation paths in:
  - `src/app/AppController.tsx`
  - `src/app/hooks/useWorkspaceHandlers.ts`
- Maintain exact current decisions and side effects:
  - cancel path: no mutation,
  - confirm path: execute existing mutation/dispatch flow.

## C. Theming and visual consistency (medium-high priority)
- Ensure dialog styling follows active theme tokens and remains legible in all supported themes.
- Keep buttons/iconography consistent with existing action button language used in workspace UI.

## D. Accessibility and interaction resilience (medium-high priority)
- Keep modal semantics compatible with existing shell focus-detection logic.
- Ensure no regression with keyboard navigation and drawer/overlay interactions.
- Preserve deterministic behavior under rapid user interactions (double click, repeated trigger).

## E. Regression and migration safety (medium priority)
- No behavior regression in destructive and replace confirmations.
- Remove direct `window.confirm` usage from app flow code paths covered by this request.
- Keep any unavoidable browser-native prompts explicitly documented as exceptions.

# Non-functional requirements
- Confirmation UX must be consistent across the product.
- No deadlocks in modal orchestration (dialog always closable by Cancel/Escape unless intentionally locked).
- Minimal render/perf impact when no dialog is active.

# Validation and regression safety
- Add/extend UI integration tests covering:
  - cancel/confirm branches for each migrated flow,
  - focus trap + Escape close + focus restore for styled confirmation dialogs,
  - keyboard and click interactions for modal actions.
- Add a guard test or static assertion to prevent new `window.confirm` usage in `src/app` (except explicit allowlisted exceptions if needed).
- Re-run standard quality matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:ui-modularization`
  - `npm run -s quality:store-modularization`
  - `npm run -s quality:pwa`
  - `npm run -s test:ci`
  - `npm run -s test:e2e`

# Acceptance criteria
- AC1: All current app-level confirmation flows previously using `window.confirm` are replaced by styled in-app dialogs.
- AC2: Confirm/cancel outcomes remain behaviorally identical to current implementation.
- AC3: Dialogs are theme-consistent and visually aligned with onboarding modal design language.
- AC4: Dialogs are accessible (focus trap, Escape cancel, proper ARIA semantics, focus restore).
- AC5: No regression in workspace shell overlays, navigation, and mutation flows.
- AC6: Browser-native prompts that are technically non-stylable are explicitly documented and excluded from this request scope.

# Out of scope
- Replacing browser APIs that are inherently native-controlled and non-stylable (e.g. platform install prompt UI).
- Redesigning onboarding modal content itself.
- Changing business rules or mutation semantics behind confirmation actions.

# References
- `src/app/AppController.tsx`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/app/components/onboarding/OnboardingModal.tsx`
- `src/app/hooks/useWorkspaceShellChrome.ts`
