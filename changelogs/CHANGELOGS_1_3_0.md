# Changelog (`1.2.1 → 1.3.0`)

## Major Highlights

- Delivered the full **req_097 -> req_099** bundle:
  - deterministic hover descriptions for interactive controls,
  - settings information architecture reorder + EN/FR i18n foundation,
  - onboarding final slide for key settings overview.
- Added app-wide runtime locale switching (`English` default, `Français` optional) with persisted language preference.
- Expanded French translation coverage across core workspace screens, settings panels, validation, modeling filters/actions, and network summary/inspector surfaces.
- Refined canvas/settings defaults and guardrails for label rendering behavior (auto/manual rotation coupling and safer baseline presets).
- Hardened CI quality gates by modularizing oversized UI test suites while preserving full integration coverage.

## Product and UX Changes

### Accessibility and Hover Descriptions (req_097)

- Added deterministic hover descriptions (`title` fallback policy) for:
  - buttons,
  - selects,
  - options,
  - disabled interactive controls.
- Preserved explicit author-provided `title` values (fallbacks do not override intentional labels).

### Settings IA + EN/FR i18n (req_098)

- Reordered settings so **Global preferences** appears before **Action bar and shortcuts**.
- Added a styled **Language** selector in **Global preferences** (before the panel action separator).
- Added runtime locale switch:
  - `English` (`en`) as default,
  - `Français` (`fr`) as alternate locale.
- Locale preference is persisted and restored on reload.
- French label strategy includes compact wording for dense table/filter labels to avoid column-width regressions.

### Translation Coverage (1.3.0 scope)

- Added/expanded FR translations across:
  - settings panels (including language, import/export, what’s new panel chrome),
  - validation screen and validation controls,
  - modeling filters, labels, and action buttons,
  - operational/health modal content,
  - inspector context, 2D render controls, analysis and route preview panels,
  - network summary panel chrome (outside raw changelog markdown content).
- Changelog markdown entries remain source-authored content.

### Onboarding Final Slide (req_099)

- Added a final onboarding slide dedicated to key settings configuration.
- Settings slide now uses the settings-button icon.
- CTA layout aligned with prior slides:
  - `Open Settings` on the left,
  - `Finish` restored on the right.
- Kept onboarding navigation/focus behavior consistent with existing modal accessibility rules.

### Canvas and Settings Defaults (follow-up alignment)

- Updated default canvas/settings behavior:
  - `Show segment names` default OFF,
  - `Show segment lengths by default` ON,
  - `Node shape target size (%)` default `70`,
  - `Auto segment label rotation` default ON,
  - `2D label rotation` displayed after auto-rotation and disabled while auto-rotation is ON,
  - `Label stroke mode` default `Light`,
  - `2D label size` default `Small`.

## Engineering Quality and Regression Coverage

- Split oversized UI integration suites to satisfy UI modularization guardrails:
  - extracted locale/settings assertions to `app.ui.settings-locale.spec.tsx`,
  - extracted selected-callout canvas assertions to `app.ui.settings-canvas-callouts.spec.tsx`.
- Updated explicit CI UI-lane contract to include the new `app.ui.*` spec files.
- Revalidated with CI-equivalent pipeline (`npm run ci:local`):
  - logics lint,
  - lint,
  - typecheck,
  - segmentation contract,
  - UI/store quality gates,
  - fast + UI + e2e tests,
  - production build,
  - PWA artifact gate.
