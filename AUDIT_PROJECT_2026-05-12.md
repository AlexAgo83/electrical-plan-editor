# Audit projet - electrical-plan-editor

Date: 2026-05-12  
Depot: `C:\Users\Pmondou\Documents\Codes projeckt\electrical-plan-editor`  
HEAD audite: `acefba3` - `fix: use valid product status`  
Version applicative: `1.6.5`

## Synthese executive

Le projet est globalement bien structure pour une application locale React/TypeScript: typage strict, lint, build, PWA, tests unitaires/integration et E2E existent et donnent un bon niveau de confiance fonctionnelle. Les controles principaux passent sur le code applicatif.

Les risques prioritaires ne sont pas des bugs metier immediats, mais des risques de maintenance et de livraison:

1. `npm audit` remonte 14 vulnerabilites de dependances, dont 11 high.
2. `npm run test:e2e` n'est pas portable sous PowerShell a cause de `env -u NO_COLOR`.
3. La lane UI Vitest execute tous ses tests avec succes, mais sort en echec a cause d'une erreur non geree `Timeout calling "onTaskUpdate"`.
4. Le bundle principal est trop gros: `index-38lA5Bqf.js` fait 1537.94 KiB raw / 419.15 KiB gzip, avec un total JS gzip de 605.72 KiB.
5. Plusieurs modules restent tres volumineux, notamment `useWireHandlers.ts`, `AppController.tsx`, `migrations.ts`, `FunctionalSchematicPanel.tsx`, `NetworkSummaryPanel.tsx` et `functionalSchematic.ts`.
6. Le workflow Logics est tres dense et globalement coherent, mais il contient des warnings massifs de Mermaid manquant, 15 placeholders, et un audit workflow bloquant sur `task_105` sans checklist DoD.

## Perimetre audite

- Stack et scripts `package.json`.
- Structure `src`, `tests`, `scripts`, `.github`, `public`, `logics`.
- TypeScript, ESLint, build Vite/PWA.
- Tests Vitest segmentes, E2E Playwright, qualite PWA et modularisation.
- Securite et fraicheur des dependances via `npm audit` et `npm outdated`.
- Dette de structure via le reviewer Logics.
- Workflow documentaire Logics.
- Recherche rapide de motifs sensibles: `TODO`, `FIXME`, `HACK`, `@ts-ignore`, `eslint-disable`, `as any`, `console`.

## Etat du depot

- Branche: `main...origin/main`.
- HEAD: `acefba3`.
- Arbre de travail: tres nombreux fichiers modifies sous `logics/backlog` et `logics/tasks`, plus quelques fichiers Logics non suivis (`req_122`, `req_123`, `task_105`, `task_106`, `item_591`, `item_592`).
- Aucun diff applicatif observe sur `src`, `package.json`, `package-lock.json`, `VERSION`, `README.md`, `vite.config.ts`, `tsconfig.json`, `playwright.config.ts` au moment du controle cible.
- Le rapport courant ajoute uniquement `AUDIT_PROJECT_2026-05-12.md`.

## Stack et architecture

- React 19 + TypeScript strict + Vite.
- Domaine separe en:
  - `src/core`: primitives metier, graphe, routage, schema, derivations.
  - `src/store`: reducers, selectors, actions.
  - `src/app`: shell React, hooks, composants, styles, PWA.
  - `src/adapters`: persistence locale et import/export.
- Vite PWA configure avec `generateSW`, manifest, cache document `NetworkFirst`.
- Tests:
  - Vitest + Testing Library sous `src/tests`.
  - Playwright sous `tests/e2e`.
  - Segmentation explicite fast/UI via `scripts/quality/run-vitest-segmented.mjs`.

Avis: la separation domaine/store/app est saine. Le risque principal vient de la taille des orchestrateurs React/hooks et de certains modules domaine/export qui concentrent beaucoup de responsabilites.

## Metriques de taille

Inventaire local:

| Racine | Fichiers | Lignes |
|---|---:|---:|
| `.github` | 1 | 55 |
| `public` | 43 | 1345 |
| `scripts` | 9 | 812 |
| `src` | 372 | 78251 |
| `tests` | 1 | 305 |

Top fichiers volumineux observes:

| Fichier | Lignes approx. |
|---|---:|
| `src/app/hooks/useWireHandlers.ts` | 1349 |
| `src/tests/persistence.localStorage.spec.ts` | 1162 |
| `src/app/AppController.tsx` | 1074 |
| `src/app/components/workspace/ModelingPrimaryTables.tsx` | 1025 |
| `src/app/components/network-summary/FunctionalSchematicPanel.tsx` | 949 |
| `src/app/components/NetworkSummaryPanel.tsx` | 938 |
| `src/app/hooks/controller/useAppControllerScreenContentSlices.tsx` | 929 |
| `src/adapters/persistence/migrations.ts` | 928 |
| `src/app/lib/i18n.ts` | 917 |
| `src/core/functionalSchematic.ts` | 898 |

Le reviewer structure signale 329 fichiers scannes et 52 fichiers au-dessus de 400 lignes. Les plus gros modules sont dans les zones ou le risque de regression est eleve: wire lifecycle, persistence migrations, network summary, functional schematic et composition controller.

## Resultats de validation

| Commande | Resultat | Signal |
|---|---|---|
| `npm run -s lint` | OK | Aucun lint bloquant |
| `npm run -s typecheck` | OK | TypeScript strict valide |
| `npm run -s build` | OK avec warning | Build prod et PWA generes, mais chunk principal trop gros |
| `npm run -s test:ci:segmentation:check` | OK | 39 fichiers UI, 81 specs total |
| `npm run -s test:ci:fast -- --coverage` | OK | 42 fichiers, 210 tests passes |
| `npm run -s test:ci:ui` | KO technique | 39 fichiers, 278 tests passent, mais Vitest remonte 1 unhandled error |
| `npm run -s quality:ui-modularization` | OK | 95 fichiers UI controles, exceptions documentees |
| `npm run -s quality:ui-timeout-governance` | OK | 39 specs UI, 9 overrides allowlistes |
| `npm run -s quality:store-modularization` | OK | 27 fichiers store controles |
| `npm run -s quality:pwa` | OK | Manifest, `sw.js`, workbox valides |
| `npm run -s test:e2e` | KO Windows | `env` non reconnu sous PowerShell |
| `$env:NO_COLOR=$null; npx playwright test --reporter=line` | OK | 2 tests E2E passes en 41.3s |
| `py -3 logics/skills/logics-doc-linter/scripts/logics_lint.py` | OK warnings | Warnings Mermaid massifs |
| `py -3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability` | KO | `task_105` sans DoD checklist |
| `npm audit --audit-level=moderate` | KO | 14 vulnerabilites, 3 moderate, 11 high |

Conclusion validation: le code applicatif est en etat fonctionnel, mais `npm run ci:blocking` n'est pas fiable depuis PowerShell tant que `test:e2e` utilise `env -u` et tant que la lane UI peut sortir en erreur Vitest malgre des assertions vertes.

## Securite et dependances

`npm audit` remonte 14 vulnerabilites:

- High: `@babel/plugin-transform-modules-systemjs`, `fast-uri`, `flatted`, `lodash`, `minimatch`, `picomatch`, `rollup`, `serialize-javascript`, `vite`.
- Moderate: `ajv`, `brace-expansion`, `postcss`.

Dependances notables non a jour:

- Runtime: `react` / `react-dom` 19.2.4 installes, 19.2.6 disponible.
- Build/test: `vite` 6.4.1 installe, 6.4.2 wanted, 8.0.12 latest.
- PWA: `vite-plugin-pwa` 1.2.0 installe, 1.3.0 wanted/latest.
- Test: `@playwright/test` 1.58.2 installe, 1.60.0 disponible; `vitest` 3.2.4 installe, 4.1.6 latest.
- Tooling: `eslint`, `typescript-eslint`, `@types/node`, `@vitejs/plugin-react`, `jsdom`, `typescript`.

Priorite recommandee:

1. Lancer une branche dediee deps/security.
2. Executer `npm audit fix`, puis verifier le diff `package-lock.json`.
3. Si le lock ne corrige pas tout, upgrader explicitement `vite`, `vite-plugin-pwa`, `@playwright/test`, `typescript-eslint` et les paquets indirects via overrides si necessaire.
4. Rejouer `npm run -s lint`, `npm run -s typecheck`, `npm run -s build`, `npm run -s quality:pwa`, `npm run -s test:ci:fast -- --coverage`, `npm run -s test:ci:ui`, Playwright.

## Performance et bundle

Build Vite:

- CSS: `assets/index-CyXEBci7.css` 332.68 kB raw / 43.91 kB gzip.
- Main JS: `assets/index-38lA5Bqf.js` 1574.85 kB raw / 429.21 kB gzip.
- Bundle metrics: main JS 1537.94 KiB raw / 419.15 KiB gzip.
- Total JS gzip: 605.72 KiB sur 20 chunks.
- Budget informatif: main <= 500 KiB raw, total JS gzip <= 220 KiB.
- Depassement: main +1037.94 KiB raw, total gzip +385.72 KiB.

Causes probables:

- `src/app/lib/changelogFeed.ts` charge tous les changelogs en eager via `import.meta.glob(..., eager: true)`.
- `HomeWorkspaceContent.tsx` embarque `react-markdown` et `remark-gfm`.
- `src/app/lib/tabularExport.ts` importe `exceljs`, potentiellement couteux si les chemins d'export ne sont pas isoles dynamiquement.
- La lazy registry existe, mais une partie du modele/orchestration reste dans le chunk principal.

Actions recommandees:

1. Remplacer l'import eager des changelogs par chargement paresseux ou index precompile leger.
2. Lazy-load `react-markdown` / `remark-gfm` uniquement quand le feed changelog est visible.
3. Charger `exceljs` dynamiquement dans le chemin XLSX uniquement.
4. Ajouter des chunks manuels pour markdown/export si le split automatique ne suffit pas.
5. Transformer le budget bundle en gate optionnelle d'abord, puis bloquante quand le budget est realiste.

## Fiabilite tests et CI

Points positifs:

- Les tests fast passent: 210 tests.
- Les tests UI executent 278 assertions vertes.
- Les E2E Playwright passent quand l'equivalent PowerShell est lance directement.
- Les gates UI/store/PWA passent.

Risques:

- `npm run test:ci:ui` prend environ 670s et sort avec `Vitest caught 1 unhandled error`: `Timeout calling "onTaskUpdate"`.
- Plusieurs specs UI individuelles sont lourdes:
  - `app.ui.delete-confirmations.spec.tsx`: ~128s.
  - `app.ui.navigation-canvas.spec.tsx`: ~93s.
  - `app.ui.creation-flow-ergonomics.spec.tsx`: ~81s.
  - `app.ui.network-summary-workflow-polish.spec.tsx`: ~79s.
  - `app.ui.settings-canvas-render.spec.tsx`: ~58s.
- `npm run test:e2e` echoue sous PowerShell avant Playwright, car `env -u NO_COLOR` est une syntaxe Unix.

Actions recommandees:

1. Remplacer le script E2E par un wrapper Node cross-platform, ou appeler Playwright via un script JS qui supprime `NO_COLOR` dans `process.env`.
2. Investiguer l'erreur Vitest `onTaskUpdate`: reduire la concurrence UI, sharder la lane UI, ou separer les specs les plus lentes.
3. Faire de `test:ci:ui:slow-top` un artefact systematique pour suivre les regressions de temps.
4. Extraire des fixtures/helpers communs pour les specs UI lourdes afin de reduire les cycles de setup.

## Qualite code et maintenabilite

Points forts:

- TypeScript strict avec `noUncheckedIndexedAccess`.
- Pas de `@ts-ignore`, pas de `eslint-disable`, pas de `as any`.
- `TODO` et `FIXME`: 0.
- Reducer store sous gate de modularisation.
- Le code de persistence/import/export contient des normalisations et garde-fous visibles.
- CSV export teste contre l'injection formule.

Points faibles:

- `useWireHandlers.ts` concentre formulaire, validation, routing, confirmation, mutation et sync de references.
- `AppController.tsx` reste un point d'assemblage tres gros malgre les extractions deja presentes.
- `migrations.ts` est volumineux et critique: risque eleve a chaque evolution de schema.
- `FunctionalSchematicPanel.tsx` et `NetworkSummaryPanel.tsx` restent gros dans une zone riche en interactions.
- `i18n.ts` grossit comme registre central; a surveiller avant d'ajouter beaucoup de langues.
- Les `console.warn` runtime existent dans les reducers d'occupancy; ce n'est pas bloquant, mais il faut eviter que les warnings deviennent une API de feedback utilisateur.

Actions recommandees:

1. Decouper `useWireHandlers.ts` en sous-hooks ou services: endpoint draft, occupancy, route computation, reference sync, submit orchestration.
2. Decouper `migrations.ts` par version ou par domaine, avec fixtures legacy par version.
3. Garder `src/core/functionalSchematic.ts` comme source de derivation, mais sortir les helpers de layout/trace si le fichier continue de grossir.
4. Faire de `AppController.tsx` un orchestrateur plus mince en poussant les assemblages par ecran dans des modules dedies.
5. Continuer a preferer les warnings non bloquants pour les vues derivees quand les donnees sont ambigues.

## Logics et documentation projet

Snapshot Logics:

- Architecture decisions: 8.
- Product briefs: 2.
- Requests: 131.
- Backlog items: 598.
- Tasks: 103.
- Specs: 0.
- Progress: 100% sur 598 backlog items et 103 tasks selon le global reviewer.

Findings:

- 15 documents backlog contiennent encore des placeholders.
- Le linter Logics passe avec warnings, surtout `missing Mermaid overview block`.
- Le workflow audit echoue sur `logics/tasks/task_105_wire_twist_groups_and_left_right_splice_pin_mode.md`: checklist DoD manquante.
- Le volume Logics est tres eleve; il faut eviter que la documentation de suivi devienne plus couteuse que la livraison.

Actions recommandees:

1. Corriger `task_105` en ajoutant la checklist DoD attendue.
2. Nettoyer les 15 placeholders signales autour des items 483-504.
3. Decider si les Mermaid overview manquants sont un standard reel ou un warning trop bruyant; soit generer les blocs manquants par lot, soit assouplir la regle.
4. Generer ou rafraichir `logics/INDEX.md` et `logics/RELATIONSHIPS.md` si ces vues servent vraiment au pilotage.
5. Pour les futures demandes, conserver la discipline request -> backlog -> task -> validation -> closure.

## Produit et UX

Le produit couvre deja un perimetre large:

- Modelisation connecteurs, epissures, noeuds, segments, fils.
- Routage deterministe, forced route, longueurs.
- Network scope multi-reseau.
- Analyse, validation, go-to actions.
- Catalog, BOM, pricing, export CSV/SVG/PNG/XLSX.
- Persistence locale versionnee, import/export, PWA, onboarding, themes.

Risques UX:

- Surface fonctionnelle tres dense: les ecrans Modeling/Analysis/Settings peuvent devenir difficiles a maintenir et tester.
- La Home charge un feed changelog riche et couteux; utile produit, mais trop cher au bundle s'il est charge eager.
- Les preferences canvas et network summary ont beaucoup de permutations; les tests existent, mais coutent cher.

Actions recommandees:

1. Prioriser les ecrans par workflow utilisateur recurrent, pas par accumulation d'options.
2. Maintenir les controles existants d'accessibilite/focus, car les modales, tables et canvas sont des zones a fort risque.
3. Continuer a isoler les vues derivees comme read-only et recomputees depuis le modele source.

## Risques priorises

### P0 - A corriger avant une release publique

- Vulnerabilites npm high, notamment Vite/Rollup et dependances de build.
- Script `test:e2e` non portable Windows, incompatible avec l'environnement local PowerShell.
- Lane UI Vitest qui sort KO malgre assertions vertes.

### P1 - A corriger prochainement

- Bundle principal et total JS gzip largement au-dessus des budgets.
- `task_105` sans DoD checklist, ce qui casse l'audit workflow strict.
- Modules de plus de 900 lignes dans les zones wire, persistence, network summary, functional schematic.

### P2 - Dette a lisser

- Placeholders Logics restants.
- Warnings Mermaid massifs.
- Specs UI lentes et centralisees.
- CSS et themes tres volumineux.

## Plan d'action recommande

1. Creer une branche `audit-followups/security-ci`.
2. Corriger le script E2E Windows avec un wrapper Node.
3. Traiter `npm audit` et mettre a jour le lock.
4. Rejouer lint/typecheck/build/PWA/fast/UI/E2E.
5. Investiguer la sortie KO de `test:ci:ui` et sharder les specs lentes.
6. Corriger `task_105` DoD et nettoyer les 15 placeholders Logics.
7. Reduire le bundle: changelog lazy, markdown lazy, ExcelJS dynamic import.
8. Planifier un decoupage de `useWireHandlers.ts` et `migrations.ts` avant toute nouvelle grosse feature dans ces zones.

## Commandes executees

```powershell
git status --short --branch
git rev-parse --short HEAD
git log -1 --pretty=format:'%h %ad %s' --date=short
Get-Content package.json
rg --files src tests scripts .github logics
py -3 logics/skills/logics-code-structure-reviewer/scripts/code_structure_review.py
py -3 logics/skills/logics-global-reviewer/scripts/logics_global_review.py
py -3 logics/skills/logics-test-impact-orchestrator/scripts/plan_test_impact.py
npm run -s lint
npm run -s typecheck
npm run -s build
npm run -s test:ci:segmentation:check
npm run -s quality:ui-modularization
npm run -s quality:ui-timeout-governance
npm run -s quality:store-modularization
npm run -s quality:pwa
npm run -s test:ci:fast -- --coverage
npm run -s test:ci:ui
npm run -s test:e2e
$env:NO_COLOR=$null; npx playwright test --reporter=line
npm audit --audit-level=moderate
npm outdated --long
npm run -s bundle:metrics:report
py -3 logics/skills/logics-doc-linter/scripts/logics_lint.py
py -3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability
rg -n "TODO|FIXME|HACK|XXX|@ts-ignore|eslint-disable|as any|console\\." src tests scripts
rg -n "dangerouslySetInnerHTML|innerHTML|outerHTML|eval\\(|new Function|localStorage|sessionStorage|URL\\.createObjectURL|revokeObjectURL|sanitize|DOMParser|download" src scripts tests
```

## Verdict

Le projet est viable et deja bien outille. Le niveau de couverture et de garde-fous est superieur a la moyenne pour une app locale de ce type. Le prochain gain ne vient pas d'ajouter plus de tests au hasard, mais de fiabiliser la chaine CI locale, corriger les dependances vulnerables, reduire le bundle, et continuer a decomposer les zones qui concentrent trop de logique.
