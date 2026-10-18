# Tests

This folder is the home for all test suites in this repository.

| Folder | Purpose |
| ------ | ------- |
| `unit/` | Unit tests. Run by `npm test`. |

## Conventions

- Unit test files end with `.spec.ts` or `.test.ts` (`.tsx` for React components).
- Mirror the `src/` structure: `src/user/user.service.ts` is tested by `tests/unit/user/user.service.spec.ts`.
- Co-located specs inside `src/` also work, but `tests/unit/` is the convention this scaffold sets up.
- Keep end-to-end suites in `tests/e2e/` named `*.e2e-spec.ts` so the unit runner does not pick them up.
