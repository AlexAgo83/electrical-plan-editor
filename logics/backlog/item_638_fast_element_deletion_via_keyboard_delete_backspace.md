## item_638_fast_element_deletion_via_keyboard_delete_backspace - Fast element deletion via keyboard (Delete/Backspace)
> From version: 1.16.10
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: Renamed the linked request reference in English.

# Problem
Let the user delete the selected plan element with the `Delete` and `Backspace` keys, without going through a secondary action (a button in a table).
Goal: editing speed, natural interaction close to classic drawing tools.

# Scope
- In:
  - one coherent delivery slice from the source request
- Out:
  - unrelated sibling slices that should stay in separate backlog items instead of widening this doc

# Acceptance criteria
- AC1: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- AC2: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- AC3: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- AC4: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- request-AC2 -> This backlog slice. Proof: AC2: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- request-AC3 -> This backlog slice. Proof: AC3: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- request-AC4 -> This backlog slice. Proof: AC4: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).

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
- Request: `logics/request/req_152_fast_element_deletion_via_keyboard.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Fast element deletion via keyboard (Delete/Backspace)
- Keywords: backlog-groom, request, fast element deletion via keyboard (delete/backspace), bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Fast element deletion via keyboard (Delete/Backspace).
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Impact:
- Urgency:

# Notes
- Hybrid rationale: Derived from request `req_152_fast_element_deletion_via_keyboard` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_152_fast_element_deletion_via_keyboard.md`.
- Generated locally by logics-manager.
- Task `task_147_fast_element_deletion_via_keyboard_delete_backspace` was finished via `logics-manager flow finish task` on 2026-06-26.

# Tasks
- `task_147_fast_element_deletion_via_keyboard_delete_backspace`
