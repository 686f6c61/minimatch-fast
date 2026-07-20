/**
 * @fileoverview minimatch-fast - Drop-in replacement for minimatch
 *
 * This is the main entry point for the minimatch-fast package. It provides
 * a 100% API-compatible replacement for minimatch while using picomatch
 * internally for better performance and security.
 *
 * The package exports:
 * - minimatch(): Main function for testing if a path matches a pattern
 * - minimatch.match(): Filter an array of paths
 * - minimatch.filter(): Create a filter function for Array.filter()
 * - minimatch.makeRe(): Convert a pattern to a RegExp
 * - minimatch.braceExpand(): Expand brace patterns
 * - minimatch.escape(): Escape glob special characters
 * - minimatch.unescape(): Unescape glob special characters
 * - minimatch.defaults(): Create a new minimatch with default options
 * - Minimatch: Class for repeated matching against the same pattern
 *
 * @example
 * ```typescript
 * import minimatch from 'minimatch-fast';
 *
 * // Basic matching
 * minimatch('bar.js', '*.js'); // true
 * minimatch('src/deep/file.ts', '**\/*.ts'); // true
 *
 * // Filter an array
 * minimatch.match(['a.js', 'b.txt'], '*.js'); // ['a.js']
 *
 * // Create filter function
 * const jsFiles = files.filter(minimatch.filter('*.js'));
 *
 * // Use Minimatch class for repeated matching (more efficient)
 * const mm = new minimatch.Minimatch('**\/*.js');
 * mm.match('src/index.js'); // true
 * ```
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type {
  MinimatchOptions,
  MMRegExp,
  Platform,
  Sep,
  ParseReturn,
  ParseReturnFiltered,
  GlobstarSymbol,
} from './types.js';
import { GLOBSTAR } from './types.js';
import { Minimatch, DEFAULT_MAX_PATTERN_LENGTH } from './minimatch-class.js';
import { braceExpand } from './brace-expand.js';
import { escape } from './escape.js';
import { unescape } from './unescape.js';
import { sep as pathSep } from './utils.js';
import { getOrCreateMatcher, clearCache, getCacheSize } from './cache.js';
import { tryFastPath, mightUseFastPath } from './fast-paths.js';

// Re-export types
export type {
  MinimatchOptions,
  MMRegExp,
  Platform,
  Sep,
  ParseReturn,
  ParseReturnFiltered,
  GlobstarSymbol,
};

// Re-export class and symbols
export { Minimatch, GLOBSTAR };
export { escape } from './escape.js';
export { unescape } from './unescape.js';

/**
 * Path separator for the current platform
 */
export const sep: Sep = pathSep;

/**
 * Test if a path matches a glob pattern
 *
 * This function is optimized with:
 * 1. Fast paths for common simple patterns (*.js, *, ???)
 * 2. LRU cache for compiled Minimatch instances
 *
 * @param path - The path to test
 * @param pattern - The glob pattern
 * @param options - Matching options
 * @returns true if the path matches the pattern
 *
 * @example
 * ```typescript
 * minimatch('foo.js', '*.js'); // true
 * minimatch('src/foo.js', '**\/*.js'); // true
 * minimatch('.hidden', '*'); // false
 * minimatch('.hidden', '*', { dot: true }); // true
 * ```
 */
/**
 * Shared frozen empty-options object: avoids allocating a fresh `{}`
 * on every minimatch(path, pattern) call (the hottest entry point).
 */
const NO_OPTIONS: MinimatchOptions = Object.freeze({});

export function minimatch(
  path: string,
  pattern: string,
  options: MinimatchOptions = NO_OPTIONS
): boolean {
  // Validate input types
  if (typeof path !== 'string') {
    throw new TypeError('path must be a string');
  }
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern must be a string');
  }

  // Handle empty pattern
  if (pattern === '') {
    return path === '';
  }

  // Handle comments
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false;
  }

  // Enforce maxLength here as well: fast paths below skip Minimatch
  // construction, which is where this validation normally happens
  const maxLength = options.maxLength ?? DEFAULT_MAX_PATTERN_LENGTH;
  if (pattern.length > maxLength) {
    throw new TypeError(
      `Pattern length ${pattern.length} exceeds maximum ${maxLength}. ` +
      `This limit exists to prevent ReDoS attacks. ` +
      `Use options.maxLength to increase if needed.`
    );
  }

  // Early rejection: a pattern without slashes, globstar or braces can never
  // match a path that contains a slash (a single pattern segment cannot cross
  // directory boundaries). This lets us answer immediately for the most
  // common globbing case - non-matching paths in nested directories - without
  // compiling anything. Skipped for negated patterns (their result inverts),
  // matchBase (matches against basename), partial (prefix semantics), and
  // contains/bash/format (they alter what can match or the string matched).
  // The check runs on the trailing-slash-trimmed path: 'dir/' may still
  // match a slashless pattern via its trimmed form.
  if (
    !options.matchBase &&
    !options.partial &&
    !options.contains &&
    !options.bash &&
    !options.format &&
    !(pattern.charAt(0) === '!' && !options.nonegate) &&
    !pattern.includes('/') &&
    !pattern.includes('**') &&
    !pattern.includes('{') &&
    (path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path).includes('/')
  ) {
    return false;
  }

  // Try fast path for simple patterns (no path separators, no complex features)
  // Fast paths avoid creating Minimatch instance entirely.
  // They only implement a subset of minimatch semantics (dot, nocase), so any
  // option they don't understand must fall through to the full engine.
  const canFastPath =
    !options.matchBase &&
    !options.partial &&
    !options.flags &&
    !options.ignore &&
    !options.format &&
    !options.contains &&
    !options.bash &&
    !options.keepQuotes &&
    !options.unescape &&
    !options.strictBrackets &&
    !options.literalBrackets &&
    !options.expandRange &&
    !options.onMatch &&
    !options.onIgnore &&
    !options.onResult;

  if (canFastPath && mightUseFastPath(pattern)) {
    const fastResult = tryFastPath(path, pattern, options);
    if (fastResult !== null) {
      return fastResult;
    }
  }

  // Use cached Minimatch instance for full matching
  return getOrCreateMatcher(pattern, options).match(path);
}

// Attach static properties to minimatch function
minimatch.sep = sep;
minimatch.GLOBSTAR = GLOBSTAR as GlobstarSymbol;
minimatch.Minimatch = Minimatch;

/**
 * Create a filter function for use with Array.filter()
 *
 * Uses cached Minimatch instance for better performance.
 *
 * @param pattern - The glob pattern
 * @param options - Matching options
 * @returns A function that tests paths against the pattern
 *
 * @example
 * ```typescript
 * const jsFilter = minimatch.filter('*.js');
 * ['a.js', 'b.txt', 'c.js'].filter(jsFilter); // ['a.js', 'c.js']
 * ```
 */
export function filter(
  pattern: string,
  options: MinimatchOptions = {}
): (path: string) => boolean {
  // Use cached matcher for repeated matching
  const mm = getOrCreateMatcher(pattern, options);
  return (path: string) => mm.match(path);
}
minimatch.filter = filter;

/**
 * Create a minimatch function with default options
 *
 * @param def - Default options to apply to all calls
 * @returns A new minimatch function with defaults applied
 *
 * @example
 * ```typescript
 * const mm = minimatch.defaults({ dot: true });
 * mm('.hidden', '*'); // true (dot files included)
 * ```
 */
export function defaults(def: MinimatchOptions): typeof minimatch {
  if (!def || typeof def !== 'object' || !Object.keys(def).length) {
    return minimatch;
  }

  const orig = minimatch;

  const m = (
    path: string,
    pattern: string,
    options: MinimatchOptions = {}
  ): boolean => orig(path, pattern, { ...def, ...options });

  return Object.assign(m, {
    Minimatch: Minimatch.defaults(def),
    filter: (pattern: string, options: MinimatchOptions = {}) =>
      orig.filter(pattern, { ...def, ...options }),
    defaults: (options: MinimatchOptions) =>
      orig.defaults({ ...def, ...options }),
    makeRe: (pattern: string, options: MinimatchOptions = {}) =>
      orig.makeRe(pattern, { ...def, ...options }),
    braceExpand: (pattern: string, options: MinimatchOptions = {}) =>
      orig.braceExpand(pattern, { ...def, ...options }),
    match: (list: string[], pattern: string, options: MinimatchOptions = {}) =>
      orig.match(list, pattern, { ...def, ...options }),
    escape: (s: string, options: MinimatchOptions = {}) =>
      escape(s, { ...def, ...options }),
    unescape: (s: string, options: MinimatchOptions = {}) =>
      unescape(s, { ...def, ...options }),
    sep: orig.sep,
    GLOBSTAR,
  }) as typeof minimatch;
}
minimatch.defaults = defaults;

/**
 * Expand brace patterns like {a,b,c} and {1..3}
 *
 * @param pattern - The pattern to expand
 * @param options - Expansion options
 * @returns Array of expanded patterns
 *
 * @example
 * ```typescript
 * minimatch.braceExpand('{a,b,c}'); // ['a', 'b', 'c']
 * minimatch.braceExpand('{1..3}'); // ['1', '2', '3']
 * minimatch.braceExpand('file.{js,ts}'); // ['file.js', 'file.ts']
 * ```
 */
minimatch.braceExpand = function (
  pattern: string,
  options: MinimatchOptions = {}
): string[] {
  return braceExpand(pattern, options);
};

/**
 * Convert a glob pattern to a regular expression
 *
 * Uses cached Minimatch instance for better performance.
 *
 * @param pattern - The glob pattern
 * @param options - Matching options
 * @returns RegExp or false if pattern is invalid
 *
 * @example
 * ```typescript
 * const re = minimatch.makeRe('*.js');
 * re.test('foo.js'); // true
 * ```
 */
export function makeRe(
  pattern: string,
  options: MinimatchOptions = {}
): false | MMRegExp {
  return getOrCreateMatcher(pattern, options).makeRe();
}
minimatch.makeRe = makeRe;

/**
 * Match a list of paths against a glob pattern
 *
 * Uses cached Minimatch instance for better performance.
 *
 * @param list - Array of paths to filter
 * @param pattern - The glob pattern
 * @param options - Matching options
 * @returns Array of matching paths
 *
 * @example
 * ```typescript
 * minimatch.match(['a.js', 'b.txt', 'c.js'], '*.js'); // ['a.js', 'c.js']
 * ```
 */
export function match(
  list: string[],
  pattern: string,
  options: MinimatchOptions = {}
): string[] {
  const mm = getOrCreateMatcher(pattern, options);
  const result = list.filter((f) => mm.match(f));

  // Handle no matches case
  if (result.length === 0) {
    // failglob has precedence: throw error if enabled
    if (options.failglob) {
      throw new Error(
        `No matches found for pattern: ${pattern} (searched ${list.length} paths)`
      );
    }
    // nonull: return the pattern itself when no matches
    // Read from the caller's options, not the cached instance's, so that
    // cache hits don't leak behavior between calls with different options
    if (options.nonull) {
      return [pattern];
    }
  }

  return result;
}
minimatch.match = match;

/**
 * Escape special glob characters in a string
 */
minimatch.escape = escape;

/**
 * Unescape special glob characters in a string
 */
minimatch.unescape = unescape;

/**
 * Clear the pattern cache.
 * Useful for testing or when memory pressure is high.
 */
minimatch.clearCache = clearCache;

/**
 * Get the current cache size.
 * Useful for monitoring and testing.
 */
minimatch.getCacheSize = getCacheSize;

// Default export
export default minimatch;
