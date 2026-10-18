import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.test.tsx'
  ],
  /**
   * tsconfig's `moduleResolution: NodeNext` requires every relative import
   * to spell out its extension -- `./app.module.js` -- so the same code
   * resolves under real Node. ts-jest compiles to CommonJS underneath, and
   * Jest's own resolver looks for a literal `app.module.js` there and never
   * finds one, since only `app.module.ts` exists on disk. Stripping the
   * extension before resolution is what makes both true at once.
   */
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

export default config;
