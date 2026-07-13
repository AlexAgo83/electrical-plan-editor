## item_671_migrate_modeling_catalog_validation_and_diagnostic_surfaces - Migrate modeling, catalog, validation, and diagnostic surfaces
> From version: 1.18.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Internationalization contract adoption
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Domain-heavy panels mix product instructions and diagnostics with configured electrical data.
- Runtime source-text matching cannot reliably preserve that boundary or format dynamic counts and values.

# Scope
- In:
  - Create semantic keys for modeling forms, catalog actions, validation summaries, diagnostics, warnings, errors, and accessibility labels.
  - Convert dynamic counts, names embedded in product sentences, and validation details to named placeholders with locale-aware number and plural formatting.
  - Keep configured part names, wire labels, connector identifiers, measurements, and model content as interpolation data rather than catalog keys.
  - Add focused UI tests for both locales and data-boundary cases.
- Out:
  - Translation of catalog records or imported model content.
  - Changes to validation or modeling rules.

# Acceptance criteria
- AC1: Product-owned copy across the targeted domain surfaces uses semantic keys with complete locale parity.
- AC2: Dynamic messages use named placeholders and correct plural/number formatting.
- AC3: Domain values remain byte-for-byte unchanged when the locale changes.
- AC4: Targeted UI tests pass without the DOM compatibility translator.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Product-owned copy across the targeted domain surfaces uses semantic keys with complete locale parity.
- request-AC2 -> This backlog slice. Proof: AC2: Dynamic messages use named placeholders and correct plural/number formatting.
- request-AC4 -> This backlog slice. Proof: AC3: Domain values remain byte-for-byte unchanged when the locale changes.
- request-AC5 -> This backlog slice. Proof: AC4: Targeted UI tests pass without the DOM compatibility translator.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)
- Request: `req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility`
- Primary task(s): `task_163_orchestrate_completion_of_semantic_localization`

# AI Context
- Summary: Migrate modeling, catalog, validation, and diagnostic surfaces
- Keywords: scaffolded-backlog, migrate modeling, catalog, validation, and diagnostic surfaces, implementation-ready
- Use when: Implementing the scaffolded slice for Migrate modeling, catalog, validation, and diagnostic surfaces.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_163_orchestrate_completion_of_semantic_localization`

# Notes
- Task `task_163_orchestrate_completion_of_semantic_localization` was finished via `logics-manager flow finish task` on 2026-07-13.
