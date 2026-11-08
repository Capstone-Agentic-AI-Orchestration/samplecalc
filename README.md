# samplecalc

a basic and simple calculator with working functions

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to use the calculator. Production: run `npm run build`, then `npm start`. The `public/` directory must remain beside `dist/` when deploying.

## Scripts

| Command | Does |
| ------- | ---- |
| `npm run dev` | Run the local server |
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

Hosting on **Render** is set up automatically by Alpha. See its status, URLs and deploys from this repositoryâ€™s project in Alpha.

## Calculator

Use the buttons or type numbers and `+`, `-`, `*`, `/`, `%`, and `.`. Press Enter or `=` to calculate, Escape/Delete to clear, and Backspace to remove the last digit. Tab and Enter/Space also operate individual buttons. Browser shortcuts using Ctrl/Command are preserved.

Arithmetic runs from left to right, like a basic desk calculator: `2 + 3 × 4 =` gives `20`. Pressing an operator again replaces the pending operator. Repeated equals repeats the previous operation. Percent divides the displayed number by 100; the sign button changes its sign. New digits after a result start a fresh calculation. Clear or a new digit recovers from division by zero or overflow.

Input is limited to 12 digits, and results are rounded to 12 significant digits to keep common decimal operations readable. This uses JavaScript floating-point arithmetic and is intended for everyday calculations. No expressions are evaluated as code; calculations stay in the browser.

The calculator assets are in `public/`; Express serves them at `/`. `GET /health` remains available for service monitoring. Engine, browser controls, and HTTP tests live under `tests/unit/`.

