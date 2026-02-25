# e-Plan Editor

A local-first electrical network editor focused on deterministic modeling, routing, and validation.

The project models connectors, splices, nodes, segments, and wires as a graph, computes shortest routes, and keeps wire lengths synchronized with segment changes.

[![CI](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/AlexAgo83/electrical-plan-editor/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/AlexAgo83/electrical-plan-editor)](LICENSE)
[![Live Demo](https://img.shields.io/badge/live%20demo-Render-46E3B7?logo=render&logoColor=white)](https://e-plan-editor.onrender.com) ![Version](https://img.shields.io/badge/version-v0.9.7-4C8BF5)

<img width="1219" height="815" alt="image" src="https://github.com/user-attachments/assets/baf79474-665f-4462-ae1a-b0e172c46a95" />

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
- Current version: `0.9.7`
- CI status: see the GitHub Actions badge above

## Features

- Deterministic domain model for:
  - Connectors with cavity occupancy
  - Splices with port occupancy
  - Graph nodes and weighted segments
  - Wires with endpoint constraints, section (`mm²`), optional mono/bi-color, and per-side connection/seal references
- Editable node IDs with atomic graph-safe rename (segments/positions/selection remap)
- Automatic shortest-path routing (Dijkstra-based)
- Forced route lock/reset for wires
- Automatic wire length recomputation after segment edits
- Wire endpoint occupancy validation with next-free way/port prefill in create flows
- 2D network view:
  - Node drag-and-drop
  - Pan with `Shift + drag`
  - Zoom with toolbar controls (`Zoom -`, `Zoom +`, `Reset view`, `Fit network`)
  - Callout overlays with configurable visibility and text size (`small`, `normal`, `large`)
  - Canvas defaults for grid/snap/lock/overlays/segment lengths/callouts and PNG background export
- Quick entity navigation in the canvas with contextual `Modeling` / `Analysis` switch (when available)
- Network-scoped `Catalog` with catalog-first connector/splice creation (manufacturer reference + connection count driven by catalog items)
- New network bootstrap seeds `3` default catalog items (`CAT-2W-STD`, `CAT-6P-STD`, `CAT-8W-STD`) with deterministic names/prices
- Catalog analysis panel showing linked connector/splice usage for the selected catalog item with `Go to` navigation to Modeling edit flows
- Step-by-step onboarding modal with contextual panel help entry points and persistent auto-open opt-out
- Table ergonomics:
  - Reusable `Filter` bars with field selector + full-width input (`Wires`, `Network Scope`, `Connectors`, `Splices`, `Nodes`, `Segments`)
  - Occupancy/kind/route/sub-network chip filters remain available alongside table filter bars
- Settings defaults for wire section prefill and connector/splice auto-create linked-node behavior
- Validation center with grouped issues, issue navigation, and catalog integrity checks (`Catalog` records + connector/splice catalog-link audits)
- Legacy save/import normalization for missing connector/splice manufacturer references via deterministic catalog placeholders
- `Network summary` header exports:
  - `Export PNG`
  - `Export BOM CSV` (catalog-aggregated BOM with connector/splice quantities and unit/line totals when priced)
- Theme presets including multiple light and dark themes
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

## Persistence Versioning

The app uses explicit versioned payload contracts for both local storage and network export files.

- Local workspace persistence:
  - primary key: configured `VITE_STORAGE_KEY` (default `electrical-plan-editor.state`)
  - backup key: `<storage-key>.backup` (written before destructive migration replacement or unsupported/failed payload fallback)
  - payload includes:
    - `payloadKind`
    - `schemaVersion`
    - `appVersion`
    - `appSchemaVersion`
    - timestamps + serialized `state`
- Network export/import files:
  - include explicit file `schemaVersion` + source metadata (`appVersion`, `appSchemaVersion`)
  - legacy file payloads are normalized on import
  - unsupported future file versions are rejected safely (no workspace mutation)

Migration authoring workflow (future schema evolution):

1. Add/adjust payload shape support in `src/adapters/persistence/migrations.ts` (local storage) and/or `src/adapters/portability/networkFile.ts` (file import/export).
2. Keep migration steps incremental and deterministic (`vN -> vN+1`), with a single entry point for runtime hydration/import.
3. Add regression fixtures/tests for:
   - legacy/unversioned payload
   - current payload
   - unsupported future version
   - malformed payload
4. Run the full validation pipeline (`lint`, `typecheck`, `test:ci`, `test:e2e`, `build`, `quality:pwa`).

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
npm run build
```

Additional release-oriented validation:

```bash
npm run quality:pwa
```

CI runs the same main pipeline in `.github/workflows/ci.yml` on `push` and `pull_request`.

Local E2E note:

- `npm run test:e2e` requires a Playwright browser install first (CI runs `npx playwright install --with-deps chromium`).

PWA caveats:

- Service worker registration is production-only (`build/preview`) and remains disabled during normal `npm run dev`.
- Install prompt availability depends on browser capability and secure context (`https` or `localhost`).
- Offline behavior is guaranteed after the first successful online load of production assets.

## Contributing

Contribution guidelines are available in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
