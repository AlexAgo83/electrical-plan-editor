## item_129_app_ui_modules_real_lazy_chunking_contract_restoration_with_testable_modes - appUiModules Real Lazy Chunking Contract Restoration with Testable Modes
> From version: 0.5.7
> Understanding: 99%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Restore Actual Production Code-Splitting Without Losing Lazy Test Harness Controls
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`appUiModules` currently statically imports the same UI modules it also dynamically imports via `lazy()`. Vite warns that dynamic imports will not move those modules into separate chunks, which undermines the intended production lazy-loading behavior and makes lazy-path regression tests less representative.

# Scope
- In:
  - Restore real production chunk-splitting behavior for `appUiModules` targets.
  - Preserve testable lazy/eager mode controls introduced in `req_021`.
  - Keep lazy-path regression tests meaningful and stable.
- Out:
  - Full replacement of the lazy/eager registry architecture.
  - Broad build tooling changes beyond what is needed for this contract.

# Acceptance criteria
- Production build no longer emits dynamic-import-not-splitting warnings caused by static+dynamic imports in `appUiModules` (or equivalent documented resolution).
- Lazy-path test controls remain available and explicit.
- Lazy-path regression coverage continues to pass.
- Changes remain readable and localized.

# Priority
- Impact: High (production loading behavior + regression realism).
- Urgency: High (direct follow-up review finding).

# Notes
- Dependencies: `req_021` lazy-path test harness baseline.
- Blocks: item_133.
- Related AC: AC1, AC2, AC7.
- References:
  - `logics/request/req_022_post_req_021_review_followup_real_lazy_chunking_no_active_network_compute_scoping_and_test_helper_contract_hardening.md`
  - `src/app/components/appUiModules.tsx`
  - `src/tests/app.ui.lazy-loading-regression.spec.tsx`
  - `src/app/components/layout/AppShellLayout.tsx`
  - `package.json`
  - `vite.config.ts`
