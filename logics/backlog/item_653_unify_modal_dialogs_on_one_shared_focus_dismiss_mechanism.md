## item_653_unify_modal_dialogs_on_one_shared_focus_dismiss_mechanism - Unify modal dialogs on one shared focus/dismiss mechanism
> From version: 1.18.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Codebase simplification and maintenance cost reduction
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Ten modal components each hand-roll the same focus trap, Escape handler, Tab cycling, initial-focus and focus-restore logic, and a button-element backdrop (~50 redundant lines each, ~500 total).
- No shared useModal or useFocusTrap hook exists, so every new dialog copies the pattern again and accessibility fixes must be applied ten times.

# Scope
- In:
  - Prefer the native dialog element with showModal(): free focus trapping, Escape via the cancel event, and ::backdrop styling; fall back to one shared useModalDialog hook only if native dialog conflicts with existing styling or test infrastructure (spike on ConfirmDialog first, then decide once for all ten).
  - Migrate all ten dialogs (ConfirmDialog, ChoiceDialog, DeleteImpactDialog, FileFeedbackDialog, ImportOverwriteDialog, BomExportPreviewDialog, SvgExportPreviewDialog, MultiNetworkFunctionalAnalysisDialog, PinRoleMassEditDialog, OnboardingModal) to the chosen mechanism, deleting the per-dialog trap/Escape/restore code.
  - Preserve existing per-dialog options with real callers (confirmOnEnter, closeOnBackdrop, detailsLabel) and current focus-restore behavior on close.
  - Keep existing dialog test suites green; adapt queries only where the DOM structure legitimately changes (dialog element vs div).
- Out:
  - Visual redesign of any dialog; backdrop appearance must stay equivalent.
  - Non-modal popovers, tooltips, or the settings drawer.
  - New accessibility features beyond what the shared mechanism gives for free.

# Acceptance criteria
- AC1: One mechanism (native dialog or one shared hook) owns focus trap, Escape, Tab cycling, and focus restore; zero per-dialog copies remain, verified by grepping for the old trap patterns.
- AC2: All ten dialogs open, trap focus, close on Escape, respect closeOnBackdrop/confirmOnEnter options, and restore focus to the invoking control, covered by the existing UI test suites.
- AC3: Net line count across the ten dialog files decreases by at least 350 lines.
- AC4: Full ci:blocking passes.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: One mechanism (native dialog or one shared hook) owns focus trap, Escape, Tab cycling, and focus restore; zero per-dialog copies remain, verified by grepping for the old trap patterns.
- request-AC8 -> This backlog slice. Proof: AC2: All ten dialogs open, trap focus, close on Escape, respect closeOnBackdrop/confirmOnEnter options, and restore focus to the invoking control, covered by the existing UI test suites.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_codebase_simplification_and_tooling_consolidation`
- Architecture decision(s): (none yet)
- Request: `req_162_over_engineering_reduction_replace_bespoke_gates_with_eslint_collapse_mirror_layers_delete_dead_code`
- Primary task(s): `task_157_orchestrate_over_engineering_reduction_across_gates_layers_dead_code_and_dependencies`

# AI Context
- Summary: Unify modal dialogs on one shared focus/dismiss mechanism
- Keywords: scaffolded-backlog, unify modal dialogs on one shared focus/dismiss mechanism, implementation-ready
- Use when: Implementing the scaffolded slice for Unify modal dialogs on one shared focus/dismiss mechanism.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
