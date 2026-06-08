# Logics Context

This repository uses the Logics workflow to keep product intent, scoped delivery work, validation evidence, and architectural decisions connected to the code that ships in `electrical-plan-editor`.

`electrical-plan-editor` is a local-first React/TypeScript electrical network editor. Logics documents should preserve that product contract: deterministic graph behavior, explicit user-controlled persistence, reversible operations, reliable import/export, and validation that matches the app operators see.

## Operating Rule

- Treat `logics/` as managed workflow context, not scratch notes.
- Keep workflow documents in English.
- Prefer `logics-manager` for Logics operations when it is available.
- Use raw file edits only when the needed change is editorial, cross-document, or not covered by a `logics-manager flow ...` command.
- Keep Logics updates small enough to review, but do not leave delivered work in `Ready` or `In progress`.
- Preserve explicit user save/apply actions in product scope. Do not document or implement silent persistence unless the user explicitly asks for live updates.
- Keep product summaries user-facing. Avoid commit-style narration when documenting releases or recent changes.

## Document Map

- `logics/request`: incoming needs, field observations, user requests, and product problems.
- `logics/backlog`: scoped delivery slices with acceptance criteria, priority, dependencies, and links back to requests.
- `logics/tasks`: execution plans, Definition of Done, progress, validation, and closeout evidence derived from backlog items.
- `logics/specs`: lightweight functional specs derived from requests or tasks.
- `logics/product`: product framing, user value, non-goals, success signals, and feature-level positioning.
- `logics/architecture`: ADRs and technical decisions for model, persistence, UI/runtime boundaries, import/export, and validation contracts.
- `logics/external`: generated artifacts that do not fit the managed doc folders.
- `logics/.cache`: local Logics tool cache. Do not commit cache artifacts.

## Required Links

- A request with acceptance criteria should link at least one backlog item under `# Backlog`.
- A backlog item should link its source request and primary task under `# Links`.
- A task should link its source backlog and related request under `# Backlog` and `# Links`.
- Backlog/task docs that make a meaningful product claim should link a product brief.
- Backlog/task docs that define graph semantics, persistence, import/export schemas, validation severity, AI Agent operation boundaries, harness assembly behavior, connector layout contracts, or release gates should link an ADR.
- Product briefs and ADRs should mirror their related managed docs under `# References`, not only in front-matter prose.
- Do not leave active links as `TBD` when a linked doc exists. Replace placeholders with the real ref.

## Status Discipline

- `Draft`: incomplete idea, rough capture, or request still missing delivery framing.
- `Ready`: scoped and actionable but not yet implemented.
- `In progress`: actively being implemented or partially delivered with remaining work called out.
- `Blocked`: cannot proceed without a named dependency, missing decision, or unavailable validation route.
- `Done`: delivered, validated, and traceability updated.
- `Obsolete` or `Archived`: no longer active; explain why in the report, notes, or delivery status.

Do not leave a request as `Ready` after its code and release notes have shipped. Promote it, link the delivery docs, record validation evidence, and close the chain.

If work is partially shipped, keep the source backlog or follow-up task open only when the undelivered behavior is explicit. Record what shipped, what did not, and the version where the partial delivery landed.

## Acceptance Traceability

For each request/backlog/task chain:

- Request ACs should map to backlog slices using `request-ACN -> ...` lines in backlog docs.
- Request ACs should map to implementation tasks when the work is delivered.
- Backlog ACs should map to task plan items, DoD items, or report evidence.
- Proof should name the command, file, behavior, fixture, scenario, or validation result that satisfies the AC.
- Avoid placeholder refs such as `req_XXX_example` in active docs. Replace them with real refs or `(none yet)` if no source exists.
- When closing broad release-validation tasks, link to the changelog entry or version marker that shipped the work.

## Product Discipline

- Model behavior should stay deterministic: routing, layout generation, occupancy checks, validation ordering, and import/export normalization must not depend on incidental iteration order.
- Local-first persistence is a product guarantee. Schema migrations, storage failures, import rejection, and export payloads need explicit validation evidence when touched.
- Editing flows should remain user-controlled. Draft text, layout changes, AI Agent proposals, and destructive actions should persist only through explicit save/apply/confirm paths unless scoped otherwise.
- Validation severity is part of the UX contract. Do not upgrade warnings to errors, relax errors, or add permissive fallbacks without documenting the intended operator behavior.
- Harness assembly, functional schematic, connector physical layout, catalog defaults, and pin electrical roles are shared domain surfaces; changes to one usually need regression notes for the others.
- Remove obsolete or empty UI rather than leaving visible-but-empty panels, dead controls, or misleading affordances.
- For reporting requests such as product lists or release summaries, synthesize by user-facing capability from changelogs and product docs, not raw commit history.

## Closeout Rules

Before marking a task `Done`:

- Check every DoD item.
- Record validation evidence under `# Validation`, `# Report`, or `# Delivery Status`.
- Update linked request/backlog/task docs.
- Keep `Progress: 100%`.
- Run the relevant local validation, at minimum `logics-manager lint --require-status` for Logics-only changes.
- If a validation command is skipped, record why and the remaining risk.

Before closing a request:

- Confirm all acceptance criteria are either delivered, explicitly moved to a linked follow-up, or marked out of scope with a reason.
- Confirm related backlog/tasks reference the request and summarize delivery evidence.
- Confirm the changelog or release notes mention user-visible shipped behavior when applicable.

## Preferred Commands

Use these direct commands when `logics-manager` is on `PATH`:

- `logics-manager status`: summarize open workflow state and next actions.
- `logics-manager health`: count docs, workflow docs, open docs, and issue signals.
- `logics-manager audit`: check workflow consistency, gates, companion docs, and traceability.
- `logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`: repo CI-compatible audit scope for the current legacy corpus.
- `logics-manager lint --require-status`: validate document structure and required status fields.
- `logics-manager view`: open the browser viewer for visual navigation and focus workflows.
- `logics-manager sync list-docs`: list bounded document context.
- `logics-manager sync read-doc <ref-or-path>`: read one managed document.
- `logics-manager sync search-docs <query>`: search the corpus without broad file scans.
- `logics-manager sync context-pack ...`: build bounded context packs for implementation or review.
- `logics-manager sync close-eligible-requests`: update request closeout state when deterministic rules apply; inspect the resulting diff before committing.
- `logics-manager flow list`: inspect active request/backlog/task docs.
- `logics-manager flow new <request|backlog|task>`: create a managed workflow doc.
- `logics-manager flow promote request-to-backlog <request-ref>`: create a linked backlog item.
- `logics-manager flow promote backlog-to-task <backlog-ref>`: create a linked task.
- `logics-manager flow companion <product|architecture>`: create companion framing docs.
- `logics-manager flow repair <gates|ac-traceability|links|mermaid>`: apply deterministic workflow repairs.
- `logics-manager flow validate-closeout <task-ref>`: preflight a task before closing.
- `logics-manager flow closeout <task-ref> --validation "<evidence>" --lint --audit`: close a task with evidence when the command fits.
- `logics-manager mcp tools`: inspect Logics MCP surfaces when an MCP workflow is the right fit.

If the executable is not on `PATH`, use the Python module form:

- `python3 -m logics_manager status`
- `python3 -m logics_manager health`
- `python3 -m logics_manager audit`
- `python3 -m logics_manager lint --require-status`
- `python3 -m logics_manager flow ...`

## Assistant CLI Hygiene

- If `rtk` is available, prefer RTK wrappers for noisy terminal commands whose exact raw output is not required.
- Keep raw commands for exact diffs, complete logs, snapshots, security-sensitive inspection, machine-readable JSON, or any case where RTK filtering could hide relevant detail.
- If RTK reports untrusted project filters, do not trust filtered output until the project filters have been reviewed and trusted.
- Use `rg` / `rg --files` first for local search.
- Use `logics-manager sync read-doc` and `search-docs` for bounded Logics context before broad file scans.

## Repository Validation

Use the validation set that matches the changed surface:

- Logics-only: `logics-manager lint --require-status`, plus the scoped audit command when changing request/backlog/task links.
- Product docs or release notes: Logics lint, `git diff --check`, and a quick consistency check against `README.md`, `VERSION`, and the relevant changelog.
- TypeScript or React behavior: `npm run -s lint`, `npm run -s typecheck`, and focused Vitest coverage.
- Core graph/routing/layout/store changes: focused unit tests plus `npm run -s test:ci:fast -- --coverage` when the surface is shared.
- UI workflow changes: focused Testing Library/Vitest tests, `npm run -s test:ci:ui`, and Playwright when navigation, dialogs, persistence, or end-to-end operator flows change.
- Persistence/import/export changes: schema migration or round-trip tests, relevant storage/import fixtures, and `npm run -s quality:pwa` when offline shell or build artifacts can be affected.
- Modularization work: run the matching quality gate, such as `quality:ui-modularization`, `quality:hooks-modularization`, `quality:store-modularization`, `quality:exceljs-boundary`, or `quality:ui-timeout-governance`.
- Full local gate: `npm run -s ci:blocking`.

Current `ci:blocking` includes Logics lint, deterministic close-eligible request sync diff checks, the legacy-scoped Logics audit, lint, typecheck, dependency audit, segmented tests, modularization gates, Playwright E2E, Vite build, and PWA artifact checks.

## Release Prep

For `prepares la release`, stage the release without publishing unless explicitly told otherwise:

- Confirm the target version from `VERSION`, `package.json`, `package-lock.json`, README badge text, and changelog naming.
- Review recent changelog entries and summarize user-facing changes by capability.
- Run Logics status/health and the CI-compatible Logics audit.
- Run the relevant validation gate. Prefer `npm run -s ci:blocking` for final release prep.
- Record blockers separately from completed prep. Do not push tags or publish releases unless the user asks for release publication.

For `fais la release`, publish only after release prep is clean or the user explicitly accepts known risk:

- Commit validated release prep.
- Push the branch and verify the remote head.
- Create and push the version tag.
- Create the GitHub release from the changelog.
- Verify GitHub release visibility and CI status after publication.

## Maintenance Notes

- Do not vendor `logics/skills/` into this repository; Logics tooling comes from the installed `logics-manager` package.
- Do not commit local cache files under `logics/.cache/`.
- Remove macOS artifacts such as `.DS_Store` when found under `logics/`.
- Keep generated mermaid diagrams valid when editing managed docs.
- Preserve `AGENTS.md` as the short pointer to this file unless the agent bootstrap contract changes.
- Keep `CLAUDE.md` RTK guidance aligned with this file when command-execution expectations change.
