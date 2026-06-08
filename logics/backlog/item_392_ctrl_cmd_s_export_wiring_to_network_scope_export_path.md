## item_392_ctrl_cmd_s_export_wiring_to_network_scope_export_path - Ctrl/Cmd+S export wiring to Network Scope active-export path
> From version: 0.9.14
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Single export path reuse for keyboard-triggered save/download action
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Shortcut interception alone is insufficient; `Ctrl/Cmd+S` must trigger exactly the same active-network export workflow as the existing Network Scope `Export` button.

# Scope
- In:
  - Wire shortcut action to the same active-export handler path used by Network Scope button.
  - Preserve existing export payload/format/filename/message behavior.
  - Preserve existing no-active-network feedback path (error message only, no new modal).
  - Ensure behavior is screen-agnostic and does not require navigation to Network Scope first.
- Out:
  - Export schema or file naming redesign.
  - Backend/cloud save.

# Acceptance criteria
- `Ctrl/Cmd+S` triggers the exact active-network export flow used by UI export button.
- No-active-network path shows existing app feedback and still blocks browser save.
- No duplicate export logic is introduced.

# Priority
- Impact: High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_076`, `item_391`.
- Blocks: `item_393`, `task_069`.
- Related AC: AC2, AC4.
- References:
  - `logics/request/req_076_ctrl_cmd_s_override_to_export_active_plan.md`
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/app/AppController.tsx`

# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: Pressing `Ctrl/Cmd+S` does not trigger browser page save.
- request-AC2 -> This backlog slice. Evidence needed: Pressing `Ctrl/Cmd+S` triggers export/download of the active network plan.
- request-AC3 -> This backlog slice. Evidence needed: `Ctrl/Cmd+S` interception applies even when an input/textarea/contenteditable field is focused.
- request-AC4 -> This backlog slice. Evidence needed: If no active network is selected, app shows existing export error feedback only and no browser save occurs.
- request-AC5 -> This backlog slice. Evidence needed: Existing keyboard shortcuts (undo/redo/navigation/issues/view) continue to work.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
