## item_316_onboarding_catalog_step_insertion_catalog_first_guidance_and_contextual_actions - Onboarding Catalog Step Insertion, Catalog-First Guidance, and Contextual Actions
> From version: 0.9.4
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Extend onboarding flow with a Catalog-first step and update connector/splice guidance accordingly
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`req_051` changes the recommended creation sequence to `catalog-first`, but onboarding currently instructs users to build connectors/splices directly. The onboarding flow must be updated to reflect the new sequence and provide contextual actions to the Catalog panels.

# Scope
- In:
  - Add a new onboarding step for `Catalog` in 2nd position (after network creation, before connector/splice library step).
  - Update onboarding progress count/labels (e.g. 5 -> 6 steps).
  - Add contextual onboarding help entry for Catalog panel (`modeling-catalog`).
  - Implement Catalog onboarding target actions (`Open/Scroll to Catalog`, optional edit panel target action).
  - Update existing `connectorSpliceLibrary` onboarding wording to reflect catalog-first workflow.
- Out:
  - Catalog domain/store implementation.
  - Connector/splice form enforcement logic.

# Acceptance criteria
- Onboarding full flow contains a new Catalog step in the correct order.
- Progress label count updates consistently.
- Catalog contextual help opens the Catalog onboarding step.
- Connector/splice onboarding wording reflects catalog-first creation.
- Onboarding target actions navigate/scroll to the correct Catalog UI context.

# Priority
- Impact: Medium-High.
- Urgency: Medium-High.

# Notes
- Dependencies: `req_051`, item_313.
- Blocks: item_317, item_318.
- Related AC: AC12, AC19.
- References:
  - `logics/request/req_051_catalog_screen_with_catalog_item_crud_navigation_integration_and_required_manufacturer_reference_connection_count.md`
  - `src/app/lib/onboarding.ts`
  - `src/app/components/onboarding/OnboardingModal.tsx`
  - `src/app/AppController.tsx`

