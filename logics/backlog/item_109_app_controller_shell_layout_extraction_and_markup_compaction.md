## item_109_app_controller_shell_layout_extraction_and_markup_compaction - AppController Shell Layout Extraction and Markup Compaction
> From version: 0.5.3
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium-High
> Theme: Top-Level Shell JSX Compaction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`AppController.tsx` still inlines a long top-level shell JSX block (`header`, drawer panels, operations panel, workspace section, footer, inspector), which contributes significant LOC and obscures the core orchestration flow.

# Scope
- In:
  - Extract or compact shell layout markup into a dedicated layout component/module (e.g. `AppShellLayout`) with explicit props/contracts.
  - Preserve accessibility semantics, overlay behavior, focus handling, and keyboard interactions.
  - Preserve screen render order and conditional layout behavior.
- Out:
  - Visual redesign of shell layout.
  - Routing/navigation semantics changes.

# Acceptance criteria
- Long shell JSX markup is no longer inlined in `AppController` (or is materially compacted with equivalent clarity).
- Shell behavior parity is preserved (drawers, operations panel, inspector, overlays, footer).
- Integration tests covering workspace shell and inspector remain green.
- `AppController` readability improves by separating shell markup from orchestration.

# Priority
- Impact: High (large contiguous markup block reduction).
- Urgency: Medium-High (pairs well with call-site and state compaction).

# Notes
- Dependencies: item_107 and/or item_108 recommended first to avoid overlapping churn.
- Blocks: item_112, item_113.
- Related AC: AC1, AC4, AC7, AC8.
- References:
  - `logics/request/req_018_app_controller_decomposition_wave_5_real_loc_reduction_and_composition_root_slimming.md`
  - `src/app/AppController.tsx`
  - `src/app/components/workspace/AppHeaderAndStats.tsx`
  - `src/app/components/workspace/WorkspaceSidebarPanel.tsx`
  - `src/app/components/workspace/OperationsHealthPanel.tsx`
  - `src/app/hooks/useWorkspaceShellChrome.ts`
  - `src/tests/app.ui.workspace-shell-regression.spec.tsx`
  - `src/tests/app.ui.inspector-shell.spec.tsx`

