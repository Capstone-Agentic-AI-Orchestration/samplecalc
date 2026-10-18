# CAL2-101 Calculator architecture

Status: proposed architecture and review of the existing implementation; product decisions below require human approval before further feature development.

## Basis and boundaries

The request is to make a fully interactive functional calculator. Reviewed baseline: commit 058e14a against scaffold f4ed10b, including README, application source, tests, package scripts, and CI. The branch contains one feature commit with seven changed files; no separate approved requirements or research artifact is present. Existing behavior is evidence of implementation, not evidence of product approval.

The system is a single Express service serving a browser calculator. Arithmetic executes locally in the browser; the server delivers HTML and JavaScript and exposes health status. Each page owns an independent, volatile calculator instance. No database, accounts, calculation API, shared state, history persistence, external service, or authentication is required for the current scope. Reloading resets state. Scientific functions, parentheses, memory keys, and financial-grade decimal arithmetic are outside the proposed baseline.

## Modules and interfaces

| Module | Responsibility | Interface and dependencies |
| --- | --- | --- |
| src/index.ts | Process startup | Imports app; listens on numeric PORT or 3000 |
| src/app.ts | HTTP boundary | Exports app and SERVICE_NAME; configures Express, JSON middleware, CORS, and three GET routes |
| src/calculator.ts | Calculator state and arithmetic | Exports Calculator; input(key: string): void mutates one instance; consumers read display, expression, error; no DOM or network dependencies |
| src/calculator-page.ts | Presentation and input adapter | Exports calculatorPage and calculatorScript strings; embeds Calculator.toString() in the served script; binds buttons and keyboard to input, then renders state |
| tests/unit | Behavioral and delivery verification | Engine sequence tests, Supertest route checks, VM execution of served script with DOM doubles |

Interaction flow: browser requests page and script; click or normalized keyboard event calls press(key); press calls Calculator.input; display/expression text and visual classes update synchronously. Native button activation handles focused Enter/Space to avoid duplicate actions. DOM output uses textContent.

The generated-script approach avoids a separate frontend bundle or asset-copy pipeline. The engine must remain self-contained: new runtime imports, module-level helpers, or compiler transforms may break serialization. Any such change requires executing the emitted production script in validation or replacing serialization with an explicit frontend build after architectural review.

## Data model and behavior contract

All state is in memory, with no wire serialization or persistence schema.

| Field | Type | Meaning |
| --- | --- | --- |
| display | string | Current entry, formatted result, or Error; starts at 0 |
| expression | string | Human-readable operation context; starts empty |
| error | boolean | Non-finite result state; starts false |
| stored | number or null | Left operand awaiting an operator application |
| operator | string | Pending +, -, *, /, or empty |
| fresh | boolean | Next digit replaces the display; pending operators can be replaced |
| computed | boolean | Display is a result, so entry restarts and deletion is ignored |
| repeatOperator, repeatValue | string, number | Last successful binary operation for repeated equals |

Input vocabulary: digits 0-9, decimal point, +, -, *, /, =, %, sign, clear, backspace. Unknown input has no effect. The input method returns no value; public display fields are the presentation contract and should be treated as read-only by adapters.

Current transitions:

- Clear restores every state field. Initial display is 0.
- Digit/decimal entry replaces a fresh or computed result; one decimal point and at most 15 numeric digits are accepted.
- An operator stores the displayed value. A second operator replaces it if no right operand was entered. Otherwise, pending arithmetic executes immediately before storing the new operator.
- Equals executes the pending operation and records its right operand; later equals repeats that operation. With no pending or previous operation it does nothing. Equals immediately after an operator uses the displayed left value as the right operand (5 + = produces 10).
- Sign toggles the current entry; immediately after an operator it starts a negative right operand. Percent divides the display by 100, including while entering a right operand.
- Backspace edits an active entry only, restoring 0 when empty; it ignores fresh/computed results.
- Division by zero and non-finite arithmetic show Error and recovery guidance. Clear or a new digit/decimal recovers; other input is ignored in error state.

Arithmetic uses JavaScript Number. Results are formatted to 12 significant digits and may use scientific notation; subsequent operations use the displayed rounded value. This is an everyday arithmetic contract, not an exact-decimal guarantee.

Keyboard adapter maps Enter to equals, Escape/Delete to clear, Backspace to deletion, and comma to decimal point. Arithmetic and digit keys pass through. Ctrl/Meta/Alt combinations are ignored; recognized calculator input prevents default browser behavior. Sign is available through its button.

## HTTP contracts

| Method and path | Success response | Consumer |
| --- | --- | --- |
| GET / | 200 text/html; complete UTF-8 calculator page, loading /calculator.js with defer | Browser |
| GET /calculator.js | 200 application/javascript; engine and event adapter | Browser |
| GET /health | 200 application/json; {"status":"ok"} | Hosting health probe |

No request body or query parameter is required. Other paths use Express default 404 behavior. Health indicates process responsiveness, not browser correctness. Existing CORS_ORIGINS is a comma-separated allowlist; same-origin page loading needs no additional cross-origin API. No server endpoint accepts or evaluates arithmetic expressions.

## Non-functional constraints

- Preserve existing Node/TypeScript/Express conventions, health endpoint, deployment environment, lockfile, and unrelated changes. No new runtime dependencies are needed.
- Arithmetic must respond within the same input event with no network round trip. Work and state remain bounded per interaction.
- Use native buttons, accessible names, visible keyboard focus, a polite atomic live result region, and reduced-motion support. Existing responsive CSS should be verified at narrow mobile and laptop widths, zoom, and keyboard-only navigation.
- Avoid eval and dynamic expression execution. Do not insert calculator input as HTML. No calculation data should leave the page.
- Preserve finite numeric state or enter the defined error state. Document rounding and input bounds; do not imply arbitrary precision.
- Delivery depends on ES2022-compatible browsers and a working JavaScript asset. Current UI has no non-JavaScript calculator fallback.

## Dependencies and development sequence

1. Obtain product approval for the behavior decisions below and turn them into acceptance cases.
2. Preserve the pure engine boundary; make any approved arithmetic changes there first.
3. Update the existing page adapter and explanatory copy to match the approved engine contract.
4. Extend sequence tests only for changed or missing behavioral requirements; verify served JavaScript against the engine contract.
5. Run tests, typecheck, lint, and production build; exercise the emitted service and script. Perform real browser checks for layout, touch, focus, native button activation, and screen-reader announcements before release.

Existing tools are TypeScript, ts-node, Jest/ts-jest, Supertest, ESLint, Express, and cors. Build emits dist through tsconfig.build.json; start runs dist/index.js. CI delegates tests/coverage, lint, and security scanning to shared workflows, with a configured default coverage threshold of 80 percent. Local unit passes alone do not prove CI coverage or security outcomes.

## Decisions requiring human approval

| Decision | Proposed baseline matching existing code | User-visible consequence |
| --- | --- | --- |
| Evaluation order | Immediate left-to-right execution | 2 + 3 * 4 = 20, rather than precedence-based 14 |
| Percent | Always divide the displayed operand by 100 | 200 + 10 % = 200.1, rather than contextual percentage 220 |
| Numeric precision | Number arithmetic, 15 entry digits, 12 significant result digits | Rounding and exponent notation are possible; unsuitable for exact financial calculations |
| Equals and editing | Repeat last operation; missing right operand duplicates left; new digits replace results; deletion only edits active entries | 2 + 3 = = gives 8; 5 + = gives 10 |
| Scope and storage | Basic arithmetic, per-page volatile state | Refresh loses calculations; no history, memory, or scientific mode |

These choices are proposed, not recorded as approved. Approval applies before further feature development; the earlier commit already implements them and is preserved.

## Verification and remaining evidence

Architecture review on 2026-10-18: npm test -- --runInBand --no-cache passed all 25 tests in 3 suites; npm run typecheck passed; npm run lint passed. Jest reports TS151002 warnings about NodeNext and isolatedModules. No application source or tests were changed by this architecture task.

The existing VM tests validate served-script handlers but do not render a real browser, verify assistive technology, or execute the production build. Production build, browser QA, coverage measurement, and remote CI/security results remain unverified in this task. Additional acceptance coverage should address missing-right-operand equals and percent/sign interactions with repeated equals once their intended behavior is approved.
