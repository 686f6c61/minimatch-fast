/**
 * @fileoverview Escape glob magic characters
 *
 * This module provides functionality to escape special glob characters in strings,
 * making them match literally instead of being interpreted as patterns.
 *
 * Escape modes:
 * - Default mode: Uses backslash escaping (\* \? etc.)
 * - Windows mode: Uses character class escaping ([*] [?] etc.)
 *
 * This is useful when you need to match file paths that contain glob
 * special characters like *, ?, [], {}, etc.
 *
 * @example
 * escape('*.js')           // Returns '\\*.js'
 * escape('[test].js')      // Returns '\\[test\\].js'
 * escape('*.js', { windowsPathsNoEscape: true })  // Returns '[*].js'
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { MinimatchOptions } from './types.js';

/**
 * Escape all magic characters in a glob pattern so it matches literally.
 *
 * If windowsPathsNoEscape is true, characters are escaped by wrapping in [],
 * because a magic character wrapped in a character class can only be satisfied
 * by that exact character. Backslash is NOT escaped in this mode because it
 * is treated as a path separator.
 *
 * If windowsPathsNoEscape is false (default), characters are escaped with
 * backslash.
 *
 * @param str - The string to escape
 * @param options - Options controlling escape behavior
 * @returns Escaped string
 */
export function escape(
  str: string,
  options: Pick<MinimatchOptions, 'windowsPathsNoEscape'> = {}
): string {
  const { windowsPathsNoEscape = false } = options;

  if (windowsPathsNoEscape) {
    // Escape by wrapping in character class []
    // Don't escape backslash since it's a path separator in this mode
    return str.replace(/[?*()[\]{}]/g, '[$&]');
  }

  // Default: escape with backslash
  // Include backslash in the escape set
  return str.replace(/[?*()[\]{}\\]/g, '\\$&');
}
