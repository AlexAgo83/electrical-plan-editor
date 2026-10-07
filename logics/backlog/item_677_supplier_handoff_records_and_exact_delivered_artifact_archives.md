## item_677_supplier_handoff_records_and_exact_delivered_artifact_archives - Supplier handoff records and exact delivered artifact archives
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 16:16:37

# AI Context
- Summary: A historical design cannot alone prove which exported files were supplied; regenerated exports may differ after application updates.
- Keywords: supplier, handoff, records, exact, delivered, artifact, archives
- Use when: Add handoff creation from a frozen version or freeze-current flow with recipient, declared handoff date, note and optional file attachments.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- A historical design cannot alone prove which exported files were supplied; regenerated exports may differ after application updates.

# Scope
- In:
  - Add handoff creation from a frozen version or freeze-current flow with recipient, declared handoff date, note and optional file attachments.
  - Store immutable handoff metadata with snapshot reference and original attachment name, safe storage path, MIME hint, byte length and SHA-256 digest; use anonymized fixtures such as Supplier A.
  - Preserve exact selected bytes in Handoffs/<handoffId>/, list/download them from history and prevent active rendering of imported attachment content.
  - Allow multiple events per version; a correction creates a superseding record. Record declared handoff separately from any generated export and never trigger messaging.
  - Publish handoff only after files validate; mark missing or corrupt files visibly, retaining usable versions and good attachments.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: A handoff can be located by version, recipient and date and retrieves byte-identical original PDF and BOM fixtures after export/import.
- AC2: Failure while saving attachments does not publish an apparently complete handoff or damage its source snapshot; retry is recoverable.
- AC3: No attachment is required to record a handoff, but UI clearly distinguishes a record without archived files from a complete artifact archive.
- AC4: Existing handoff bytes/metadata are not overwritten by correction or export regeneration; the superseding relationship is visible.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: A handoff can be located by version, recipient and date and retrieves byte-identical original PDF and BOM fixtures after export/import.
- request-AC6 -> This backlog slice. Proof: AC2: Failure while saving attachments does not publish an apparently complete handoff or damage its source snapshot; retry is recoverable.
- request-AC9 -> This backlog slice. Proof: AC3: No attachment is required to record a handoff, but UI clearly distinguishes a record without archived files from a complete artifact archive.
- request-AC10 -> This backlog slice. Proof: AC4: Existing handoff bytes/metadata are not overwritten by correction or export regeneration; the superseding relationship is visible.

# Decision framing
- Product framing: Defined in the linked product brief and request; this slice follows their folder/ZIP and milestone decisions.
- Architecture framing: Apply the repository and format boundaries in the request; record implementation details and failure semantics before dependent slices start.

# Links
- Product brief(s): `prod_018_portable_named_workspace_lineages_and_supplier_history`
- Architecture decision(s): (none yet)
- Request: `req_167_named_portable_workspace_lineages_with_immutable_version_history_and_supplier_handoffs`
- Primary task(s): `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives`

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives`

# Notes
- Task `task_164_deliver_named_workspace_lineages_version_history_and_supplier_archives` was finished via `logics-manager flow finish task` on 2026-10-07.
