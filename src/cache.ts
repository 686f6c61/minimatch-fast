/**
 * @fileoverview LRU Cache for compiled Minimatch patterns
 *
 * This module provides a simple LRU (Least Recently Used) cache for Minimatch
 * instances. Caching compiled patterns significantly improves performance
 * when the same pattern is used multiple times with the minimatch() function.
 *
 * The cache stores compiled Minimatch instances keyed by a combination of
 * the pattern string and relevant options that affect compilation.
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { MinimatchOptions } from './types.js';
import { Minimatch } from './minimatch-class.js';

/**
 * Maximum number of patterns to cache.
 * This prevents unbounded memory growth while still providing
 * good cache hit rates for typical usage patterns.
 */
const CACHE_SIZE = 500;

/**
 * LRU cache for compiled Minimatch instances.
 * Uses Map which maintains insertion order, making it easy
 * to implement LRU eviction by deleting the oldest entry.
 */
const patternCache = new Map<string, Minimatch>();

/**
 * Generate a cache key from pattern and options.
 * Only includes options that affect pattern compilation.
 *
 * @param pattern - The glob pattern
 * @param options - Minimatch options
 * @returns A unique cache key string
 */
function getCacheKey(pattern: string, options: MinimatchOptions): string {
  // Use null byte as separator (cannot appear in patterns)
  // Include all options that affect compilation
  return `${pattern}\0${
    options.nocase ? '1' : '0'
  }${options.dot ? '1' : '0'}${
    options.noglobstar ? '1' : '0'
  }${options.nobrace ? '1' : '0'}${
    options.noext ? '1' : '0'
  }${options.nonegate ? '1' : '0'}${
    options.nocomment ? '1' : '0'
  }${options.matchBase ? '1' : '0'}${
    options.flipNegate ? '1' : '0'
  }${options.windowsPathsNoEscape ? '1' : '0'}${
    options.preserveMultipleSlashes ? '1' : '0'
  }${options.partial ? '1' : '0'}${
    options.platform ?? ''
  }`;
}

/**
 * Get a cached Minimatch instance or create a new one.
 * Implements LRU eviction when cache is full.
 *
 * @param pattern - The glob pattern
 * @param options - Minimatch options
 * @returns A Minimatch instance (cached or new)
 */
export function getOrCreateMatcher(
  pattern: string,
  options: MinimatchOptions
): Minimatch {
  const key = getCacheKey(pattern, options);

  // Check cache first
  let mm = patternCache.get(key);

  if (mm) {
    // Move to end (most recently used) by re-inserting
    patternCache.delete(key);
    patternCache.set(key, mm);
    return mm;
  }

  // Create new Minimatch instance
  mm = new Minimatch(pattern, options);

  // Evict oldest entry if cache is full
  if (patternCache.size >= CACHE_SIZE) {
    const firstKey = patternCache.keys().next().value;
    if (firstKey !== undefined) {
      patternCache.delete(firstKey);
    }
  }

  // Add to cache
  patternCache.set(key, mm);

  return mm;
}

/**
 * Clear the pattern cache.
 * Useful for testing or when memory pressure is high.
 */
export function clearCache(): void {
  patternCache.clear();
}

/**
 * Get the current cache size.
 * Useful for monitoring and testing.
 */
export function getCacheSize(): number {
  return patternCache.size;
}
