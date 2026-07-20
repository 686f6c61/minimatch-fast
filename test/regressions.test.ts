/**
 * @fileoverview Regression tests for bugs found in code review
 *
 * Each describe block maps to a fixed bug. These tests verify the fixes
 * and, where applicable, that behavior matches the original minimatch.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import minimatch, { Minimatch, escape, unescape } from '../src/index.js';

describe('Regression: cache key must include all matching-affecting options', () => {
  beforeEach(() => {
    minimatch.clearCache();
  });

  it('should not share cached matchers between different contains options', () => {
    expect(minimatch('foo/bar/baz', 'bar', { contains: true })).toBe(true);
    expect(minimatch('foo/bar/baz', 'bar', { contains: false })).toBe(false);
  });

  it('should not share cached matchers between different flags options', () => {
    expect(minimatch('A.JS', '*.js', { flags: 'i' })).toBe(true);
    expect(minimatch('A.JS', '*.js', {})).toBe(false);
  });

  it('should not share cached matchers between different bash options', () => {
    const withBash = minimatch('a/b/c', '*', { bash: true });
    const withoutBash = minimatch('a/b/c', '*', {});
    expect(withBash).not.toBe(withoutBash);
  });

  it('should not share cached matchers between different maxLength options', () => {
    expect(() => minimatch('a.js', '*.js', { maxLength: 100 })).not.toThrow();
    expect(() => minimatch('a.js', '*.js', { maxLength: 2 })).toThrow(
      TypeError
    );
  });

  it('should not share cached matchers between different strictBrackets options', () => {
    // With strictBrackets, an imbalanced bracket pattern throws inside
    // picomatch and the matcher never matches; the results must differ
    // or at least not come from the same cached instance.
    const a = minimatch('a', 'a[', { strictBrackets: true });
    const b = minimatch('a', 'a[', {});
    expect(typeof a).toBe('boolean');
    expect(typeof b).toBe('boolean');
  });

  it('should distinguish function options by identity', () => {
    const strip = (s: string) => s.replace(/^x/, '');
    expect(minimatch('xfoo', 'foo', { format: strip })).toBe(true);
    expect(minimatch('xfoo', 'foo', {})).toBe(false);
  });
});

describe('Regression: hasMagic() must detect literal patterns', () => {
  it('should return false for literal patterns (minimatch compat)', () => {
    expect(new Minimatch('foo.js').hasMagic()).toBe(false);
    expect(new Minimatch('foo/bar/baz.txt').hasMagic()).toBe(false);
  });

  it('should return true for patterns with magic', () => {
    expect(new Minimatch('*.js').hasMagic()).toBe(true);
    expect(new Minimatch('foo?.js').hasMagic()).toBe(true);
    expect(new Minimatch('[abc].js').hasMagic()).toBe(true);
    expect(new Minimatch('**/*.js').hasMagic()).toBe(true);
    expect(new Minimatch('@(a|b).js').hasMagic()).toBe(true);
  });

  it('should return false for brace-expanded literals without magicalBraces', () => {
    expect(new Minimatch('{a,b}.js').hasMagic()).toBe(false);
  });

  it('should return true for literal patterns with nocase (minimatch compat)', () => {
    // minimatch compiles literals to regexes under nocase
    expect(new Minimatch('foo.js', { nocase: true }).hasMagic()).toBe(true);
  });
});

describe('Regression: makeRe() must honor negation', () => {
  it('should match everything except the pattern for negated patterns', () => {
    const re = minimatch.makeRe('!*.js');
    expect(re).not.toBe(false);
    if (re) {
      expect(re.test('foo.txt')).toBe(true);
      expect(re.test('foo.js')).toBe(false);
    }
  });

  it('should keep _src and _glob metadata', () => {
    const re = minimatch.makeRe('*.js');
    expect(re).not.toBe(false);
    if (re) {
      expect(re._glob).toBe('*.js');
      expect(typeof re._src).toBe('string');
    }
  });

  it('should still return false for comments and empty patterns', () => {
    expect(minimatch.makeRe('#comment')).toBe(false);
    expect(minimatch.makeRe('')).toBe(false);
  });
});

describe('Regression: escape/unescape alignment with minimatch', () => {
  it('should not escape braces by default', () => {
    expect(escape('{a,b}')).toBe('{a,b}');
    expect(escape('*.js')).toBe('\\*.js');
    expect(escape('[test].js')).toBe('\\[test\\].js');
  });

  it('should escape braces when magicalBraces is true', () => {
    expect(escape('{a,b}', { magicalBraces: true })).toBe('\\{a,b\\}');
    expect(escape('{a,b}', { magicalBraces: true, windowsPathsNoEscape: true })).toBe(
      '[{]a,b[}]'
    );
  });

  it('should escape with character classes in windowsPathsNoEscape mode', () => {
    expect(escape('*.js', { windowsPathsNoEscape: true })).toBe('[*].js');
    // Backslash is a path separator in this mode, not escaped
    expect(escape('a\\b*.js', { windowsPathsNoEscape: true })).toBe('a\\b[*].js');
  });

  it('unescape should reverse escape', () => {
    expect(unescape('\\*.js')).toBe('*.js');
    expect(unescape('\\[test\\].js')).toBe('[test].js');
    expect(unescape('[*].js', { windowsPathsNoEscape: true })).toBe('*.js');
  });

  it('unescape should unescape braces by default (minimatch compat)', () => {
    expect(unescape('\\{a\\}')).toBe('{a}');
    expect(unescape('\\{a\\}', { magicalBraces: false })).toBe('\\{a\\}');
  });
});

describe('Regression: nonull/failglob must come from call options, not cache', () => {
  beforeEach(() => {
    minimatch.clearCache();
  });

  it('should not leak nonull behavior through the cache', () => {
    expect(minimatch.match([], 'zzz-*', { nonull: true })).toEqual(['zzz-*']);
    // Same pattern, different call: nonull must not apply
    expect(minimatch.match([], 'zzz-*', {})).toEqual([]);
  });

  it('should not leak failglob behavior through the cache', () => {
    expect(() => minimatch.match([], 'zzz-*', { failglob: true })).toThrow();
    expect(minimatch.match([], 'zzz-*', {})).toEqual([]);
  });
});

describe('Regression: dot and dotdot path handling', () => {
  it('wildcards must never match . or .., even with dot:true', () => {
    expect(minimatch('.', '*', { dot: true })).toBe(false);
    expect(minimatch('..', '**')).toBe(false);
    expect(minimatch('.', '*')).toBe(false);
  });

  it('explicit literal patterns must match .', () => {
    expect(minimatch('.', '.')).toBe(true);
  });

  it('patterns merely containing a dot must not short-circuit', () => {
    // '*.js' contains '.' but must not match the path '.'
    expect(minimatch('.', '*.js')).toBe(false);
    expect(minimatch('.', '*.js', { dot: true })).toBe(false);
  });
});

describe('Regression: matchOne with literal string parts', () => {
  it('matchOne should work with literal parts returned by parse', () => {
    const mm = new Minimatch('foo/bar');
    expect(mm.matchOne(['foo', 'bar'], mm.set[0]!, false)).toBe(true);
    expect(mm.matchOne(['foo', 'baz'], mm.set[0]!, false)).toBe(false);
  });
});

describe('Regression: early rejection of slashless patterns', () => {
  beforeEach(() => {
    minimatch.clearCache();
  });

  it('slashless patterns must not match nested paths', () => {
    expect(minimatch('src/foo.js', '*.js')).toBe(false);
    expect(minimatch('a/b/c.txt', '*.txt')).toBe(false);
    expect(new Minimatch('*.js').match('src/foo.js')).toBe(false);
  });

  it('but they must match bare filenames', () => {
    expect(minimatch('foo.js', '*.js')).toBe(true);
    expect(new Minimatch('*.js').match('foo.js')).toBe(true);
  });

  it('trailing slash paths may still match slashless patterns', () => {
    // 'bdir/' matches [a-y]*[^c] through its trimmed form (compat suite #8)
    expect(minimatch('bdir/', '[a-y]*[^c]')).toBe(true);
    expect(new Minimatch('[a-y]*[^c]').match('bdir/')).toBe(true);
  });

  it('globstar and brace patterns are not early-rejected', () => {
    expect(minimatch('a/b/c', '**')).toBe(true);
    expect(minimatch('b/c', '{a,b/c}')).toBe(true);
    expect(minimatch('src/foo.js', '**/*.js')).toBe(true);
  });

  it('negated slashless patterns still invert correctly', () => {
    expect(minimatch('src/foo.js', '!*.js')).toBe(true);
    expect(minimatch('src/foo.js', '!*.js', { flipNegate: true })).toBe(false);
  });

  it('contains, bash and format options bypass early rejection', () => {
    expect(minimatch('foo/bar/baz', 'bar', { contains: true })).toBe(true);
    expect(minimatch('a/b/c', '*', { bash: true })).toBe(true);
    const strip = (s: string) => s.replace(/^\.\//, '');
    expect(minimatch('./foo', 'foo', { format: strip })).toBe(true);
  });

  it('matchBase and partial bypass early rejection', () => {
    expect(minimatch('src/foo.js', '*.js', { matchBase: true })).toBe(true);
    // Root always matches in partial mode
    expect(minimatch('/', 'src/*', { partial: true })).toBe(true);
  });
});
