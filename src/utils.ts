/**
 * @fileoverview Path utilities for cross-platform support
 *
 * This module provides utility functions for handling paths across different
 * operating systems. It includes functions for:
 * - Platform detection (Windows vs POSIX)
 * - Path normalization (backslash to forward slash conversion)
 * - Path splitting with UNC path support
 * - Glob magic character detection
 *
 * These utilities ensure minimatch-fast works correctly on all platforms
 * while maintaining compatibility with the original minimatch behavior.
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { Platform, Sep } from './types';

/**
 * Detect the current platform
 */
const defaultPlatform: Platform = (
  typeof process === 'object' &&
  process &&
  typeof process.platform === 'string'
    ? (process.env['__MINIMATCH_TESTING_PLATFORM__'] as Platform) ||
      (process.platform as Platform)
    : 'linux'
) as Platform;

/**
 * Get the default path separator based on platform
 */
export const sep: Sep = defaultPlatform === 'win32' ? '\\' : '/';

/**
 * Check if the given platform is Windows
 */
export function isWindows(platform?: Platform): boolean {
  return (platform || defaultPlatform) === 'win32';
}

/**
 * Get the current platform
 */
export function getPlatform(): Platform {
  return defaultPlatform;
}

/**
 * Normalize a path by converting backslashes to forward slashes
 * This is critical for Windows compatibility
 *
 * @param path - The path to normalize
 * @param windowsPathsNoEscape - If true, treat backslash as path separator
 */
export function normalizePath(
  path: string,
  windowsPathsNoEscape: boolean
): string {
  if (typeof path !== 'string') return path;

  // If windowsPathsNoEscape is true, convert all backslashes to forward slashes
  // This matches minimatch behavior where backslash is path separator, not escape
  if (windowsPathsNoEscape) {
    return path.replace(/\\/g, '/');
  }

  return path;
}

/**
 * Normalize a pattern by converting backslashes to forward slashes
 *
 * @param pattern - The pattern to normalize
 * @param windowsPathsNoEscape - If true, treat backslash as path separator
 */
export function normalizePattern(
  pattern: string,
  windowsPathsNoEscape: boolean
): string {
  if (windowsPathsNoEscape) {
    return pattern.replace(/\\/g, '/');
  }
  return pattern;
}

/**
 * Split a path by slashes
 *
 * @param path - The path to split
 * @param preserveMultipleSlashes - If true, don't collapse multiple slashes
 * @param isWindowsPlatform - If true, handle UNC paths
 */
export function slashSplit(
  path: string,
  preserveMultipleSlashes: boolean,
  isWindowsPlatform: boolean
): string[] {
  // Handle empty path
  if (!path) {
    return [''];
  }

  // If preserving multiple slashes, just split on single slash
  if (preserveMultipleSlashes) {
    return path.split('/');
  }

  // Handle UNC paths on Windows (e.g., //server/share)
  if (isWindowsPlatform && /^\/\/[^/]+/.test(path)) {
    // Preserve the leading // for UNC paths
    const parts = path.split(/\/+/);
    // First element will be empty string from leading //, keep it
    return ['', ...parts.filter((p, i) => i === 0 || p !== '')];
  }

  // Normal case: split on one or more slashes, filter empty parts except leading
  const parts = path.split(/\/+/);

  // Handle absolute paths (preserve leading empty string)
  if (path.startsWith('/')) {
    return ['', ...parts.filter((p) => p !== '')];
  }

  return parts.filter((p) => p !== '');
}
