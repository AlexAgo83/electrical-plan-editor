## item_425_remove_global_min_width_lock_and_define_mobile_shell_baseline - Remove global min-width lock and define mobile shell baseline
> From version: 0.9.18
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: App-shell mobile baseline enablement
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Global `body` minimum width blocks real mobile behavior and forces overflow on narrow screens.

# Scope
- In:
  - remove `min-width: 700px` global lock;
  - define shell-level mobile baseline and breakpoint contract;
  - ensure overflow-safe layout primitives (`minmax(0, 1fr)`, `min-width: 0`) in core shell paths.
- Out:
  - full app-wide responsive restyling in one item;
  - native mobile packaging.

# Acceptance criteria
- AC1: Global `body` no longer enforces `min-width: 700px`.
- AC2: App shell is usable on baseline mobile width without mandatory horizontal scroll.
- AC3: Desktop behavior remains stable.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_083`.
- Blocks: `item_426`, `item_427`, `item_428`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC3`, `AC7`.
- References:
  - `logics/request/req_083_app_wide_mobile_mode_enablement_and_removal_of_global_700px_min_width_constraint.md`
  - `src/app/styles/base/base-foundation.css`
  - `src/app/AppController.tsx`

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
