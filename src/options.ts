/**
 * @fileoverview Options translator: minimatch options -> picomatch options
 *
 * This module handles the translation of minimatch options to picomatch options.
 * Since minimatch-fast uses picomatch as its matching engine, we need to map
 * the options from minimatch's API to picomatch's API.
 *
 * Key differences between minimatch and picomatch options:
 * - noext (minimatch) -> noextglob (picomatch)
 * - matchBase (minimatch) -> basename (picomatch)
 *
 * Some options are handled specially and not passed to picomatch:
 * - nocomment: Comment patterns (handled in Minimatch class)
 * - nonull: Return pattern when no matches (handled in match function)
 * - flipNegate: Invert negation result (handled in match function)
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import type { MinimatchOptions, PicomatchOptions, TranslatedOptions } from './types.js';

/**
 * Translate minimatch options to picomatch options
 * Handles naming differences and sets appropriate defaults
 */
export function translateOptions(opts: MinimatchOptions = {}): TranslatedOptions {
  const picoOpts: PicomatchOptions = {
    // Direct mappings (same name, same meaning)
    dot: opts.dot,
    nocase: opts.nocase,
    nonegate: opts.nonegate,
    noglobstar: opts.noglobstar,
    nobrace: opts.nobrace,

    // Renamed options
    noextglob: opts.noext, // minimatch: noext -> picomatch: noextglob
    basename: opts.matchBase, // minimatch: matchBase -> picomatch: basename

    // Force POSIX mode - we handle Windows paths manually via normalizePath
    posix: true,

    // Disable picomatch's brace handling - we use 'braces' package for full expansion
    // picomatch only does brace matching, not expansion
    // We expand braces ourselves, so tell picomatch not to process them
    // Actually, we need nobrace: true to prevent double-processing
    // The expanded patterns should be matched literally by picomatch
  };

  // Special options that need custom handling (not passed to picomatch)
  const special = {
    nocomment: opts.nocomment ?? false,
    nonull: opts.nonull ?? false,
    flipNegate: opts.flipNegate ?? false,
    windowsPathsNoEscape:
      opts.windowsPathsNoEscape ?? opts.allowWindowsEscape === false,
    partial: opts.partial ?? false,
    magicalBraces: opts.magicalBraces ?? false,
    debug: opts.debug ?? false,
    optimizationLevel: opts.optimizationLevel ?? 1,
  };

  return { picoOpts, special };
}

/**
 * Merge options with defaults
 */
export function mergeOptions(
  defaults: MinimatchOptions,
  options: MinimatchOptions
): MinimatchOptions {
  return { ...defaults, ...options };
}
