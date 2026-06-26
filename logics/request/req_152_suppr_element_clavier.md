## req_152_suppr_element_clavier - Fast element deletion via keyboard (Delete/Backspace)
> From version: 1.16.10
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Let the user delete the selected plan element with the `Delete` and `Backspace` keys, without going through a secondary action (a button in a table).
- Goal: editing speed, natural interaction close to classic drawing tools.

# Context
- The selected element is held in `state.ui.selected` = `{ kind, id }`, `kind ∈ { catalog, connector, splice, node, segment, wire }` (`src/store/types.ts`).
- A global keyboard handler already exists: `src/app/hooks/useKeyboardShortcuts.ts` (`window.addEventListener("keydown")`) with an `isEditableElement()` guard that ignores keystrokes inside `input/textarea/select`/contenteditable. → the new key plugs in here, the anti-typing guard is already covered.
- Each kind already has its delete handler: `handleConnectorDelete`, `handleSpliceDelete`, `handleNodeDelete`, `handleSegmentDelete`, `handleWireDelete` (+ cascade variants for connector/splice). → route by `selected.kind`, no new deletion logic.
- A confirmation infrastructure exists: `useConfirmDialogController` (`requestConfirmation`) + `ConfirmDialog`. → reused, nothing to build.

# Decisions
- Active keys: `Delete` **and** `Backspace`.
- Deletion is **always preceded by a confirmation** through the existing `ConfirmDialog`.
- No trigger when focus is in an input field (the `isEditableElement` guard is already in place).

# Acceptance criteria
- AC1: A selected element (any `kind`) is deleted by pressing `Delete` or `Backspace`, after confirmation.
- AC2: The keystroke is ignored if no element is selected, or if focus is inside an `input/textarea/select`/contenteditable.
- AC3: Confirmation uses the existing `ConfirmDialog`; cancelling leaves the element intact.
- AC4: Deletion routes to the correct handler based on `selected.kind`, including cascade cases (connector/splice).

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: keyboard shortcut + delete routing + confirmation, for all 6 kinds.
- Out: changing the behavior of the existing delete buttons; multi-selection (only one element is selected at a time today).

# Risks / Open questions
- Confirmation behavior for cascade deletions: the `ConfirmDialog` should ideally surface the cascade effect (impacted wires/segments) for `node`/`connector`/`splice`.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/store/types.ts` (state.ui.selected)
- `src/app/hooks/useKeyboardShortcuts.ts` (global keyboard + isEditableElement)
- `src/app/hooks/controller/useConfirmDialogController.ts` (confirmation)
- `src/app/hooks/useConnectorHandlers.ts`, `useNodeHandlers.ts`, `useSegmentHandlers.ts`, `useSpliceHandlers.ts`, `src/app/hook-impl/useWireHandlers.ts` (delete handlers)

# AI Context
- Summary: Delete/Backspace shortcut to remove the selected plan element, with confirmation, reusing the existing global keyboard handler and ConfirmDialog.
- Keywords: keyboard-shortcut, delete, selection, edition-plan, confirm-dialog
- Use when: implementing keyboard deletion in the plan editor.
- Skip when: working on the existing delete buttons or multi-selection.

# Backlog
- none
