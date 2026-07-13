## item_672_migrate_onboarding_controller_notifications_and_import_export_states - Migrate onboarding, controller notifications, and import-export states
> From version: 1.18.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: Medium
> Theme: Internationalization contract adoption
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Onboarding and controller-level feedback contain dynamic product sentences that are currently handled by source-text and regular-expression compatibility rules.
- Import and export feedback must localize its framing while preserving file names, formats, counts, and error details as data.

# Scope
- In:
  - Migrate onboarding steps, help text, controller notifications, confirmation dialogs, and import/export progress and result states.
  - Replace every regular-expression translation rule with an explicit semantic message and named placeholders.
  - Preserve file names, extensions, identifiers, raw parser details, and user-provided values as interpolation data.
  - Cover success, warning, error, cancellation, and accessibility states in both locales.
- Out:
  - Changing import/export formats or onboarding flow behavior.
  - Localizing third-party or operating-system error text that is not product-owned.

# Acceptance criteria
- AC1: All targeted surfaces use semantic keys and named placeholders.
- AC2: No source-text regular-expression handler is needed by a migrated flow.
- AC3: File and user data remain unchanged across locale switches.
- AC4: Tests cover representative success and failure paths in both locales.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: All targeted surfaces use semantic keys and named placeholders.
- request-AC2 -> This backlog slice. Proof: AC2: No source-text regular-expression handler is needed by a migrated flow.
- request-AC4 -> This backlog slice. Proof: AC3: File and user data remain unchanged across locale switches.
- request-AC5 -> This backlog slice. Proof: AC4: Tests cover representative success and failure paths in both locales.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)
- Request: `req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility`
- Primary task(s): `task_163_orchestrate_completion_of_semantic_localization`

# AI Context
- Summary: Migrate onboarding, controller notifications, and import-export states
- Keywords: scaffolded-backlog, migrate onboarding, controller notifications, and import-export states, implementation-ready
- Use when: Implementing the scaffolded slice for Migrate onboarding, controller notifications, and import-export states.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
