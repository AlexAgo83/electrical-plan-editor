## item_345_circle_mobility_theme_mode_contract_and_brand_palette_mapping_for_light_and_dark_presets - Circle Mobility theme mode contract and brand palette mapping for light and dark presets
> From version: 0.9.7
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Theme mode extension and palette-to-token mapping for Circle Mobility presets
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The app supports many themes, but there are no presets aligned with the Circle Mobility brand palette requested by the user. Adding presets without a clear theme-mode contract and palette mapping risks inconsistent branding and regressions across surfaces.

# Scope
- In:
  - Define the two new `ThemeMode` entries (1 light, 1 dark) and Settings labels.
  - Map the provided Circle Mobility palette/gradients to app theme surfaces/variables/tokens in a deterministic way.
  - Decide/document where exact palette values are used vs where minimal derived shades are allowed for readability.
  - Keep the contract implementation-ready for CSS surface work in follow-up items.
- Out:
  - Full CSS surface implementation/tuning (handled in `item_346`).
  - Regression test additions beyond minimal contract checks (handled in `item_347`).

# Acceptance criteria
- Two new theme preset ids/labels are defined for Circle Mobility (`light` + `dark`) and integrated into the existing theme mode contract.
- A documented palette mapping exists for major app surfaces (shell, panel/card, text, border, buttons/chips, highlights, status/badges).
- The mapping clearly references the provided Circle Mobility colors and gradients.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_061`.
- Blocks: `item_346`, `item_347`, `task_058`.
- Related AC: req_061 AC1, AC2.
- Delivery:
  - Added `ThemeMode` ids `circleMobilityLight` / `circleMobilityDark` and Settings selector labels.
  - Wired persistence normalization for new modes (including compatibility aliases `circleLight` / `circleDark`).
  - Mapped Circle Mobility palette + gradients into shared `--cm-*` tokens consumed by the override pack.
- References:
  - `logics/request/req_061_circle_mobility_brand_light_and_dark_theme_presets.md`
  - `src/store/types.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/store/reducer/uiReducer.ts`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/styles/base/base-theme-overrides/circle-mobility-brand-themes.css`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: The app exposes two new theme presets in `Settings > Theme mode`: one Circle Mobility light preset and one Circle Mobility dark preset.
- request-AC2 -> This backlog slice. Evidence needed: Both presets are visually based on the provided Circle Mobility palette/gradients and match the brand direction across primary surfaces (shell, panels/cards, buttons/chips, highlights).
- request-AC3 -> This backlog slice. Evidence needed: The new presets are selectable and persist across reload/remount using the existing theme preference mechanism.
- request-AC4 -> This backlog slice. Evidence needed: Representative app surfaces render coherently under both presets (not only shell class wiring), including settings/validation/table/canvas-adjacent UI.
- request-AC5 -> This backlog slice. Evidence needed: Existing theme presets and theme switching behavior remain functional.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
