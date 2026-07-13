## req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility - Complete semantic i18n migration and retire runtime text compatibility
> From version: 1.18.2
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Internationalization contract adoption
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- All product-owned interface copy must use stable semantic keys at render time instead of being discovered from English text after rendering.
- The temporary legacy catalog, DOM observer, and text/regular-expression translation bridge must be removed without regressing either supported locale.
- Dynamic messages must use named placeholders and explicit plural-aware formatting rather than reconstructed source sentences.
- Configured electrical data, imported model content, user input, identifiers, and domain values must remain data and must never be translated as interface copy.

# Context
- A first migration slice established the shared i18n contract, locale catalogs, semantic navigation keys, and lifecycle commands.
- The English catalog still contains a large legacy namespace keyed from visible source text. src/app/lib/i18n.ts derives reverse lookup and regular-expression handlers from that namespace.
- src/app/hooks/useAppLocaleDomTranslation.ts observes rendered DOM text and attributes, while src/app/AppController.tsx activates that compatibility layer for the selected locale.
- Remaining product-owned copy spans settings, common actions and forms, modeling and catalog workflows, validation and diagnostics, onboarding, controller notifications, and import/export states.
- The migration must preserve domain terminology and distinguish product-owned labels from configured catalog names, file content, model values, and user-authored text.
- The central i18n contract is optional at repository level but is the target convention whenever this product exposes localized UI.

# Acceptance criteria
- AC1: Every remaining product-owned user-visible string and accessibility label is rendered from a stable semantic key in the canonical catalogs, with locale parity and no raw-sentence keys.
- AC2: Dynamic messages use named placeholders and locale-aware formatting; no regular-expression reconstruction of English source sentences remains.
- AC3: The DOM observer, legacy reverse lookup, legacy catalog namespace, and compatibility hook are deleted after an automated zero-consumer proof.
- AC4: Configured domain data, imported content, user input, identifiers, and file/model values remain untranslated and are covered by boundary tests.
- AC5: The repository i18n lifecycle checks, unit tests, UI tests, type checks, and production build pass, and a static guard prevents new hardcoded product copy.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)

# References
- src/app/lib/i18n.ts
- src/app/hooks/useAppLocaleDomTranslation.ts
- src/app/AppController.tsx
- src/app/components/settings
- src/app/components/modeling
- src/app/components/onboarding
- src/app/components/catalog
- src/app/components/validation

# AI Context
- Summary: Complete semantic i18n migration and retire runtime text compatibility
- Keywords: request-chain-scaffold, complete semantic i18n migration and retire runtime text compatibility, development-ready
- Use when: You need to implement or review the scaffolded workflow for Complete semantic i18n migration and retire runtime text compatibility.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_670_migrate_settings_shared_shell_actions_and_forms_to_semantic_keys`
- `item_671_migrate_modeling_catalog_validation_and_diagnostic_surfaces`
- `item_672_migrate_onboarding_controller_notifications_and_import_export_states`
- `item_673_prove_zero_legacy_consumers_and_remove_the_runtime_compatibility_bridge`
