/**
 * @fileoverview Unescape glob magic characters
 *
 * This module provides functionality to unescape previously escaped glob strings,
 * reversing the operation performed by the escape() function.
 *
 * Unescape modes:
 * - Default mode: Removes backslash escaping (\\* -> *) and square-bracket
 *   escaping ([*] -> *)
 * - Windows mode: Removes character class escaping ([*] -> *) but not
 *   backslash escapes (since backslash is a path separator in this mode)
 *
 * When magicalBraces is false, escapes of braces ({ and }) are not removed.
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
 * If windowsPathsNoEscape is false (default), both square-bracket escapes
 * and backslash escapes are removed.
 *
 * If magicalBraces is false, escapes of braces ({ and }) are left in place.
 *
 * @param str - The string to unescape
 * @param options - Options controlling unescape behavior
 * @returns Unescaped string
 */
export function unescape(
  str: string,
  options: Pick<MinimatchOptions, 'windowsPathsNoEscape' | 'magicalBraces'> = {}
): string {
  const { windowsPathsNoEscape = false, magicalBraces = true } = options;

  if (magicalBraces) {
    return windowsPathsNoEscape
      ? str.replace(/\[([^\/\\])\]/g, '$1')
      : str
          .replace(/((?!\\).|^)\[([^\/\\])\]/g, '$1$2')
          .replace(/\\([^\/])/g, '$1');
  }

  return windowsPathsNoEscape
    ? str.replace(/\[([^\/\\{}])\]/g, '$1')
    : str
        .replace(/((?!\\).|^)\[([^\/\\{}])\]/g, '$1$2')
        .replace(/\\([^\/{}])/g, '$1');
}
