# Changelog (`1.16.11 -> 1.17.0`)

## Major Highlights

- Data tables now support configurable visible columns and drag-and-drop column reordering, persisted per table in UI preferences.
- Header navigation and docked menus were tightened for compact layouts while keeping themed menu surfaces consistent.

## Patch Notes

- Added a shared `Columns` control for Modeling and Catalog tables, including Catalog items, endpoint references, and seal references.
- Persisted table column order and hidden-column preferences through the existing UI preferences store.
- Reused the existing themed menu panel styling for the column menu and docked network selector instead of local transparent menu surfaces.
- Compact header entity labels now shorten further above 99 items, and the header AI Agent entry keeps only the icon.
- Improved compact header quick-navigation spacing at the breakpoint where labels are hidden.

## Verification

- `npm run -s lint`
- `npm run -s typecheck`
- Focused suites: `configurable-table-columns`, `compact-navigation-label`

## Notes

- Builds on `1.16.11`.
