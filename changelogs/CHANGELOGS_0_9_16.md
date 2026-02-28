# Changelog (`0.9.12 → 0.9.16`)

## Major Highlights

- Delivered the full **req_070 -> req_076** feature queue:
  - Home screen workspace/changelog redesign,
  - analysis `Go to` actions for connector and splice occupancy rows,
  - styled confirmation dialogs for system and destructive actions,
  - glowing `Update ready` header action,
  - Network Scope recent-changes panel powered by undo history,
  - `Ctrl/Cmd+S` override for active-network export/save flow.
- Introduced a consistent **styled confirmation modal** experience across delete and safety-sensitive flows.
- Improved **Network Scope operator visibility** with a dedicated `Recent changes` panel (active network only, auto-hidden when empty).
- Hardened **CI reliability and UI modularization**:
  - segmented UI lane contract maintenance,
  - CSS modular split to keep quality gates green.

## Product and UX Changes

### Home, Onboarding, and Release Visibility (req_070)

- Reworked Home layout so workspace context sits directly under Quick Start.
- Added a right-column **What’s new** feed that auto-discovers changelog files.
- Implemented automatic changelog ordering by semantic version (latest first).
- Added scrollable markdown-rendered changelog reading inside Home panels.

### Modeling/Analysis Navigation (req_071)

- Added `Go to` action in **Connectors analysis** occupancy rows.
- Added `Go to` action in **Splices analysis** occupancy rows.
- Kept action placement/order aligned with existing release actions and disabled state handling when a linked wire does not exist.

### Dialog System and Safety Confirmation (req_072, req_073, req_074)

- Introduced a reusable styled `ConfirmDialog` component and host-layer wiring.
- Migrated system confirmation flows away from browser-native dialogs to styled in-app dialogs.
- Added glow visual treatment for the `Update ready` action in the header.
- Enforced confirmation for destructive actions across modeled entities and network-scope delete operations.

### Network Scope and Save Workflow (req_075, req_076)

- Added `Recent changes` panel between `Network Scope` and `Edit network`.
- Recent changes source is the active-network undo history (top 10), with auto-hide when history is empty.
- Overrode `Ctrl/Cmd+S` to trigger active-network export behavior instead of browser page save.
- Added explicit styled confirmation before active-network save/export actions.

### Defaults and Preferences

- Changed default **2D label rotation preset** to `0°`.
- Changed default **reset zoom target** to `60%`.
- Set default theme to **Warm Brown**.

## Engineering Quality, CI, and Reliability

- Updated segmented Vitest lane contract to include new UI specs.
- Fixed CI segmentation check drift for `app.ui.delete-confirmations.spec.tsx`.
- Split recent-changes styles into a dedicated CSS module to satisfy UI modularization file-size guardrails.
- Stabilized targeted UI tests (notably wire free-color mode timing behavior).

## Documentation and Planning Artifacts

- Added/updated request planning artifacts for:
  - `req_070` (Home changelog feed and layout),
  - `req_071` (analysis go-to wire action),
  - `req_072` (styled system modals),
  - `req_073` (update-ready glow),
  - `req_074` (delete confirmations),
  - `req_075` (Network Scope recent changes),
  - `req_076` (`Ctrl/Cmd+S` active save/export override).
- Updated README version badge during intermediate release progression.

## Version Progression in This Window

- `0.9.13`: Home changelog feed + analysis go-to wire actions.
- `0.9.14`: styled confirm dialog infrastructure + update-ready glow.
- `0.9.15`: destructive-action confirmation enforcement + default preference refinements.
- `0.9.16`: Network Scope recent-changes panel + save shortcut/export flow hardening + CI quality-gate fixes.
