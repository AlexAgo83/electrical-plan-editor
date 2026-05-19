# Changelog (`1.6.8 -> 1.7.0`)

## Major Highlights

- Added a connector physical layout editor for catalog-backed connector geometry.
- Added connector keying shape and color controls so physical views can model orientation cues directly.
- Added reusable physical connector rendering for analysis and catalog workflows.
- Polished catalog analysis and network summary chrome for clearer, theme-aligned inspection.
- Added Teams release notification automation, including a manual workflow trigger for validation.

## Version 1.7.0 - Connector Physical Layout Editor

### Connector Physical Layout

- Connector catalog items now support a physical layout definition with cavity positions, layout metadata, and visual defaults.
- The catalog workspace includes a dedicated connector layout editor for arranging cavities and previewing the physical connector face.
- Connector previews render cavity labels, connector outlines, and keying information consistently across the editor and analysis surfaces.
- Layout normalization keeps stored connector geometry stable when catalog records are created or updated.

### Keying and Visual Identification

- Connector layouts now support keying shape selection and keying color controls.
- Physical connector previews expose keying cues to make orientation and connector identity easier to verify.
- Connector layout styles were moved into a focused stylesheet to keep the form chrome maintainable.

### Catalog and Analysis Polish

- Catalog analysis and summary panels received theme-aligned table and toolbar polish.
- Catalog material panel styling now matches the rest of the application surface treatment.
- Network summary navigation tests were updated for the refreshed chrome.

### Release Automation

- Added a Teams release notification workflow for release publication updates.
- Added a manual dispatch path so the Teams notification can be tested without publishing a release.

## Validation and Regression Evidence

- `npm run -s ci:blocking`
