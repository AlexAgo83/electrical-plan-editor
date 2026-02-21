## item_064_pwa_baseline_manifest_icons_and_build_integration - PWA Baseline Manifest, Icons, and Build Integration
> From version: 0.3.0
> Understanding: 99%
> Confidence: 97%
> Progress: 0%
> Complexity: Medium
> Theme: PWA Foundation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app is not currently installable as a PWA because core baseline artifacts (manifest + PWA build integration) are missing.

# Scope
- In:
  - Add a valid web manifest (name/short_name/icons/display/theme/background/start_url/scope).
  - Add required icon assets and wire them correctly.
  - Integrate PWA support into Vite build configuration.
  - Keep app shell boot path compatible with current routing model.
- Out:
  - Service worker registration/update UX details (handled in `item_065`).
  - Offline caching strategy tuning (handled in `item_066`).

# Acceptance criteria
- Manifest is generated and accessible in production build output.
- Required icon assets are present and correctly referenced.
- Compatible browsers recognize the app as installable baseline.
- Build pipeline remains stable with PWA integration enabled.

# Priority
- Impact: High (hard prerequisite for all other PWA capabilities).
- Urgency: High (first delivery wave).

# Notes
- Blocks: item_065, item_066, item_067, item_068.
- Related AC: AC1, AC2.
- References:
  - `logics/request/req_011_pwa_enablement_installability_and_offline_reliability.md`
  - `package.json`
  - `vite.config.ts`
  - `index.html`
  - `public/app-icon.svg`

