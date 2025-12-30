/**
 * @fileoverview Vitest configuration for compatibility tests
 *
 * This configuration file defines settings for running the compatibility tests
 * that compare minimatch-fast against the original minimatch. These tests
 * ensure 100% API compatibility.
 *
 * Run compatibility tests with: npm run test:compat
 *
 * The timeout is set higher (30s) because compatibility tests run both
 * minimatch and minimatch-fast for comparison, which takes more time.
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/compat.test.ts'],
    testTimeout: 30000,
  },
});
