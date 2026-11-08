# CAL2-101 research handoff to Architecture Agent

## Brief and repository evidence

The supplied request is “make a fully interactive functional calculator.” No design reference, detailed arithmetic specification, or approved-brief artifact is present in the tracked repository. Treat the issue text as the supplied brief; do not infer additional product requirements.

The current branch is agent/squad-default-squad/cal2-101-8306. Its actual starting HEAD for this research pass is 69d1147, following calculator implementation ac3d576 and negative-operand fix b89800b. The supplied description of a Manager-only commit does not match this checkout. The working tree was clean. Preserve the existing implementation.

## Domain findings and established behavior

- The existing stack is Express with TypeScript and static browser JavaScript, HTML, and CSS. No frontend framework is needed to explain the current architecture. Sources: package.json, src/app.ts, public/.
- Arithmetic is immediate, left-to-right: 2 + 3 * 4 = 20. Percent divides the current operand by 100, rather than applying a contextual percentage. Repeated equals repeats the previous operation; a replacement operator changes the pending operation. These are documented implementation choices, not explicit issue requirements. Sources: README.md Calculator section, public/calculator.js, tests/unit/calculator.spec.ts.
- Existing controls cover digits, decimal, four operators, equals, clear, sign, percent, and backspace. Keyboard aliases include Enter, Escape/Delete, Backspace, decimal comma, and x/X. Modified shortcuts and editable elements are excluded from interception. Sources: public/index.html, public/app.js, tests/unit/browser.spec.ts.
- The engine limits entry to 12 digits, rounds results to 12 significant digits, and provides recoverable division-by-zero and overflow errors. Negative right operands can be entered through the sign button. Sources: public/calculator.js, README.md, tests/unit/calculator.spec.ts.

## Assumptions and unknowns

Assume the existing basic desk-calculator model is acceptable until the owner specifies otherwise. Precedence, contextual percentages, memory, history, persistence, scientific operations, exact decimal arithmetic, and localization have not been requested. They are not proposed requirements.

Unknowns: intended browser/device support; whether native browser and assistive-technology QA has occurred; desired behavior for incomplete operations such as 5 + =; whether scientific notation and rounding match user expectations. The current keyboard minus selects subtraction; it is not a dedicated sign-toggle shortcut.

## Constraints and source-backed risks

- Precision: the engine uses JavaScript Number and rounds displayed/intermediate results. Exact financial or arbitrary-precision calculations are outside the documented implementation. Source: public/calculator.js value()/calculate(), README.md.
- Deployment: public/ must accompany dist/ because the server resolves sibling static assets at runtime; TypeScript build alone does not copy them. Sources: src/app.ts, package.json build script, README.md.
- Verification scope: browser.spec.ts uses VM execution and hand-built element stubs. Passing tests do not establish actual layout, native focus/click behavior, touch behavior, or screen-reader announcements. Sources: tests/unit/browser.spec.ts, jest.config.ts.
- Static JavaScript coverage: lint targets only src and tests, and the TypeScript build compiles the server. Therefore passing lint/typecheck does not establish static validation of public/*.js. Sources: package.json, tsconfig.build.json.
- Accessibility: native buttons, accessible operator labels, focus styles, and a polite live region exist, but their real-browser usability remains unverified in this research pass. Sources: public/index.html, public/styles.css.

## Verification and architecture handoff

Executed npm test -- --runInBand: 4 suites, 30 tests passed. Executed npm run typecheck, npm run lint, and npm run build: each exited successfully. No implementation files changed during research.

Architecture Agent: build on the existing engine/browser-adapter/static-server separation. Assess the listed unknowns and verification gaps without expanding scope. This document is the research deliverable; it does not prescribe a redesign or additional features.
