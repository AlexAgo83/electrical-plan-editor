## req_165_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract - Migrate runtime text translation to the shared semantic key i18n contract
> From version: 1.18.1
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 99
> Complexity: High
> Theme: Internationalization migration
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Replace translation of already-rendered English text with semantic translation keys resolved at render time.
- Move English and French values into governed JSON catalogs without attempting a risky all-at-once rewrite.
- Retire the legacy text and DOM translation paths only after screen-level coverage is demonstrated.

# Context
- `src/app/lib/i18n.ts` contains a large English-text-to-French-text map plus regular-expression handling for dynamic messages.
- Runtime translation currently depends on exact source wording and includes post-render coverage for UI areas that do not call a semantic-key API.
- Existing locale settings, onboarding, controller messages, validation, catalog import/export, and diagnostics already have targeted regression coverage that must remain authoritative.
- The shared i18n contract v1 is a delivery dependency; this request defines project migration after that contract is stable.

# Scope
- In:
  - inventory translation map entries, regex-based messages, DOM translation coverage, and locale entry points;
  - define semantic key namespaces and English/French JSON catalogs;
  - add the smallest local key-based adapter compatible with existing locale state;
  - migrate navigation and common actions first, then settings, forms/catalog, validation/diagnostics, onboarding, and dynamic import/export messages;
  - keep an explicit temporary legacy bridge for unmigrated surfaces and measure its remaining use;
  - declare and validate the final catalogs through the shared contract;
  - remove DOM/text translation only after all production paths and regression tests have moved to semantic keys.
- Out:
  - change domain terminology, validation rules, import/export formats, or application workflows;
  - perform a single unreviewable whole-application replacement;
  - add machine translation, a remote translation platform, or an unrelated framework;
  - weaken existing locale, controller, onboarding, catalog, or accessibility coverage.

# Acceptance criteria
- AC1: New and migrated UI paths resolve stable semantic keys at render time and do not depend on English visible text identity.
- AC2: English and French JSON catalogs pass schema, key, value, and named-placeholder parity validation under the shared contract.
- AC3: Migration is delivered in bounded screen/domain slices with the legacy bridge retained only for explicitly measured unmigrated coverage.
- AC4: Dynamic validation, catalog import/export, onboarding, and controller messages preserve their data interpolation and locale behavior.
- AC5: The DOM/text translator and regex compatibility layer are removed only after no production path or regression test depends on them.
- AC6: The viewer exposes the declared semantic catalogs and reports no contract diagnostics.
- AC7: Existing focused tests plus lint, typecheck, build, and contract validation pass after every migration wave.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Dependencies and risks
- Depends on the shared i18n v1 schema and validation commands being stable.
- Exact-text and regex translation can hide call-site coupling; removing compatibility before measuring coverage risks mixed-language UI.
- Large-scale key renaming must remain reviewable and must not obscure functional changes.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/lib/i18n.ts`
- `src/app/types/app-controller.ts`
- `src/tests/app.ui.settings-locale.spec.tsx`
- `src/tests/app.locale-dom-translation.spec.tsx`
- `logics/backlog/item_479_settings_panel_reorder_and_app_wide_i18n_en_fr_with_table_label_compaction_safeguards.md`
- `logics/backlog/item_516_runtime_i18n_coverage_completion_for_controller_onboarding_and_catalog_import_export_status_strings.md`

# AI Context
- Summary: Incrementally replace runtime English-text translation with governed semantic JSON catalogs.
- Keywords: i18n-contract, semantic-keys, legacy-bridge, incremental-migration
- Use when: Planning and sequencing the application-wide migration after the shared contract is available.
- Skip when: Changing unrelated product behavior or translation wording.

# Backlog
- none
- `item_669_migrate_runtime_text_translation_to_the_shared_semantic_key_i18n_contract`
