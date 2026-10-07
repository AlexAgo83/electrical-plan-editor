## item_674_named_lineage_and_immutable_workspace_version_contracts - Named lineage and immutable workspace version contracts
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
- Summary: Technical save revisions do not encode a named lineage, milestone number or ancestry, and timestamp filenames cannot identify business history.
- Keywords: named, lineage, immutable, workspace, version, contracts
- Use when: Define typed versioned manifest, working snapshot, immutable version, recovery and handoff reference contracts matching request decisions; publish the format contract alongside the implementation.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- Technical save revisions do not encode a named lineage, milestone number or ancestry, and timestamp filenames cannot identify business history.

# Scope
- In:
  - Define typed versioned manifest, working snapshot, immutable version, recovery and handoff reference contracts matching request decisions; publish the format contract alongside the implementation.
  - Extend existing parse/serialize/migration paths for the new schema without dropping current full AppState content or v1 readability.
  - Implement stable identities, safe stable slugs, version number allocation, ancestry validation, short-ID filename disambiguation and explicit unsupported-schema errors.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: Round-trips preserve two independent named workspace identities and complete project state, including empty workspaces; renaming changes no identity or established path.
- AC2: Repeated ordinary saves change technical revisions but never create or consume a business version number.
- AC3: Version creation allocates max committed number + 1; two offline v006 snapshots with distinct IDs remain valid distinct entries after reconciliation.
- AC4: Old schema parses and future/invalid schema fails without changing the active state; version documents are standalone and contain sufficient identity and provenance.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Round-trips preserve two independent named workspace identities and complete project state, including empty workspaces; renaming changes no identity or established path.
- request-AC3 -> This backlog slice. Proof: AC2: Repeated ordinary saves change technical revisions but never create or consume a business version number.
- request-AC7 -> This backlog slice. Proof: AC3: Version creation allocates max committed number + 1; two offline v006 snapshots with distinct IDs remain valid distinct entries after reconciliation.
- request-AC9 -> This backlog slice. Proof: AC4: Old schema parses and future/invalid schema fails without changing the active state; version documents are standalone and contain sufficient identity and provenance.

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
