## item_670_migrate_settings_shared_shell_actions_and_forms_to_semantic_keys - Migrate settings, shared shell, actions, and forms to semantic keys
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Internationalization contract adoption
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Shared controls and settings still depend on visible source text being translated after render.
- These high-reuse surfaces multiply legacy dependencies and make coverage difficult to measure.

# Scope
- In:
  - Inventory product-owned copy in settings, shared shell, dialogs, buttons, menus, form labels, placeholders, titles, empty states, and accessibility attributes.
  - Introduce semantic namespaces for common actions and settings concepts, then render them through the existing translator API.
  - Add a machine-readable legacy-consumer report so each remaining legacy entry can be assigned to a source surface.
  - Add tests proving configured labels, model values, and user-entered form values are not passed through translation.
- Out:
  - Modeling, catalog, validation, onboarding, and controller-specific copy.
  - Visual redesign of settings or forms.

# Acceptance criteria
- AC1: Settings and shared UI render all product-owned copy from semantic catalog keys in both locales.
- AC2: The legacy-consumer report lists every remaining compatibility dependency by source surface.
- AC3: Boundary tests keep configured and user-provided values unchanged.
- AC4: No migrated component relies on DOM mutation for its localized result.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Settings and shared UI render all product-owned copy from semantic catalog keys in both locales.
- request-AC4 -> This backlog slice. Proof: AC2: The legacy-consumer report lists every remaining compatibility dependency by source surface.
- request-AC5 -> This backlog slice. Proof: AC3: Boundary tests keep configured and user-provided values unchanged.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)
- Request: `req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility`
- Primary task(s): `task_163_orchestrate_completion_of_semantic_localization`

# AI Context
- Summary: Migrate settings, shared shell, actions, and forms to semantic keys
- Keywords: scaffolded-backlog, migrate settings, shared shell, actions, and forms to semantic keys, implementation-ready
- Use when: Implementing the scaffolded slice for Migrate settings, shared shell, actions, and forms to semantic keys.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_163_orchestrate_completion_of_semantic_localization`

# Notes
- Task `task_163_orchestrate_completion_of_semantic_localization` was finished via `logics-manager flow finish task` on 2026-07-13.
