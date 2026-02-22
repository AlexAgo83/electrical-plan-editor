# e-Plan Editor

A local-first electrical network editor focused on deterministic modeling, routing, and validation.

The project models connectors, splices, nodes, segments, and wires as a graph, computes shortest routes, and keeps wire lengths synchronized with segment changes.

[![CI](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/AlexAgo83/electrical-plan-editor)](LICENSE)
[![Live Demo](https://img.shields.io/badge/live%20demo-Render-46E3B7?logo=render&logoColor=white)](https://e-plan-editor.onrender.com) ![Version](https://img.shields.io/badge/version-v0.6.4-4C8BF5)

## Table of Contents

- [Live Demo & Status](#live-demo--status)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Quality and CI](#quality-and-ci)
- [Contributing](#contributing)
- [License](#license)

## Live Demo & Status

- Production: [https://e-plan-editor.onrender.com](https://e-plan-editor.onrender.com)
- Hosting: Render Static Site (Blueprint via `render.yaml`)
- Current version: `0.6.4`
- CI status: see the GitHub Actions badge above

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
- PWA support (install prompt + offline shell + update readiness in production)
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
- `npm run quality:pwa`: validate generated PWA build artifacts (`manifest`, `sw.js`, `workbox-*`)

## Deployment

### Render (Blueprint)

This repository includes a ready-to-use [`render.yaml`](render.yaml) for static hosting on Render.

1. Push your latest changes to GitHub.
2. In Render, create a new service with **Blueprint** from this repository.
3. Render will build with `npm ci && npm run build` and publish `dist/`.

### Any static server

The app is a SPA and can be hosted from `dist/` on any static server/CDN.

- Build: `npm run build`
- Serve over HTTPS in production (required for full PWA behavior).
- Configure SPA fallback rewrite to `/index.html`.

## Project Structure

```text
src/
  app/                    # React app shell, UI, controller wiring, PWA integration
  app/pwa/                # PWA registration and update/install UX helpers
  config/                 # Runtime env resolution and defaults
  core/                   # Domain entities, graph and pathfinding
  store/                  # State management, reducer, selectors, actions
  store/reducer/          # Reducer handlers split by domain concern
  adapters/persistence/   # Local storage persistence + migrations
  adapters/portability/   # Network import/export payload adapters
  tests/                  # Unit + integration tests

tests/e2e/                # Playwright end-to-end smoke
logics/                   # Product requests, backlog, tasks, architecture, skills
```

## Quality and CI

Primary validation commands:

```bash
python3 logics/skills/logics-doc-linter/scripts/logics_lint.py
npm run lint
npm run typecheck
npm run quality:ui-modularization
npm run quality:store-modularization
npm run test:ci
npm run test:e2e
```

Additional release-oriented validation:

```bash
npm run quality:pwa
```

CI runs the same main pipeline in `.github/workflows/ci.yml` on `push` and `pull_request`.

PWA caveats:

- Service worker registration is production-only (`build/preview`) and remains disabled during normal `npm run dev`.
- Install prompt availability depends on browser capability and secure context (`https` or `localhost`).
- Offline behavior is guaranteed after the first successful online load of production assets.

## Contributing

Contribution guidelines are available in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
