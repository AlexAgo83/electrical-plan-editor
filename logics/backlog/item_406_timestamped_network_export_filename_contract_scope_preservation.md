## item_406_timestamped_network_export_filename_contract_scope_preservation - Timestamped network export filename contract with scope preservation
> From version: 0.9.16
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Export filename traceability and collision reduction
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Static export filenames make repeated downloads hard to distinguish and can cause accidental overwrites in user download folders.

# Scope
- In:
  - Append filesystem-safe timestamp suffix to export/save filenames.
  - Preserve scope prefix semantics (`active`, `selected`, `all`).
  - Keep export payload schema/content unchanged.
- Out:
  - Export content format changes.
  - Import compatibility changes.

# Acceptance criteria
- Export filenames include deterministic safe timestamp suffix.
- Scope distinction (`active`/`selected`/`all`) remains explicit.
- Export payload content/schema remains unchanged.

# Priority
- Impact: Medium.
- Urgency: Medium.

# Notes
- Dependencies: `req_078`.
- Blocks: `item_408`.
- Related AC: AC4, AC5, AC6.
- References:
  - `logics/request/req_078_update_app_button_breathing_glow_and_timestamped_save_filename.md`
  - `src/app/hooks/useNetworkImportExport.ts`
  - `src/app/AppController.tsx`
  - `src/tests/app.ui.settings.spec.tsx`

