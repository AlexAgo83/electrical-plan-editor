## item_417_canvas_tools_selected_callout_only_preference_state_and_persistence - Canvas tools selected-callout-only preference state and persistence
> From version: 0.9.18
> Status: Done
> Understanding: 98%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Preference contract extension for focused callout mode
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
The selected-callout-only mode needs a first-class preference contract (default off + persistence), otherwise runtime behavior will drift across reloads.

# Scope
- In:
  - add preference field for selected-callout-only behavior;
  - default value `false` and reset/apply-defaults integration;
  - restore value on app bootstrap.
- Out:
  - rendering filter behavior itself;
  - callout visual redesign.

# Acceptance criteria
- AC1: New settings toggle exists and defaults to unchecked.
- AC2: Preference persists and restores across remount/reload.
- AC3: Apply-defaults/reset flows include this preference deterministically.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_081`.
- Blocks: `item_418`, `item_420`, `task_073`.
- Related AC: `AC1`, `AC2`, `AC6`.
- References:
  - `logics/request/req_081_canvas_tools_preference_selected_callout_only_visibility_override.md`
  - `src/app/hooks/useUiPreferences.ts`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: A new toggle exists in `Canvas tools preferences` for selected-callout-only visibility and is unchecked by default.
- request-AC2 -> This backlog slice. Evidence needed: The new preference is persisted and restored across remount/reload.
- request-AC3 -> This backlog slice. Evidence needed: Enabling selected-callout-only mode shows at most one callout, bound to current connector/splice selection.
- request-AC4 -> This backlog slice. Evidence needed: In selected-callout-only mode, selecting non-callout entities (for example segment/node/wire) renders no callout.
- request-AC5 -> This backlog slice. Evidence needed: Disabling selected-callout-only restores full callout rendering behavior (subject to existing `Callouts` toggle).
- request-AC6 -> This backlog slice. Evidence needed: `lint`, `typecheck`, and `test:ci` pass with updated callout/settings tests.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
