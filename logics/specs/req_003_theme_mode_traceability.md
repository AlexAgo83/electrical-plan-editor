## req_003_theme_mode_traceability - Acceptance Criteria Traceability
> Request: `req_003_theme_mode_switch_normal_dark`
> Last updated: 2026-02-21

# Traceability Matrix
- AC1: Users can switch between `normal` and `dark` from workspace UI.
  - Evidence:
    - `src/app/App.tsx` (persistent header switch + settings control)
    - `src/tests/app.ui.theme.spec.tsx`

- AC2: Theme preference is persisted and restored.
  - Evidence:
    - `src/app/hooks/useUiPreferences.ts`
    - `src/tests/app.ui.theme.spec.tsx`

- AC3: Main screens render coherently in dark mode.
  - Evidence:
    - `src/app/styles/base.css` (`.app-shell.theme-dark` token overrides)
    - `src/app/styles/workspace.css`
    - `src/app/styles/tables.css`
    - `src/app/styles/canvas.css`
    - `src/app/styles/validation-settings.css`

- AC4: Focus/selected/warning/error states remain distinguishable.
  - Evidence:
    - `src/app/styles/base.css` (`:focus-visible`, dark-mode status + selection overrides)
    - `src/tests/app.ui.theme.spec.tsx`

- AC5: Theme toggle does not mutate domain entities.
  - Evidence:
    - `src/store/reducer/uiReducer.ts`
    - `src/tests/app.ui.theme.spec.tsx`

- AC6: Automated tests cover toggle behavior and restore logic.
  - Evidence:
    - `src/tests/app.ui.theme.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
    - `tests/e2e/smoke.spec.ts`
