# Contributing

Thanks for contributing to Electrical Plan Editor.

## Prerequisites

- Node.js 20+
- npm
- Python 3

## Setup

```bash
npm ci
git submodule update --init --recursive
```

## Development Workflow

1. Create a branch from `main`.
2. Implement your change with focused commits.
3. Run the full validation suite locally.
4. Open a Pull Request with a clear description of scope and risks.

## Validation Checklist

Run these commands before submitting:

```bash
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
npm run lint
npm run typecheck
npm run test:ci
npm run test:e2e
```

## Code and Documentation Expectations

- Keep behavior deterministic in routing and occupancy logic.
- Preserve local-first persistence guarantees.
- Add or update tests for any behavior change.
- If you modify product scope/planning, update `logics/request`, `logics/backlog`, and `logics/tasks` consistently.

## Pull Request Guidelines

Include:

- What changed
- Why it changed
- How you validated it
- Any known limitations or follow-up items

