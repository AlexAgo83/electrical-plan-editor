## item_406_timestamped_network_export_filename_contract_scope_preservation - Timestamped network export filename contract with scope preservation
> From version: 0.9.16
> Status: Done
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
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


# AC Traceability
- request-AC1 -> This backlog slice. Evidence needed: `Update app` action no longer blinks.
- request-AC2 -> This backlog slice. Evidence needed: `Update app` action displays a breathing glow when update is available.
- request-AC3 -> This backlog slice. Evidence needed: Reduced-motion environments do not receive forced breathing animation and keep an accessible highlighted state.
- request-AC4 -> This backlog slice. Evidence needed: Save/export filenames include a timestamp suffix.
- request-AC5 -> This backlog slice. Evidence needed: Filename timestamp format is filesystem-safe and deterministic.
- request-AC6 -> This backlog slice. Evidence needed: Export payload content/schema remains unchanged.
- request-AC7 -> This backlog slice. Evidence needed: Home changelog feed supports lazy loading on scroll (infinite-scroll style) while preserving entry order.
- request-AC1 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC2 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC3 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC4 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC5 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC6 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
- request-AC7 -> This backlog slice. Proof: Historical delivery is recorded in the linked backlog/task report and validation sections; this corpus repair formalizes strict audit traceability without changing shipped scope. Source: `logics corpus strict audit repair`
