# TFO Pricing Tool

Ferramenta de precificação estratégica para marcas de moda brasileiras. Conduz gestores através de perguntas guiadas, cálculos automáticos e diagnósticos em linguagem humana.

## Run & Operate

- `pnpm --filter @workspace/tfo-pricing run dev` — run the pricing tool frontend (port 18176, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS v4
- State: Zustand (with localStorage persistence)
- Charts: Recharts
- Animations: Framer Motion
- Forms: React Hook Form + Zod
- No backend — fully client-rendered, no database

## Where things live

- `artifacts/tfo-pricing/src/screens/` — all flow screens (Entry, FlowA, FlowB, FlowC, FlowD, MixPortfolio, Export)
- `artifacts/tfo-pricing/src/engine/` — pricing calculations, benchmarks, diagnostics logic
- `artifacts/tfo-pricing/src/store/useToolStore.ts` — Zustand global state and navigation
- `artifacts/tfo-pricing/src/data/benchmarks.json` — market benchmark data for Brazilian fashion

## Architecture decisions

- No backend: all state lives in the client via Zustand + localStorage (persist middleware)
- Navigation is state-machine based via `activeFlow` in the store (not URL routing)
- Three main pricing flows (A: product margin, B: business health, C: ideal price) + FlowD (competitive positioning) and MixPortfolio
- Scenario comparison and CSV export are built in (no external libs for export)

## Product

A strategic pricing tool for Brazilian fashion brands. Users start by choosing what they want to discover (product margin, business health, or ideal price), then the tool guides them through inputs and delivers human-readable diagnostics — never raw numbers without context.

## User preferences

- Portuguese (Brazilian) language throughout the UI
- No backend, no auth, no database — keep it client-only

## Gotchas

- Vite dev server binds to PORT env var (set to 18176 by the workflow)
- The `scripts/build-benchmarks.mjs` runs as a prebuild step to generate benchmark data

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
