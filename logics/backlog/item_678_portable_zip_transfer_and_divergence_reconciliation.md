## item_678_portable_zip_transfer_and_divergence_reconciliation - Portable ZIP transfer and divergence reconciliation
> From version: 1.18.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 15:22:15

# AI Context
- Summary: Manual copies across computers need complete history portability and explicit handling of divergent offline edits. Some browsers cannot persist directory access.
- Keywords: portable, zip, transfer, divergence, reconciliation
- Use when: Implement ZIP import/export with exactly the lineage folder layout, including manifest, working snapshot, versions, handoffs and explicit recovery records, excluding handles and machine-local secrets.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- Manual copies across computers need complete history portability and explicit handling of divergent offline edits. Some browsers cannot persist directory access.

# Scope
- In:
  - Implement ZIP import/export with exactly the lineage folder layout, including manifest, working snapshot, versions, handoffs and explicit recovery records, excluding handles and machine-local secrets.
  - Implement browser-mode library and pending-portable-export state; Ctrl/Cmd+S without a writable target initiates a package download, individual snapshot download remains available.
  - Validate archive paths, schemas, resource limits and content hashes before registry activation; choose a ZIP dependency or adapter with a documented bundle-size assessment.
  - Reconcile same workspace by immutable IDs/content/ancestry: deduplicate identical objects, quarantine same-ID different-content corruption, fast-forward only proven ancestry, retain divergent working heads for explicit selection.
  - Preserve original version numbers and disambiguate collisions with IDs; do not merge model entities or silently choose by time. A later publication allocates beyond all known committed numbers.
  - Document manual directory copying, ZIP transfer, stale copies and limits of concurrent cloud-folder writers; no distributed lock guarantee.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: A folder copy and a ZIP round-trip into a clean browser recover equivalent working content, history and attachment bytes.
- AC2: Simulate two computers editing the same parent and publishing distinct v006: import retains both, requires a head choice and next version is v007.
- AC3: Import of an identical package is idempotent; ancestor copies cannot silently replace newer known state; same-ID different-content is reported.
- AC4: Traversal, duplicate paths, corrupt hashes, missing required working payload, future schema and decoded-size limit violations fail safely before activation.
- AC5: Unsupported directory access provides honest local/pending-download statuses, import/export and history consultation without pretending to overwrite disk files.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: A folder copy and a ZIP round-trip into a clean browser recover equivalent working content, history and attachment bytes.
- request-AC7 -> This backlog slice. Proof: AC2: Simulate two computers editing the same parent and publishing distinct v006: import retains both, requires a head choice and next version is v007.
- request-AC9 -> This backlog slice. Proof: AC3: Import of an identical package is idempotent; ancestor copies cannot silently replace newer known state; same-ID different-content is reported.

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
