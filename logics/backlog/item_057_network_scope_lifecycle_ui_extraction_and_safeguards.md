## item_057_network_scope_lifecycle_ui_extraction_and_safeguards - Network Scope Lifecycle UI Extraction and Safeguards
> From version: 0.3.0
> Understanding: 98%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Network Lifecycle UX Consolidation
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Network lifecycle actions exist in fragmented UI areas, which weakens workflow clarity and increases the risk of accidental destructive actions.

# Scope
- In:
  - Move network lifecycle actions into the dedicated `Network Scope` screen.
  - Keep active network selection and create/rename/duplicate/delete flows accessible in one place.
  - Preserve safeguards and confirmations for rename, duplicate, and delete actions.
  - Preserve explicit empty-state behavior and deterministic fallback when active network changes.
- Out:
  - Changes to data model ownership or network reducer contracts.
  - Import/export workflow redesign.

# Acceptance criteria
- Lifecycle actions are available from `Network Scope` and no longer depend on ad-hoc sidebar composition.
- Existing safety confirmations remain in place for destructive actions.
- Empty-state and fallback behavior remain explicit and deterministic.
- Multi-network isolation and active-scope invariants remain intact.

# Priority
- Impact: High (core operability and safety).
- Urgency: High (needed to make `Network Scope` useful as a real workspace).

# Notes
- Dependencies: item_055, item_018.
- Related AC: AC1, AC7.
- References:
  - `logics/request/req_010_network_scope_workspace_shell_and_global_defaults.md`
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/app/components/workspace/SettingsWorkspaceContent.tsx`
  - `src/app/hooks/useWorkspaceHandlers.ts`
  - `src/store/reducer/networkReducer.ts`
  - `src/tests/app.ui.networks.spec.tsx`

