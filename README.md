# Electrical Plan Editor

A local-first electrical network editor focused on deterministic modeling, routing, and validation.

The project models connectors, splices, nodes, segments, and wires as a graph, computes shortest routes, and keeps wire lengths synchronized with segment changes.

[![CI](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/AlexAgo83/electrical-plan-editor)](LICENSE)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Quality and CI](#quality-and-ci)
- [Contributing](#contributing)
- [License](#license)

## Features

- Deterministic domain model for:
  - Connectors with cavity occupancy
  - Splices with port occupancy
  - Graph nodes and weighted segments
  - Wires with endpoint constraints
- Automatic shortest-path routing (Dijkstra-based)
- Forced route lock/reset for wires
- Automatic wire length recomputation after segment edits
- 2D network view:
  - Node drag-and-drop
  - Pan with `Shift + drag`
  - Zoom with toolbar controls (`Zoom -`, `Zoom +`, `Reset view`, `Fit network`)
- Validation center with grouped issues and issue navigation
- Local persistence with schema versioning and migrations
- Keyboard shortcuts for major workspace actions

## Tech Stack

- React 19
- TypeScript (strict)
- Vite
- Vitest + Testing Library
- Playwright (E2E smoke)
- ESLint
- Logics documentation workflow (`logics/`)

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Python 3 (for Logics lint/tooling)

### Install

```bash
npm ci
```

If you cloned without submodules and need Logics tooling:

```bash
git submodule update --init --recursive
```

### Run locally

Create local env values from the tracked template:

```bash
cp .env.example .env
```

Supported variables and defaults:

- `APP_HOST=127.0.0.1`
- `APP_PORT=5284`
- `PREVIEW_PORT=5285`
- `E2E_BASE_URL=http://127.0.0.1:5284`
- `VITE_STORAGE_KEY=electrical-plan-editor.state`

Env fallback behavior:

- Invalid/empty `APP_PORT` or `PREVIEW_PORT` falls back to documented defaults.
- Invalid/empty `E2E_BASE_URL` falls back to `http://{APP_HOST}:{APP_PORT}`.
- Invalid/empty `VITE_STORAGE_KEY` falls back to `electrical-plan-editor.state`.
- Keep secrets out of `VITE_*` variables (they are client-visible at build/runtime).

```bash
npm run dev
```

Then open `http://127.0.0.1:5284` (unless overridden).

## Available Scripts

- `npm run dev`: start local dev server
- `npm run build`: typecheck + production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run test`: run Vitest in watch mode
- `npm run test:ci`: run Vitest with coverage
- `npm run test:e2e`: run Playwright E2E smoke tests
- `npm run quality:ui-modularization`: enforce UI modularization line-budget gate
- `npm run quality:store-modularization`: enforce store modularization line-budget gate

## Project Structure

```text
src/
  app/                    # React app shell and UI
  config/                 # Runtime env resolution and defaults
  core/                   # Domain entities, graph and pathfinding
  store/                  # State management, reducer, selectors, actions
  adapters/persistence/   # Local storage persistence + migrations
  adapters/portability/   # Network import/export payload adapters
  tests/                  # Unit + integration tests

tests/e2e/                # Playwright end-to-end smoke
logics/                   # Product requests, backlog, tasks, architecture
```

## Quality and CI

Primary validation commands:

```bash
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
npm run lint
npm run typecheck
npm run test:ci
npm run test:e2e
```

CI runs the same pipeline in `.github/workflows/ci.yml` on `push` and `pull_request`.

## Contributing

Contribution guidelines are available in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
