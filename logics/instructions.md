# Codex Context

This file defines the working context for Codex in this repository.

## Language

Use English for all communication, code comments, and documentation.

## Workflow

The `logics` folder defines a lightweight product flow:

* `logics/architecture`: Architecture notes, decisions, and diagrams.
* `logics/request`: Incoming requests or ideas (problem statement + context).
* `logics/backlog`: Scoped items with acceptance criteria + priority.
* `logics/tasks`: Execution plans derived from backlog items (plan + progress + validation).
* `logics/specs`: Lightweight functional specs derived from backlog/tasks.
* `logics/external`: Generated artifacts (images, exports) that don't fit other logics folders.

## Indicators

Use the following indicators in request/backlog/task items:

* `From version: X.X.X` : The version when the need was first identified.
* `Understanding: ??%` : Your estimated understanding of the need.
* `Confidence: ??%` : Your confidence in solving the need.
* `Progress: ??%` : Your progress toward completing the backlog item or task.
* `Complexity: Low | Medium | High` : Effort/complexity classification.
* `Theme: Combat | Items | Economy | UI | ...` : High-level theme/epic tag.

## Automation

This repository uses a reusable Logics skills kit (usually imported as a submodule under `logics/skills/`).

Core workflow in this project:

- Lint Logics docs (required in CI/local): `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- Create/promote request/backlog/task docs: `python3 logics/skills/logics-flow-manager/scripts/logics_flow.py`

On-demand workflow:

- Bootstrap folders (one-time or structural checks): `python3 logics/skills/logics-bootstrapper/scripts/logics_bootstrap.py`
- Other skills in `logics/skills/` are optional and should be used only when they match a concrete need.

## MCP

Available MCP skills (optional, connector-specific) include:

- Chrome DevTools: `logics/skills/logics-mcp-chrome-devtools/SKILL.md`
- Terminal: `logics/skills/logics-mcp-terminal/SKILL.md`
- Figma: `logics/skills/logics-mcp-figma/SKILL.md`
- Linear: `logics/skills/logics-mcp-linear/SKILL.md`
- Notion: `logics/skills/logics-mcp-notion/SKILL.md`

## Validation

Project validation commands are project-specific.
Add the relevant ones to task docs under `# Validation` (tests/lint/build/typecheck).
