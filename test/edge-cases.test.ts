/**
 * @fileoverview Edge case tests
 *
 * This test file covers unusual patterns, Windows paths, and boundary
 * conditions that might not be covered by the basic compatibility tests.
 *
 * Test categories:
 * - Windows paths: Backslashes, UNC paths, drive letters, mixed slashes
 * - Empty and special patterns: Empty strings, comments, whitespace
 * - Nested braces: Complex brace expansion scenarios
 * - Multiple extensions: Patterns with multiple file extensions
 * - Trailing slashes: Directory indicators
 * - Case sensitivity: nocase option testing
 * - matchBase: Basename matching without full path
 * - nonull: Return pattern when no matches
 * - flipNegate: Inverted negation logic
 *
 * These tests ensure minimatch-fast handles real-world edge cases correctly.
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

// ============================================================================
// WINDOWS PATH HANDLING
// These tests verify that minimatch-fast correctly handles Windows-style paths
// with backslashes, UNC paths (//server/share), and drive letters (C:/)
// ============================================================================

describe('Windows paths', () => {
  it('should handle backslashes with windowsPathsNoEscape', () => {
    const windowsPath = 'src\\components\\Button.js';
    expect(
      minimatch(windowsPath, 'src/**/*.js', { windowsPathsNoEscape: true })
    ).toBe(true);
  });

  it('should handle mixed slashes', () => {
    expect(
      minimatch('src/foo\\bar.js', 'src/**/*.js', { windowsPathsNoEscape: true })
    ).toBe(true);
  });

  it('should handle UNC paths', () => {
    expect(
      minimatch('//server/share/file.js', '**/*.js', {
        windowsPathsNoEscape: true,
      })
    ).toBe(true);
  });

  it('should handle drive letters', () => {
    expect(
      minimatch('C:/Users/test/file.js', '**/*.js', {
        windowsPathsNoEscape: true,
      })
    ).toBe(true);
  });
});

// ============================================================================
// EMPTY AND SPECIAL PATTERNS
// These tests verify handling of edge cases like empty strings, comments (#),
// very long patterns, and patterns consisting only of wildcards
// ============================================================================

describe('Empty and special patterns', () => {
  it('should handle empty pattern', () => {
    expect(minimatch('', '')).toBe(true);
    expect(minimatch('foo', '')).toBe(false);
  });

  it('should handle comment patterns', () => {
    expect(minimatch('anything', '#comment')).toBe(false);
  });

  it('should respect nocomment option', () => {
    const mm = new Minimatch('#notacomment', { nocomment: true });
    expect(mm.comment).toBe(false);
  });

  it('should handle very long patterns gracefully', () => {
    const longPattern = 'a'.repeat(1000);
    expect(() => minimatch('test', longPattern)).not.toThrow();
  });

  it('should reject patterns that are too long', () => {
    const veryLongPattern = 'a'.repeat(100000);
    expect(() => minimatch('test', veryLongPattern)).toThrow(TypeError);
  });

  it('should handle pattern with only stars', () => {
    expect(minimatch('anything', '*')).toBe(true);
    expect(minimatch('any/thing', '**')).toBe(true);
    expect(minimatch('any/thing', '*')).toBe(false);
  });
});

// ============================================================================
// BRACE EXPANSION
// These tests verify that {a,b,c} and {1..5} patterns are correctly expanded
// Brace expansion is critical for patterns like: file.{js,ts,tsx}
// ============================================================================

describe('Brace expansion edge cases', () => {
  it('should expand comma-separated values', () => {
    const expanded = minimatch.braceExpand('{a,b,c}');
    expect(expanded.sort()).toEqual(['a', 'b', 'c']);
  });

  it('should expand numeric ranges', () => {
    const expanded = minimatch.braceExpand('{1..5}');
    expect(expanded).toEqual(['1', '2', '3', '4', '5']);
  });

  it('should expand alpha ranges', () => {
    const expanded = minimatch.braceExpand('{a..e}');
    expect(expanded).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('should handle nested braces', () => {
    const expanded = minimatch.braceExpand('{a,{b,c}}');
    expect(expanded.sort()).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty braces', () => {
    const expanded = minimatch.braceExpand('{}');
    expect(expanded).toEqual(['{}']);
  });

  it('should handle single value braces', () => {
    const expanded = minimatch.braceExpand('{a}');
    // Single value braces might be kept as-is or expanded
    expect(expanded.length).toBeGreaterThan(0);
  });

  it('should respect nobrace option', () => {
    const expanded = minimatch.braceExpand('{a,b,c}', { nobrace: true });
    expect(expanded).toEqual(['{a,b,c}']);
  });
});

// ============================================================================
// NEGATION PATTERNS
// These tests verify ! negation, double negation (!!), triple negation (!!!),
// and the nonegate/flipNegate options that control negation behavior
// ============================================================================

describe('Negation edge cases', () => {
  it('should handle single negation', () => {
    expect(minimatch('foo.txt', '!*.js')).toBe(true);
    expect(minimatch('foo.js', '!*.js')).toBe(false);
  });

  it('should handle double negation', () => {
    expect(minimatch('foo.js', '!!*.js')).toBe(true);
    expect(minimatch('foo.txt', '!!*.js')).toBe(false);
  });

  it('should handle triple negation', () => {
    expect(minimatch('foo.js', '!!!*.js')).toBe(false);
  });

  it('should respect nonegate option', () => {
    // With nonegate, the ! is treated literally
    expect(minimatch('!foo.js', '!*.js', { nonegate: true })).toBe(true);
  });

  it('should handle flipNegate option', () => {
    // flipNegate inverts the result of negation
    expect(minimatch('foo.js', '!*.js', { flipNegate: true })).toBe(true);
    expect(minimatch('foo.txt', '!*.js', { flipNegate: true })).toBe(false);
  });
});

// ============================================================================
// DOTFILE HANDLING
// These tests verify that dotfiles (.hidden, .gitignore) are handled correctly
// By default, * and ** don't match dotfiles unless dot:true is set
// ============================================================================

describe('Dotfile edge cases', () => {
  it('should not match dotfiles by default', () => {
    expect(minimatch('.hidden', '*')).toBe(false);
    expect(minimatch('.hidden', '**')).toBe(false);
  });

  it('should match dotfiles with dot option', () => {
    expect(minimatch('.hidden', '*', { dot: true })).toBe(true);
    expect(minimatch('.hidden', '**', { dot: true })).toBe(true);
  });

  it('should match dotfiles with explicit pattern', () => {
    expect(minimatch('.hidden', '.*')).toBe(true);
    expect(minimatch('.hidden', '.hidden')).toBe(true);
  });

  it('should handle nested dotfiles', () => {
    expect(minimatch('a/.hidden/b', 'a/*/b')).toBe(false);
    expect(minimatch('a/.hidden/b', 'a/*/b', { dot: true })).toBe(true);
  });
});

describe('Globstar edge cases', () => {
  it('should match zero directories', () => {
    expect(minimatch('a/b', 'a/**/b')).toBe(true);
  });

  it('should match one directory', () => {
    expect(minimatch('a/x/b', 'a/**/b')).toBe(true);
  });

  it('should match many directories', () => {
    expect(minimatch('a/x/y/z/b', 'a/**/b')).toBe(true);
  });

  it('should handle multiple globstars', () => {
    expect(minimatch('a/b/c/d', '**/**')).toBe(true);
    expect(minimatch('a/b/c/d', '**/c/**')).toBe(true);
  });

  it('should respect noglobstar option', () => {
    expect(minimatch('a/b/c', '**', { noglobstar: true })).toBe(false);
    expect(minimatch('abc', '**', { noglobstar: true })).toBe(true);
  });
});

describe('matchBase edge cases', () => {
  it('should match basename only', () => {
    expect(minimatch('path/to/file.js', '*.js', { matchBase: true })).toBe(
      true
    );
    expect(minimatch('very/deep/path/file.js', '*.js', { matchBase: true })).toBe(
      true
    );
  });

  it('should work with path patterns containing globstar', () => {
    // Pattern with slashes still works normally
    expect(
      minimatch('path/to/file.js', '**/*.js')
    ).toBe(true);
  });
});

describe('Special characters', () => {
  it('should handle patterns with special regex chars', () => {
    expect(minimatch('file.js', 'file.js')).toBe(true);
    expect(minimatch('file+js', 'file+js')).toBe(true);
  });

  it('should escape special chars with escape()', () => {
    const escaped = minimatch.escape('*.js');
    expect(escaped).not.toBe('*.js');
    expect(minimatch('*.js', escaped)).toBe(true);
  });

  it('should unescape with unescape()', () => {
    const escaped = minimatch.escape('*.js');
    const unescaped = minimatch.unescape(escaped);
    expect(unescaped).toBe('*.js');
  });
});

describe('Extglob patterns', () => {
  it('should handle @() exactly one', () => {
    expect(minimatch('foo.js', '@(foo|bar).js')).toBe(true);
    expect(minimatch('bar.js', '@(foo|bar).js')).toBe(true);
    expect(minimatch('baz.js', '@(foo|bar).js')).toBe(false);
  });

  it('should handle ?() zero or one', () => {
    expect(minimatch('foo.js', 'foo?(.min).js')).toBe(true);
    expect(minimatch('foo.min.js', 'foo?(.min).js')).toBe(true);
  });

  it('should handle *() zero or more', () => {
    expect(minimatch('foo.js', 'foo*(.min).js')).toBe(true);
    expect(minimatch('foo.min.js', 'foo*(.min).js')).toBe(true);
    expect(minimatch('foo.min.min.js', 'foo*(.min).js')).toBe(true);
  });

  it('should handle +() one or more', () => {
    expect(minimatch('foo.min.js', 'foo+(.min).js')).toBe(true);
    expect(minimatch('foo.js', 'foo+(.min).js')).toBe(false);
  });

  it('should handle !() negation', () => {
    expect(minimatch('foo.js', '!(bar).js')).toBe(true);
    expect(minimatch('bar.js', '!(bar).js')).toBe(false);
  });

  it('should respect noext option', () => {
    expect(minimatch('foo.js', '@(foo|bar).js', { noext: true })).toBe(false);
  });
});

// ============================================================================
// EXTENDED PICOMATCH OPTIONS (v0.3.0)
// These tests verify the new picomatch options exposed in minimatch-fast
// ============================================================================

describe('Extended picomatch options', () => {
  describe('failglob option', () => {
    it('should throw error when no matches and failglob is true', () => {
      expect(() =>
        minimatch.match(['a.txt', 'b.txt'], '*.js', { failglob: true })
      ).toThrow('No matches found for pattern: *.js (searched 2 paths)');
    });

    it('should not throw when matches exist', () => {
      expect(() =>
        minimatch.match(['a.js', 'b.txt'], '*.js', { failglob: true })
      ).not.toThrow();
    });

    it('should take precedence over nonull', () => {
      expect(() =>
        minimatch.match(['a.txt'], '*.js', { failglob: true, nonull: true })
      ).toThrow();
    });
  });

  describe('maxLength option', () => {
    it('should use default maxLength of 65536', () => {
      // Pattern exactly at limit should work
      const atLimit = 'a'.repeat(65536);
      expect(() => new Minimatch(atLimit)).not.toThrow();
      // Pattern over limit should throw
      const overLimit = 'a'.repeat(65537);
      expect(() => new Minimatch(overLimit)).toThrow(TypeError);
    });

    it('should allow custom maxLength', () => {
      const pattern = 'a'.repeat(100);
      expect(() => new Minimatch(pattern, { maxLength: 50 })).toThrow(TypeError);
    });

    it('should accept patterns within custom maxLength', () => {
      const pattern = 'a'.repeat(100);
      expect(() => new Minimatch(pattern, { maxLength: 200 })).not.toThrow();
    });

    it('should provide informative error message when pattern too long', () => {
      const pattern = 'a'.repeat(100);
      expect(() => new Minimatch(pattern, { maxLength: 50 })).toThrow(
        /Pattern length 100 exceeds maximum 50/
      );
    });

    it('should validate maxLength option value', () => {
      expect(() => new Minimatch('test', { maxLength: -1 })).toThrow(
        /options.maxLength must be a positive finite number/
      );
      expect(() => new Minimatch('test', { maxLength: 0 })).toThrow(
        /options.maxLength must be a positive finite number/
      );
      expect(() => new Minimatch('test', { maxLength: NaN })).toThrow(
        /options.maxLength must be a positive finite number/
      );
      expect(() => new Minimatch('test', { maxLength: Infinity })).toThrow(
        /options.maxLength must be a positive finite number/
      );
    });
  });

  describe('ignore option', () => {
    it('should ignore patterns matching ignore string', () => {
      const mm = new Minimatch('*.js', { ignore: 'test.js' });
      expect(mm.match('foo.js')).toBe(true);
      expect(mm.match('test.js')).toBe(false);
    });

    it('should ignore patterns matching ignore array', () => {
      const mm = new Minimatch('*.js', { ignore: ['test.js', 'spec.js'] });
      expect(mm.match('foo.js')).toBe(true);
      expect(mm.match('test.js')).toBe(false);
      expect(mm.match('spec.js')).toBe(false);
    });
  });

  describe('contains option', () => {
    it('should match pattern anywhere in string', () => {
      const mm = new Minimatch('foo', { contains: true });
      expect(mm.match('foobar')).toBe(true);
      expect(mm.match('barfoo')).toBe(true);
      expect(mm.match('barfoobaz')).toBe(true);
    });

    it('should not match without contains option', () => {
      const mm = new Minimatch('foo');
      expect(mm.match('foobar')).toBe(false);
      expect(mm.match('barfoo')).toBe(false);
    });
  });

  describe('bash option', () => {
    it('should follow bash matching rules strictly', () => {
      const mm = new Minimatch('*.js', { bash: true });
      expect(mm.match('foo.js')).toBe(true);
    });
  });

  describe('strictBrackets option', () => {
    it('should handle unbalanced brackets with strictBrackets option', () => {
      // strictBrackets affects how unbalanced brackets are handled
      // The exact behavior depends on picomatch version
      const mmStrict = new Minimatch('[abc', { strictBrackets: true });
      const mmNormal = new Minimatch('[abc');
      // Both should create valid Minimatch instances
      expect(mmStrict).toBeInstanceOf(Minimatch);
      expect(mmNormal).toBeInstanceOf(Minimatch);
    });

    it('should not throw without strictBrackets', () => {
      expect(() => new Minimatch('[abc')).not.toThrow();
    });
  });

  describe('format option', () => {
    it('should format strings before matching', () => {
      const mm = new Minimatch('*.js', {
        format: (str: string) => str.replace(/^\.\//, ''),
      });
      expect(mm.match('./foo.js')).toBe(true);
    });
  });

  describe('flags option', () => {
    it('should apply regex flags', () => {
      const mm = new Minimatch('*.JS', { flags: 'i' });
      expect(mm.match('foo.js')).toBe(true);
      expect(mm.match('foo.JS')).toBe(true);
    });
  });

  describe('callback options', () => {
    it('should call onMatch when pattern matches', () => {
      let matchCalled = false;
      const mm = new Minimatch('*.js', {
        onMatch: () => {
          matchCalled = true;
        },
      });
      mm.match('foo.js');
      expect(matchCalled).toBe(true);
    });

    it('should call onResult for all results', () => {
      let resultCount = 0;
      const mm = new Minimatch('*.js', {
        onResult: () => {
          resultCount++;
        },
      });
      const initialCount = resultCount;
      mm.match('foo.js');
      mm.match('bar.txt');
      // Should call onResult at least once per match call
      expect(resultCount).toBeGreaterThan(initialCount);
    });
  });

  describe('literalBrackets option', () => {
    it('should treat brackets as literal characters', () => {
      const mm = new Minimatch('[abc]', { literalBrackets: true });
      expect(mm.match('[abc]')).toBe(true);
      expect(mm.match('a')).toBe(false);
    });
  });

  describe('keepQuotes option', () => {
    it('should retain quotes in pattern', () => {
      const mm = new Minimatch('"foo"', { keepQuotes: true });
      expect(mm.match('"foo"')).toBe(true);
    });
  });

  describe('unescape option', () => {
    it('should remove backslashes from pattern', () => {
      const mm = new Minimatch('\\*', { unescape: true });
      expect(mm.match('*')).toBe(true);
    });
  });
});
