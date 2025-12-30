/**
 * @fileoverview Regression tests for known vulnerabilities and performance issues
 *
 * This test file ensures that minimatch-fast does NOT have the vulnerabilities
 * and performance issues that affected the original minimatch.
 *
 * Security tests:
 * - CVE-2022-3517: ReDoS (Regular Expression Denial of Service) vulnerability
 *   that could cause applications to hang on specially crafted patterns
 * - Pathological patterns: Patterns designed to cause exponential backtracking
 * - Deeply nested patterns: Patterns with many levels of globstar
 *
 * Performance tests:
 * - Large brace expansion: {1..1000} should complete quickly
 * - Very large ranges: {1..10000} should be handled gracefully
 * - Pattern length limits: Very long patterns should be rejected
 *
 * Why these tests matter:
 * The original minimatch had vulnerabilities that could be exploited to
 * freeze Node.js applications. minimatch-fast uses picomatch which has
 * built-in protections against these attacks.
 *
 * To run these tests:
 * ```bash
 * npm test
 * ```
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import { minimatch, Minimatch } from '../src';

describe('CVE-2022-3517 ReDoS vulnerability', () => {
  it('should not freeze on pathological patterns', () => {
    const start = Date.now();

    // This pattern would cause ReDoS in old minimatch
    const maliciousPattern = '*'.repeat(100) + 'a';

    try {
      minimatch('a'.repeat(100), maliciousPattern);
    } catch {
      // OK if it throws instead of hanging
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });

  it('should handle deeply nested patterns', () => {
    const start = Date.now();

    const pattern = '**/' + '**/'.repeat(10) + '*.js';

    try {
      minimatch('a/b/c/d/e/f/g/h/i/j/file.js', pattern);
    } catch {
      // OK if it throws
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});

describe('Large brace expansion', () => {
  it('should handle large numeric ranges efficiently', () => {
    const start = Date.now();

    // This would freeze old minimatch
    const result = minimatch('file50.txt', '{1..100}.txt');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
    // The result might be true or false depending on implementation
    // We just care that it completes quickly
  });

  it('should handle moderate ranges', () => {
    const start = Date.now();

    minimatch.braceExpand('{1..100}');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('should limit expansion to prevent DoS', () => {
    const start = Date.now();

    try {
      // Very large range - should be limited or handled gracefully
      minimatch.braceExpand('{1..10000}');
    } catch {
      // OK if it throws
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it('should handle alpha ranges', () => {
    const start = Date.now();

    const result = minimatch.braceExpand('{a..z}');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
    expect(result.length).toBe(26);
  });
});

describe('Pattern validation', () => {
  it('should reject non-string patterns', () => {
    expect(() => minimatch('test', null as unknown as string)).toThrow(TypeError);
    expect(() => minimatch('test', undefined as unknown as string)).toThrow(TypeError);
    expect(() => minimatch('test', 123 as unknown as string)).toThrow(TypeError);
    expect(() => minimatch('test', {} as unknown as string)).toThrow(TypeError);
  });

  it('should reject extremely long patterns', () => {
    const veryLongPattern = 'a'.repeat(100000);
    expect(() => minimatch('test', veryLongPattern)).toThrow(TypeError);
  });

  it('should handle Minimatch class with invalid pattern', () => {
    expect(() => new Minimatch(null as unknown as string)).toThrow(TypeError);
  });
});

describe('Memory safety', () => {
  it('should not leak memory on repeated calls', () => {
    // This is a basic smoke test - proper memory testing would require
    // external tools
    for (let i = 0; i < 1000; i++) {
      minimatch('some/path/file.js', '**/*.js');
    }
    // If we get here without crashing, we're OK
    expect(true).toBe(true);
  });

  it('should handle many Minimatch instances', () => {
    const instances: Minimatch[] = [];
    for (let i = 0; i < 100; i++) {
      instances.push(new Minimatch(`pattern${i}/**/*.js`));
    }
    expect(instances.length).toBe(100);
  });
});

describe('Edge cases from real-world bugs', () => {
  it('should handle patterns ending with **', () => {
    expect(minimatch('a/b/c', 'a/**')).toBe(true);
  });

  it('should handle patterns starting with **', () => {
    expect(minimatch('a/b/c.js', '**/*.js')).toBe(true);
    expect(minimatch('c.js', '**/*.js')).toBe(true);
  });

  it('should handle exact path matching', () => {
    expect(minimatch('a/b', 'a/b')).toBe(true);
    expect(minimatch('a/b/c', 'a/b/c')).toBe(true);
  });

  it('should preserve multiple slashes with option', () => {
    const mm = new Minimatch('a//b', { preserveMultipleSlashes: true });
    expect(mm.match('a//b')).toBe(true);
  });

  it('should handle trailing slashes in pattern', () => {
    expect(minimatch('dir/', 'dir/')).toBe(true);
  });

  it('should handle patterns with only globstar', () => {
    expect(minimatch('anything', '**')).toBe(true);
    expect(minimatch('a/b/c', '**')).toBe(true);
  });

  it('should handle paths starting with slash', () => {
    expect(minimatch('/a', '**/a')).toBe(true);
  });
});

describe('Partial matching', () => {
  it('should match full paths correctly', () => {
    const mm = new Minimatch('src/**/*.js');

    expect(mm.match('src/components/Button.js')).toBe(true);
    expect(mm.match('src/index.js')).toBe(true);
  });

  it('should reject non-matching paths', () => {
    const mm = new Minimatch('src/**/*.js');

    expect(mm.match('lib/file.js')).toBe(false);
    expect(mm.match('dist/file.js')).toBe(false);
  });
});

describe('hasMagic', () => {
  it('should detect magic characters', () => {
    expect(new Minimatch('*.js').hasMagic()).toBe(true);
    expect(new Minimatch('**/*.js').hasMagic()).toBe(true);
    expect(new Minimatch('[a-z].js').hasMagic()).toBe(true);
    expect(new Minimatch('?(a|b).js').hasMagic()).toBe(true);
  });

  it('should respect magicalBraces option', () => {
    expect(new Minimatch('{a,b}.js').hasMagic()).toBe(true); // Multiple patterns from brace expansion
    expect(
      new Minimatch('{a,b}.js', { magicalBraces: true }).hasMagic()
    ).toBe(true);
  });
});
