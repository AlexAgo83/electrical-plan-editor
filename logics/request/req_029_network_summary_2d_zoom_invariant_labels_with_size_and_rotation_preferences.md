## req_029_network_summary_2d_zoom_invariant_labels_with_size_and_rotation_preferences - Network Summary 2D Zoom-Invariant Labels with Size and Rotation Preferences
> From version: 0.6.2
> Understanding: 100%
> Confidence: 99%
> Complexity: Medium
> Theme: Readability-Oriented 2D Label Rendering Controls (Zoom Invariance + User Preferences)
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve readability of text labels in the 2D `Network summary` rendering by making label size insensitive to zoom level.
- Preserve label anchoring to entities while zooming/panning (labels stay attached to segments/nodes).
- Add user controls in `Settings` to choose a preferred label size mode (`small`, `normal`, `large`).
- Add user controls in `Settings` to rotate labels around their center (`0`, `20`, `45`, `90` degrees) for readability/spacing preferences.

# Context
The 2D `Network summary` rendering currently scales labels with the SVG zoom. This makes labels:
- too small when zoomed out,
- too large/overlapping when zoomed in,
- and generally inconsistent for users trying to scan topology quickly.

Users need a display-layer readability mode where labels keep a stable screen-space size while remaining visually attached to the underlying entities. In addition, users have different readability preferences (compact vs larger labels, horizontal vs angled labels), so label size and rotation should be configurable from `Settings`.

This request is a display/UX refinement:
- no topology changes,
- no data-model changes for networks,
- no change to entity positions,
- and no change to routing/selection semantics.

## Objectives
- Make 2D labels visually zoom-invariant (stable on-screen size across zoom changes).
- Keep labels anchored to the same entities while panning/zooming.
- Add persistent `Settings` preferences for label size mode (`small` / `normal` / `large`).
- Add persistent `Settings` preferences for label rotation mode (`0` / `20` / `45` / `90` degrees around center).
- Preserve theme compatibility and readability across supported themes.

## Functional Scope
### A. Zoom-invariant 2D labels (high priority)
- Apply a rendering strategy so 2D labels do **not change apparent size** when the user zooms the network view.
- Labels must remain anchored to the corresponding entities (nodes/segments) while panning/zooming.
- The zoom-invariant behavior should cover the primary 2D labels displayed in `Network summary` (segment labels/length labels and node labels, where applicable).
- The solution should preserve label legibility stroke/contrast behavior across themes.

### B. Label size preference in Settings (high priority)
- Add a new `Settings` option for 2D label size with exactly three modes:
  - `Small`
  - `Normal`
  - `Large`
- The selected mode should affect zoom-invariant label rendering consistently.
- Default mode should be `Normal` unless current UX conventions require otherwise.
- The setting should be persisted alongside other UI preferences and included in UI preference reset behavior.

### C. Label rotation preference in Settings (high priority)
- Add a new `Settings` option for 2D label rotation with exactly four values:
  - `0°`
  - `20°`
  - `45°`
  - `90°`
- Rotation must be applied **around the label center** (not top-left origin drift).
- Rotation should affect the relevant 2D labels consistently and remain compatible with zoom-invariant sizing.
- The setting should be persisted alongside other UI preferences and included in UI preference reset behavior.

### D. Runtime behavior and defaults (medium priority)
- Label size and rotation preferences should apply immediately after user changes them in `Settings`.
- Defaults:
  - size mode: `Normal`
  - rotation: `0°`
- Existing users should receive sensible defaults without breaking stored preferences or causing invalid values.
- If preference schema changes require normalization/migration, it must be documented and tested.

### E. Validation and delivery traceability (closure target)
- Add/adjust regression tests for:
  - Settings preference wiring
  - 2D label rendering behavior (including class/style/state changes used to implement zoom invariance)
  - preference persistence/normalization (if touched)
- Document decisions and acceptance-criteria traceability in Logics artifacts.

## Non-functional requirements
- Preserve current interaction performance of the 2D rendering (avoid expensive per-frame layout work where possible).
- Keep label rendering stable during zoom and pan (no visible jitter due to anchoring math).
- Preserve theme compatibility and readability across all supported themes, including composed themes.
- Keep implementation maintainable and explicit (prefer CSS/SVG transforms + clear preference wiring over opaque rendering hacks).

## Validation and regression safety
- Targeted tests (minimum):
  - `src/tests/app.ui.navigation-canvas.spec.tsx` (2D rendering preference behavior / label rendering classes if impacted)
  - `src/tests/app.ui.settings.spec.tsx` (Settings controls + persistence wiring)
  - any `useUiPreferences` tests if schema/normalization changes are introduced
- Visual/build checks (recommended):
  - `npm run build`
  - manual verification across zoom levels and themes in `Network summary`
- Closure validation (recommended):
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ci`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run quality:pwa`
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`

## Acceptance criteria
- AC1: 2D labels in `Network summary` keep a stable visual size when zooming (zoom-invariant labels).
- AC2: Labels remain visually anchored to their entities while panning/zooming.
- AC3: `Settings` includes a 2D label size preference with `Small` / `Normal` / `Large`, persisted and applied at runtime.
- AC4: `Settings` includes a 2D label rotation preference with `0° / 20° / 45° / 90°`, applied around label center, persisted and applied at runtime.
- AC5: Defaults are `Normal` size and `0°` rotation, with safe handling of existing/stale preference values if normalization is needed.
- AC6: Theme compatibility, regression coverage, and validation suites / Logics lint pass.

## Out of scope
- Changing network data schema to store per-entity label rotation/size.
- Per-label manual editing/dragging of label positions.
- Advanced typography controls beyond the requested size and rotation modes (font family, per-type spacing, opacity, etc.).
- Rewriting the 2D renderer architecture beyond what is needed to support zoom-invariant labels and preferences.

# Backlog
- To be created from this request (proposed):
  - Zoom-invariant 2D label rendering implementation
  - Settings preference wiring (size + rotation) and UI preference persistence/normalization
  - Theme/readability verification and regression tests for 2D label behavior
  - Closure validation + AC traceability

# References
- `src/app/components/NetworkSummaryPanel.tsx`
- `src/app/styles/canvas/canvas-diagram-and-overlays.css`
- `src/app/components/workspace/SettingsWorkspaceContent.tsx`
- `src/app/hooks/useUiPreferences.ts`
- `src/app/hooks/useWorkspaceHandlers.ts`
- `src/tests/app.ui.navigation-canvas.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`

