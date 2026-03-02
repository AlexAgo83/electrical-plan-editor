## req_097_hover_descriptions_for_buttons_selects_and_options - Hover descriptions for buttons, selects, and options
> From version: 1.2.1
> Status: Done
> Understanding: 100% (implementation and validation completed)
> Confidence: 99%
> Complexity: Medium
> Theme: Accessibility / UI clarity
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Ensure interactive controls expose a visible hover description for desktop usage.
- Standardize hover-description behavior across `button`, `select`, and `option` surfaces.
- Include disabled controls in hover-description coverage.
- Keep current UX semantics and accessibility labels non-regressed while adding consistent hover guidance.

# Context
- The app already uses strong accessibility semantics (`aria-label`, `aria-sort`, keyboard activation, dialog focus management), but hover-description behavior is not uniform across controls.
- Several controls are icon-heavy or compact in dense tables/panels, which can reduce immediate discoverability for mouse users.
- Users requested explicit hover descriptions for all button/select/option controls to improve readability and action confidence.

# Objective
- Provide deterministic hover descriptions on all relevant interactive controls.
- Reuse existing semantic sources (labels/ARIA/text) instead of introducing copy duplication.
- Ensure the behavior remains robust for dynamic UI updates and conditional rendering.

# Scope
- In:
  - define and implement a global hover-description contract for:
    - `button`
    - `select`
    - `option`
  - guarantee every rendered control in scope has a non-empty hover description source, including disabled controls;
  - preserve explicit author-provided descriptions where already present;
  - cover dynamically mounted/updated controls (dialogs, drawers, screen switches, list refreshes);
  - add regression tests for representative control families across workspace surfaces.
- Out:
  - redesign of control labels/icons/layout;
  - rewriting business copy for all controls;
  - replacing native browser tooltip behavior with a custom tooltip system.

# Locked execution decisions
- Decision 1: The hover description mechanism is based on the native `title` attribute contract.
- Decision 2: Existing explicit `title` values always have priority and are not overwritten.
- Decision 3: For controls without explicit `title`, fallback description sources are resolved with deterministic priority:
  - `aria-label`,
  - `aria-description`,
  - associated `<label>` text (when applicable),
  - visible control text/content,
  - deterministic generic fallback text as last resort.
- Decision 4: Scope includes `button`, `select`, and `option` only for this request.
- Decision 5: Delivery is direct (no feature flag).

# Functional behavior contract
## A. Description source resolution
- For controls in scope:
  - if `title` is explicitly present and non-empty, keep it as-is;
  - otherwise compute a non-empty description using the fallback-priority chain defined in locked decisions.
- Fallback strategy must be deterministic and stable across rerenders.

## B. Runtime coverage
- Hover descriptions must apply in all major app contexts:
  - header actions,
  - workspace navigation,
  - panel/tool actions,
  - forms,
  - modal/dialog actions,
  - table action controls.
- Conditional/dynamic controls must receive a description when they appear.
- Disabled controls in scope must also expose a hover description.

## C. Non-regression constraints
- Accessible names and screen-reader semantics remain non-regressed.
- Keyboard and pointer interactions remain unchanged.
- Existing behavior for explicitly titled controls is preserved.

# Acceptance criteria
- AC1: Every rendered `button` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- AC2: Every rendered `select` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- AC3: Every rendered `option` in the app (enabled or disabled) has a non-empty hover description via explicit or computed `title`.
- AC4: Explicitly authored `title` values are never overridden by fallback generation.
- AC5: Hover-description coverage holds after dynamic UI transitions (screen switch, modal open/close, drawer open/close, conditional section rendering).
- AC6: Existing a11y/interaction semantics are non-regressed.
- AC7: `logics_lint`, `lint`, `typecheck`, and relevant tests pass.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `npm run -s lint`
- `npm run -s typecheck`
- `npm run -s test:ci:ui`
- targeted checks around:
  - representative button/select/option controls in Home, Modeling, Analysis, Validation, Settings;
  - icon-only and compact controls;
  - disabled controls across the same surfaces;
  - dynamically mounted controls (dialogs/drawers);
  - confirmation that explicit `title` is preserved.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Risks
- Auto-generated titles can produce low-value wording if fallback source priority is weak.
- Over-broad runtime instrumentation may add unnecessary DOM churn if not implemented efficiently.
- Native tooltip rendering for `option` can vary by platform/browser, so coverage must be validated pragmatically.

# Backlog
- `logics/backlog/item_478_hover_descriptions_for_buttons_selects_and_options.md`
# References
- `src/app/AppController.tsx`
- `src/app/components/workspace/AppHeaderAndStats.tsx`
- `src/app/components/WorkspaceNavigation.tsx`
- `src/app/components/layout/AppShellLayout.tsx`
- `src/app/components/workspace/ModelingPrimaryTables.tsx`
- `src/app/components/workspace/ModelingSecondaryTables.tsx`
- `src/app/components/workspace/ValidationWorkspaceContent.tsx`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useHoverDescriptionTitles.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.validation.spec.tsx`
- `src/tests/app.ui.hover-descriptions.spec.tsx`
- `logics/request/req_060_accessibility_hardening_for_interactive_network_summary_modal_focus_sortable_tables_and_validation_navigation.md`
