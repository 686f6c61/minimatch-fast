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

import type { MinimatchOptions, PicomatchOptions } from './types.js';

/**
 * Translate minimatch options to picomatch options
 * Handles naming differences and sets appropriate defaults
 */
export function translateOptions(opts: MinimatchOptions = {}): { picoOpts: PicomatchOptions } {
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

    // Extended picomatch options (new in v0.3.0)
    ignore: opts.ignore,
    maxLength: opts.maxLength,
    expandRange: opts.expandRange,
    bash: opts.bash,
    contains: opts.contains,
    format: opts.format,
    flags: opts.flags,
    onMatch: opts.onMatch,
    onIgnore: opts.onIgnore,
    onResult: opts.onResult,
    strictBrackets: opts.strictBrackets,
    literalBrackets: opts.literalBrackets,
    keepQuotes: opts.keepQuotes,
    unescape: opts.unescape,
  };

  return { picoOpts };
}
