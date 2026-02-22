## item_092_ci_workflow_build_and_pwa_quality_gate_extension - CI Workflow Build and PWA Quality-Gate Extension
> From version: 0.5.0
> Understanding: 100%
> Confidence: 98%
> Progress: 0%
> Complexity: Low
> Theme: CI Release Safety Completion
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The CI pipeline validates code quality and tests but does not currently validate production build output or generated PWA artifacts, allowing release-only failures to slip through.

# Scope
- In:
  - Extend `.github/workflows/ci.yml` with:
    - `npm run build`
    - `npm run quality:pwa`
  - Preserve existing CI checks (docs lint, lint, typecheck, quality gates, unit/integration, E2E).
  - Choose and document step ordering consistent with fail-fast behavior.
- Out:
  - CI job matrix parallelization redesign.
  - Deployment automation changes.

# Acceptance criteria
- CI workflow runs production build validation and PWA artifact validation.
- Existing CI steps remain present and operational.
- Pipeline remains green on baseline project state after change.
- README/Logics references remain consistent with CI behavior.

# Priority
- Impact: High (deployment confidence).
- Urgency: High (prevents false-green CI before deploy).

# Notes
- Blocks: item_093 (full closure should validate updated CI path).
- Related AC: AC5, AC7.
- References:
  - `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`
  - `.github/workflows/ci.yml`
  - `package.json`
  - `vite.config.ts`

