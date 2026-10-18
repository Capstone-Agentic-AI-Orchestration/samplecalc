# CAL2-101 validation handoff

Reviewed HEAD 6ae667d and the preceding implementation, architecture, research, database, mobile and security handoffs. No separately approved architecture artifact exists; validation uses the supplied issue and documented implementation contracts.

## Verdict

PASS for the exercised functional scope and repository checks. This is not a complete release, accessibility or security clearance. No runtime fixes were necessary in this pass.

## Evidence from this pass

- npm test -- --runInBand: 4 suites, 32 tests passed.
- npm run typecheck, npm run lint, npm run build: each completed successfully.
- node --check public/calculator.js and public/app.js: passed.
- git diff --check: passed before this report.
- Coverage run: 32 tests passed; reported 100% for src/app.ts only. Browser scripts loaded through VM are not included in this coverage figure. ts-jest emitted TS151002 about hybrid module configuration and isolatedModules; the run still passed.
- Installed headless Chrome exercised the built Express application over a local HTTP listener. Actual DOM button clicks produced: 7 + 8 = 15; 5 + sign 2 = 3; 50 percent = 0.5; 8 / 0 = Error; entering 4 recovered to 4.
- Chrome Input.dispatchKeyEvent with no focused button: 2 + 3 Enter produced 5.
- Chrome mobile viewport emulation at 320 x 740: innerWidth and document scrollWidth were both 320; minimum measured button dimensions were 62.75 x 55 CSS pixels.

## Remaining limitations and reproduction

- Focused-button Enter remains unverified: the CDP keyDown/keyUp sequence after focusing 7 left the result at 5. That synthetic sequence is insufficient to establish a product defect or a successful native activation. Follow up in an interactive browser: calculate 2 + 3, focus 7, press physical Enter and expect 7 exactly once; test Space similarly. Existing adapter tests verify only that these events are not intercepted.
- No screenshot review, physical touch device, screen reader, full browser matrix or zoom validation was performed. Headless viewport emulation does not establish those results.
- The preceding security report records 29 high and 5 moderate development dependency findings. This pass did not rerun the network-backed audit or remediate dependencies. Reproduce with npm audit --json; check production separately with npm audit --omit=dev --json. A clean security gate remains outstanding.
- Lint covers src/tests; public JavaScript receives syntax and execution checks but no lint or TypeScript analysis. Deployment must retain public beside dist.

Changes in this validation pass: this report only. Preserve earlier implementation commits. Next agent should report the actual checks above, retain the security finding and browser limitations, and avoid presenting source-only coverage as coverage of the calculator engine.
