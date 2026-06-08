## item_426_mobile_responsive_pass_for_settings_validation_and_import_export_surfaces - Mobile responsive pass for settings, validation, and import/export surfaces
> From version: 0.9.18
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: High
> Theme: Responsive behavior hardening for dense form/panel surfaces
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Settings/validation/import-export panels are desktop-biased and can clip, overflow, or become hard to use below 700px.

# Scope
- In:
  - adapt settings and validation layout patterns for narrow widths;
  - enforce readable one-column collapse when two columns are not viable;
  - keep import/export controls and summaries operable on mobile baseline widths.
- Out:
  - redesign of feature semantics or business rules.

# Acceptance criteria
- AC1: Settings/validation/import-export surfaces are usable at mobile baseline widths.
- AC2: No critical clipping/overlap in targeted screens and themes.
- AC3: Existing desktop/tablet behavior remains intact.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_083`, `item_425`, `req_082` layout contracts.
- Blocks: `item_428`, `task_073`.
- Related AC: `AC2`, `AC3`, `AC4`, `AC5`, `AC6`.
- References:
  - `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
  - `src/app/styles/validation-settings/validation-and-settings-layout.css`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/tests/app.ui.settings.spec.tsx`
  - `src/tests/app.ui.import-export.spec.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Global `body` style no longer enforces `min-width: 700px`.
- request-AC2 -> This backlog slice. Evidence needed: Main app flows are usable on narrow viewport widths (baseline profiles: `360x800` and `390x844`) without mandatory horizontal page scroll.
- request-AC3 -> This backlog slice. Evidence needed: Existing responsive components preserve desktop behavior and collapse gracefully on narrow screens.
- request-AC4 -> This backlog slice. Evidence needed: Import/export/settings and network summary controls remain accessible and operable in mobile mode.
- request-AC5 -> This backlog slice. Evidence needed: No critical visual clipping/overlap regressions are introduced in supported themes for targeted screens.
- request-AC6 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and relevant UI/integration tests pass after mobile-mode changes.
- request-AC7 -> This backlog slice. Evidence needed: Mobile breakpoint contract is explicit and consistent between CSS and JS behaviors involved in the shell/navigation flow.
- request-AC8 -> This backlog slice. Evidence needed: Mobile overlay/drawer flows (if present) lock body scroll only while open and always release lock on close/unmount.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC8 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
