## req_160_physical_layout_way_labels_in_endpoints - Display physical layout way labels in endpoints
> From version: 1.17.1
> Schema version: 1.0
> Status: Done
> Understanding: When a way label is configured in a connector's physical layout, endpoint displays must use it instead of the numeric C1/C2 label. Forms that still accept a numeric index must show the associated label beside it to avoid confusion. Numeric indexes remain the domain source of truth.
> Confidence: high
> Complexity: Medium
> Theme: Operator workflow and endpoint readability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- When a connector way has a configured label in the catalog physical layout, endpoint displays should use that physical label instead of the fallback numeric `C<n>` label.
- Numeric cavity indexes remain the persisted source of truth for routing, occupancy, validation, imports, and exports.
- Forms that still ask for the numeric way index must show the resolved physical label next to the numeric field when a label exists, so operators can confirm which physical way they are editing.

# Context
- Connector physical layouts already support per-way labels through `ConnectorLayoutWay.label`.
- Existing endpoint descriptions currently render connector positions as `C1`, `C2`, etc. even when the physical layout has labels such as `A10`.
- Keeping the numeric index editable is required because labels can be changed and may not be suitable as stable identifiers.

# Acceptance criteria
- AC1: Endpoint display strings for connector cavities use the resolved physical way label when the linked catalog physical layout defines one for the cavity index.
- AC2: Endpoint display strings fall back to `C<n>` when no physical label exists, no catalog layout is linked, or the connector/catalog reference is missing.
- AC3: Numeric cavity indexes remain the stored and submitted value; the change is display-only outside existing numeric endpoint fields.
- AC4: Wire endpoint forms that accept a numeric connector way index show the associated resolved label beside the field when that label differs from `C<n>`.
- AC5: UI and export-facing endpoint helpers have focused regression coverage for both labeled and fallback connector ways.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Draft a bounded request for displaying physical layout way labels in endpoints.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_646_physical_layout_way_labels_in_endpoints`
