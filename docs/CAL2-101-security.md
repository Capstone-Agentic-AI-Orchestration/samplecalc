# CAL2-101 security and code-quality review

Reviewed branch changes from scaffold f4ed10b through 87cfc9f, including runtime assets, server, tests, lockfile, environment example and workflows. This pass changes only this review document; no implementation or dependency rewrites and no remote changes.

## Findings and remediation

1. **High (development dependency audit): vulnerable tooling dependencies.** Full `npm audit --json` exits 1 with 34 affected package entries (29 high, 5 moderate; these are not 34 independent advisories). `npm ls` confirms Jest 29.7.0 -> micromatch 4.0.8 -> braces 3.0.3, and ts-jest 29.4.15 -> coverage tooling -> js-yaml 3.15.2 -> argparse 1.0.10 -> sprintf-js 1.0.3. Audit identifies stack-exhaustion denial of service in braces (https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and unbounded precision denial of service in sprintf-js (https://github.com/advisories/GHSA-hp3w-g68c-fv3c). Actual exploitability requires affected tooling to process attacker-controlled patterns/format strings; no calculator HTTP path to these packages was found. Production-only audit exits 0 with zero findings. Update the development dependency tree to patched versions compatible with Jest/ts-jest, regenerate the lockfile and rerun checks and full audit. npm proposes a major Jest upgrade; do not apply `audit fix --force` without compatibility review. This tooling was declared in the scaffold; the branch adds its lockfile. Existing CI uses fail-on-high and may reject this tree, depending on the external scanner's scope.

2. **Low (quality): browser code bypasses static checks.** package.json runs `eslint src tests`; tsconfig includes only src/tests. The new public/calculator.js and public/app.js therefore receive neither lint nor typechecking. VM tests execute them, but do not replace static analysis. Add browser-specific ESLint configuration/globals and include public JavaScript in lint; consider checked JavaScript/JSDoc for the state machine. Syntax checks pass in this review.

3. **Low (pre-existing CI hardening): broad workflow permissions and mutable external workflow references.** .github/workflows/ci.yml grants id-token, packages and security-events write globally and delegates to external workflows at @v1. Pin reviewed immutable commit SHAs and scope write permissions to jobs that require them, coordinating with the workflow provider. The delegated workflow implementation was not inspected, so no shell injection or concrete workflow exploit is asserted.

## Security observations

No hardcoded credentials were found in reviewed tracked files (the environment example contains local URLs only). The engine uses explicit arithmetic dispatch rather than eval/Function; rendering uses textContent. Operand strings are bounded and calculation state stays in the browser. Static serving is rooted at public rather than the repository root. There are no account, persistence or protected mutation endpoints requiring authorization in the current scope. No new runtime dependency is introduced. These observations are source review, not penetration testing or a guarantee against all vulnerabilities.

## Actual verification

- npm test -- --runInBand: passed, 4 suites / 32 tests.
- npm run typecheck: passed.
- npm run lint: passed (src/tests only).
- npm run build: passed.
- node --check public/calculator.js and public/app.js: passed.
- git diff --check: passed before this documentation change.
- npm audit --omit=dev --json: passed, zero known findings.
- npm audit --json: failed, exit 1; 29 high / 5 moderate development dependency findings.

## Next-agent handoff

Preserve the calculator implementation and earlier changes. Address the dependency audit before claiming a clean full security scan; rerun audit after remediation. Native browser/mobile, focus, touch and screen-reader checks remain unverified because adapter tests use DOM stubs. This review adds no redundant tests and changes no executable behavior.
