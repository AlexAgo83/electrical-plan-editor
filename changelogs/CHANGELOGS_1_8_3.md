# Changelog (`1.8.2 -> 1.8.3`)

## Major Highlights

- Moved the quick entity navigation strip above the network summary so entity switching is immediately available before the canvas.
- Added a docked header version of the entity navigation that appears after the original strip scrolls under the sticky header.
- Stabilized the docked navigation across scroll and responsive breakpoints to avoid flicker, overlap, and theme mismatches.

## Version 1.8.3 - Docked Entity Navigation

### Network Summary Navigation

- Repositioned `Catalog`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires` above the `Network summary` panel.
- Added a header-docked entity navigation strip for Modeling and Analysis when the source navigation scrolls out of view.
- Kept the docked navigation wired to the same active sub-screen state and entity counts as the source strip.
- Preserved the source navigation in the document for normal reading order and regression coverage.

### Header and Responsive Behavior

- Forced `Settings` and `Ops & Health` into compact icon mode while the header navigation slot is active.
- Removed the extra docked-navigation panel frame so only the navigation buttons consume header space.
- Hid entity labels and counts at tighter breakpoints to keep the header from overlapping.
- Kept the docked header slot mounted and toggled visibility instead of remounting it, preventing layout flicker near thresholds.

### Stability and Theme Polish

- Marked the source quick navigation explicitly so scroll tracking does not confuse it with the header copy.
- Memoized the dock threshold in document coordinates and added hysteresis so the docked strip remains stable during small scroll movements.
- Reused existing `filter-chip` theme styles for the docked controls instead of hard-coded colors.
- Updated regression coverage for source ordering, header docking, and navigation behavior.

## Validation and Regression Evidence

- `npm run -s ci:blocking`
