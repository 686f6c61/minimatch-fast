/**
 * @fileoverview Brace expansion using the 'braces' package
 *
 * This module is critical because picomatch does NOT perform full brace expansion.
 * picomatch only does brace matching, meaning {a,b} will match 'a' or 'b'
 * but won't expand the pattern into ['a', 'b'].
 *
 * minimatch uses brace-expansion to fully expand patterns like:
 * - {a,b,c} -> ['a', 'b', 'c']
 * - {1..3} -> ['1', '2', '3']
 * - {a..c} -> ['a', 'b', 'c']
 * - a{b,c}d -> ['abd', 'acd']
 *
 * We use 'braces' package which is maintained by the same author as picomatch
 * and is what micromatch uses internally.
 *
 * Security considerations:
 * - Maximum expansion length is limited to prevent DoS attacks
 * - Range expansion is limited (e.g., {1..1000000} is restricted)
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import braces from 'braces';
import type { MinimatchOptions } from './types.js';

/**
 * Maximum number of patterns that can be generated from brace expansion.
 * This prevents DoS attacks from patterns like {1..1000000}.
 * Value of 10000 allows reasonable use cases while blocking abuse.
 */
const MAX_EXPANSION_LENGTH = 10000;

/**
 * Cache for brace expansion results.
 * Key is the pattern, value is the expanded array.
 *
 * Size of 200 was chosen because:
 * - Brace patterns are less common than general globs (~40% of CACHE_SIZE)
 * - Each cached array uses more memory than a Minimatch instance
 * - 200 entries provide good hit rate for typical brace usage
 */
const BRACE_CACHE_SIZE = 200;
const braceCache = new Map<string, string[]>();

/**
 * Add a result to the brace cache with LRU eviction.
 * Extracts common cache management logic to avoid duplication.
 *
 * @param pattern - The pattern key
 * @param result - The expanded patterns to cache
 */
function addToBraceCache(pattern: string, result: string[]): void {
  if (braceCache.size >= BRACE_CACHE_SIZE) {
    const firstKey = braceCache.keys().next().value;
    if (firstKey !== undefined) {
      braceCache.delete(firstKey);
    }
  }
  braceCache.set(pattern, result);
}

/**
 * Simple brace pattern regex: prefix{a,b,c}suffix
 * Matches patterns with a single brace group containing comma-separated values
 * without nesting or ranges.
 */
const SIMPLE_BRACE_RE = /^([^{]*)\{([^{}]+)\}([^{]*)$/;

/**
 * Try fast path for simple brace patterns like prefix{a,b,c}suffix
 * Returns null if pattern is not a simple brace pattern.
 */
function trySimpleBraceExpand(pattern: string): string[] | null {
  const m = pattern.match(SIMPLE_BRACE_RE);
  if (!m) return null;

  const [, prefix, content, suffix] = m;

  // Check if it's a range pattern (contains ..)
  if (content.includes('..')) return null;

  // Split by comma and expand
  const items = content.split(',');
  return items.map(item => prefix + item + suffix);
}

/**
 * Expand brace patterns like {a,b,c} and {1..3}
 *
 * Optimized with:
 * 1. Cache for repeated patterns
 * 2. Fast path for simple {a,b,c} patterns
 *
 * @param pattern - The glob pattern to expand
 * @param options - Minimatch options
 * @returns Array of expanded patterns
 */
export function braceExpand(
  pattern: string,
  options: MinimatchOptions = {}
): string[] {
  // If nobrace is set, return pattern unchanged
  if (options.nobrace) {
    return [pattern];
  }

  // Quick check: pattern must contain both { and }
  const braceIdx = pattern.indexOf('{');
  if (braceIdx === -1 || pattern.indexOf('}', braceIdx) === -1) {
    return [pattern];
  }

  // Check cache first
  const cached = braceCache.get(pattern);
  if (cached) {
    // Return a copy to prevent mutation
    return [...cached];
  }

  // Try fast path for simple brace patterns
  const fastResult = trySimpleBraceExpand(pattern);
  if (fastResult !== null) {
    addToBraceCache(pattern, fastResult);
    return [...fastResult];
  }

  try {
    // Use braces with expand: true for full bash-like expansion
    const expanded = braces(pattern, {
      expand: true,
      // Limit range expansion to prevent DoS
      // e.g., {1..10000} will be limited
      rangeLimit: 1000,
    });

    // Check if expansion is too large (additional safety)
    if (expanded.length > MAX_EXPANSION_LENGTH) {
      // Return original pattern silently if expansion is too large
      return [pattern];
    }

    // Remove duplicates using Set (faster than manual loop for larger arrays)
    const unique = [...new Set(expanded)];
    const result = unique.length > 0 ? unique : [pattern];

    addToBraceCache(pattern, result);
    return [...result];
  } catch {
    // If expansion fails for any reason, return original pattern
    // This matches minimatch's behavior of being lenient with invalid patterns
    return [pattern];
  }
}
