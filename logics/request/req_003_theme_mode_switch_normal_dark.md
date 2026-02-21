## req_003_theme_mode_switch_normal_dark - Theme Mode Switch Normal and Dark
> From version: 0.1.0
> Understanding: 98%
> Confidence: 96%
> Complexity: Medium
> Theme: UX/UI Theming
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Allow users to switch between current `Normal` mode and a new `Dark` mode.
- Keep visual consistency across workspace navigation, lists, canvas, inspector, and validation screens in both modes.
- Persist user theme preference locally and restore it on reload.

# Context
The current application exposes one visual mode only. As usage increases in long modeling sessions, users need an alternative low-luminance theme for comfort and readability in different environments.

This request introduces a deterministic theme system with explicit mode selection and full UI coverage, without changing domain behavior.

Architecture reference to preserve:
- `logics/architecture/target_reference_v1_frontend_local_first.md`

## Objectives
- Introduce a global theme mode contract (`normal`, `dark`) in app state/settings.
- Add a visible and quick theme switch action in the workspace.
- Apply mode-specific design tokens across all major UI surfaces.
- Guarantee accessibility and readability in both modes.

## Functional Scope
### Theme model and state
- Define a theme mode setting with allowed values:
  - `normal` (default, current visual mode)
  - `dark` (new mode)
- Persist selected mode in local storage and restore at app startup.
- Ensure theme updates are immediate without full page reload.

### Theme switching UX
- Add a theme switch control in the persistent workspace shell.
- Control must expose current mode and allow one-click switch.
- Theme switch must be available from all top-level sections (`Modeling`, `Analysis`, `Validation`, `Settings`).

### Visual coverage
- Apply theme tokens to:
  - app chrome (navigation, headers, panels)
  - data tables/lists and sortable headers
  - forms and inspector controls
  - validation panels and issue states
  - 2D canvas surrounding UI and overlays/legend
- Preserve visual hierarchy (`Name`, `Technical ID`, selected vs active vs warning states) in both modes.

### Accessibility and readability
- Ensure text/background contrast remains readable in both modes for primary and secondary text.
- Keep interaction affordance visible for hover/focus/selected states.
- Preserve keyboard focus visibility in both modes.

### Behavior guarantees
- Theme mode switch must not alter domain data, routing behavior, or validation rules.
- Theme mode is a UI preference only and must not affect persisted electrical model content.

## Acceptance criteria
- AC1: Users can switch between `normal` and `dark` modes from the workspace UI.
- AC2: Selected mode is persisted and restored after reload.
- AC3: All main screens/components render with coherent styling in `dark` mode.
- AC4: Focus, selected, warning, and error states remain visually distinguishable in both modes.
- AC5: Theme switch does not mutate domain entities or routing/validation outcomes.
- AC6: Automated tests cover theme toggle behavior and persistence restoration.

## Non-functional requirements
- No regression on existing workspace performance and responsiveness.
- Keep local-first behavior and persistence reliability.
- Maintain deterministic behavior of current domain logic.
- Preserve keyboard accessibility in both modes.

## Out of scope
- User-custom theme builder.
- Additional theme variants beyond `normal` and `dark`.
- Brand redesign beyond mode adaptation.

# Backlog
- To create from this request:
  - `item_020_theme_mode_state_and_persistence.md`
  - `item_021_theme_switch_control_and_workspace_integration.md`
  - `item_022_dark_mode_tokenization_and_surface_coverage.md`
  - `item_023_theme_accessibility_contrast_focus_validation.md`
  - `item_024_theme_toggle_and_persistence_test_coverage.md`

# References
- `logics/request/req_001_v1_ux_ui_operator_workspace.md`
- `logics/request/req_002_multi_network_management_and_navigation.md`
- `logics/tasks/task_003_theme_mode_orchestration_and_delivery_control.md`
- `README.md`
