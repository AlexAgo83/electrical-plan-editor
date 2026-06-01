## Major Highlights

- Large saved networks now open without freezing the app when every node already has a persisted canvas position. The generated layout pass is skipped in that case, avoiding the expensive crossing/position scoring work that was dominating load time on 50+ node / 50+ segment files.
- Network summary callouts render faster by removing hidden SVG/card measurement work and using lightweight text measurement instead.
- OpenAI AI provider settings now default to `gpt-5.5`.
- The Home Workspace recent activity log now uses the surrounding panel theme more consistently, keeping action accents while avoiding an over-styled standalone theme block.

## 1.12.3

- Optimized derived layout state for saved large networks: when all nodes already include persisted positions, the app reuses those positions and bypasses `createNodePositionMap`.
- Reworked network summary callout layout measurement to avoid mounting offscreen callout cards and hidden SVG measurement layers.
- Updated OpenAI provider defaults and settings placeholders from `gpt-4.1-mini` to `gpt-5.5`.
- Aligned the Home Workspace recent changes list with neutral panel surfaces, reducing primary-theme gradients and heavy shadows while preserving create/delete/route visual cues.
- Added regression coverage for the saved-position layout shortcut and updated AI settings expectations.

### Verification

- `npm run -s ci:blocking`
- `npm run -s test -- src/tests/app.ui.settings-ai-agent.spec.tsx src/tests/ai-agent-provider-client.spec.ts`
- `npm run -s typecheck`
- `npm run -s test -- src/tests/app.ui.networks.spec.tsx src/tests/app.ui.theme.spec.tsx`
