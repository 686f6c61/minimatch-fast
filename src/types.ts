/**
 * @fileoverview Type definitions for minimatch-fast
 *
 * This file contains all TypeScript type definitions used throughout the package.
 * These types are 100% compatible with minimatch v10.x, ensuring seamless migration
 * for projects switching from the original minimatch package.
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

/**
 * Supported platforms for path handling
 */
export type Platform =
  | 'aix'
  | 'android'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'openbsd'
  | 'sunos'
  | 'win32'
  | 'cygwin'
  | 'netbsd';

/**
 * Path separator types
 */
export type Sep = '\\' | '/';

/**
 * RegExp with additional metadata
 */
export type MMRegExp = RegExp & {
  _src?: string;
  _glob?: string;
};

/**
 * Symbol representing globstar pattern (**)
 */
export const GLOBSTAR: unique symbol = Symbol('globstar **');
export type GlobstarSymbol = typeof GLOBSTAR;

/**
 * Parse return types
 */
export type ParseReturnFiltered = string | MMRegExp | GlobstarSymbol;
export type ParseReturn = ParseReturnFiltered | false;

/**
 * Result object passed to onMatch, onIgnore, and onResult callbacks
 * Compatible with picomatch's callback result type
 */
export interface MatchResult {
  isMatch: boolean;
  match?: string;
  output: string;
}

/**
 * Options for minimatch functions
 * All options are optional and default to false unless otherwise specified
 */
export interface MinimatchOptions {
  /**
   * Do not expand {a,b} and {1..3} brace sets
   * @default false
   */
  nobrace?: boolean;

  /**
   * Disable pattern comments starting with #
   * When false (default), patterns starting with # are treated as comments and match nothing
   * @default false
   */
  nocomment?: boolean;

  /**
   * Disable negation with leading !
   * When false (default), patterns starting with ! are negated
   * @default false
   */
  nonegate?: boolean;

  /**
   * Enable debug output
   * @default false
   */
  debug?: boolean;

  /**
   * Disable ** matching across directory separators
   * When true, ** behaves like *
   * @default false
   */
  noglobstar?: boolean;

  /**
   * Disable extglob patterns like +(a|b), *(a|b), ?(a|b), @(a|b), !(a|b)
   * @default false
   */
  noext?: boolean;

  /**
   * Return the pattern itself when no matches are found
   * Only applies to minimatch.match()
   * @default false
   */
  nonull?: boolean;

  /**
   * Treat backslash as path separator only, not as escape character
   * Replaces all \ with / before processing
   * Useful for Windows paths
   * @default false
   */
  windowsPathsNoEscape?: boolean;

  /**
   * Legacy alias: when set to false, enables windowsPathsNoEscape
   * @deprecated Use windowsPathsNoEscape instead
   */
  allowWindowsEscape?: boolean;

  /**
   * Perform partial matching
   * Useful when traversing directories and full path is not yet known
   * @default false
   */
  partial?: boolean;

  /**
   * Match patterns without slashes against basename of the path
   * e.g., *.js will match path/to/file.js
   * @default false
   */
  matchBase?: boolean;

  /**
   * Preserve multiple consecutive slashes
   * By default, multiple slashes are collapsed to one
   * @default false
   */
  preserveMultipleSlashes?: boolean;

  /**
   * Match dotfiles (files starting with .)
   * By default, * and ** do not match dotfiles unless pattern also starts with .
   * @default false
   */
  dot?: boolean;

  /**
   * Perform case-insensitive matching
   * @default false
   */
  nocase?: boolean;

  /**
   * When used with nocase, only use case-insensitive regex
   * but leave string comparisons case-sensitive
   * Has no effect without nocase: true
   * @default false
   */
  nocaseMagicOnly?: boolean;

  /**
   * Treat brace expansion as "magic" for hasMagic()
   * When true, patterns like {a,b} are considered to have magic
   * @default false
   */
  magicalBraces?: boolean;

  /**
   * Invert the result of negation
   * When true, negated patterns return true on hit and false on miss
   * @default false
   */
  flipNegate?: boolean;

  /**
   * Optimization level for pattern processing
   * - 0: No optimization (explicit disable, not recommended)
   * - 1: Basic optimization (default, recommended)
   * - 2+: Aggressive optimization
   * @default 1
   */
  optimizationLevel?: number;

  /**
   * Override platform detection for path handling
   */
  platform?: Platform;

  /**
   * Windows-specific: disable magic root detection for drive letters
   * @default false on non-Windows, true on Windows with nocase
   */
  windowsNoMagicRoot?: boolean;

  // =========================================================================
  // Extended picomatch options (not in original minimatch)
  // =========================================================================

  /**
   * Patterns to exclude from matching
   * Can be a string or array of glob patterns
   * @default undefined
   */
  ignore?: string | string[];

  /**
   * Throw an error if no matches are found
   * Only applies to minimatch.match()
   * @default false
   */
  failglob?: boolean;

  /**
   * Maximum length of the input pattern
   * Patterns longer than this will throw a TypeError
   * @default 65536
   */
  maxLength?: number;

  /**
   * Custom function for expanding ranges in brace patterns
   * Receives the range values as two arguments (e.g., 'a', 'z' for {a..z})
   * Must return a string to be used in the generated regex
   * @example (a, b) => `(${fillRange(a, b, { toRegex: true })})`
   */
  expandRange?: (a: string, b: string) => string;

  /**
   * Follow bash matching rules more strictly
   * Disallows backslashes as escape characters and treats single stars as globstars
   * @default false
   */
  bash?: boolean;

  /**
   * Allow glob to match any part of the given string
   * By default, the pattern must match the entire string
   * @default false
   */
  contains?: boolean;

  /**
   * Custom function for formatting strings before matching
   * Useful for removing leading slashes, converting Windows paths, etc.
   * @example (str) => str.replace(/^\.\//, '')
   */
  format?: (str: string) => string;

  /**
   * Regex flags to use in the generated regex
   * If defined, the nocase option will be overridden
   * @example 'gi'
   */
  flags?: string;

  /**
   * Function to be called on matched items
   * Receives match result object with glob, regex, input, output
   */
  onMatch?: (result: MatchResult) => void;

  /**
   * Function to be called on ignored items
   * Receives match result object with glob, regex, input, output
   */
  onIgnore?: (result: MatchResult) => void;

  /**
   * Function to be called on all items, regardless of match status
   * Receives match result object with glob, regex, input, output
   */
  onResult?: (result: MatchResult) => void;

  /**
   * Throw an error if brackets, braces, or parens are imbalanced
   * @default false
   */
  strictBrackets?: boolean;

  /**
   * When true, brackets in the glob pattern will be escaped
   * so that only literal brackets will be matched
   * @default false
   */
  literalBrackets?: boolean;

  /**
   * Retain quotes in the generated regex
   * Quotes may also be used as an alternative to backslashes
   * @default false
   */
  keepQuotes?: boolean;

  /**
   * Remove backslashes preceding escaped characters in the glob pattern
   * By default, backslashes are retained
   * @default false
   */
  unescape?: boolean;
}

/**
 * Options specifically for picomatch (internal use)
 */
export interface PicomatchOptions {
  dot?: boolean;
  nocase?: boolean;
  nonegate?: boolean;
  noextglob?: boolean;
  noglobstar?: boolean;
  nobrace?: boolean;
  basename?: boolean;
  posix?: boolean;
  windows?: boolean;
  contains?: boolean;
  flags?: string;
  matchBase?: boolean;
  posixSlashes?: boolean;
  expandRange?: (a: string, b: string) => string;
  // Extended options
  ignore?: string | string[];
  maxLength?: number;
  bash?: boolean;
  format?: (str: string) => string;
  onMatch?: (result: MatchResult) => void;
  onIgnore?: (result: MatchResult) => void;
  onResult?: (result: MatchResult) => void;
  strictBrackets?: boolean;
  literalBrackets?: boolean;
  keepQuotes?: boolean;
  unescape?: boolean;
}

