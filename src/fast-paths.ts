/**
 * @fileoverview Fast path handlers for common glob patterns
 *
 * This module provides optimized matching for the most common glob patterns,
 * avoiding the overhead of full regex compilation. These fast paths use
 * simple string operations like startsWith(), endsWith(), and includes()
 * which are significantly faster than regex matching.
 *
 * Supported fast path patterns:
 * - `*` - Match any single path segment (except dotfiles by default)
 * - `*.ext` - Match files with specific extension (e.g., `*.js`, `*.ts`)
 * - `*.*` - Match files with any extension
 * - `.*` - Match hidden files (dotfiles)
 * - `???` - Match files with exact length (question mark patterns)
 *
 * When a pattern doesn't match any fast path, null is returned and the
 * caller should fall back to full pattern matching.
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { MinimatchOptions } from './types.js';

// ============================================================================
// PATTERN DETECTION REGEXES
// These regexes detect which fast path to use. They are compiled once at
// module load time and reused for all pattern checks.
// ============================================================================

/**
 * Matches pure star patterns: *, **, ***
 * Used for "match anything" patterns.
 */
const STAR_RE = /^\*+$/;

/**
 * Matches star-dot-extension patterns: *.js, *.ts, *.txt
 * Captures the extension (including the dot).
 * Excludes patterns with special glob characters in the extension.
 */
const STAR_DOT_EXT_RE = /^\*+(\.[^+@!?\*\[\(]+)$/;

/**
 * Matches star-dot-star patterns: *.*, **.*
 * Used for "any file with an extension" matching.
 */
const STAR_DOT_STAR_RE = /^\*+\.\*+$/;

/**
 * Matches dot-star patterns: .*, .**
 * Used for dotfile/hidden file matching.
 */
const DOT_STAR_RE = /^\.\*+$/;

/**
 * Matches question mark patterns: ?, ??, ???, ???.js
 * Captures optional extension after the question marks.
 * Used for exact-length matching.
 */
const QMARKS_RE = /^(\?+)(\.[^+@!?\*\[\(]+)?$/;

// ============================================================================
// FAST PATH IMPLEMENTATION
// ============================================================================

/**
 * Try to match a path against a pattern using a fast path.
 *
 * This function attempts to use optimized string operations for common
 * glob patterns instead of full regex compilation. If the pattern is not
 * a simple pattern that can be handled by a fast path, null is returned.
 *
 * @param path - The path to match (should be a filename without directory)
 * @param pattern - The glob pattern to match against
 * @param options - Minimatch options (dot, nocase are relevant)
 * @returns true if matches, false if doesn't match, null if no fast path available
 *
 * @example
 * ```typescript
 * tryFastPath('foo.js', '*.js', {});           // true
 * tryFastPath('foo.txt', '*.js', {});          // false
 * tryFastPath('.hidden', '*', {});             // false
 * tryFastPath('.hidden', '*', { dot: true });  // true
 * tryFastPath('foo.js', '**\/*.js', {});        // null (has /, need full matching)
 * ```
 */
export function tryFastPath(
  path: string,
  pattern: string,
  options: MinimatchOptions
): boolean | null {
  // Skip if path contains / (need full path matching)
  if (path.includes('/')) return null;

  // Skip if pattern has path separators (need full matching)
  if (pattern.includes('/')) return null;

  // Skip if negated (need full matching for proper negation handling)
  if (!options.nonegate && pattern.startsWith('!')) return null;

  // Skip if pattern has braces (need brace expansion)
  if (!options.nobrace && pattern.includes('{')) return null;

  // Skip if pattern has extglob (need extglob handling)
  if (!options.noext && /[@!?+*]\(/.test(pattern)) return null;

  // Skip if pattern has character class (need regex)
  if (pattern.includes('[')) return null;

  const dot = options.dot ?? false;
  const nocase = options.nocase ?? false;

  let m: RegExpMatchArray | null;

  // -------------------------------------------------------------------------
  // Fast path: * (pure star)
  // Matches any non-empty filename, respecting dot option
  // -------------------------------------------------------------------------
  if ((m = pattern.match(STAR_RE))) {
    if (path.length === 0) return false;
    if (dot) {
      // With dot option, match anything except . and ..
      return path !== '.' && path !== '..';
    }
    // Without dot option, don't match dotfiles
    return !path.startsWith('.');
  }

  // -------------------------------------------------------------------------
  // Fast path: *.ext (star-dot-extension)
  // Matches files ending with specific extension
  // -------------------------------------------------------------------------
  if ((m = pattern.match(STAR_DOT_EXT_RE))) {
    const ext = m[1]; // Includes the dot, e.g., ".js"
    if (path.length === 0) return false;

    if (nocase) {
      const lpath = path.toLowerCase();
      const lext = ext.toLowerCase();
      if (dot) return lpath.endsWith(lext);
      return !path.startsWith('.') && lpath.endsWith(lext);
    }

    if (dot) return path.endsWith(ext);
    return !path.startsWith('.') && path.endsWith(ext);
  }

  // -------------------------------------------------------------------------
  // Fast path: *.* (star-dot-star)
  // Matches any file with an extension (contains a dot)
  // -------------------------------------------------------------------------
  if ((m = pattern.match(STAR_DOT_STAR_RE))) {
    if (path.length === 0) return false;

    if (dot) {
      // With dot, match anything with a dot except . and ..
      return path !== '.' && path !== '..' && path.includes('.');
    }
    // Without dot, must have extension and not be a dotfile
    return !path.startsWith('.') && path.includes('.');
  }

  // -------------------------------------------------------------------------
  // Fast path: .* (dot-star)
  // Matches hidden files (starting with dot)
  // -------------------------------------------------------------------------
  if ((m = pattern.match(DOT_STAR_RE))) {
    // Must start with dot but not be . or ..
    return path.startsWith('.') && path !== '.' && path !== '..';
  }

  // -------------------------------------------------------------------------
  // Fast path: ??? (question marks with optional extension)
  // Matches files with exact length
  // -------------------------------------------------------------------------
  if ((m = pattern.match(QMARKS_RE))) {
    const qmarks = m[1]; // The question marks, e.g., "???"
    const ext = m[2] ?? ''; // Optional extension, e.g., ".js"
    const qLen = qmarks.length;
    const expectedLen = qLen + ext.length;

    if (path.length !== expectedLen) return false;

    // Never match . or .. (special directories)
    if (path === '.' || path === '..') return false;

    if (ext) {
      // Has extension - check length and extension match
      if (nocase) {
        const lpath = path.toLowerCase();
        const lext = ext.toLowerCase();
        if (!lpath.endsWith(lext)) return false;
      } else {
        if (!path.endsWith(ext)) return false;
      }
    }

    // Check dotfile restriction
    if (!dot && path.startsWith('.')) return false;

    return true;
  }

  // No fast path available
  return null;
}

/**
 * Check if a pattern might be eligible for fast path.
 * This is a quick pre-check to avoid expensive regex tests.
 *
 * @param pattern - The glob pattern
 * @returns true if pattern might use fast path
 */
export function mightUseFastPath(pattern: string): boolean {
  // Fast paths only work for simple patterns without:
  // - Path separators
  // - Braces
  // - Character classes
  // - Extglob patterns
  return (
    !pattern.includes('/') &&
    !pattern.includes('{') &&
    !pattern.includes('[') &&
    !/[@!?+*]\(/.test(pattern)
  );
}
