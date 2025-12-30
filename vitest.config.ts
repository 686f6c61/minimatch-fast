/**
 * @fileoverview Vitest configuration for unit tests
 *
 * This configuration file defines settings for running the unit tests
 * (edge cases and regression tests). Compatibility tests are run with
 * a separate configuration (vitest.compat.config.ts).
 *
 * Run unit tests with: npm test
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/compatibility/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['benchmarks/**', 'test/**', 'dist/**', 'scripts/**'],
    },
    testTimeout: 10000,
  },
});
