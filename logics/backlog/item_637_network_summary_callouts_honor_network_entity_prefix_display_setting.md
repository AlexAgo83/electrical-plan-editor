## item_637_network_summary_callouts_honor_network_entity_prefix_display_setting - Network Summary callouts honor the network entity prefix display setting
> From version: 1.16.8
> Schema version: 1.0
> Status: Done
> Understanding: 98
> Confidence: 95
> Progress: 100%
> Complexity: Low
> Theme: Modeling display and network identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The network entity prefix display setting (`canvasShowNetworkEntityPrefix`, from `req_150`) hides a network's shared ID prefix such as `LAT-` or `PRI-` in the 2D canvas node/splice labels and the human-readable wire-list and BOM exports, but the Network Summary connector and splice callouts still render full canonical IDs with the prefix.

Callouts are the primary on-plan documentation surface. When operators hide the prefix to declutter the plan, the callout title, the wire-row `Wire ID` cell, and the far-end `End ID` cell stay prefixed, so the plan reads inconsistently (`EP 2` on the symbol but `LAT-EP 2` in the callout). This slice extends the existing prefix display seam to the callouts, the explicit follow-up flagged in the `task_145` scope note.

# Scope
- In:
  - Pass the existing per-network `formatEntityId` resolver into the Network Summary callout model (`buildConnectorCalloutGroupsById`, `buildSpliceCalloutGroupsById`, `buildCableCalloutViewModels`).
  - Apply the resolver to the connector/splice callout title (and prefixed subtitle fallback), the wire-row `Wire ID` cell, and the wire-row `End ID` cell.
  - Keep prefix hiding display-only; exports inherit the formatted callout text via the existing live-DOM snapshot.
- Out:
  - Adding any new setting; this reuses `canvasShowNetworkEntityPrefix`.
  - Changing canonical stored `technicalId` values, callout selection targets, drag-position persistence keys, sorting, or grouping.
  - AI-agent JSON / machine-readable identifiers, which keep canonical full IDs.
  - Modeling tables, inspector, and analysis panels (separate remaining surfaces).

# Acceptance criteria
- AC1: When `canvasShowNetworkEntityPrefix` is off, connector and splice callout titles in the Network Summary 2D plan omit the active network prefix (e.g. `LAT-EP 2` renders as `EP 2`).
- AC2: When the setting is off, callout wire-detail rows omit the active network prefix in both the `Wire ID` column (the wire's own `technicalId`) and the `End ID` column (the far-endpoint connector/splice `technicalId`).
- AC3: When the setting is on, callout titles and wire-detail ID cells remain backward-compatible and continue to include the stored prefix.
- AC4: Prefix hiding in callouts is display-only: callout selection, drag-position persistence keys, sorting, and grouping continue to use canonical entity IDs and behave identically whether the prefix is shown or hidden.
- AC5: SVG/PNG/PDF network-plan exports that snapshot the live callouts reflect the same prefix visibility as the on-screen callouts.
- AC6: AI-agent JSON and machine-readable identifiers are unaffected and continue to expose canonical full IDs.
- AC7: Targeted tests cover callout title prefix hiding, wire-row `Wire ID` and `End ID` prefix hiding, the prefix-shown backward-compatible path, and a non-regression check that callout selection/keys use canonical IDs.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: When `canvasShowNetworkEntityPrefix` is off, connector and splice callout titles in the Network Summary 2D plan omit the active network prefix (e.g. `LAT-EP 2` renders as `EP 2`).
- request-AC2 -> This backlog slice. Proof: AC2: When the setting is off, callout wire-detail rows omit the active network prefix in both the `Wire ID` column (the wire's own `technicalId`) and the `End ID` column (the far-endpoint connector/splice `technicalId`).
- request-AC3 -> This backlog slice. Proof: AC3: When the setting is on, callout titles and wire-detail ID cells remain backward-compatible and continue to include the stored prefix.
- request-AC4 -> This backlog slice. Proof: AC4: Prefix hiding in callouts is display-only: callout selection, drag-position persistence keys, sorting, and grouping continue to use canonical entity IDs and behave identically whether the prefix is shown or hidden.
- request-AC5 -> This backlog slice. Proof: AC5: SVG/PNG/PDF network-plan exports that snapshot the live callouts reflect the same prefix visibility as the on-screen callouts.
- request-AC6 -> This backlog slice. Proof: AC6: AI-agent JSON and machine-readable identifiers are unaffected and continue to expose canonical full IDs.
- request-AC7 -> This backlog slice. Proof: AC7: Targeted tests cover callout title prefix hiding, wire-row `Wire ID` and `End ID` prefix hiding, the prefix-shown backward-compatible path, and a non-regression check that callout selection/keys use canonical IDs.

# Decision framing
- Product framing: Not needed
- Product signals: User clarified all open product decisions in `req_151`; this reuses the existing setting and seam.
- Product follow-up: No separate product brief is expected for this slice.
- Architecture framing: Not needed
- Architecture signals: No data-model, persistence, or export-schema change; the change plumbs an existing display resolver into three callout display strings.
- Architecture follow-up: No ADR expected.

# Links
- Product brief(s): (none)
- Architecture decision(s): (none)
- Request: `logics/request/req_151_network_summary_callouts_honor_network_entity_prefix_display_setting.md`
- Primary task(s): `logics/tasks/task_146_network_summary_callouts_honor_network_entity_prefix_display_setting.md`

# AI Context
- Summary: Delivery slice extending the existing network entity prefix display setting to the Network Summary connector/splice callouts, reusing the shared `formatEntityId` resolver while keeping canonical IDs for selection, persistence, sorting, exports, and AI-agent JSON.
- Keywords: backlog-groom, network summary callout, entity prefix, formatEntityId, canvasShowNetworkEntityPrefix, Wire ID, End ID, callout title, display-only prefix
- Use when: Implementing or reviewing prefix-aware callout label display in the Network Summary.
- Skip when: The change concerns colocated splice geometry, new prefix settings, AI-agent JSON identifiers, or modeling/inspector/analysis label surfaces.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Hybrid rationale: Derived from request `req_151_network_summary_callouts_honor_network_entity_prefix_display_setting` and kept bounded to one coherent display-only delivery slice.
- Source file: `logics/request/req_151_network_summary_callouts_honor_network_entity_prefix_display_setting.md`.
- Created manually because `logics-manager flow` is unavailable in this environment (the published 2.12.12 package ships `cli.py` referencing `logics_manager.flow` but omits the module).
- Direct follow-up to the `task_145` scope note: callouts were intentionally left on canonical IDs and can adopt the same `formatEntityIdForDisplay` / `formatEntityId` seam.
- Task `task_146_network_summary_callouts_honor_network_entity_prefix_display_setting` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_146_network_summary_callouts_honor_network_entity_prefix_display_setting`
