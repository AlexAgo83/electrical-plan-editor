## task_147_fast_element_deletion_via_keyboard_delete_backspace - Fast element deletion via keyboard (Delete/Backspace)
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Restored historical AC traceability proof.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

# Backlog
- `item_638_fast_element_deletion_via_keyboard_delete_backspace`

# Acceptance criteria
- AC1: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- AC2: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- AC3: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- AC4: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_147_fast_element_deletion_via_keyboard_delete_backspace.md` after implementation.
- Finish workflow executed on 2026-06-26.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-06-26.
- Linked backlog item(s): `item_638_fast_element_deletion_via_keyboard_delete_backspace`
- Related request(s): `req_152_suppr_element_clavier`

# AI Context
- Summary: Implement fast element deletion via keyboard (delete/backspace).
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_152_suppr_element_clavier`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Evidence needed: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- request-AC2 -> This task. Evidence needed: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- request-AC3 -> This task. Evidence needed: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- request-AC4 -> This task. Evidence needed: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).
- request-AC1 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC2 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC3 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
- request-AC4 -> This task. Proof: Historical delivery is recorded in the linked task Report and Validation sections. Source: `linked workflow closeout`
