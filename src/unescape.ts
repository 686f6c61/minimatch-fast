/**
 * @fileoverview Unescape glob magic characters
 *
 * This module provides functionality to unescape previously escaped glob strings,
 * reversing the operation performed by the escape() function.
 *
 * Unescape modes:
 * - Default mode: Removes backslash escaping (\\* -> *)
 * - Windows mode: Removes character class escaping ([*] -> *)
 *
 * This is useful when you need to convert escaped patterns back to their
 * original form for display or further processing.
 *
 * @example
 * unescape('\\*.js')        // Returns '*.js'
 * unescape('[*].js', { windowsPathsNoEscape: true })  // Returns '*.js'
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { MinimatchOptions } from './types.js';

/**
 * Un-escape a string that has been escaped with escape().
 *
 * If windowsPathsNoEscape is true, square-bracket escapes are removed,
 * but not backslash escapes (since backslash is a path separator in this mode).
 *
 * If windowsPathsNoEscape is false (default), backslash escapes are removed.
 *
 * @param str - The string to unescape
 * @param options - Options controlling unescape behavior
 * @returns Unescaped string
 */
export function unescape(
  str: string,
  options: Pick<MinimatchOptions, 'windowsPathsNoEscape'> = {}
): string {
  const { windowsPathsNoEscape = false } = options;

  if (windowsPathsNoEscape) {
    // Remove square-bracket escapes: [x] -> x
    // But only for single non-special characters
    // Don't touch things like [abc] or [a-z]
    return str.replace(/\[([^\/\\[\]{}])\]/g, '$1');
  }

  // Default: remove backslash escapes
  // \x -> x (but not for forward slash which can't be escaped)
  return str.replace(/\\([^/])/g, '$1');
}
