## item_434_network_scope_mobile_duplicate_label_and_header_tool_alignment - Network Scope mobile duplicate label and header tool alignment
> From version: 0.9.18
> Status: Draft
> Understanding: 99%
> Confidence: 96%
> Progress: 0%
> Complexity: Medium
> Theme: Mobile action/header compaction for Network Scope and Validation center
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
In mobile mode, Network Scope and Validation headers/actions still consume extra vertical space or use long labels that reduce scanability.

# Scope
- In:
  - rename Network Scope mobile action label `Duplicate` to `Dup.`;
  - keep Network Scope `CSV` and `Help` on the same row as `Network Scope`, right-aligned;
  - keep `Validation center` `CSV` action on the same row as title, right-aligned.
- Out:
  - changes to duplicate/export business logic;
  - non-mobile copy changes;
  - global toolbar redesign outside targeted panels.

# Acceptance criteria
- AC1: On mobile, Network Scope button label is `Dup.` and triggers unchanged duplicate behavior.
- AC2: On mobile, Network Scope title row keeps `CSV` + `Help` right-aligned on the same line.
- AC3: On mobile, Validation title row keeps `CSV` right-aligned on the same line.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_085`.
- Blocks: `item_436`, `task_074`.
- Related AC: `AC3`, `AC4`, `AC12`.
- References:
  - `logics/request/req_085_mobile_onboarding_and_workspace_header_compaction_for_small_screens.md`
  - `src/app/components/workspace/NetworkScopeWorkspaceContent.tsx`
  - `src/app/components/workspace/ValidationWorkspaceContent.tsx`
  - `src/app/styles/tables.css`
  - `src/tests/app.ui.networks.spec.tsx`
  - `src/tests/app.ui.validation.spec.tsx`
