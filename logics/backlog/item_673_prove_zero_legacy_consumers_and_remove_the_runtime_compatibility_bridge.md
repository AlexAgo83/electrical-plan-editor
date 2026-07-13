## item_673_prove_zero_legacy_consumers_and_remove_the_runtime_compatibility_bridge - Prove zero legacy consumers and remove the runtime compatibility bridge
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
- The compatibility layer remains global infrastructure until every consumer is migrated and its absence is verified.
- Leaving an empty bridge in place would allow future hardcoded copy to silently reintroduce source-text translation.

# Scope
- In:
  - Run the legacy-consumer report and resolve every remaining product-owned entry or explicitly classify it as non-translatable data.
  - Delete the legacy catalog namespace, reverse lookup, regular-expression handlers, DOM observer hook, controller activation, and obsolete tests.
  - Add a static hardcoded-copy guard with a narrow reviewed allowlist for test fixtures and data values.
  - Run lifecycle validation, locale parity, unit and UI tests, type checks, and production build; record closure evidence in the orchestration task.
- Out:
  - Broad refactoring unrelated to localization.
  - Adding translation management services.

# Acceptance criteria
- AC1: Automated inventory reports zero runtime consumers of legacy source-text translation.
- AC2: All compatibility implementation and the legacy namespace are removed from production code.
- AC3: A failing fixture proves the static guard rejects newly hardcoded product copy.
- AC4: Full repository validation passes in both locales and boundary tests prove domain data is untouched.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Automated inventory reports zero runtime consumers of legacy source-text translation.
- request-AC2 -> This backlog slice. Proof: AC2: All compatibility implementation and the legacy namespace are removed from production code.
- request-AC3 -> This backlog slice. Proof: AC3: A failing fixture proves the static guard rejects newly hardcoded product copy.
- request-AC4 -> This backlog slice. Proof: AC4: Full repository validation passes in both locales and boundary tests prove domain data is untouched.
- request-AC5 -> This backlog slice. Proof: AC4: Full repository validation passes in both locales and boundary tests prove domain data is untouched.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_semantic_localization_completion`
- Architecture decision(s): (none yet)
- Request: `req_166_complete_semantic_i18n_migration_and_retire_runtime_text_compatibility`
- Primary task(s): `task_163_orchestrate_completion_of_semantic_localization`

# AI Context
- Summary: Prove zero legacy consumers and remove the runtime compatibility bridge
- Keywords: scaffolded-backlog, prove zero legacy consumers and remove the runtime compatibility bridge, implementation-ready
- Use when: Implementing the scaffolded slice for Prove zero legacy consumers and remove the runtime compatibility bridge.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
