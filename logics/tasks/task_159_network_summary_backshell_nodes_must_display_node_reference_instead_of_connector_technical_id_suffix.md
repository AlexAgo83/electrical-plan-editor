## task_159_network_summary_backshell_nodes_must_display_node_reference_instead_of_connector_technical_id_suffix - Network summary backshell nodes must display node reference instead of connector technical ID suffix
> From version: 1.15.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

# Backlog
- `item_629_network_summary_backshell_nodes_must_display_node_reference_instead_of_connector_technical_id_suffix`

# Acceptance criteria
- AC1: `Network summary` renders a backshell helper node with a non-empty `label` using that `label` as its visible node text.
- AC2: If a backshell helper node has no `label` but has an `id`, `Network summary` uses the node `id` rather than forcing `${connector technicalId}-BS`.
- AC3: The synthetic `${connector technicalId}-BS` text is used only as a final fallback when no explicit node-facing reference is available.
- AC4: Tooltip/title and accessibility text for backshell helper nodes follow the same display-reference rule as the visible node label.
- AC5: Connector-node and splice-node display behavior does not regress.

# Validation
- Historical delivery commit `002c41be` passed the focused backshell reference tests, typecheck, lint, build, and Logics lint recorded in `item_629_network_summary_backshell_nodes_must_display_node_reference_instead_of_connector_technical_id_suffix`.
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_159_network_summary_backshell_nodes_must_display_node_reference_instead_of_connector_technical_id_suffix.md` after implementation.
- Historical delivery commit 002c41be; item_629 Report and Validation record focused tests, typecheck, lint, build, and Logics lint passing.
- Finish workflow executed on 2026-07-03.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-03.
- Linked backlog item(s): `item_629_network_summary_backshell_nodes_must_display_node_reference_instead_of_connector_technical_id_suffix`
- Related request(s): `req_143_network_summary_backshell_nodes_must_display_node_reference_not_connector_suffix`

# AI Context
- Summary: Implement network summary backshell nodes must display node reference instead of connector technical id suffix.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_143_network_summary_backshell_nodes_must_display_node_reference_not_connector_suffix`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: Historical delivery commit `002c41be` and the linked item Report record label-first rendering. Source: `item_629` closeout.
- request-AC2 -> This task. Proof: Historical delivery commit `002c41be` and the linked item Report record node-ID fallback rendering. Source: `item_629` closeout.
- request-AC3 -> This task. Proof: Historical delivery commit `002c41be` and the linked item Report record the synthetic reference as final fallback only. Source: `item_629` closeout.
- request-AC4 -> This task. Proof: Historical delivery commit `002c41be` and the linked item Report record shared visible and accessible reference resolution. Source: `item_629` closeout.
- request-AC5 -> This task. Proof: Historical delivery commit `002c41be` and the linked item Validation record connector and splice non-regression coverage. Source: `item_629` closeout.
