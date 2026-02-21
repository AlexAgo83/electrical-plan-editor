## item_018_network_lifecycle_actions_duplicate_delete_fallback - Network Lifecycle Actions Duplicate Delete Fallback
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: High
> Theme: Multi-Network Lifecycle UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Multi-network support is incomplete without reliable lifecycle actions. Operators need deterministic creation, duplication, rename, and deletion behavior with safe active-network fallback.

# Scope
- In:
  - Implement network actions: `create`, `rename`, `duplicate`, `delete`.
  - Add confirmation flow for delete and prevent ambiguous destructive actions.
  - On delete of active network, apply deterministic fallback selection:
    - earliest `createdAt`
    - lexical `technicalId` tie-break.
  - Keep selector and workspace context synchronized after lifecycle actions.
- Out:
  - Bulk operations on multiple networks.
  - Advanced archival/restore workflows.

# Acceptance criteria
- Users can create and rename networks with unique `technicalId` constraints enforced.
- Duplicating a network creates a deep copy with a new network identity.
- Deleting active network automatically switches to deterministic fallback network.
- UI context stays coherent (lists/canvas/inspector/validation) after each lifecycle action.

# Priority
- Impact: High (completes operational multi-network workflow).
- Urgency: High once model partitioning and migration are available.

# Notes
- Dependencies: item_014, item_015, item_017.
- Blocks: item_019.
- Related AC: AC1, AC4, AC6.
- References:
  - `logics/request/req_002_multi_network_management_and_navigation.md`
  - `src/app/App.tsx`
  - `src/store/actions.ts`
  - `src/store/reducer.ts`
  - `src/store/selectors.ts`

