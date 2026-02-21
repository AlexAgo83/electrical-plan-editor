## req_005_ui_modularization_traceability - Acceptance Criteria Traceability
> Request: `req_005_large_ui_files_split_and_hook_extraction`
> Last updated: 2026-02-21

# Traceability Matrix
- AC1: `App.tsx` is reduced to orchestration/composition role.
  - Evidence:
    - `src/app/App.tsx` (delegates major workspace sections to extracted components/hooks)
    - `src/app/components/InspectorContextPanel.tsx`
    - `src/app/components/NetworkSummaryPanel.tsx`
    - `src/app/components/WorkspaceNavigation.tsx`

- AC2: UI behavior remains equivalent across major workflows.
  - Evidence:
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/app.ui.validation.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
    - `tests/e2e/smoke.spec.ts`

- AC3: Canvas/navigation/preferences logic extracted into dedicated hooks.
  - Evidence:
    - `src/app/hooks/useKeyboardShortcuts.ts`
    - `src/app/hooks/useUiPreferences.ts`
    - `src/app/hooks/useWorkspaceNavigation.ts`

- AC4: Styles are split into modular stylesheets.
  - Evidence:
    - `src/app/styles/base.css`
    - `src/app/styles/workspace.css`
    - `src/app/styles/forms.css`
    - `src/app/styles/tables.css`
    - `src/app/styles/canvas.css`
    - `src/app/styles/validation-settings.css`

- AC5: UI integration tests are split by feature area.
  - Evidence:
    - `src/tests/app.ui.navigation-canvas.spec.tsx`
    - `src/tests/app.ui.validation.spec.tsx`
    - `src/tests/app.ui.settings.spec.tsx`
    - `src/tests/app.ui.list-ergonomics.spec.tsx`
    - `src/tests/helpers/app-ui-test-utils.tsx`

- AC6: Scoped UI file-size policy is enforced (with documented exceptions) and CI gates pass.
  - Evidence:
    - `scripts/quality/check-ui-modularization.mjs`
    - `npm run quality:ui-modularization`
    - `.github/workflows/ci.yml`

# Documented Exception
- `src/app/App.tsx` remains above 500 lines.
  - Justification: the file is now an orchestration-heavy shell with extracted major sections/hooks, but still aggregates remaining form blocks.
  - Control: guarded by split integration tests + e2e and explicit exception tracking in `scripts/quality/check-ui-modularization.mjs`.
