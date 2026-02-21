## item_028_import_export_ui_flow_and_user_feedback - Import Export UI Flow and User Feedback
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UX/UI Workflow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even robust import/export logic is hard to operate without clear UI entry points and feedback. Users need predictable flows, confirmations, and actionable error messages.

# Scope
- In:
  - Add import/export actions in workspace settings/network management area.
  - Support export variants: active network, selected networks, all networks.
  - Add import file picker flow and result panel (`success`, `partial`, `failed`).
  - Display summary details (imported, skipped, warnings/errors) after import.
  - Keep active context stable on import failure (no abrupt navigation corruption).
- Out:
  - Advanced multi-step wizard for batch merge rules.
  - Cloud upload/download UX.

# Acceptance criteria
- Users can trigger all planned import/export actions from visible workspace controls.
- Import flow exposes clear status and actionable feedback on failure/partial success.
- Export flow confirms file generation and scope (active/selected/all).
- UI state remains coherent after failed or partial import operations.

# Priority
- Impact: High (operability and trust).
- Urgency: High after core import/export engine items.

# Notes
- Dependencies: item_015, item_021, item_025, item_026, item_027.
- Blocks: item_029.
- Related AC: AC1, AC2, AC6.
- References:
  - `logics/request/req_004_network_import_export_file_workflow.md`
  - `src/app/App.tsx`
  - `src/app/styles.css`
  - `src/store/selectors.ts`

