/**
 * Type declarations for picomatch
 */

declare module 'picomatch' {
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
    format?: (str: string) => string;
    onMatch?: (result: { isMatch: boolean; match?: string; output: string }) => void;
    onIgnore?: (result: { isMatch: boolean; output: string }) => void;
    onResult?: (result: { isMatch: boolean; output: string }) => void;
  }

  export interface ScanResult {
    prefix: string;
    input: string;
    start: number;
    base: string;
    glob: string;
    isBrace: boolean;
    isBracket: boolean;
    isGlob: boolean;
    isExtglob: boolean;
    isGlobstar: boolean;
    negated: boolean;
    negatedExtglob: boolean;
    maxDepth?: number;
    tokens?: object[];
    slashes?: number[];
    parts?: string[];
  }

  export interface Matcher {
    (test: string): boolean;
  }

  /**
   * Creates a matcher function from one or more glob patterns
   */
  function picomatch(
    glob: string | string[],
    options?: PicomatchOptions
  ): Matcher;

  namespace picomatch {
    /**
     * Test if a string matches one or more glob patterns
     */
    function isMatch(
      str: string,
      patterns: string | string[],
      options?: PicomatchOptions
    ): boolean;

    /**
     * Create a regular expression from a glob pattern
     */
    function makeRe(
      pattern: string,
      options?: PicomatchOptions
    ): RegExp;

    /**
     * Scan a glob pattern and return an object with pattern metadata
     */
    function scan(
      pattern: string,
      options?: PicomatchOptions & { parts?: boolean; tokens?: boolean }
    ): ScanResult;

    /**
     * Parse a glob pattern
     */
    function parse(
      pattern: string,
      options?: PicomatchOptions
    ): { input: string; output: string; tokens: object[] };

    /**
     * Compile a regex source string
     */
    function toRegex(
      source: string,
      options?: { flags?: string; nocase?: boolean; debug?: boolean }
    ): RegExp;

    /**
     * Test string against regex
     */
    function test(
      input: string,
      regex: RegExp,
      options?: PicomatchOptions,
      returnObject?: boolean
    ): boolean | { isMatch: boolean; match?: RegExpMatchArray; output: string };

    /**
     * Match basename of string against pattern
     */
    function matchBase(
      input: string,
      glob: RegExp | string,
      options?: PicomatchOptions
    ): boolean;
  }

  export = picomatch;
}
