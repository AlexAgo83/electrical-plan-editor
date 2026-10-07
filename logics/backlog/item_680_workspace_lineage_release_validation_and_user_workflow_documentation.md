## item_680_workspace_lineage_release_validation_and_user_workflow_documentation - Workspace lineage release validation and user workflow documentation
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
- Summary: The feature crosses persistence, UI history and external files; happy-path tests alone would miss data loss or misleading save state.
- Keywords: workspace, lineage, release, validation, user, workflow, documentation
- Use when: Build targeted model/repository tests for migration, numbering, ancestry, idempotency, divergence, partial writes and stale asynchronous operations.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- The feature crosses persistence, UI history and external files; happy-path tests alone would miss data loss or misleading save state.

# Scope
- In:
  - Build targeted model/repository tests for migration, numbering, ancestry, idempotency, divergence, partial writes and stale asynchronous operations.
  - Extend workspace-file.spec.ts and workspace-file-storage.hook.spec.ts plus focused UI tests; add end-to-end scenarios using temporary files and capability stubs where necessary.
  - Run manual supported-browser folder access/relink tests and a no-directory fallback test, recording tested environments and limitations without claiming browser parity.
  - Exercise 100 full snapshots of at least 150 wires, validate lazy loading and record measured package size/open/history timing.
  - Document Save versus Create version, workspace selection, historical consultation/restore, supplier archive, legacy adoption and computer-to-computer transfer; capture AC evidence in task closeout.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: End-to-end evidence covers independent Series/Prototypes editing, restore v002 after v005, supplier artifact recovery, legacy import and divergent offline v006 reconciliation.
- AC2: Existing workspace parse/save/open and network import/export tests pass alongside new targeted regression tests.
- AC3: Typecheck, lint, i18n validation, applicable Vitest/Playwright suites and production build pass; Logics validation and closeout traceability reference actual evidence.
- AC4: Fault-injection evidence confirms no silent loss, cross-lineage write or historical snapshot mutation; documented fallback statuses match observed behavior.

# AC Traceability
- request-AC1 -> Release scenario: Two named lineages independently reopen and resume after switching and reload. Implementation proof deferred to task closeout.
- request-AC2 -> Release scenario: Delayed autosave and undo history cannot cross lineage boundaries; failure statuses distinguish local and disk storage. Implementation proof deferred to task closeout.
- request-AC3 -> Release scenario: Explicit version creation is numbered and idempotent; Ctrl/Cmd+S does not create milestones. Implementation proof deferred to task closeout.
- request-AC4 -> Release scenario: Historical mutation guards and recovery-preserving v002-to-v006 restoration are exercised. Implementation proof deferred to task closeout.
- request-AC5 -> Release scenario: Supplier handoff artifacts survive archive transfer byte-for-byte with declared recipient and date. Implementation proof deferred to task closeout.
- request-AC6 -> Release scenario: Clean-browser folder copy and ZIP fallback reconstruct the full working state and history. Implementation proof deferred to task closeout.
- request-AC7 -> Release scenario: Two offline v006 variants survive reconciliation and the next publication is v007. Implementation proof deferred to task closeout.
- request-AC8 -> Release scenario: Mixed legacy files require reviewed lineage assignment, ordering and duplicate handling. Implementation proof deferred to task closeout.
- request-AC9 -> Release scenario: Fault injection at publication stages and corrupt archive fixtures preserve the previous valid state. Implementation proof deferred to task closeout.
- request-AC10 -> Release scenario: Localized keyboard-accessible UI, targeted regressions, browser checks and build have recorded delivery evidence. Implementation proof deferred to task closeout.

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
