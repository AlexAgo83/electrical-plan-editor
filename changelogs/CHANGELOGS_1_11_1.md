# Changelog (`1.11.0 -> 1.11.1`)

## Major Highlights

- Added Settings search with label highlighting, no-match feedback, and focused accessibility coverage.
- Reworked Settings into a sectioned preferences surface with a left glossary, grouped right-side settings, search match indicators, and responsive behavior.
- Persisted Modeling AI Agent panel preferences and instruction drafts so remounts no longer reset the working setup.
- Improved the AI Agent entry point so opening it also scrolls to the panel.
- Polished header and Settings layout details, including a wider desktop Settings search bar, one-column export/import actions, separator cleanup, darker section surfaces, and better top spacing for the AI provider section.
- Enhanced the update-ready button glow while keeping the temporary debug visibility override out of the release.
- Fixed CI stability around navigation labels and BOM preview behavior.

## Version 1.11.1 - Settings Navigation and AI Agent Workflow Polish

### Settings search and navigation

- Added a Settings search input that matches preference labels case-insensitively and highlights matching text without breaking label/control accessibility.
- Added empty-search restoration and no-match feedback so search does not mutate or hide settings unexpectedly.
- Added a section glossary for Settings with section jump behavior and search-mode match indicators.
- Migrated the Settings surface from scattered cards into grouped preference sections that remain scannable on desktop and usable on narrow layouts.
- Docked the Settings search in the desktop header and widened it so it uses the available toolbar space more naturally.

### Settings layout polish

- Aligned the Settings section background treatment with the left section panel theme.
- Removed unwanted extra spacing after row values by tightening the settings row grid.
- Kept export/import actions to a single column, including `Export active`, `Export selected`, `Export all`, `Export grouped BOM (XLSX)`, `Export grouped SVG`, and `Import from file`.
- Removed separators before `Test connection`, `Reset current view`, and `Reset all UI preferences`.
- Added top padding to the grouped Settings decoration so the `AI provider` section no longer sits against the panel edge.

### AI Agent workflow persistence

- Persisted AI Agent panel preferences across remounts.
- Preserved AI Agent instruction text so draft work remains available after reopening the panel.
- When the `AI Agent` entry is clicked, the app now opens the screen and scrolls to the AI Agent panel.

### Header and update readiness

- Improved compact navigation labels for crowded header layouts.
- Added a polished glow animation around the update-ready button.
- Removed the temporary hardcoded update-button debug visibility before release prep.

### CI and regression hardening

- Fixed navigation-related CI coverage and stabilized the BOM preview assertion.
- Added focused regression coverage for Settings search, section navigation, grouped rendering, responsive behavior, AI Agent persistence, and compact navigation labels.

## Validation and Regression Evidence

- `npm run -s ci:blocking`
