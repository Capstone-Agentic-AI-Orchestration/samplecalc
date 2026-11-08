# CAL2-101 architecture and implementation handoff

## Scope and status

The issue requests a fully interactive functional calculator. This document describes the implementation already present at a8867a9 and the contracts subsequent agents should preserve. It is an architecture deliverable, not a new implementation or evidence of product approval. Read alongside [research](CAL2-101-research.md) and the repository README. No separate approved requirements artifact exists.

Keep the existing Express/TypeScript server and dependency-free static frontend. No database, calculation service, authentication, remote arithmetic API, frontend framework, or persistence is required by the supplied brief. Calculation state belongs to one browser page and resets on reload. Preserve earlier commits and unrelated changes.

## Boundaries and modules

| Module | Responsibility | Interface/dependency |
| --- | --- | --- |
| src/index.ts | Start the HTTP listener | Imports app; PORT defaults to 3000 |
| src/app.ts | Health endpoint and static delivery | Express, CORS_ORIGINS; serves sibling public/ |
| public/calculator.js | Arithmetic and state transitions, independent of DOM/network | Installs globalThis.Calculator; synchronous input(key) |
| public/app.js | Normalize clicks/keyboard input and render state | Constructs Calculator; reads display/expression/error/operator |
| public/index.html | Semantic controls and initial display | Deferred calculator.js precedes app.js; data-key commands |
| public/styles.css | Responsive layout, interaction and focus styling | Existing classes, error and aria-pressed attributes |

Flow: native button or keyboard event -> browser adapter -> engine input -> synchronous state mutation -> textContent and accessibility-state rendering. The engine never reads DOM elements. The server never receives operands or results. There are no third-party runtime requests in the current page.

## Engine interface and data model

`new globalThis.Calculator()` initializes the following in-memory state. `input(key: string): void` is the adapter-facing command interface; `clear()` resets state. Other methods and mutable fields are implementation details, not external service APIs.

| Field | Type | Meaning / initial value |
| --- | --- | --- |
| display | string | Editable decimal or formatted result; initially '0', or 'Error' on failure |
| stored | number or null | Left operand; initially null |
| operator | '+', '-', '*', '/', or null | Pending binary operation; initially null |
| fresh | boolean | Next digit replaces displayed operand; initially true |
| repeat | { operator, right: number } or null | Last successful equals operation; initially null |
| expression | string | Human-readable calculation/status; initially empty |
| error | boolean | Arithmetic failure latch; initially false |

Accepted commands: digits 0-9, '.', '+', '-', '*', '/', '=', '%', 'sign', 'backspace', 'clear'. Unknown commands leave state unchanged. Numbers use JavaScript Number; entry permits 12 digits, results use 12 significant digits, and scientific notation is possible. Both subsequent arithmetic and display use the rounded result. This is not an exact-decimal contract.

Transition contracts:

- Digits/decimal edit the current operand; a fresh result starts a new calculation. Duplicate decimal points are ignored. A digit or decimal clears an error before entry.
- An operator stores the displayed operand. If a right operand has been entered, resolve the pending operation first; otherwise replace the pending operator. Arithmetic is immediate and left-to-right.
- Equals resolves the pending operation and records its right operand for repeated equals. Without a pending/repeated operation it does nothing. Currently `5 + =` produces `10` by reusing the displayed operand.
- Sign toggles the operand; after a pending operator it begins a negative right operand as '-0'. Percent divides the displayed operand by 100 and clears repeated-equals state.
- Backspace edits an active operand, does nothing on a fresh result, and clears an error. Clear always restores initial state.
- Division by zero or non-finite results set display to 'Error' with a recoverable explanatory expression. Other operations are ignored while errored; clear, backspace, or numeric entry recover.

## Browser and HTTP contracts

The browser adapter binds button[data-key], #display, and #expression. It renders strings with textContent, toggles the error class, and sets aria-pressed for the pending operator. Keep these hooks synchronized with HTML changes. Native buttons support focus and Enter/Space activation; the adapter must avoid invoking those keys twice.

Keyboard aliases: Enter -> '=', Escape/Delete -> clear, Backspace -> backspace, comma -> decimal point, x/X -> multiply. Digits, decimal point, four operators, percent, and equals map directly. Ctrl/Meta/Alt combinations and editable targets are ignored. Prevent default only for handled calculator input. Minus selects subtraction; sign toggle is a button command.

| Request | Success contract |
| --- | --- |
| GET / | 200 text/html calculator document |
| GET /calculator.js, /app.js | 200 JavaScript static assets |
| GET /styles.css | 200 CSS static asset |
| GET /health | 200 application/json, { "status": "ok" } |

There is no arithmetic POST endpoint. Unmatched routes retain Express default behavior. Health reports process availability, not browser execution or asset integrity.

## Non-functional constraints

- Keep arithmetic local, deterministic, and synchronous with constant-sized state; never evaluate expressions as code. No calculation telemetry or stored history is needed.
- Preserve native buttons, descriptive operator labels, polite atomic status announcements, visible focus, reduced-motion behavior, and responsive four-column controls. Actual browser, touch and assistive-technology behavior still requires validation.
- No numerical accuracy guarantee beyond the Number/rounding contract. Do not represent this as financial-grade arithmetic.
- Production must deploy public/ beside dist/; tsc does not copy browser assets. Continue using the lockfile and existing scripts. No new dependency is needed for this architecture.
- Browser support and performance targets are unspecified. Do not claim a tested browser matrix or formal accessibility conformance.

## Decisions requiring human approval before changes

The following choices are implemented and documented but were not explicitly approved in the brief. Preserve them during this handoff; obtain owner approval before changing their behavior or expanding scope:

1. Left-to-right desk arithmetic versus expression precedence, standalone percent versus contextual percent, and repeated equals (including incomplete operations such as `5 + =`).
2. Twelve-digit input and rounded Number arithmetic versus exact decimal/scientific requirements.
3. Any additional history, persistence, memory functions, localization, backend calculation, or external integration.

Owner input is also needed to establish release browser/device coverage and any accessibility acceptance standard. This does not prevent documenting or testing the existing application. No new architectural dependency or implementation decision is requested by this document.

## Dependencies, validation and next-agent handoff

The implementation order, if revisited, is engine behavior -> adapter/HTML hooks -> static delivery -> interaction validation. The engine and adapter require no new packages. Engine tests load the actual browser script in a VM; adapter tests use DOM stubs; HTTP tests exercise Express delivery. Keep these boundaries independently testable.

Run npm test -- --runInBand, npm run typecheck, npm run lint, and npm run build. Lint covers src/tests only; TypeScript compilation does not validate public JavaScript. Existing VM tests cannot establish actual focus, layout, touch, or screen-reader behavior. A release verification pass should exercise these in real browsers against the served app, including narrow-screen overflow, native Enter/Space activation, errors, and negative operands.

Architecture changes: this document only. No implementation or new tests are necessary for this documentation-only handoff. See the agent handoff for actual verification results from this pass.

## Verification in this architecture pass

- npm test -- --runInBand: passed, 4 suites / 30 tests.
- npm run typecheck: passed (exit 0).
- npm run lint: passed (exit 0).
- npm run build: passed (exit 0).

Next agent: preserve the existing implementation and use the contracts above when reviewing it. Resolve product semantics with the owner before changing them; complete native-browser interaction/accessibility checks before claiming browser validation. No runtime files were changed by the Architecture Agent.
