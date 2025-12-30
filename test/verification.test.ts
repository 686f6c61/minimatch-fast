/**
 * Verification tests for minimatch-fast v0.2.0
 * Tests for POSIX classes, Issue #273, and Unicode support
 */

import { describe, it, expect } from 'vitest';
import { minimatch, Minimatch } from '../src/index.js';

describe('POSIX Character Classes', () => {
  describe('[[:alpha:]] - Alphabetic characters', () => {
    it('should match lowercase letters', () => {
      expect(minimatch('a', '[[:alpha:]]')).toBe(true);
      expect(minimatch('z', '[[:alpha:]]')).toBe(true);
    });

    it('should match uppercase letters', () => {
      expect(minimatch('A', '[[:alpha:]]')).toBe(true);
      expect(minimatch('Z', '[[:alpha:]]')).toBe(true);
    });

    it('should not match digits', () => {
      expect(minimatch('5', '[[:alpha:]]')).toBe(false);
    });

    it('should work in file patterns', () => {
      expect(minimatch('file.txt', '[[:alpha:]]*.txt')).toBe(true);
      expect(minimatch('123.txt', '[[:alpha:]]*.txt')).toBe(false);
    });
  });

  describe('[[:digit:]] - Numeric characters', () => {
    it('should match digits', () => {
      expect(minimatch('0', '[[:digit:]]')).toBe(true);
      expect(minimatch('5', '[[:digit:]]')).toBe(true);
      expect(minimatch('9', '[[:digit:]]')).toBe(true);
    });

    it('should not match letters', () => {
      expect(minimatch('a', '[[:digit:]]')).toBe(false);
    });

    it('should work in file patterns', () => {
      expect(minimatch('file1.txt', 'file[[:digit:]].txt')).toBe(true);
      expect(minimatch('filea.txt', 'file[[:digit:]].txt')).toBe(false);
    });
  });

  describe('[[:alnum:]] - Alphanumeric characters', () => {
    it('should match letters and digits', () => {
      expect(minimatch('a', '[[:alnum:]]')).toBe(true);
      expect(minimatch('Z', '[[:alnum:]]')).toBe(true);
      expect(minimatch('5', '[[:alnum:]]')).toBe(true);
    });

    it('should not match special characters', () => {
      expect(minimatch('-', '[[:alnum:]]')).toBe(false);
      expect(minimatch('_', '[[:alnum:]]')).toBe(false);
    });
  });

  describe('[[:space:]] - Whitespace characters', () => {
    it('should match space', () => {
      expect(minimatch(' ', '[[:space:]]')).toBe(true);
    });

    it('should match tab', () => {
      expect(minimatch('\t', '[[:space:]]')).toBe(true);
    });

    it('should not match letters', () => {
      expect(minimatch('a', '[[:space:]]')).toBe(false);
    });
  });

  describe('[[:upper:]] - Uppercase letters', () => {
    it('should match uppercase', () => {
      expect(minimatch('A', '[[:upper:]]')).toBe(true);
      expect(minimatch('Z', '[[:upper:]]')).toBe(true);
    });

    it('should not match lowercase', () => {
      expect(minimatch('a', '[[:upper:]]')).toBe(false);
    });
  });

  describe('[[:lower:]] - Lowercase letters', () => {
    it('should match lowercase', () => {
      expect(minimatch('a', '[[:lower:]]')).toBe(true);
      expect(minimatch('z', '[[:lower:]]')).toBe(true);
    });

    it('should not match uppercase', () => {
      expect(minimatch('A', '[[:lower:]]')).toBe(false);
    });
  });

  describe('[[:xdigit:]] - Hexadecimal characters', () => {
    it('should match hex digits', () => {
      expect(minimatch('0', '[[:xdigit:]]')).toBe(true);
      expect(minimatch('9', '[[:xdigit:]]')).toBe(true);
      expect(minimatch('a', '[[:xdigit:]]')).toBe(true);
      expect(minimatch('f', '[[:xdigit:]]')).toBe(true);
      expect(minimatch('A', '[[:xdigit:]]')).toBe(true);
      expect(minimatch('F', '[[:xdigit:]]')).toBe(true);
    });

    it('should not match non-hex', () => {
      expect(minimatch('g', '[[:xdigit:]]')).toBe(false);
      expect(minimatch('z', '[[:xdigit:]]')).toBe(false);
    });
  });

  describe('[[:punct:]] - Punctuation characters', () => {
    it('should match punctuation', () => {
      // Note: '.' is special in glob context, use other punctuation
      expect(minimatch(',', '[[:punct:]]')).toBe(true);
      expect(minimatch('!', '[[:punct:]]')).toBe(true);
      expect(minimatch('@', '[[:punct:]]')).toBe(true);
      expect(minimatch('#', '[[:punct:]]')).toBe(true);
    });

    it('should not match alphanumeric', () => {
      expect(minimatch('a', '[[:punct:]]')).toBe(false);
      expect(minimatch('5', '[[:punct:]]')).toBe(false);
    });
  });

  describe('Combined POSIX patterns', () => {
    it('should work with multiple POSIX classes', () => {
      expect(minimatch('a1', '[[:alpha:]][[:digit:]]')).toBe(true);
      expect(minimatch('1a', '[[:alpha:]][[:digit:]]')).toBe(false);
    });

    it('should work with glob patterns', () => {
      expect(minimatch('test123.js', '[[:alpha:]]*[[:digit:]].js')).toBe(true);
    });
  });
});

describe('Issue #273 - Regex with commas and character classes', () => {
  // Original issue: patterns with commas inside character classes
  // can generate invalid regex

  describe('Character classes with special characters', () => {
    it('should handle comma in character class', () => {
      expect(minimatch('a', '[a,b]')).toBe(true);
      expect(minimatch(',', '[a,b]')).toBe(true);
      expect(minimatch('b', '[a,b]')).toBe(true);
      expect(minimatch('c', '[a,b]')).toBe(false);
    });

    it('should handle braces with character classes', () => {
      expect(minimatch('a.js', '{*.js,*.ts}')).toBe(true);
      expect(minimatch('b.ts', '{*.js,*.ts}')).toBe(true);
      expect(minimatch('c.py', '{*.js,*.ts}')).toBe(false);
    });

    it('should handle nested patterns', () => {
      expect(minimatch('file.test.js', '*.{test,spec}.js')).toBe(true);
      expect(minimatch('file.spec.js', '*.{test,spec}.js')).toBe(true);
      expect(minimatch('file.unit.js', '*.{test,spec}.js')).toBe(false);
    });

    it('should handle complex character class with range and comma', () => {
      expect(minimatch('a', '[a-z,0-9]')).toBe(true);
      expect(minimatch('5', '[a-z,0-9]')).toBe(true);
      expect(minimatch(',', '[a-z,0-9]')).toBe(true);
      expect(minimatch('A', '[a-z,0-9]')).toBe(false);
    });
  });

  describe('Edge cases from Issue #273', () => {
    it('should handle glob with comma in extension list', () => {
      const pattern = '*.{js,jsx,ts,tsx}';
      expect(minimatch('file.js', pattern)).toBe(true);
      expect(minimatch('file.jsx', pattern)).toBe(true);
      expect(minimatch('file.ts', pattern)).toBe(true);
      expect(minimatch('file.tsx', pattern)).toBe(true);
      expect(minimatch('file.css', pattern)).toBe(false);
    });

    it('should not throw on complex patterns', () => {
      const complexPatterns = [
        '[a,b,c]',
        '{a,b,[c,d]}',
        '**/*.{js,ts,[jt]sx}',
        '[!a,b]',
        '[a-z,A-Z,0-9]',
      ];

      for (const pattern of complexPatterns) {
        expect(() => new Minimatch(pattern)).not.toThrow();
      }
    });

    it('should generate valid regex', () => {
      const patterns = [
        '*.{js,ts}',
        '[a,b,c].txt',
        '**/{src,lib}/**',
      ];

      for (const pattern of patterns) {
        const mm = new Minimatch(pattern);
        const re = mm.makeRe();
        expect(re).toBeInstanceOf(RegExp);
      }
    });
  });
});

describe('Unicode Support', () => {
  describe('Unicode filenames', () => {
    it('should match files with accented characters', () => {
      expect(minimatch('café.txt', '*.txt')).toBe(true);
      expect(minimatch('naïve.js', '*.js')).toBe(true);
      expect(minimatch('über.ts', '*.ts')).toBe(true);
    });

    it('should match files with Chinese characters', () => {
      expect(minimatch('文件.txt', '*.txt')).toBe(true);
      expect(minimatch('测试.js', '*.js')).toBe(true);
    });

    it('should match files with Japanese characters', () => {
      expect(minimatch('ファイル.txt', '*.txt')).toBe(true);
      expect(minimatch('テスト.js', '*.js')).toBe(true);
    });

    it('should match files with Korean characters', () => {
      expect(minimatch('파일.txt', '*.txt')).toBe(true);
      expect(minimatch('테스트.js', '*.js')).toBe(true);
    });

    it('should match files with Arabic characters', () => {
      expect(minimatch('ملف.txt', '*.txt')).toBe(true);
    });

    it('should match files with Cyrillic characters', () => {
      expect(minimatch('файл.txt', '*.txt')).toBe(true);
      expect(minimatch('тест.js', '*.js')).toBe(true);
    });
  });

  describe('Unicode in patterns', () => {
    it('should support Unicode in literal patterns', () => {
      expect(minimatch('café.txt', 'café.txt')).toBe(true);
      expect(minimatch('café.txt', 'cafe.txt')).toBe(false);
    });

    it('should support Unicode with wildcards', () => {
      expect(minimatch('文件夹/test.js', '文件夹/*.js')).toBe(true);
      expect(minimatch('папка/test.js', 'папка/*.js')).toBe(true);
    });

    it('should support Unicode in brace expansion', () => {
      expect(minimatch('文件.txt', '{文件,档案}.txt')).toBe(true);
      expect(minimatch('档案.txt', '{文件,档案}.txt')).toBe(true);
    });
  });

  describe('Emoji support', () => {
    it('should match files with emoji names', () => {
      expect(minimatch('🎉.txt', '*.txt')).toBe(true);
      expect(minimatch('test🚀.js', '*.js')).toBe(true);
      expect(minimatch('📁folder/file.ts', '📁folder/*.ts')).toBe(true);
    });

    it('should support emoji in patterns', () => {
      expect(minimatch('🎉party.txt', '🎉*.txt')).toBe(true);
      expect(minimatch('rocket🚀.js', '*🚀.js')).toBe(true);
    });

    it('should support emoji in brace expansion', () => {
      expect(minimatch('🎉.txt', '{🎉,🎊}.txt')).toBe(true);
      expect(minimatch('🎊.txt', '{🎉,🎊}.txt')).toBe(true);
    });
  });

  describe('Unicode edge cases', () => {
    it('should handle combining characters', () => {
      // é can be represented as single char or e + combining accent
      expect(minimatch('café.txt', '*.txt')).toBe(true);
    });

    it('should handle zero-width characters', () => {
      expect(minimatch('test\u200B.txt', '*.txt')).toBe(true);
    });

    it('should handle right-to-left text', () => {
      expect(minimatch('مرحبا.txt', '*.txt')).toBe(true);
    });

    it('should handle mixed scripts', () => {
      expect(minimatch('hello世界🌍.txt', '*.txt')).toBe(true);
      expect(minimatch('test测试тест.js', '*.js')).toBe(true);
    });
  });

  describe('Unicode with globstar', () => {
    it('should match Unicode paths with globstar', () => {
      expect(minimatch('文件夹/子目录/test.js', '**/test.js')).toBe(true);
      expect(minimatch('папка/подпапка/file.ts', '**/*.ts')).toBe(true);
    });

    it('should match deep Unicode paths', () => {
      expect(minimatch('🗂️/📁/📄.txt', '**/*.txt')).toBe(true);
    });
  });
});

describe('Additional Edge Cases', () => {
  describe('Empty and special patterns', () => {
    it('should handle empty string matching', () => {
      expect(minimatch('', '')).toBe(true);
      expect(minimatch('a', '')).toBe(false);
    });

    it('should handle patterns with only special chars', () => {
      expect(minimatch('*', '\\*')).toBe(true);
      expect(minimatch('?', '\\?')).toBe(true);
    });
  });

  describe('Path separators', () => {
    it('should handle forward slashes', () => {
      expect(minimatch('a/b/c.js', 'a/b/*.js')).toBe(true);
    });

    it('should handle multiple slashes', () => {
      expect(minimatch('a//b/c.js', 'a/**/c.js')).toBe(true);
    });
  });

  describe('Case sensitivity', () => {
    it('should be case sensitive by default', () => {
      expect(minimatch('FILE.TXT', '*.txt')).toBe(false);
      expect(minimatch('file.txt', '*.txt')).toBe(true);
    });

    it('should support nocase option', () => {
      expect(minimatch('FILE.TXT', '*.txt', { nocase: true })).toBe(true);
      expect(minimatch('File.Txt', '*.txt', { nocase: true })).toBe(true);
    });
  });
});
