## item_645_callout_header_duplicate_technical_id_prefix_in_name - Callout header duplicates the technical ID prefix carried by the entity name
> From version: 1.17.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Progress: 100%
> Complexity: Low
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
In the network-summary callouts, the splice/connector header repeats the technical ID prefix when the free-form entity name already starts with that ID. A splice named `AV-EP-01 Epissure Masse` with technicalId `AV-EP-01` renders `EP-01 · AV-EP-01 Epissure Masse` instead of `EP-01 · Epissure Masse`. The prefix is masked on the technical ID but not on the free-form name.

# Scope
- In:
  - de-duplicate the leading technical-ID prefix (raw or stripped form) from the free-form name in the splice and connector callout header display path, with unit coverage
- Out:
  - editing stored entity names, table-row rendering, or the entity-prefix display setting itself

# Acceptance criteria
- AC1: A splice named `AV-EP-01 Epissure Masse` with technicalId `AV-EP-01` renders header `EP-01 · Epissure Masse` (prefix shown once, label only).
- AC2: A name that starts with the stripped ID (e.g. `EP-01 Epissure Masse`) also yields `EP-01 · Epissure Masse`.
- AC3: A name with no embedded ID (e.g. `Epissure Masse`) is unchanged: `EP-01 · Epissure Masse`.
- AC4: The same de-duplication applies to connector callouts.
- AC5: If the name equals exactly the ID (raw or stripped), only the stripped ID is shown (no trailing ` · `), and a name that would become empty after stripping is left intact.
- AC6: No table cell / row content changes; only the callout title is affected.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 above.
- request-AC2 -> This backlog slice. Proof: AC2 above.
- request-AC3 -> This backlog slice. Proof: AC3 above.
- request-AC4 -> This backlog slice. Proof: AC4 above.
- request-AC5 -> This backlog slice. Proof: AC5 above.
- request-AC6 -> This backlog slice. Proof: AC6 above.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_159_callout_header_duplicate_technical_id_prefix_in_name.md`
- Primary task(s): `task_154_callout_header_duplicate_technical_id_prefix_in_name`

# AI Context
- Summary: Callout header duplicates the technical ID prefix carried by the entity name
- Keywords: backlog-groom, request, callout-header, technical-id, prefix-dedup, bounded slice
- Use when: Use when implementing or reviewing the callout-header prefix de-duplication slice.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact: Medium (export/plan readability defect, user-reported)
- Urgency: Medium

# Notes
- Hybrid rationale: Derived from request `req_159_callout_header_duplicate_technical_id_prefix_in_name` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_159_callout_header_duplicate_technical_id_prefix_in_name.md`.
- Bug reported by Codex from SVG export inspection; root cause isolated to the callout title builder.

# Tasks
- `task_154_callout_header_duplicate_technical_id_prefix_in_name`
