import type { Translations } from './es';

export const en: Translations = {
  layout: {
    skipLink: 'Skip to content',
    metaKeywords: 'minimatch, glob, pattern matching, fast, performance, nodejs, javascript, typescript, picomatch, file matching, wildcard, regex, npm package',
    jsonLdDescription: 'Drop-in replacement for minimatch. Up to 36x faster glob pattern matching for Node.js. Zero vulnerabilities, 100% API compatible.',
    jsonLdReleaseNotes: 'Cache correctness fixes, hasMagic()/makeRe() alignment with minimatch, escape/unescape 1:1 compat. 402 tests. Published via npm trusted publishing (OIDC) with provenance.',
    jsonLdKeywords: ['glob', 'minimatch', 'pattern matching', 'fast', 'performance', 'nodejs', 'javascript', 'typescript'],
    ogImageAlt: 'minimatch-fast - up to 36x faster glob pattern matching',
  },
  page: {
    title: 'minimatch-fast | Up to 36x Faster Glob Pattern Matching for Node.js',
    description: 'Drop-in replacement for minimatch. Up to 36x faster glob pattern matching powered by picomatch. Zero vulnerabilities (CVE-2022-3517 safe). 100% API compatible. TypeScript support. Used by developers worldwide for faster builds.',
  },
  header: {
    nav: [
      { href: '#features', label: 'features' },
      { href: '#benchmarks', label: 'benchmarks' },
      { href: '#install', label: 'install' },
      { href: '#api', label: 'api' },
      { href: '#changelog', label: 'changelog' },
    ],
    githubAria: 'GitHub repository',
    themeAria: 'Toggle dark mode',
    menuAria: 'Toggle menu',
    langToggleAria: 'Versión en español',
  },
  hero: {
    badge: 'v0.4.0 live on npm',
    subtitle1: 'Drop-in replacement for minimatch.',
    subtitle2: 'Up to 36x faster. Zero vulnerabilities.',
    copyAria: 'Copy install command',
    cta: 'Get Started',
    chips: ['picomatch engine', '100% API compatible', 'TypeScript', 'ESM + CJS', '402 tests'],
    license: 'MIT License',
  },
  features: {
    heading: 'Why minimatch-fast?',
    sub: 'The performance and security upgrade your glob matching needs',
    items: [
      {
        title: 'Lightning Fast',
        description: 'up to 36x faster than minimatch. Powered by picomatch engine with LRU caching and optimized fast paths for common patterns.'
      },
      {
        title: 'Secure',
        description: 'Not vulnerable to CVE-2022-3517 (ReDoS). Built-in protection against catastrophic backtracking and DoS attacks.'
      },
      {
        title: 'Stable',
        description: 'Never freezes on patterns like {1..1000}. Limits on brace expansion prevent hanging or memory issues.'
      },
      {
        title: '100% Compatible',
        description: 'Drop-in replacement with identical API. 402 tests ensure full compatibility with minimatch v10.x behavior.'
      },
      {
        title: 'TypeScript Ready',
        description: 'Full TypeScript support with complete type definitions included. No need to install separate @types packages.'
      },
      {
        title: 'Dual Module Support',
        description: 'Works with both ESM and CommonJS. Use import or require() - we support both module systems out of the box.'
      }
    ],
  },
  benchmark: {
    heading: 'Performance Benchmarks',
    sub: 'Every scenario beats minimatch v10.x — 3 stable consecutive runs, median of 21 rounds, 1000-path corpus',
    baseline: 'Baseline',
    cols: { pattern: 'Pattern', scenario: 'Scenario', speedup: 'Speedup' },
    warm: {
      heading: 'Real-world globbing (warm LRU cache)',
      note: 'The real glob workload: build tools and linters match a handful of patterns against thousands of files. minimatch recompiles on every call; minimatch-fast caches compiled patterns. This asymmetry is an openly acknowledged product feature.',
      earlyRejection: 'The big numbers come from early rejection: slashless patterns are rejected without compiling for nested paths, because one segment cannot cross /.',
      rows: [
        { scenario: '{src,lib}/**/*.{js,ts,tsx}', minimatch: '88.0ms', fast: '2.4ms', speedup: '36x faster', highlight: true },
        { scenario: '@(foo|bar|baz).js', minimatch: '—', fast: '—', speedup: '~190x faster', highlight: true },
        { scenario: '*.js', minimatch: '—', fast: '—', speedup: '~64x faster', highlight: true },
        { scenario: '**/*.js', minimatch: '—', fast: '—', speedup: '4.3x faster', highlight: true },
      ],
    },
    engine: {
      heading: 'Engine vs engine (pre-compiled, no cache)',
      note: 'The most honest comparison: the same pre-compiled pattern on both sides, no cache involved. The engine wins 2.4-12x on every measured pattern shape.',
      rows: [
        { scenario: 'file[0-9].js', speedup: '12x faster', highlight: true },
        { scenario: '@(foo|bar|baz).js', speedup: '12x faster', highlight: true },
        { scenario: '*.js / !*.test.js / ???.js', speedup: '8-9x faster', highlight: true },
        { scenario: '{src,lib}/**/*.{js,ts,tsx}', speedup: '3.4x faster', highlight: true },
        { scenario: '**/*.js / **/**/**/*.js', speedup: '2.7x faster', highlight: true },
        { scenario: '{src,lib}/*.js', speedup: '2.4x faster', highlight: true },
      ],
    },
    compileCold: {
      heading: 'Compilation and cold calls',
      note: 'The worst-case workload: one-off calls where every pattern gets compiled. Even there, always above parity.',
      rows: [
        { scenario: 'Compile {src,lib}/**/*.{js,ts,tsx}', speedup: '5.7x faster', highlight: true },
        { scenario: 'Compile @(foo|bar|baz).js (extglob)', speedup: '3x faster', highlight: true },
        { scenario: 'Compile *.js / **/*.js', speedup: '1.6-2.3x faster', highlight: false },
        { scenario: 'Cold @(foo|bar|baz).js (extglob)', speedup: '~105x faster', highlight: true },
        { scenario: 'Cold *.js', speedup: '~20x faster', highlight: true },
        { scenario: 'Cold complex braces', speedup: '~4x faster', highlight: true },
        { scenario: 'Cold **/*.js', speedup: '1.1-1.9x faster', highlight: false },
      ],
    },
    security: {
      heading: 'Security Comparison',
      featureCol: 'Feature',
      rows: [
        { feature: 'CVE-2022-3517 (ReDoS)', minimatch: 'Vulnerable', fast: 'Not affected', danger: true },
        { feature: 'Pattern {1..1000}', minimatch: 'Freezes', fast: 'Instant', danger: true },
        { feature: 'Brace expansion limit', minimatch: 'None', fast: '10,000 max', danger: false },
      ],
    },
    note: 'Node.js 22, Linux. Methodology: interleaved A/B/B/A, 5 warmup rounds, median of 21 rounds, 1000-path deterministic corpus, 3 stable consecutive runs. Reproduce with',
  },
  install: {
    heading: 'Installation',
    sub: 'Two ways to upgrade from minimatch',
    option1Badge: 'option 1',
    option1Title: 'Update imports',
    option1Intro: 'Install the package and update your import statements:',
    option1Then: 'Then update your imports:',
    option2Badge: 'option 2',
    option2Title: 'npm aliasing',
    option2Intro: 'Zero code changes required. Use npm\'s package aliasing:',
    option2DetailPre: 'This installs minimatch-fast as',
    option2DetailPost: ', so all your existing imports continue to work without any changes.',
    option2NoteStrong: 'Note:',
    option2Note: 'This also updates minimatch for all your dependencies that use it.',
  },
  usage: {
    heading: 'Usage Examples',
    sub: 'Common patterns and use cases',
    examples: [
      { title: 'Basic Matching' },
      { title: 'Match Array' },
      { title: 'Filter Function' },
      { title: 'Minimatch Class' },
      { title: 'Brace Expansion' },
      { title: 'Escape / Unescape' },
    ],
  },
  patterns: {
    heading: 'Glob Pattern Reference',
    sub: 'Complete guide to glob pattern syntax',
    cols: { pattern: 'Pattern', description: 'Description', example: 'Example', class: 'Class', matches: 'Matches' },
    posixHeading: 'POSIX Character Classes',
    posixSub: 'Full support for POSIX bracket expressions',
    unicodeHeading: 'Unicode Support',
    unicodeSub: 'Full Unicode and emoji support in patterns and filenames',
    patterns: [
      { pattern: '*', description: 'Match any characters except path separators', example: '*.js matches foo.js, bar.js' },
      { pattern: '**', description: 'Match any characters including path separators (globstar)', example: '**/*.js matches src/foo.js, a/b/c.js' },
      { pattern: '?', description: 'Match exactly one character (except path separator)', example: '?.js matches a.js, b.js' },
      { pattern: '[abc]', description: 'Match any character in the set', example: '[abc].js matches a.js, b.js, c.js' },
      { pattern: '[a-z]', description: 'Match any character in the range', example: '[a-z].js matches a.js through z.js' },
      { pattern: '[!abc]', description: 'Match any character NOT in the set', example: '[!a].js matches b.js, c.js (not a.js)' },
      { pattern: '{a,b,c}', description: 'Match any of the comma-separated patterns', example: '{foo,bar}.js matches foo.js, bar.js' },
      { pattern: '{1..5}', description: 'Match numeric range', example: 'file{1..3}.js matches file1.js, file2.js, file3.js' },
      { pattern: '{a..c}', description: 'Match alphabetic range', example: '{a..c}.js matches a.js, b.js, c.js' },
      { pattern: '!pattern', description: 'Negate the match', example: '!*.min.js excludes minified files' },
      { pattern: '?(a|b)', description: 'Match zero or one of the patterns', example: '?(foo).js matches .js, foo.js' },
      { pattern: '*(a|b)', description: 'Match zero or more of the patterns', example: '*(a|b).js matches .js, a.js, ab.js, aab.js' },
      { pattern: '+(a|b)', description: 'Match one or more of the patterns', example: '+(a|b).js matches a.js, ab.js, aab.js' },
      { pattern: '@(a|b)', description: 'Match exactly one of the patterns', example: '@(foo|bar).js matches foo.js, bar.js' },
    ],
    posixClasses: [
      { pattern: '[[:alpha:]]', description: 'Alphabetic characters (a-z, A-Z)', example: '[[:alpha:]]*.txt matches file.txt' },
      { pattern: '[[:digit:]]', description: 'Numeric digits (0-9)', example: 'file[[:digit:]].js matches file1.js' },
      { pattern: '[[:alnum:]]', description: 'Alphanumeric (letters and digits)', example: '[[:alnum:]] matches a, Z, 5' },
      { pattern: '[[:space:]]', description: 'Whitespace characters', example: '[[:space:]] matches space, tab' },
      { pattern: '[[:upper:]]', description: 'Uppercase letters', example: '[[:upper:]] matches A but not a' },
      { pattern: '[[:lower:]]', description: 'Lowercase letters', example: '[[:lower:]] matches a but not A' },
      { pattern: '[[:xdigit:]]', description: 'Hexadecimal digits (0-9, a-f, A-F)', example: '[[:xdigit:]] matches 0, a, F' },
    ],
    unicodeExamples: [
      { pattern: '*.txt', description: 'Full Unicode support in filenames', example: 'café.txt, 文件.txt, ファイル.txt' },
      { pattern: '文件夹/*.js', description: 'Unicode in patterns', example: '文件夹/test.js matches' },
      { pattern: '{🎉,🎊}.txt', description: 'Emoji support', example: '🎉.txt, 🎊.txt' },
    ],
  },
  api: {
    heading: 'API Reference',
    sub: 'Complete API documentation',
    params: 'Parameters',
    returns: 'Returns',
    example: 'Example',
    methods: [
      {
        name: 'minimatch(path, pattern, [options])',
        description: 'Test a path against a pattern. Returns true if the path matches.',
        params: [
          { name: 'path', type: 'string', desc: 'The path to test' },
          { name: 'pattern', type: 'string', desc: 'The glob pattern' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: 'boolean',
      },
      {
        name: 'minimatch.match(list, pattern, [options])',
        description: 'Filter an array of paths, returning those that match the pattern.',
        params: [
          { name: 'list', type: 'string[]', desc: 'Array of paths to filter' },
          { name: 'pattern', type: 'string', desc: 'The glob pattern' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: 'string[]',
      },
      {
        name: 'minimatch.filter(pattern, [options])',
        description: 'Create a filter function for use with Array.filter().',
        params: [
          { name: 'pattern', type: 'string', desc: 'The glob pattern' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: '(path: string) => boolean',
      },
      {
        name: 'minimatch.makeRe(pattern, [options])',
        description: 'Create a regular expression from the pattern.',
        params: [
          { name: 'pattern', type: 'string', desc: 'The glob pattern' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: 'RegExp | false',
      },
      {
        name: 'minimatch.braceExpand(pattern, [options])',
        description: 'Expand brace patterns into an array of patterns.',
        params: [
          { name: 'pattern', type: 'string', desc: 'Pattern with braces' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: 'string[]',
      },
      {
        name: 'minimatch.escape(str, [options])',
        description: 'Escape special glob characters in a string.',
        params: [
          { name: 'str', type: 'string', desc: 'String to escape' },
          { name: 'options', type: '{ windowsPathsNoEscape?: boolean }', desc: 'Optional configuration' },
        ],
        returns: 'string',
      },
      {
        name: 'minimatch.unescape(str, [options])',
        description: 'Remove escape characters from a string.',
        params: [
          { name: 'str', type: 'string', desc: 'String to unescape' },
          { name: 'options', type: '{ windowsPathsNoEscape?: boolean }', desc: 'Optional configuration' },
        ],
        returns: 'string',
      },
      {
        name: 'minimatch.defaults(options)',
        description: 'Create a new minimatch function with default options.',
        params: [
          { name: 'options', type: 'MinimatchOptions', desc: 'Default options to apply' },
        ],
        returns: 'typeof minimatch',
      },
      {
        name: 'new Minimatch(pattern, [options])',
        description: 'Create a reusable matcher for a pattern. More efficient when matching the same pattern against multiple paths.',
        params: [
          { name: 'pattern', type: 'string', desc: 'The glob pattern' },
          { name: 'options', type: 'MinimatchOptions', desc: 'Optional configuration' },
        ],
        returns: 'Minimatch',
      },
    ],
  },
  options: {
    heading: 'Options',
    sub: 'Configuration options for fine-tuning pattern matching',
    cols: { option: 'Option', type: 'Type', default: 'Default', description: 'Description' },
    coreHeading: 'Core Options',
    coreBadge: 'minimatch compatible',
    extendedHeading: 'Extended Options',
    extendedBadge: 'new in v0.3.0',
    callbackHeading: 'Callback Options',
    callbackBadge: 'new in v0.3.0',
    examplesHeading: 'Examples',
    core: [
      { name: 'dot', type: 'boolean', default: 'false', description: 'Match dotfiles (files starting with .). By default, * and ? do not match leading dots.' },
      { name: 'nocase', type: 'boolean', default: 'false', description: 'Perform case-insensitive matching.' },
      { name: 'nonegate', type: 'boolean', default: 'false', description: 'Suppress negation behavior with leading !.' },
      { name: 'nobrace', type: 'boolean', default: 'false', description: 'Do not expand brace patterns like {a,b,c}.' },
      { name: 'noext', type: 'boolean', default: 'false', description: 'Disable extglob patterns like ?(a|b), *(a|b), etc.' },
      { name: 'noglobstar', type: 'boolean', default: 'false', description: 'Disable ** matching across directory boundaries.' },
      { name: 'nocomment', type: 'boolean', default: 'false', description: 'Suppress treating # as a comment character.' },
      { name: 'matchBase', type: 'boolean', default: 'false', description: 'If pattern has no slashes, match basename of the path. foo matches bar/baz/foo.' },
      { name: 'partial', type: 'boolean', default: 'false', description: 'Partial match: pattern can match a portion of the path.' },
      { name: 'flipNegate', type: 'boolean', default: 'false', description: 'Returns true for negated patterns that do not match.' },
      { name: 'preserveMultipleSlashes', type: 'boolean', default: 'false', description: 'Do not collapse multiple slashes (a//b stays as a//b).' },
      { name: 'optimizationLevel', type: 'number', default: '1', description: 'Regex optimization level: 0 = none, 1 = safe (default), 2 = aggressive.' },
      { name: 'platform', type: 'string', default: 'process.platform', description: 'Platform for path handling: "win32", "darwin", "linux", etc.' },
      { name: 'windowsPathsNoEscape', type: 'boolean', default: 'false', description: 'On Windows, treat \\ as path separator, not escape character.' },
      { name: 'allowWindowsEscape', type: 'boolean', default: 'platform !== "win32"', description: 'Allow \\ as escape character on Windows.' },
      { name: 'nocaseMagicOnly', type: 'boolean', default: 'false', description: 'Only apply nocase to magic portions of the pattern.' },
      { name: 'magicalBraces', type: 'boolean', default: 'false', description: 'Treat brace expansion as magic (affects hasMagic()).' },
      { name: 'debug', type: 'boolean', default: 'false', description: 'Enable debug output.' },
    ],
    extended: [
      { name: 'ignore', type: 'string | string[]', default: 'undefined', description: 'Patterns to exclude from matching.' },
      { name: 'failglob', type: 'boolean', default: 'false', description: 'Throw error if no matches found (takes precedence over nonull).' },
      { name: 'maxLength', type: 'number', default: '65536', description: 'Maximum pattern length. Prevents ReDoS attacks.' },
      { name: 'expandRange', type: 'function', default: 'undefined', description: 'Custom function for expanding ranges in brace patterns.' },
      { name: 'bash', type: 'boolean', default: 'false', description: 'Follow bash matching rules more strictly.' },
      { name: 'contains', type: 'boolean', default: 'false', description: 'Match pattern anywhere in string (not just full match).' },
      { name: 'format', type: 'function', default: 'undefined', description: 'Custom function for formatting strings before matching.' },
      { name: 'flags', type: 'string', default: 'undefined', description: 'Regex flags to use in generated regex.' },
      { name: 'strictBrackets', type: 'boolean', default: 'false', description: 'Throw error if brackets, braces, or parens are imbalanced.' },
      { name: 'literalBrackets', type: 'boolean', default: 'false', description: 'Escape brackets to match literal [ and ].' },
      { name: 'keepQuotes', type: 'boolean', default: 'false', description: 'Retain quotes in the generated regex.' },
      { name: 'unescape', type: 'boolean', default: 'false', description: 'Remove backslashes preceding escaped characters.' },
    ],
    callbacks: [
      { name: 'onMatch', type: 'function', default: 'undefined', description: 'Called when a pattern matches. Receives match result object.' },
      { name: 'onIgnore', type: 'function', default: 'undefined', description: 'Called when a pattern is ignored. Receives match result object.' },
      { name: 'onResult', type: 'function', default: 'undefined', description: 'Called for all results. Receives match result object.' },
    ],
  },
  security: {
    heading: 'Security',
    sub: 'Built-in protection against common vulnerabilities',
    cve: {
      title: 'CVE-2022-3517 Protection',
      p1: 'The original minimatch is vulnerable to Regular Expression Denial of Service (ReDoS) via CVE-2022-3517. Malicious patterns can cause catastrophic backtracking, freezing your application.',
      p2: 'minimatch-fast uses picomatch internally, which is specifically designed to avoid backtracking issues and is not vulnerable to this CVE.',
    },
    brace: {
      title: 'Brace Expansion Limits',
      p1Pre: 'Unconstrained brace expansion can be exploited to create denial of service attacks. A pattern like',
      p1Post: 'would generate a million patterns, consuming all available memory.',
      p2: 'minimatch-fast limits brace expansion to 10,000 patterns maximum and range expansion to 1,000 items, preventing DoS attacks.',
    },
    input: {
      title: 'Input Validation',
      p1: 'The original minimatch accepts invalid inputs that can cause unexpected behavior or runtime errors deep in the call stack.',
      p2: 'minimatch-fast validates both path and pattern arguments upfront, throwing descriptive TypeErrors immediately. Pattern length is also limited to prevent DoS.',
    },
    summary: {
      title: 'Security Features',
      items: [
        'Not affected by CVE-2022-3517 (ReDoS)',
        'Maximum 10,000 patterns from brace expansion',
        'Maximum 1,000 items in range expansion ({1..N})',
        'No catastrophic backtracking in regex',
        'Graceful fallback for oversized patterns',
        'Input type validation for path and pattern',
        'Pattern length limits (max 65,536 characters)',
      ],
    },
  },
  typescript: {
    heading: 'TypeScript Support',
    sub: 'Full type definitions included',
    introPre: 'minimatch-fast ships with complete TypeScript definitions. All types are exported and ready to use without installing separate',
    introPost: 'packages.',
    exportedHeading: 'Exported Types',
    types: [
      { name: 'minimatch', desc: 'The main function' },
      { name: 'Minimatch', desc: 'The Minimatch class' },
      { name: 'MinimatchOptions', desc: 'Configuration options interface' },
      { name: 'MMRegExp', desc: 'Extended RegExp with index info' },
      { name: 'ParseReturn', desc: 'Type for parsed pattern segments' },
      { name: 'AST', desc: 'Type for the abstract syntax tree' },
    ],
  },
  tests: {
    heading: 'Testing & Compatibility',
    sub: 'Comprehensive test suite ensures reliability',
    categories: [
      { name: 'Unit Tests', count: 42, description: 'Core functionality tests' },
      { name: 'Compatibility Tests', count: 196, description: 'Behavior parity with minimatch' },
      { name: 'Edge Case Tests', count: 64, description: 'Windows paths, extended options, dotfiles' },
      { name: 'Security Tests', count: 23, description: 'CVE-2022-3517 and input validation tests' },
      { name: 'Verification Tests', count: 53, description: 'POSIX classes, Unicode, regex edge cases' },
      { name: 'Regression Tests', count: 24, description: 'Cache correctness, hasMagic, makeRe, escape alignment' },
    ],
    totalBadge: '402 tests total',
    totalText: 'Every release is verified against the original minimatch test suite plus additional tests for edge cases, Windows paths, and security vulnerabilities.',
    runHeading: 'Running Tests',
    reportHeading: 'Reporting Issues',
    reportIntro: 'Found a compatibility issue? Please open an issue on GitHub with:',
    reportItems: [
      'The pattern and path that produces different results',
      'Expected behavior (what minimatch returns)',
      'Actual behavior (what minimatch-fast returns)',
      'Any relevant options used',
    ],
    reportLink: 'Open an issue on GitHub',
  },
  changelog: {
    heading: 'Changelog',
    sub: 'Project evolution and version history',
    typeLabels: {
      added: 'added',
      changed: 'changed',
      security: 'security',
      fixed: 'fixed',
      removed: 'removed',
    },
    versions: [
      {
        version: '0.4.0',
        date: '20/07/2026',
        tag: 'Current',
        highlights: [
          'Cache correctness fixes',
          'hasMagic() and makeRe() parity with minimatch',
          'escape/unescape 1:1 alignment',
          '402 tests'
        ],
        changes: [
          { type: 'fixed', text: 'Cache key now includes every matching-affecting option (contains, bash, flags, ignore, maxLength, strictBrackets, literalBrackets, keepQuotes, unescape, magicalBraces)' },
          { type: 'fixed', text: 'hasMagic() returns false for literal patterns, matching minimatch' },
          { type: 'fixed', text: 'makeRe() honors negated patterns (!*.js), matching minimatch' },
          { type: 'fixed', text: 'nonull option no longer leaks between calls through the pattern cache' },
          { type: 'changed', text: 'escape()/unescape() aligned 1:1 with minimatch: braces only escaped with magicalBraces: true' },
          { type: 'changed', text: 'Fast paths fall back to the full engine when options they cannot honor are present' },
          { type: 'security', text: 'maxLength is now also enforced before fast-path matching' },
          { type: 'security', text: 'Releases published via npm trusted publishing (OIDC) with Sigstore provenance' },
          { type: 'added', text: '24 new regression tests (402 total)' },
        ]
      },
      {
        version: '0.3.0',
        date: '01/02/2026',
        highlights: [
          '15 new picomatch options',
          'Callback support',
          'Better error messages',
          '378 tests'
        ],
        changes: [
          { type: 'added', text: 'Extended picomatch options: ignore, failglob, maxLength, expandRange, bash, contains, format, flags' },
          { type: 'added', text: 'Bracket options: strictBrackets, literalBrackets, keepQuotes, unescape' },
          { type: 'added', text: 'Callback options: onMatch, onIgnore, onResult' },
          { type: 'changed', text: 'Improved maxLength error messages with pattern length and limit details' },
          { type: 'changed', text: 'failglob now shows how many paths were searched' },
          { type: 'security', text: 'maxLength now validates for positive finite numbers' },
          { type: 'added', text: '22 new tests for extended options' },
        ]
      },
      {
        version: '0.2.3',
        date: '01/02/2026',
        highlights: [
          'Input validation for path',
          'Clean code improvements',
          'Dead code removal',
          '356 tests'
        ],
        changes: [
          { type: 'security', text: 'Added type validation for path parameter in minimatch()' },
          { type: 'changed', text: 'Fixed generic error message to descriptive message' },
          { type: 'removed', text: 'Removed console.warn from library code' },
          { type: 'removed', text: 'Removed dead code (hasMagicChars, escapeRegex, hasBraces)' },
          { type: 'changed', text: 'Consistent operators (?? instead of || for defaults)' },
          { type: 'added', text: 'Tests for path validation (5 cases)' },
        ]
      },
      {
        version: '0.2.2',
        date: '31/01/2026',
        highlights: [
          'Security audit',
          'Dependency updates',
          'Clean code review'
        ],
        changes: [
          { type: 'security', text: 'Security audit completed' },
          { type: 'changed', text: 'Updated dependencies' },
          { type: 'changed', text: 'Clean code improvements' },
        ]
      },
      {
        version: '0.2.1',
        date: '19/01/2026',
        highlights: [
          'Pattern length validation',
          'Landing page',
          'Benchmarks'
        ],
        changes: [
          { type: 'security', text: 'Added pattern length validation (max 65,536 chars)' },
          { type: 'added', text: 'Landing page with documentation' },
          { type: 'added', text: 'Benchmark suite comparing with original minimatch' },
        ]
      },
      {
        version: '0.2.0',
        date: '29/12/2025',
        highlights: [
          'LRU pattern cache (500 entries)',
          'Fast paths for simple patterns',
          'Brace expansion cache (200 entries)',
          'Cache utility functions'
        ],
        performance: '9.4x faster average',
        changes: [
          { type: 'added', text: 'Pattern cache for compiled Minimatch instances' },
          { type: 'added', text: 'Fast paths for *, *.js, ???, .* patterns' },
          { type: 'added', text: 'Brace expansion cache' },
          { type: 'added', text: 'clearCache() and getCacheSize() utilities' },
          { type: 'changed', text: 'Pre-computed regex flags in Minimatch class' },
          { type: 'changed', text: 'Optimized basename extraction' },
          { type: 'changed', text: 'Smarter Windows path normalization' },
        ]
      },
      {
        version: '0.1.0',
        date: '10/11/2025',
        tag: 'Initial Release',
        highlights: [
          '100% API compatible with minimatch',
          'Powered by picomatch engine',
          'Full TypeScript support',
          'Dual ESM/CJS exports'
        ],
        performance: '7-29x faster',
        changes: [
          { type: 'added', text: 'Initial release of minimatch-fast' },
          { type: 'added', text: '100% API compatibility with minimatch v10.x' },
          { type: 'added', text: 'Full TypeScript support with type definitions' },
          { type: 'added', text: 'Dual ESM and CommonJS module exports' },
          { type: 'added', text: 'Comprehensive test suite (302 tests)' },
          { type: 'added', text: 'GitHub Actions CI/CD pipeline' },
          { type: 'security', text: 'Not affected by CVE-2022-3517 (ReDoS)' },
          { type: 'security', text: 'Limits on brace expansion to prevent DoS' },
        ]
      }
    ],
  },
  footer: {
    tagline1: 'Drop-in replacement for minimatch.',
    tagline2: 'Up to 36x faster. Zero vulnerabilities.',
    linksHeading: 'Links',
    creditsHeading: 'Credits',
    mitLabel: 'MIT License',
    bottom: 'MIT License. Built with',
  },
  codeBlock: {
    copyAria: 'Copy code',
    copy: 'copy',
    copied: 'copied!',
  },
};
