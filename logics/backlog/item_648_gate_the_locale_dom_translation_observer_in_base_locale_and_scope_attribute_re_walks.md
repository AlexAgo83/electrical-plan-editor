## item_648_gate_the_locale_dom_translation_observer_in_base_locale_and_scope_attribute_re_walks - Gate the locale DOM-translation observer in base locale and scope attribute re-walks
> From version: 1.17.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Runtime performance and bundle efficiency
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- useAppLocaleDomTranslation observes document.body for all subtree/childList/characterData/attribute mutations and walks changed subtrees after every render, multiplying the cost of the full-tree re-render problem.
- In locale en the observer work is a near-no-op restore pass on nodes that are already in the base language, yet it still runs on every mutation.
- An attribute mutation calls translateSubtree on the element, re-walking its entire subtree when only the element's own translatable attributes could have changed.

# Scope
- In:
  - Do not attach the MutationObserver when locale is en; on switching en -> fr run the initial full translateSubtree pass and attach the observer; on fr -> en run one restore pass then disconnect.
  - Handle the attributes mutation type by translating only the mutated element's translatable attributes (translateElementAttributes) instead of walking the subtree.
  - Unit tests covering: en session performs no observer work on DOM mutations; fr -> en -> fr round-trip restores base text and re-translates; attribute-only mutation in fr does not visit descendant text nodes.
- Out:
  - Any change to the translation dictionary, translateTextValue semantics, or data-locale-exempt behavior.
  - Migrating away from DOM-based translation to component-level i18n.

# Acceptance criteria
- AC1: With locale en, no MutationObserver is connected for translation and DOM mutations trigger no translation work, verified by unit test.
- AC2: Switching en -> fr translates the existing document and newly added nodes; switching back to en restores all base-language text and attributes, including nodes added while fr was active.
- AC3: In fr, an attribute-only mutation translates only that element's aria-label/aria-description/placeholder/title and does not traverse its descendants, verified by test instrumentation.
- AC4: Existing i18n and locale-switch test suites pass unchanged.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: With locale en, no MutationObserver is connected for translation and DOM mutations trigger no translation work, verified by unit test.
- request-AC4 -> This backlog slice. Proof: AC2: Switching en -> fr translates the existing document and newly added nodes; switching back to en restores all base-language text and attributes, including nodes added while fr was active.
- request-AC8 -> This backlog slice. Proof: AC3: In fr, an attribute-only mutation translates only that element's aria-label/aria-description/placeholder/title and does not traverse its descendants, verified by test instrumentation.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_editor_responsiveness_and_load_time_performance`
- Architecture decision(s): (none yet)
- Request: `req_161_runtime_rendering_and_initial_bundle_performance_overhaul`
- Primary task(s): `task_156_orchestrate_runtime_rendering_and_initial_bundle_performance_overhaul`

# AI Context
- Summary: Gate the locale DOM-translation observer in base locale and scope attribute re-walks
- Keywords: scaffolded-backlog, gate the locale dom-translation observer in base locale and scope attribute re-walks, implementation-ready
- Use when: Implementing the scaffolded slice for Gate the locale DOM-translation observer in base locale and scope attribute re-walks.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
