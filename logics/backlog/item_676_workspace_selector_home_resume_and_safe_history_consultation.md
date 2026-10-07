## item_676_workspace_selector_home_resume_and_safe_history_consultation - Workspace selector Home resume and safe history consultation
> From version: 1.18.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: High
> Theme: Portable workspace version history
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Indicators reviewed: 2026-10-07 15:19:22

# AI Context
- Summary: Users need to know which lineage they edit and inspect old snapshots without replacing or autosaving over their working session.
- Keywords: workspace, selector, home, resume, safe, history, consultation
- Use when: Add create/name/rename/select workflows, Home cards and persistent active-workspace/version/save status in the existing shell, compatible with standard and canvas-first layouts.
- Skip when: Implementing sibling slices beyond the scope listed below.

# Problem
- Users need to know which lineage they edit and inspect old snapshots without replacing or autosaving over their working session.

# Scope
- In:
  - Add create/name/rename/select workflows, Home cards and persistent active-workspace/version/save status in the existing shell, compatible with standard and canvas-first layouts.
  - Expose Save, Create version and History; bind Ctrl/Cmd+S through the existing keyboard hook. Version dialog accepts optional title/comment and disables duplicate submissions.
  - History shows number, date, label, handoff markers, provenance and conflict disambiguation with text filtering; lazily load selected versions.
  - Implement read-only historical session with return-to-work action and central mutation guard covering dispatch, undo/redo, imports, agents and autosave.
  - Resume from history first writes displaced working state to verified recovery, records restoredFromVersionId, retains all published versions and clears incompatible transient editing history.
  - Use existing localization and accessible dialog/focus patterns; keyboard and screen-reader status distinguish historical and working sessions.
- Out:
  - Changes outside this item are delivered by the other linked backlog items.

# Acceptance criteria
- AC1: Create Series and Prototypes, edit each, switch/reload and resume each independently through selector and Home.
- AC2: Inspect v002 after v005: all mutation routes are blocked and return restores the original working content and status.
- AC3: Resume v002 preserves displaced work and published v003-v005; next explicit milestone is v006 with restoration provenance.
- AC4: Cancelling or failing recovery aborts restore; asynchronous work from a consulted historical session never saves into a live working file.
- AC5: Localized controls support keyboard navigation, focus return and an explicit read-only banner in both existing shell layouts.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Create Series and Prototypes, edit each, switch/reload and resume each independently through selector and Home.
- request-AC2 -> This backlog slice. Proof: AC2: Inspect v002 after v005: all mutation routes are blocked and return restores the original working content and status.
- request-AC4 -> This backlog slice. Proof: AC3: Resume v002 preserves displaced work and published v003-v005; next explicit milestone is v006 with restoration provenance.
- request-AC10 -> This backlog slice. Proof: AC4: Cancelling or failing recovery aborts restore; asynchronous work from a consulted historical session never saves into a live working file.

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
