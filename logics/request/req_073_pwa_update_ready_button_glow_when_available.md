## req_073_pwa_update_ready_button_glow_when_available - Add glowy emphasis when `Update ready` is available
> From version: 0.9.13
> Understanding: 100% (scope and delivered behavior are confirmed: `Update ready` now carries a dedicated glow emphasis state when update is available)
> Confidence: 99% (implemented styling/state contract is covered by targeted PWA header-action tests)
> Complexity: Low
> Theme: PWA update visibility and action discoverability
> Reminder: Update Understanding/Confidence and references when editing this doc.

# Needs
- The `Update ready` action can be missed in the header.
- Users want stronger visual attention when an update is available.
- The effect should be styled, intentional, and consistent with current theme system.

# Context
The update CTA is rendered in the app header:
- `src/app/components/workspace/AppHeaderAndStats.tsx`
  - button label: `Update ready`
  - class: `header-update-toggle`

Styling currently lives in base/theme styles:
- `src/app/styles/base/base-foundation.css`
- `src/app/styles/base/base-components.css`
- `src/app/styles/base/base-theme-overrides/...` (theme-specific overrides)

Update availability is driven by PWA events handled in shell hooks:
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/pwa/registerServiceWorker.ts`

# Objective
- Add a glowy visual effect to the `Update ready` button only when that button is present (i.e., update is available).
- Keep behavior/functionality unchanged (click still triggers update apply flow).

# Default decisions (V1)
- Glow activation:
  - Active only for the `Update ready` state (never for normal header buttons).
- Visual treatment:
  - soft outer glow + subtle pulse to draw attention without flashing aggressively.
  - no layout shift (use box-shadow/filter/opacity/transform-safe animation only).
- Motion accessibility:
  - respect `prefers-reduced-motion: reduce` by disabling pulse animation and keeping static glow.
- Theme compatibility:
  - glow color derives from existing update button/accent tokens and remains legible in light/dark/custom themes.
- Interaction:
  - hover/focus states remain clear and not overridden by the glow.

# Functional scope
## A. Header button visual state (high priority)
- Introduce a dedicated style state/class for update availability glow (e.g. modifier on `header-update-toggle`).
- Ensure the glow appears only when `Update ready` button is rendered.

## B. Theming and contrast (high priority)
- Verify glow and button contrast across supported themes, including dark and branded theme variants.
- Avoid over-saturated glow that reduces text readability.

## C. Accessibility and ergonomics (medium-high priority)
- Keep keyboard focus ring visible and distinguishable from glow.
- Respect reduced-motion preference.
- Ensure the glow does not create seizure-risk patterns (no rapid flashing).

## D. Non-regression (medium priority)
- No regression to:
  - PWA update event handling,
  - click behavior (`onApplyPwaUpdate`),
  - header layout spacing/alignment.

# Non-functional requirements
- Effect must be lightweight (no expensive paint loops beyond simple CSS animation).
- Should not introduce jitter/reflow in the header.

# Validation and regression safety
- Extend PWA header action tests to assert glow-state class/attribute when update is available.
- Keep existing behavior test:
  - update button appears on `app:pwa-update-available`,
  - clicking it clears the action state.
- Run quality/test matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s quality:pwa`
  - `npm run -s test -- src/tests/pwa.header-actions.spec.tsx`
  - `npm run -s test:ci`

# Acceptance criteria
- AC1: When update is available and `Update ready` is shown, the button has a visible glowy emphasis.
- AC2: Glow effect is disabled or non-animated under `prefers-reduced-motion: reduce`.
- AC3: Glow remains readable and consistent across supported themes.
- AC4: Clicking `Update ready` keeps existing behavior (apply update flow) with no regression.
- AC5: Header layout remains stable with no visual jump introduced by the effect.

# Out of scope
- Redesign of the whole header action system.
- New PWA update logic or service worker lifecycle changes.
- Changing button label/content beyond current `Update ready` text.

# Delivery status
- Status: delivered.
- Task: `logics/tasks/task_070_super_orchestration_closure_validation_for_req_070_to_req_073.md`.

# Backlog
- `logics/backlog/item_397_req_073_pwa_update_ready_glow_closure_validation_and_traceability.md` (done)

# References
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/pwa/registerServiceWorker.ts`
- `src/app/styles/base/base-foundation.css`
- `src/app/styles/base/base-components.css`
- `src/tests/pwa.header-actions.spec.tsx`
