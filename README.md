# samplecalc

a basic and simple calculator with working functions

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Does |
| ------- | ---- |
| `npm run dev` | Run locally in watch mode |
| `npm run build` | Produce a production build |
| `npm test` | Run the test suite |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint `src` and `tests` |

## Layout

```
src/          Application source
tests/unit/   Unit tests
```

---

_Scaffolded by Alpha. Copy `.env.example` to `.env` before running._

## CI/CD

`.github/workflows/ci.yml` runs unit tests with coverage, lint and a security scan on every push and pull request to `dev`, `uat` and `main` (from `Capstone-Agentic-AI-Orchestration/alphaorch-workflow@v1:workflow-templates/product/be-nodejs.yml`).

Work lands on `dev`, is promoted to `uat`, then to `main`, by pull request only.

Hosting on **Render** is set up automatically by Alpha. See its status, URLs and deploys from this repository’s project in Alpha.
