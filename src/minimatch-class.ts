/**
 * @fileoverview Minimatch class - core pattern matching implementation
 *
 * This is the heart of minimatch-fast. The Minimatch class provides 100% API
 * compatibility with minimatch's Minimatch class while using picomatch
 * internally for faster and more secure pattern matching.
 *
 * Key features:
 * - Pattern compilation and caching for efficient repeated matching
 * - Full support for glob patterns: *, **, ?, [], {}, extglob
 * - Brace expansion using the 'braces' package
 * - Negation patterns with !
 * - Comment patterns with #
 * - Cross-platform path handling (Windows and POSIX)
 *
 * Architecture:
 * 1. Constructor receives pattern and options
 * 2. Pattern is parsed and expanded (braces)
 * 3. Picomatch matchers are created for each expanded pattern
 * 4. match() method tests paths against all matchers
 *
 * Compatibility layer:
 * Some edge cases require special handling to match minimatch's exact behavior:
 * - Dotfiles (. and ..) are never matched by wildcards
 * - Negated character classes [^...] don't match dotfiles
 * - Backslash escapes in character classes ([\b] = literal 'b')
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import picomatch from 'picomatch';
import type {
  MinimatchOptions,
  MMRegExp,
  ParseReturn,
  ParseReturnFiltered,
  Platform,
  PicomatchOptions,
} from './types.js';
import { GLOBSTAR } from './types.js';
import { translateOptions } from './options.js';
import { braceExpand } from './brace-expand.js';
import {
  normalizePath,
  normalizePattern,
  slashSplit,
  isWindows as checkIsWindows,
  getPlatform,
} from './utils.js';

/**
 * Default maximum pattern length to prevent ReDoS attacks
 */
export const DEFAULT_MAX_PATTERN_LENGTH = 65536;

/**
 * Minimatch class for glob pattern matching
 */
export class Minimatch {
  /** Original pattern passed to constructor */
  pattern: string;

  /** Options used for matching */
  options: MinimatchOptions;

  /** 2D array of parsed pattern parts after brace expansion */
  set: ParseReturnFiltered[][];

  /** Whether the pattern is negated (starts with !) */
  negate: boolean;

  /** Whether the pattern is a comment (starts with #) */
  comment: boolean;

  /** Whether the pattern is empty */
  empty: boolean;

  /** Whether to preserve multiple consecutive slashes */
  preserveMultipleSlashes: boolean;

  /** Whether to do partial matching */
  partial: boolean;

  /** Result of brace expansion on the pattern */
  globSet: string[];

  /** Brace-expanded patterns split into path portions */
  globParts: string[][];

  /** Whether to perform case-insensitive matching */
  nocase: boolean;

  /** Whether running on Windows */
  isWindows: boolean;

  /** Target platform */
  platform: Platform;

  /** Windows-specific magic root handling */
  windowsNoMagicRoot: boolean;

  /** Compiled regular expression (lazily computed) */
  regexp: false | null | MMRegExp;

  /** Whether backslash is treated as path separator */
  windowsPathsNoEscape: boolean;

  /** Whether negation is disabled */
  nonegate: boolean;

  // Private properties
  private _picoOpts: PicomatchOptions;
  private _matchers: Array<(str: string) => boolean>;
  private _debugFn: (...args: unknown[]) => void;

  // Cached computed values for performance
  private _hasNegatedCharClassCached: boolean;
  private _requiresTrailingSlashCached: boolean;

  /**
   * Create a new Minimatch instance
   *
   * @param pattern - The glob pattern to match against
   * @param options - Matching options
   */
  constructor(pattern: string, options: MinimatchOptions = {}) {
    // Validate pattern
    if (typeof pattern !== 'string') {
      throw new TypeError('glob pattern must be a string');
    }

    // Validate and apply maxLength option
    const maxLength = options.maxLength ?? DEFAULT_MAX_PATTERN_LENGTH;
    if (typeof maxLength !== 'number' || !Number.isFinite(maxLength) || maxLength < 1) {
      throw new TypeError(
        `options.maxLength must be a positive finite number, got: ${maxLength}`
      );
    }
    if (pattern.length > maxLength) {
      throw new TypeError(
        `Pattern length ${pattern.length} exceeds maximum ${maxLength}. ` +
        `This limit exists to prevent ReDoS attacks. ` +
        `Use options.maxLength to increase if needed.`
      );
    }

    // Store options
    this.options = options;
    this.pattern = pattern;

    // Platform detection
    this.platform = options.platform || getPlatform();
    this.isWindows = checkIsWindows(this.platform);

    // Handle Windows path escape mode (use ?? for consistency with options.ts)
    this.windowsPathsNoEscape =
      options.windowsPathsNoEscape ?? options.allowWindowsEscape === false;

    // Normalize pattern for Windows if needed
    if (this.windowsPathsNoEscape) {
      this.pattern = normalizePattern(this.pattern, true);
    }

    // Initialize properties
    this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
    this.regexp = null;
    this.negate = false;
    this.nonegate = !!options.nonegate;
    this.comment = false;
    this.empty = false;
    this.partial = !!options.partial;
    this.nocase = !!options.nocase;

    this.windowsNoMagicRoot =
      options.windowsNoMagicRoot !== undefined
        ? options.windowsNoMagicRoot
        : !!(this.isWindows && this.nocase);

    this.globSet = [];
    this.globParts = [];
    this.set = [];
    this._matchers = [];

    // Debug function (no-op by default)
    this._debugFn = () => {};

    // Translate options for picomatch
    const { picoOpts } = translateOptions(options);
    this._picoOpts = picoOpts;

    // Build the pattern set
    this.make();

    // Pre-compute cached values for performance
    // These are used in match() and would otherwise be computed on every call
    this._hasNegatedCharClassCached = /\[\^[^\]]+\]/.test(this.pattern);
    this._requiresTrailingSlashCached = /\*\*\/\.[^/]+\/\*\*/.test(this.pattern);
  }

  /**
   * Enable debug output
   */
  private debug(...args: unknown[]): void {
    this._debugFn(...args);
  }

  /**
   * Check if the pattern contains glob magic characters
   */
  hasMagic(): boolean {
    // If magicalBraces is set and we have multiple patterns from brace expansion
    if (this.options.magicalBraces && this.set.length > 1) {
      return true;
    }

    // Check each pattern part for non-string (regex) parts
    for (const pattern of this.set) {
      for (const part of pattern) {
        if (typeof part !== 'string') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Build the pattern matching set
   */
  private make(): void {
    const pattern = this.pattern;
    const options = this.options;

    // Handle debug mode
    if (options.debug) {
      this._debugFn = (...args: unknown[]) => console.error(...args);
    }

    // Comments match nothing
    if (!options.nocomment && pattern.charAt(0) === '#') {
      this.comment = true;
      return;
    }

    // Empty patterns match nothing
    if (!pattern) {
      this.empty = true;
      return;
    }

    // Parse negation (!)
    this.parseNegate();

    // Expand braces
    this.globSet = [...new Set(this.braceExpand())];

    this.debug(this.pattern, this.globSet);

    // Split into path parts
    const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));

    // Apply preprocessing (optimization, normalization)
    this.globParts = this.preprocess(rawGlobParts);

    this.debug(this.pattern, this.globParts);

    // Create matchers for the expanded patterns.
    // Strategy (fastest first):
    // 1. Single pattern: compile it directly.
    // 2. Brace patterns: compile the ORIGINAL unexpanded pattern - picomatch
    //    compiles braces natively into a single regex with inline alternation
    //    (?:src|lib), which is much faster than a union of full regexes.
    // 3. Multiple expansions without braces: one combined matcher from the
    //    array (picomatch accepts string[] and shares structure).
    // 4. Fallback: one matcher per expanded pattern.
    try {
      if (this.globSet.length === 1) {
        this._matchers = [
          picomatch(this.preprocessPattern(this.globSet[0]!), this._picoOpts),
        ];
      } else if (
        !this.options.nobrace &&
        this.pattern.includes('{') &&
        // Native brace compilation changes semantics when braces are nested
        // inside extglob (e.g. *(a|{b,c})), so only use it without extglob
        !/[@!?+*]\(/.test(this.pattern)
      ) {
        try {
          this._matchers = [
            picomatch(this.preprocessPattern(this.pattern), this._picoOpts),
          ];
        } catch {
          this._matchers = [
            picomatch(
              this.globSet.map((p) => this.preprocessPattern(p)),
              this._picoOpts
            ),
          ];
        }
      } else {
        this._matchers = [
          picomatch(
            this.globSet.map((p) => this.preprocessPattern(p)),
            this._picoOpts
          ),
        ];
      }
    } catch {
      // Fallback: one matcher per expanded pattern
      this._matchers = this.globSet.map((p) => {
        try {
          const processed = this.preprocessPattern(p);
          return picomatch(processed, this._picoOpts);
        } catch {
          // If picomatch fails, return a matcher that never matches
          return () => false;
        }
      });
    }

    // Convert to pattern set for internal use
    this.set = this.globParts
      .map((parts) => {
        return parts.map((part) => this.parse(part));
      })
      .filter((s) => s.indexOf(false) === -1) as ParseReturnFiltered[][];

    this.debug(this.pattern, this.set);
  }

  /**
   * Parse negation from the pattern
   */
  private parseNegate(): void {
    if (this.nonegate) return;

    const pattern = this.pattern;
    let negate = false;
    let negateOffset = 0;

    // Count leading ! characters
    for (let i = 0; i < pattern.length && pattern.charAt(i) === '!'; i++) {
      negate = !negate;
      negateOffset++;
    }

    // Remove leading ! characters from pattern
    if (negateOffset) {
      this.pattern = pattern.slice(negateOffset);
    }
    this.negate = negate;
  }

  /**
   * Perform brace expansion on the pattern
   */
  braceExpand(): string[] {
    return braceExpand(this.pattern, this.options);
  }

  /**
   * Split a path by slashes
   */
  slashSplit(p: string): string[] {
    return slashSplit(p, this.preserveMultipleSlashes, this.isWindows);
  }

  /**
   * Preprocess glob parts (optimization, normalization)
   */
  private preprocess(globParts: string[][]): string[][] {
    // Convert ** to * if noglobstar
    if (this.options.noglobstar) {
      for (const parts of globParts) {
        for (let j = 0; j < parts.length; j++) {
          if (parts[j] === '**') {
            parts[j] = '*';
          }
        }
      }
    }

    const { optimizationLevel = 1 } = this.options;

    if (optimizationLevel >= 1) {
      // Remove adjacent ** and resolve .. portions
      globParts = globParts
        .map((parts) => {
          return parts.reduce((set: string[], part) => {
            const prev = set[set.length - 1];

            // Skip duplicate **
            if (part === '**' && prev === '**') {
              return set;
            }

            // Resolve ..
            if (part === '..') {
              if (prev && prev !== '..' && prev !== '.' && prev !== '**') {
                set.pop();
                return set;
              }
            }

            set.push(part);
            return set;
          }, []);
        })
        .map((parts) => (parts.length === 0 ? [''] : parts));
    }

    return globParts;
  }

  /**
   * Parse a single pattern part into a regex or string
   *
   * Literal parts (no glob magic) are returned as plain strings, matching
   * minimatch's behavior. This makes hasMagic() work correctly and avoids
   * regex compilation for literal segments. With nocase, literals are
   * compiled to regexes so that matching stays case-insensitive (this also
   * matches minimatch, where hasMagic() returns true for nocase patterns).
   */
  private parse(pattern: string): ParseReturn {
    // Globstar
    if (pattern === '**') {
      return GLOBSTAR;
    }

    // Empty string
    if (pattern === '') {
      return '';
    }

    // Literal part without magic characters: keep as string.
    // Magic means: unescaped *, ?, character classes [ ], backslash escapes,
    // or extglob introducers like @( !( *( +(
    if (!this.nocase && !/[*?\][\\]/.test(pattern) && !/[@!+*]\(/.test(pattern)) {
      return pattern;
    }

    // Try to create a regex using picomatch
    try {
      const regex = picomatch.makeRe(pattern, this._picoOpts);
      if (regex) {
        return regex as MMRegExp;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Run all compiled matchers against a string, returning true on first hit.
   * Uses a plain loop instead of .some() to avoid a closure allocation
   * per call - this is the hottest path in the library.
   */
  private _matchAny(str: string): boolean {
    const matchers = this._matchers;
    for (let i = 0; i < matchers.length; i++) {
      if (matchers[i]!(str)) return true;
    }
    return false;
  }

  /**
   * Test if a path matches the pattern
   *
   * @param path - The path to test
   * @param partial - Whether to do partial matching
   * @returns true if the path matches
   */
  match(path: string, partial: boolean = this.partial): boolean {
    this.debug('match', path, this.pattern);

    // Comments never match
    if (this.comment) {
      return false;
    }

    // Empty patterns only match empty strings
    if (this.empty) {
      return path === '';
    }

    // Root matches everything in partial mode
    if (path === '/' && partial) {
      return true;
    }

    // Normalize Windows paths (only if needed)
    if ((this.windowsPathsNoEscape || this.isWindows) && path.includes('\\')) {
      path = normalizePath(path, true);
    }

    const matchBase = this.options.matchBase;

    // minimatch compatibility: '.' and '..' are never matched by wildcards,
    // even with dot:true. They only match when an expanded pattern
    // explicitly ends with that literal segment.
    // Cheap precheck: basename can only be '.' or '..' if path ends with '.'
    let basename: string | undefined;
    if (path.endsWith('.')) {
      const lastSlashIdx = path.lastIndexOf('/');
      basename = lastSlashIdx >= 0 ? path.slice(lastSlashIdx + 1) : path;
      if (basename === '.' || basename === '..') {
        const explicit = this.globSet.some((glob) => {
          const idx = glob.lastIndexOf('/');
          return (idx >= 0 ? glob.slice(idx + 1) : glob) === basename;
        });
        if (!explicit) {
          return this.negate ? true : false;
        }
      }
    }

    // Handle trailing slashes in path
    // minimatch treats 'dir/' as equivalent to 'dir' when pattern doesn't end with /
    const pathWithoutTrailingSlash = path.endsWith('/') && path.length > 1
      ? path.slice(0, -1)
      : path;

    // Use picomatch matchers for fast matching
    let matches = false;

    if (matchBase && !path.includes('/')) {
      // matchBase mode: match against basename only
      matches = this._matchAny(path);
    } else if (matchBase) {
      // matchBase with path: try full path first, then basename
      // (slice(lastIndexOf+1) handles "no slash" correctly, returns path)
      basename ??= path.slice(path.lastIndexOf('/') + 1);
      matches = this._matchAny(path) || this._matchAny(basename);
    } else {
      // Normal mode: match full path.
      // Only try the trailing-slash-trimmed variant when it actually
      // differs; otherwise every miss would run each matcher twice
      // with the same string.
      matches = this._matchAny(path);
      if (!matches && pathWithoutTrailingSlash !== path) {
        matches = this._matchAny(pathWithoutTrailingSlash);
      }
    }

    // minimatch compatibility: negated character classes [^...] should not match dotfiles
    // unless dot option is true
    if (matches && !this.options.dot && this._hasNegatedCharClassCached) {
      basename ??= path.slice(path.lastIndexOf('/') + 1);
      if (basename.startsWith('.')) {
        matches = false;
      }
    }

    // minimatch compatibility: globstar patterns like **/.x/** require directory indicators
    // The path ".x" or "a/b/.x" (without trailing /) should not match **/.x/**
    // but ".x/" or "a/b/.x/" or "a/b/.x/c" should match
    if (matches && this._requiresTrailingSlashCached && !path.endsWith('/')) {
      // Check if the matched portion requires a trailing slash
      const patternParts = this.pattern.split('/');
      const pathParts = path.split('/');
      const lastPathPart = pathParts[pathParts.length - 1];

      // If pattern has **/.x/** and path ends with just ".x" (no trailing slash), don't match
      // The pattern requires content after the dotfile directory
      for (let i = 0; i < patternParts.length - 1; i++) {
        if (patternParts[i] === '**' && patternParts[i + 1] && patternParts[i + 1].startsWith('.')) {
          const dotPart = patternParts[i + 1];
          // Check if this is followed by another ** (meaning content is required after)
          if (i + 2 < patternParts.length && patternParts[i + 2] === '**') {
            // Path ends with the dotfile part - should not match without trailing slash
            if (lastPathPart === dotPart) {
              matches = false;
              break;
            }
          }
        }
      }
    }

    // Handle flipNegate option
    if (this.options.flipNegate) {
      return matches;
    }

    // Apply negation
    return this.negate ? !matches : matches;
  }


  /**
   * Pre-process pattern for minimatch compatibility
   * Handles edge cases where picomatch behaves differently
   */
  private preprocessPattern(pattern: string): string {
    // minimatch treats [\b] as [b] (the backslash is just escaping 'b' in a character class)
    // picomatch treats [\b] as the backspace character
    // Convert [\b] to [b] for compatibility
    pattern = pattern.replace(/\[\\b\]/g, '[b]');

    // Also handle other escaped letters in character classes that should be literal
    // [\n], [\t], etc. in minimatch are just the literal letters n, t, etc.
    // But we need to be careful not to break actual escape sequences

    return pattern;
  }

  /**
   * Create a regular expression from the pattern
   *
   * @returns RegExp or false if pattern is invalid
   */
  makeRe(): false | MMRegExp {
    // Return cached regex if available
    if (this.regexp !== null) {
      return this.regexp;
    }

    // Comments and empty patterns produce no regex
    if (this.comment || this.empty) {
      this.regexp = false;
      return this.regexp;
    }

    // No patterns after parsing
    if (!this.set.length) {
      this.regexp = false;
      return this.regexp;
    }

    const options = this.options;
    const flags = options.nocase ? 'i' : '';

    try {
      // Collect all regexes from expanded patterns
      const regexParts: string[] = [];

      for (const glob of this.globSet) {
        try {
          const re = picomatch.makeRe(glob, this._picoOpts);
          if (re) {
            // Extract the source without anchors
            let src = re.source;
            // Remove ^ and $ anchors if present
            if (src.startsWith('^')) src = src.slice(1);
            if (src.endsWith('$')) src = src.slice(0, -1);
            regexParts.push(src);
          }
        } catch {
          // Skip invalid patterns
        }
      }

      if (regexParts.length === 0) {
        this.regexp = false;
        return this.regexp;
      }

      // Combine all patterns with |
      const combined =
        regexParts.length === 1
          ? regexParts[0]
          : `(?:${regexParts.join('|')})`;

      let re = `^${combined}$`;

      // Negated patterns match anything EXCEPT the pattern,
      // mirroring minimatch's makeRe behavior
      if (this.negate) {
        re = `^(?!${re}).+$`;
      }

      this.regexp = new RegExp(re, flags) as MMRegExp;
      this.regexp._src = re;
      this.regexp._glob = this.pattern;
    } catch (e) {
      this.regexp = false;
    }

    return this.regexp;
  }

  /**
   * Match a file array against a pattern array
   * This is for internal use and advanced matching scenarios
   *
   * @param file - Array of path segments
   * @param pattern - Array of pattern parts
   * @param partial - Whether to do partial matching
   * @returns true if file matches pattern
   */
  matchOne(
    file: string[],
    pattern: ParseReturn[],
    partial: boolean = false
  ): boolean {
    const options = this.options;

    this.debug('matchOne', { file, pattern, partial });

    // Traverse both arrays simultaneously
    let fi = 0;
    let pi = 0;
    const fl = file.length;
    const pl = pattern.length;

    for (; fi < fl && pi < pl; fi++, pi++) {
      const p = pattern[pi];
      const f = file[fi];

      this.debug('matchOne loop', { fi, pi, f, p });

      // Invalid pattern part
      if (p === false) {
        return false;
      }

      // Globstar handling
      if (p === GLOBSTAR) {
        this.debug('GLOBSTAR', { pi, fl, fi });

        // Handle ** at the end
        const pr = pi + 1;
        if (pr === pl) {
          this.debug('** at end');
          // ** at the end swallows everything except . and ..
          for (; fi < fl; fi++) {
            if (
              file[fi] === '.' ||
              file[fi] === '..' ||
              (!options.dot && file[fi]!.charAt(0) === '.')
            ) {
              return false;
            }
          }
          return true;
        }

        // Try to match rest of pattern
        let fr = fi;
        while (fr < fl) {
          const swallowee = file[fr];
          this.debug('globstar while', { swallowee, fr, fl });

          // Try matching the rest
          if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
            this.debug('globstar found match!', fr, fl, swallowee);
            return true;
          }

          // Don't swallow . or .. or dotfiles (unless dot option)
          if (
            swallowee === '.' ||
            swallowee === '..' ||
            (!options.dot && swallowee!.charAt(0) === '.')
          ) {
            this.debug('dot detected!', file, fr, pattern, pi);
            break;
          }

          fr++;
        }

        // Partial match if we've consumed all of file
        if (partial && fr === fl) {
          return true;
        }

        return false;
      }

      // String or RegExp matching for this segment
      let hit: boolean;

      if (typeof p === 'string') {
        hit = f === p;
        this.debug('string match', p, f, hit);
      } else {
        hit = p.test(f!);
        this.debug('pattern match', p, f, hit);
      }

      if (!hit) {
        return false;
      }
    }

    // Check if we matched everything
    if (fi === fl && pi === pl) {
      // Perfect match
      return true;
    } else if (fi === fl) {
      // Ran out of file, but still have pattern left
      // This is a partial match
      return partial;
    } else if (pi === pl) {
      // Ran out of pattern, but still have file left
      // Only OK if we're at the last part and it's empty (trailing slash)
      return fi === fl - 1 && file[fi] === '';
    }

    // This point should be unreachable given the logic above
    throw new Error('Unexpected state in matchOne: pattern/file mismatch');
  }

  /**
   * Create a new Minimatch class with default options
   *
   * @param def - Default options to apply
   * @returns New Minimatch class with defaults
   */
  static defaults(def: MinimatchOptions): typeof Minimatch {
    const OrigClass = Minimatch;
    return class DefaultMinimatch extends OrigClass {
      constructor(pattern: string, options: MinimatchOptions = {}) {
        super(pattern, { ...def, ...options });
      }
      static override defaults(
        options: MinimatchOptions
      ): typeof DefaultMinimatch {
        return OrigClass.defaults({ ...def, ...options }) as typeof DefaultMinimatch;
      }
    };
  }
}
