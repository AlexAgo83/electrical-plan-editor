## item_679_previewable_adoption_of_legacy_timestamped_workspace_collections - Previewable adoption of legacy timestamped workspace collections
> From version: 1.18.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 15:19:23

# AI Context
- Summary: Existing folders have valuable snapshots with timestamp names and potentially unrelated inferred IDs; automatic grouping would invent project identity.
- Keywords: previewable, adoption, legacy, timestamped, workspace, collections
- Use when: Add multi-file import preview using existing workspace parser and migration code, including persisted-state payload compatibility.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- Existing folders have valuable snapshots with timestamp names and potentially unrelated inferred IDs; automatic grouping would invent project identity.

# Scope
- In:
  - Add multi-file import preview using existing workspace parser and migration code, including persisted-state payload compatibility.
  - Require explicit target/new lineage and confirm order plus working-state selection; suggest dates using embedded timestamp then filename fallback, never filesystem copy date.
  - Show invalid files, ties, duplicates and source metadata; require explicit choices where ordering or retention is ambiguous.
  - Assign numbered versions using reviewed order, preserve provenance and original files, stage conversion and publish only valid confirmed entries.
  - Import into existing lineages appends using next available numbers; retain source IDs as provenance rather than rewriting originals or inferring ancestry.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: A mixed legacy fixture can be assigned explicitly to Series and Prototypes in separate batches with reviewed order and selected working state.
- AC2: Undated/tied/duplicate/corrupt files remain visible in preview and cannot silently disappear or become a wrong lineage.
- AC3: After adoption every accepted version opens independently, records its original filename/digest and preserves project content; original inputs are unchanged.
- AC4: Cancelling preview or a failing publication keeps the previous registered lineage intact and supports retry without duplicate snapshots.

# AC Traceability
- request-AC8 -> This backlog slice. Proof: AC1: A mixed legacy fixture can be assigned explicitly to Series and Prototypes in separate batches with reviewed order and selected working state.
- request-AC9 -> This backlog slice. Proof: AC2: Undated/tied/duplicate/corrupt files remain visible in preview and cannot silently disappear or become a wrong lineage.

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
