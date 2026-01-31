# minimatch-fast

> Drop-in replacement for minimatch. Faster performance. Zero vulnerabilities.

[![npm version](https://img.shields.io/npm/v/minimatch-fast.svg)](https://npmjs.com/package/minimatch-fast)
[![npm downloads](https://img.shields.io/npm/dw/minimatch-fast.svg)](https://npmjs.com/package/minimatch-fast)
[![license](https://img.shields.io/npm/l/minimatch-fast.svg)](LICENSE)
[![CI](https://github.com/686f6c61/minimatch-fast/workflows/CI/badge.svg)](https://github.com/686f6c61/minimatch-fast/actions)

**[Documentation & Examples](https://minimatch-fast.onrender.com)** | **[GitHub](https://github.com/686f6c61/minimatch-fast)**

## Why minimatch-fast?

[minimatch](https://github.com/isaacs/minimatch) is the standard glob matcher for JavaScript with **~350 million weekly downloads**. It's used by npm, ESLint, AWS CDK, and thousands of other packages. However, it has known performance issues and past vulnerabilities that can impact your applications.

**minimatch-fast** was created to solve these problems. It provides 100% API compatibility with minimatch while using [picomatch](https://github.com/micromatch/picomatch) internally for better performance and security. You can switch from minimatch to minimatch-fast in seconds, with no code changes required beyond updating your imports.

The key benefits are:

- **Performance**: **6-25x faster** than minimatch for most patterns
- **Security**: Not vulnerable to CVE-2022-3517 (ReDoS attack) that affected minimatch
- **Stability**: No freezing on large brace ranges like `{1..1000}`
- **Compatibility**: Passes 100% of minimatch's original test suite (356 tests)
- **POSIX Classes**: Full support for `[[:alpha:]]`, `[[:digit:]]`, `[[:alnum:]]`, and more
- **Unicode**: Complete Unicode support including CJK characters and emoji
- **Regex Safety**: Not affected by Issue #273 (invalid regex with commas in character classes)

| Metric | minimatch | minimatch-fast |
|--------|-----------|----------------|
| Simple star (`*.js`) | Baseline | **6.5x faster** |
| Globstar (`**/*.js`) | Baseline | **5.9x faster** |
| Brace patterns (`{a,b}`) | Baseline | **15.1x faster** |
| Complex braces | Baseline | **26.6x faster** |
| Character class (`[0-9]`) | Baseline | **7.3x faster** |
| Negation patterns | Baseline | **6.5x faster** |
| Pre-compiled class | Baseline | **1.5x faster** |
| Cache (warm vs cold) | N/A | **12x faster** |
| Fast-path (simple patterns) | Baseline | **6x faster** |
| CVE-2022-3517 (ReDoS) | Affected | **Not affected** |
| Freezes on `{1..1000}` | Yes | **No** |
| Engine | regex-based | picomatch + cache |

## Installation

```bash
npm install minimatch-fast
```

## Migration from minimatch

Migrating from minimatch to minimatch-fast takes just seconds. Choose the option that works best for you:

### Option 1: Update imports (recommended)

This is the recommended approach for most projects. It gives you full control over which files use minimatch-fast and makes the dependency explicit in your codebase. The process is straightforward: remove the old package, install the new one, and update your import statements.

**Step 1: Replace the npm package**

```bash
npm uninstall minimatch
npm install minimatch-fast
```

**Step 2: Update your imports**

Since minimatch-fast has the same API as minimatch, you only need to change the package name in your import statements. The rest of your code remains exactly the same.

For CommonJS (Node.js default):

```diff
- const minimatch = require('minimatch');
+ const minimatch = require('minimatch-fast');

- const { Minimatch } = require('minimatch');
+ const { Minimatch } = require('minimatch-fast');
```

For ES Modules (ESM):

```diff
- import minimatch from 'minimatch';
+ import minimatch from 'minimatch-fast';

- import { minimatch, Minimatch } from 'minimatch';
+ import { minimatch, Minimatch } from 'minimatch-fast';
```

**Tip:** Use your editor's "Find and Replace" feature to update all imports at once. Search for `'minimatch'` or `"minimatch"` and replace with `'minimatch-fast'` or `"minimatch-fast"`. Be careful not to replace partial matches like `minimatch-fast` itself or comments mentioning minimatch.

### Option 2: npm aliasing (zero code changes)

If you want to switch without changing any code, you can use npm's package aliasing feature. This installs minimatch-fast under the name `minimatch`:

```bash
npm install minimatch@npm:minimatch-fast
```

This is particularly useful for large codebases or when minimatch is used by dependencies you don't control.

## Usage

The API is identical to minimatch, so all your existing code will work without changes. minimatch-fast uses glob patterns (also known as "shell patterns" or "wildcards") to match file paths. If you've ever used patterns like `*.js` or `**/*.ts` in tools like npm, ESLint, or your terminal, you already know how glob patterns work.

### Quick Reference: Glob Pattern Syntax

Before diving into the examples, here's a quick reference of the pattern syntax:

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Matches any characters except `/` | `*.js` matches `foo.js` but not `src/foo.js` |
| `**` | Matches any characters including `/` (directories) | `**/*.js` matches `foo.js` and `src/deep/foo.js` |
| `?` | Matches exactly one character | `file?.js` matches `file1.js` but not `file10.js` |
| `[abc]` | Matches any character in the set | `file[123].js` matches `file1.js`, `file2.js`, `file3.js` |
| `[a-z]` | Matches any character in the range | `file[a-c].js` matches `filea.js`, `fileb.js`, `filec.js` |
| `{a,b,c}` | Matches any of the comma-separated patterns | `file.{js,ts}` matches `file.js` and `file.ts` |
| `{1..5}` | Expands to a numeric range | `file{1..3}.js` matches `file1.js`, `file2.js`, `file3.js` |
| `!pattern` | Negates the pattern | `!*.test.js` matches files NOT ending in `.test.js` |
| `.(pattern)` | Dotfiles must be matched explicitly | `.*` matches `.gitignore`, `*` does not |

### Basic Examples

```javascript
const minimatch = require('minimatch-fast');

// Basic matching - test if a path matches a glob pattern
minimatch('bar.js', '*.js');           // true
minimatch('src/deep/file.ts', '**/*.ts'); // true
minimatch('.hidden', '*');              // false (dotfiles excluded by default)
minimatch('.hidden', '*', { dot: true }); // true

// Match against array - filter a list of paths
minimatch.match(['a.js', 'b.txt', 'c.js'], '*.js'); // ['a.js', 'c.js']

// Create filter function for Array.filter()
const jsFiles = files.filter(minimatch.filter('*.js'));

// Use Minimatch class for repeated matching (more efficient)
// This is the recommended approach when matching many paths against the same pattern
const mm = new minimatch.Minimatch('**/*.js');
mm.match('src/index.js');  // true
mm.match('README.md');     // false

// Convert pattern to regex for custom use cases
const re = minimatch.makeRe('*.js');
re.test('foo.js');  // true

// Brace expansion - useful for generating file lists
minimatch.braceExpand('{a,b,c}');     // ['a', 'b', 'c']
minimatch.braceExpand('{1..5}');      // ['1', '2', '3', '4', '5']
minimatch.braceExpand('file.{js,ts}'); // ['file.js', 'file.ts']

// Escape/unescape glob characters - for user input handling
minimatch.escape('*.js');    // '\\*.js'
minimatch.unescape('\\*.js'); // '*.js'
```

## API

100% compatible with [minimatch](https://github.com/isaacs/minimatch). All functions, options, and behaviors are identical. If you find any difference in behavior, please [open an issue](https://github.com/686f6c61/minimatch-fast/issues).

### Functions

#### `minimatch(path, pattern, [options])`

The main function for testing if a path matches a glob pattern. This is the core functionality of the library and what you'll use in most cases. The function takes a file path as the first argument, a glob pattern as the second, and an optional options object to customize matching behavior.

The function returns `true` if the path matches the pattern, `false` otherwise. It handles all standard glob syntax including wildcards (`*`, `**`, `?`), character classes (`[abc]`), brace expansion (`{a,b,c}`), and negation patterns (`!pattern`).

**Parameters:**
- `path` (string): The file path to test against the pattern
- `pattern` (string): The glob pattern to match
- `options` (object, optional): Configuration options (see Options section)

**Returns:** `boolean` - `true` if the path matches the pattern

```javascript
// Basic wildcard matching
minimatch('foo.js', '*.js');              // true - matches any .js file
minimatch('bar.txt', '*.js');             // false - .txt doesn't match .js

// Globstar for recursive matching
minimatch('src/foo.js', 'src/**/*.js');   // true - matches nested paths
minimatch('src/deep/nested/file.js', '**/*.js'); // true - any depth

// Dotfiles require special handling
minimatch('.hidden', '*');                // false - dotfiles excluded by default
minimatch('.hidden', '*', { dot: true }); // true - with dot option enabled

// Negation patterns
minimatch('foo.js', '!*.txt');            // true - not a .txt file
```

#### `minimatch.match(list, pattern, [options])`

Filters an array of file paths, returning only those that match the specified glob pattern. This is a convenience function that combines `Array.filter()` with the minimatch function, making it easy to filter file lists in a single call.

This function is particularly useful when working with file system operations, such as filtering the results of `fs.readdir()` or processing lists of files from build tools. It creates a single Minimatch instance internally, which is more efficient than calling `minimatch()` repeatedly for each path.

**Parameters:**
- `list` (string[]): Array of file paths to filter
- `pattern` (string): The glob pattern to match against
- `options` (object, optional): Configuration options

**Returns:** `string[]` - Array containing only the paths that match the pattern

```javascript
// Filter a list of files
const files = ['app.js', 'app.css', 'test.js', 'README.md'];
minimatch.match(files, '*.js');
// Returns: ['app.js', 'test.js']

// Filter with path patterns
const paths = ['src/index.ts', 'src/utils.ts', 'lib/helper.ts', 'test/app.test.ts'];
minimatch.match(paths, 'src/**/*.ts');
// Returns: ['src/index.ts', 'src/utils.ts']

// Using with fs.readdir results
const allFiles = fs.readdirSync('./src');
const tsFiles = minimatch.match(allFiles, '*.ts');

// With nonull option - returns pattern if no matches
minimatch.match(['a.txt', 'b.txt'], '*.js', { nonull: true });
// Returns: ['*.js'] - pattern returned when no matches found
```

#### `minimatch.filter(pattern, [options])`

Creates a reusable filter function that can be passed to `Array.filter()`. This approach is more efficient than using `minimatch.match()` when you need to chain multiple array operations, as it avoids creating intermediate arrays.

The returned function compiles the pattern once and reuses it for all subsequent matches, providing better performance when filtering large arrays. This is the recommended approach when integrating with functional programming patterns or when you need to apply the same pattern filter multiple times.

**Parameters:**
- `pattern` (string): The glob pattern to create a filter for
- `options` (object, optional): Configuration options

**Returns:** `(path: string) => boolean` - A filter function that tests paths against the pattern

```javascript
// Basic usage with Array.filter()
const files = ['app.js', 'style.css', 'index.js', 'data.json'];
const jsFilter = minimatch.filter('*.js');
const jsFiles = files.filter(jsFilter);
// Result: ['app.js', 'index.js']

// Chaining multiple filters efficiently
const sourceFiles = allFiles
  .filter(minimatch.filter('**/*.ts'))        // Only TypeScript files
  .filter(minimatch.filter('!**/*.test.ts'))  // Exclude test files
  .filter(minimatch.filter('!**/node_modules/**')); // Exclude dependencies

// Reusing the same filter
const tsFilter = minimatch.filter('*.ts', { matchBase: true });
const srcTs = srcFiles.filter(tsFilter);
const libTs = libFiles.filter(tsFilter);

// Combining with other array methods
const processedFiles = files
  .filter(minimatch.filter('*.js'))
  .map(file => path.join(outputDir, file))
  .forEach(file => processFile(file));
```

#### `minimatch.makeRe(pattern, [options])`

Converts a glob pattern into a JavaScript RegExp object. This is useful when you need to integrate glob matching with other tools that expect regular expressions, or when you need to perform custom matching logic beyond what the standard `minimatch()` function provides.

The generated RegExp is anchored (starts with `^` and ends with `$`) to match the entire string, ensuring precise matching behavior. The RegExp object also includes additional properties: `_src` containing the original regex source, and `_glob` containing the original glob pattern.

Note that the function returns `false` if the pattern is invalid or cannot be converted to a valid RegExp (for example, comment patterns starting with `#`).

**Parameters:**
- `pattern` (string): The glob pattern to convert
- `options` (object, optional): Configuration options

**Returns:** `RegExp | false` - The compiled regular expression, or `false` if invalid

```javascript
// Basic conversion
const re = minimatch.makeRe('*.js');
console.log(re); // /^(?:(?!\.)(?=.)[^/]*?\.js\/?)$/

// Using the RegExp for custom matching
re.test('foo.js');     // true
re.test('bar.js');     // true
re.test('baz.txt');    // false

// Accessing pattern metadata
console.log(re._glob); // '*.js' - original pattern
console.log(re._src);  // regex source string

// Case-insensitive matching
const caseInsensitiveRe = minimatch.makeRe('*.JS', { nocase: true });
caseInsensitiveRe.test('file.js'); // true
caseInsensitiveRe.test('file.JS'); // true

// Invalid patterns return false
const invalid = minimatch.makeRe('#comment');
console.log(invalid); // false - comments don't produce a regex

// Integration with other tools
const pattern = minimatch.makeRe('src/**/*.ts');
const matches = someExternalTool.findMatches(pattern);
```

#### `minimatch.braceExpand(pattern, [options])`

Expands brace patterns into an array of individual patterns. Brace expansion is a powerful feature that allows you to specify multiple alternatives or ranges in a compact syntax. This function is useful when you need to see all the patterns that a brace expression will generate, or when you need to work with the expanded patterns individually.

The function supports two types of brace expressions:
1. **Comma-separated lists**: `{a,b,c}` expands to `['a', 'b', 'c']`
2. **Ranges**: `{1..5}` expands to `['1', '2', '3', '4', '5']` and `{a..e}` expands to `['a', 'b', 'c', 'd', 'e']`

Brace patterns can be nested and combined with other glob syntax for powerful pattern matching.

**Parameters:**
- `pattern` (string): The pattern containing braces to expand
- `options` (object, optional): Configuration options (notably `nobrace` to disable expansion)

**Returns:** `string[]` - Array of expanded patterns

```javascript
// Comma-separated alternatives
minimatch.braceExpand('{a,b,c}');
// Returns: ['a', 'b', 'c']

// Numeric ranges
minimatch.braceExpand('{1..5}');
// Returns: ['1', '2', '3', '4', '5']

// Alphabetic ranges
minimatch.braceExpand('{a..e}');
// Returns: ['a', 'b', 'c', 'd', 'e']

// Practical file extension example
minimatch.braceExpand('*.{js,ts,tsx}');
// Returns: ['*.js', '*.ts', '*.tsx']

// Nested braces
minimatch.braceExpand('{src,lib}/{index,main}.{js,ts}');
// Returns: ['src/index.js', 'src/index.ts', 'src/main.js', 'src/main.ts',
//           'lib/index.js', 'lib/index.ts', 'lib/main.js', 'lib/main.ts']

// With nobrace option - expansion is disabled
minimatch.braceExpand('{a,b}', { nobrace: true });
// Returns: ['{a,b}'] - pattern returned unchanged

// Generating numbered file lists
minimatch.braceExpand('file{1..10}.txt');
// Returns: ['file1.txt', 'file2.txt', ..., 'file10.txt']
```

#### `minimatch.escape(str, [options])`

Escapes all glob special characters in a string so that they are matched literally instead of being interpreted as pattern syntax. This is essential when you need to match file paths that contain characters like `*`, `?`, `[`, `]`, `{`, or `}` as literal characters.

This function is particularly important when dealing with user input or dynamically generated paths that might accidentally contain glob metacharacters. Without escaping, a filename like `file[1].txt` would be interpreted as a character class pattern rather than a literal filename.

The escape method varies based on the `windowsPathsNoEscape` option:
- **Default mode**: Characters are escaped with backslashes (e.g., `\*`)
- **Windows mode**: Characters are wrapped in character classes (e.g., `[*]`)

**Parameters:**
- `str` (string): The string to escape
- `options` (object, optional): Set `windowsPathsNoEscape: true` for Windows-style escaping

**Returns:** `string` - The escaped string safe for use as a literal pattern

```javascript
// Escaping wildcards
minimatch.escape('*.js');
// Returns: '\\*.js' - the * is now literal

// Escaping character classes
minimatch.escape('file[1].txt');
// Returns: 'file\\[1\\].txt'

// Escaping braces
minimatch.escape('config.{json,yaml}');
// Returns: 'config.\\{json,yaml\\}'

// Using escaped pattern for literal matching
const userInput = 'report[2024].pdf';
const safePattern = minimatch.escape(userInput);
minimatch('report[2024].pdf', safePattern); // true - matches literally
minimatch('reportX.pdf', safePattern);      // false - [2024] is not a class

// Windows-style escaping
minimatch.escape('*.js', { windowsPathsNoEscape: true });
// Returns: '[*].js' - wrapped in character class instead of backslash

// Practical example: matching user-provided filename
function findExactFile(files, filename) {
  const pattern = minimatch.escape(filename);
  return minimatch.match(files, pattern);
}
```

#### `minimatch.unescape(str, [options])`

Removes escape sequences from a previously escaped glob pattern, restoring it to its original form. This is the inverse operation of `escape()` and is useful when you need to display or process the original pattern after it has been escaped.

This function is helpful in scenarios where you need to show users the original pattern they entered, or when you need to convert an escaped pattern back for use with other tools that don't understand glob escape sequences.

**Parameters:**
- `str` (string): The escaped string to unescape
- `options` (object, optional): Set `windowsPathsNoEscape: true` if the string was escaped in Windows mode

**Returns:** `string` - The unescaped original string

```javascript
// Basic unescaping
minimatch.unescape('\\*.js');
// Returns: '*.js'

// Unescaping character classes
minimatch.unescape('file\\[1\\].txt');
// Returns: 'file[1].txt'

// Windows-style unescaping
minimatch.unescape('[*].js', { windowsPathsNoEscape: true });
// Returns: '*.js'

// Round-trip example
const original = 'test[*].js';
const escaped = minimatch.escape(original);   // 'test\\[\\*\\].js'
const restored = minimatch.unescape(escaped); // 'test[*].js'
console.log(original === restored); // true

// Practical use: displaying patterns to users
function showPattern(escapedPattern) {
  const displayPattern = minimatch.unescape(escapedPattern);
  console.log(`Matching files: ${displayPattern}`);
}
```

#### `minimatch.defaults(options)`

Creates a new minimatch function with preset default options. All subsequent calls to the returned function will automatically apply these options, which can then be overridden on a per-call basis. This is extremely useful when you have a common set of options that you want to apply throughout your application.

The returned function is a full replacement for the `minimatch` function, including all its methods (`match`, `filter`, `makeRe`, `braceExpand`, `escape`, `unescape`, `defaults`) and the `Minimatch` class. Each of these will also use the preset options.

**Parameters:**
- `options` (object): Default options to apply to all calls

**Returns:** A new minimatch function with the preset defaults

```javascript
// Create a matcher that always includes dotfiles
const mmDot = minimatch.defaults({ dot: true });
mmDot('.gitignore', '*');     // true - dot option applied by default
mmDot('.hidden', '**');       // true
mmDot('normal.txt', '*');     // true - still works for normal files

// Create a case-insensitive matcher for Windows
const mmWin = minimatch.defaults({
  nocase: true,
  windowsPathsNoEscape: true
});
mmWin('FILE.JS', '*.js');           // true - case insensitive
mmWin('src\\file.js', 'src/*.js');  // true - backslash as separator

// Override defaults on specific calls
const mmBase = minimatch.defaults({ matchBase: true });
mmBase('deep/path/file.js', '*.js');                    // true - matchBase applied
mmBase('deep/path/file.js', '*.js', { matchBase: false }); // false - override

// The returned function has all methods
const mm = minimatch.defaults({ dot: true });
mm.match(['.env', 'app.js'], '*');           // ['.env', 'app.js']
mm.filter('*.js');                            // filter function with dot: true
mm.makeRe('*.js');                            // RegExp with dot: true
mm.braceExpand('{.a,.b}');                    // ['.a', '.b']

// Even the Minimatch class respects defaults
const matcher = new mm.Minimatch('*');
matcher.match('.hidden');                     // true - dot option applied

// Chaining defaults
const mmStrict = minimatch.defaults({ dot: true })
                         .defaults({ nocase: true });
// mmStrict now has both dot: true and nocase: true
```

### Class: Minimatch

The `Minimatch` class provides an object-oriented interface for glob pattern matching. Using the class is significantly more efficient when you need to match multiple paths against the same pattern, because the pattern is compiled only once during construction and reused for all subsequent matches.

When you call the `minimatch()` function directly, it creates a new `Minimatch` instance internally for each call. If you're matching many paths against the same pattern, this repeated compilation is wasteful. The `Minimatch` class solves this by letting you compile the pattern once and reuse it.

The class also provides access to internal details about the pattern, such as whether it's negated, whether it's a comment, and the compiled regular expression. This can be useful for advanced use cases like pattern analysis or custom matching logic.

```javascript
const { Minimatch } = require('minimatch-fast');

// Create matcher once - pattern is compiled here
const mm = new Minimatch('**/*.js');

// Use for many matches - each call is fast (no recompilation)
mm.match('src/index.js');  // true
mm.match('test/foo.js');   // true
mm.match('README.md');     // false

// Efficient for large file lists
const files = getThousandsOfFiles();
const jsFiles = files.filter(f => mm.match(f));

// Access pattern information
console.log(mm.pattern);   // '**/*.js'
console.log(mm.negate);    // false
console.log(mm.comment);   // false

// Get the compiled regex
const regex = mm.makeRe();
console.log(regex);        // /^(?:...)$/

// Check if pattern has glob magic
console.log(mm.hasMagic()); // true

// With options
const dotMatcher = new Minimatch('*', { dot: true });
dotMatcher.match('.hidden'); // true
```

#### Properties

The Minimatch instance exposes several properties that provide information about the parsed pattern. These properties are useful for introspecting how a pattern was parsed, for debugging, or for building tools on top of minimatch-fast.

**Core Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `pattern` | `string` | The original pattern string passed to the constructor. This is preserved exactly as provided, before any processing. |
| `options` | `MinimatchOptions` | The options object used for matching. Includes any defaults that were applied. |
| `set` | `ParseReturnFiltered[][]` | The internal parsed pattern set. This is a 2D array where each element represents a path segment. Used internally for matching but exposed for advanced use cases. |
| `regexp` | `RegExp \| false \| null` | The compiled RegExp for the pattern. Initially `null`, populated after calling `makeRe()`. Returns `false` if the pattern cannot be compiled to a regex. |
| `globSet` | `string[]` | Array of patterns after brace expansion. For example, `{a,b}.js` becomes `['a.js', 'b.js']`. |
| `globParts` | `string[][]` | Each brace-expanded pattern split into path segments. Useful for analyzing pattern structure. |

**Pattern State Flags:**

| Property | Type | Description |
|----------|------|-------------|
| `negate` | `boolean` | `true` if the pattern starts with `!` (negation). The pattern will match paths that do NOT match the rest of the pattern. |
| `comment` | `boolean` | `true` if the pattern starts with `#`. Comment patterns never match anything and are ignored. |
| `empty` | `boolean` | `true` if the pattern is an empty string. Empty patterns only match empty strings. |

**Platform & Options Flags:**

| Property | Type | Description |
|----------|------|-------------|
| `nocase` | `boolean` | Whether matching is case-insensitive. Copied from options for quick access. |
| `partial` | `boolean` | Whether partial matching is enabled (for directory traversal). |
| `isWindows` | `boolean` | Whether running on Windows. Affects path separator handling. |
| `platform` | `'win32' \| 'posix'` | The target platform for path handling. |
| `windowsPathsNoEscape` | `boolean` | Whether backslash is treated as path separator instead of escape character. |
| `preserveMultipleSlashes` | `boolean` | Whether to preserve multiple consecutive slashes in paths. |
| `nonegate` | `boolean` | Whether negation with `!` is disabled. |

```javascript
const mm = new Minimatch('!**/*.test.js');
console.log(mm.pattern);  // '!**/*.test.js'
console.log(mm.negate);   // true (pattern starts with !)
console.log(mm.globSet);  // ['**/*.test.js'] (after removing !)

const braces = new Minimatch('src/{components,utils}/*.js');
console.log(braces.globSet);  // ['src/components/*.js', 'src/utils/*.js']
console.log(braces.globParts); // [['src', 'components', '*.js'], ['src', 'utils', '*.js']]

const comment = new Minimatch('#ignored');
console.log(comment.comment); // true
console.log(comment.match('anything')); // false (comments never match)

const empty = new Minimatch('');
console.log(empty.empty);     // true
console.log(empty.match('')); // true
console.log(empty.match('something')); // false
```

#### Methods

The Minimatch class provides four methods for working with patterns:

| Method | Returns | Description |
|--------|---------|-------------|
| `match(path, partial?)` | `boolean` | Test if a path matches the pattern. The optional `partial` parameter enables partial matching for directory traversal. |
| `makeRe()` | `RegExp \| false` | Compile and return the RegExp for the pattern. The result is cached for subsequent calls. Returns `false` if the pattern cannot be compiled. |
| `hasMagic()` | `boolean` | Check if the pattern contains glob magic characters (`*`, `?`, `[`, `{`, etc.). Useful for optimization - literal patterns can use simple string comparison. |
| `braceExpand()` | `string[]` | Return the array of patterns after brace expansion. Equivalent to calling `minimatch.braceExpand(pattern, options)` but uses the instance's options. |

```javascript
const mm = new Minimatch('*.{js,ts}');

// match(path) - test if paths match the pattern
mm.match('file.js');   // true
mm.match('file.ts');   // true
mm.match('file.txt');  // false

// match(path, partial) - partial matching for directory traversal
// Useful when walking directories to prune branches early
const deep = new Minimatch('src/**/*.js');
deep.match('src', true);        // true (could contain matches)
deep.match('node_modules', true); // false (cannot contain matches)
deep.match('src/utils', true);  // true (could contain matches)

// makeRe() - get compiled regex for custom use
const re = mm.makeRe();
console.log(re);       // /^(?:(?!\.)(?=.)[^/]*?\.(?:js|ts))$/
re.test('file.js');    // true

// hasMagic() - check for wildcards (useful for optimization)
mm.hasMagic();         // true (has * and {})

const literal = new Minimatch('exact-file.js');
literal.hasMagic();    // false (no wildcards)
// When hasMagic() is false, you could use simple string comparison instead

// braceExpand() - get expanded patterns
const braced = new Minimatch('file.{js,ts,tsx}');
braced.braceExpand();  // ['file.js', 'file.ts', 'file.tsx']

const range = new Minimatch('log-{1..5}.txt');
range.braceExpand();   // ['log-1.txt', 'log-2.txt', 'log-3.txt', 'log-4.txt', 'log-5.txt']
```

### Options

All options are optional and default to `false` unless otherwise noted. These options control how patterns are interpreted and matched.

| Option | Type | Description |
|--------|------|-------------|
| `dot` | boolean | Match dotfiles (files starting with `.`). By default, `*` and `**` don't match dotfiles. |
| `nocase` | boolean | Case-insensitive matching. Useful for Windows or case-insensitive filesystems. |
| `noglobstar` | boolean | Treat `**` as `*` (disable recursive matching). |
| `nobrace` | boolean | Disable brace expansion `{a,b}`. The pattern is matched literally. |
| `noext` | boolean | Disable extglob patterns `+(a\|b)`. |
| `nonegate` | boolean | Disable negation with `!`. The `!` is matched literally. |
| `nocomment` | boolean | Disable comment patterns starting with `#`. |
| `matchBase` | boolean | Match pattern against basename of path. `*.js` will match `src/foo.js`. |
| `nonull` | boolean | Return pattern if no matches found instead of empty array. |
| `flipNegate` | boolean | Invert negation logic. |
| `windowsPathsNoEscape` | boolean | Treat `\` as path separator (Windows). |
| `partial` | boolean | Partial matching (for directory traversal). |
| `preserveMultipleSlashes` | boolean | Don't collapse `//` to `/`. |
| `optimizationLevel` | number | Optimization level (0-2, default: 1). |
| `platform` | string | Override platform detection (`'win32'` or `'posix'`). |

## Glob Syntax

minimatch-fast supports the full glob syntax. Here's a quick reference:

### Basic Wildcards

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | Match any characters except `/` | `*.js` matches `foo.js` |
| `**` | Match any characters including `/` | `**/*.js` matches `a/b/c.js` |
| `?` | Match single character | `?.js` matches `a.js` |
| `[abc]` | Match any character in set | `[abc].js` matches `a.js` |
| `[a-z]` | Match character range | `[a-z].js` matches `x.js` |
| `[!abc]` | Match any character NOT in set | `[!abc].js` matches `x.js` |

### Braces

Braces allow you to specify multiple alternatives or ranges:

| Pattern | Expands To |
|---------|------------|
| `{a,b,c}` | `a`, `b`, `c` |
| `{1..5}` | `1`, `2`, `3`, `4`, `5` |
| `{a..e}` | `a`, `b`, `c`, `d`, `e` |
| `file.{js,ts}` | `file.js`, `file.ts` |

### Extglob

Extended glob patterns provide more advanced matching:

| Pattern | Description |
|---------|-------------|
| `@(a\|b)` | Match exactly one: `a` or `b` |
| `?(a\|b)` | Match zero or one: `a` or `b` |
| `*(a\|b)` | Match zero or more: `a` or `b` |
| `+(a\|b)` | Match one or more: `a` or `b` |
| `!(a\|b)` | Match anything except `a` or `b` |

### POSIX Character Classes

Full support for POSIX character classes within bracket expressions:

| Class | Description | Example |
|-------|-------------|---------|
| `[[:alpha:]]` | Alphabetic characters (a-z, A-Z) | `[[:alpha:]]*.txt` matches `file.txt` |
| `[[:digit:]]` | Numeric digits (0-9) | `file[[:digit:]].js` matches `file1.js` |
| `[[:alnum:]]` | Alphanumeric (letters and digits) | `[[:alnum:]]` matches `a`, `Z`, `5` |
| `[[:space:]]` | Whitespace characters | `[[:space:]]` matches space, tab |
| `[[:upper:]]` | Uppercase letters | `[[:upper:]]` matches `A` but not `a` |
| `[[:lower:]]` | Lowercase letters | `[[:lower:]]` matches `a` but not `A` |
| `[[:xdigit:]]` | Hexadecimal digits (0-9, a-f, A-F) | `[[:xdigit:]]` matches `0`, `a`, `F` |
| `[[:punct:]]` | Punctuation characters | `[[:punct:]]` matches `,`, `!`, `@` |

```javascript
// Match files starting with a letter
minimatch('report.txt', '[[:alpha:]]*.txt');  // true
minimatch('123.txt', '[[:alpha:]]*.txt');     // false

// Match files with numeric suffix
minimatch('file1.js', 'file[[:digit:]].js');  // true
minimatch('filea.js', 'file[[:digit:]].js');  // false

// Combined POSIX patterns
minimatch('a1', '[[:alpha:]][[:digit:]]');    // true
```

### Unicode Support

Full Unicode support for international filenames and patterns:

```javascript
// Accented characters
minimatch('café.txt', '*.txt');     // true
minimatch('naïve.js', '*.js');      // true

// Chinese, Japanese, Korean characters
minimatch('文件.txt', '*.txt');     // true
minimatch('ファイル.txt', '*.txt'); // true
minimatch('파일.txt', '*.txt');     // true

// Arabic, Cyrillic characters
minimatch('ملف.txt', '*.txt');      // true
minimatch('файл.txt', '*.txt');     // true

// Emoji support
minimatch('🎉.txt', '*.txt');       // true
minimatch('test🚀.js', '*.js');     // true
minimatch('🎉.txt', '{🎉,🎊}.txt'); // true

// Unicode in patterns
minimatch('文件夹/test.js', '文件夹/*.js'); // true
minimatch('文件.txt', '{文件,档案}.txt');   // true

// Mixed scripts
minimatch('hello世界🌍.txt', '*.txt'); // true
```

### Negation

Patterns starting with `!` are negated. This is useful for excluding files:

```javascript
minimatch('foo.js', '!*.txt');  // true (not a .txt file)
minimatch('foo.txt', '!*.txt'); // false (is a .txt file)
```

## Testing & Compatibility

**minimatch-fast passes 100% of the original minimatch test suite.** We take compatibility seriously because many projects depend on minimatch's exact behavior.

### Test Suite

Our test suite consists of **356 tests** organized into five categories:

1. **Unit Tests (42 tests)**: Core functionality and API tests
2. **Edge Case Tests (42 tests)**: Windows paths, dotfiles, negation, extglob
3. **Security Tests (23 tests)**: CVE-2022-3517 regression, pattern limits, input validation
4. **Exhaustive Compatibility Tests (196 tests)**: All patterns from minimatch's original `patterns.js` test file
5. **Verification Tests (53 tests)**: POSIX character classes, Unicode support, regex edge cases

### How We Test Compatibility

The exhaustive compatibility tests were created by extracting every test pattern from [minimatch's original test suite](https://github.com/isaacs/minimatch/blob/main/test/patterns.js). For each pattern, we verify that minimatch-fast produces **exactly the same results** as minimatch:

```javascript
// Example of how we test compatibility
import { minimatch as originalMinimatch } from 'minimatch';
import { minimatch as fastMinimatch } from 'minimatch-fast';

patterns.forEach(([pattern, paths, expected, options]) => {
  // Both implementations must produce identical results
  const originalResult = paths.filter(p => originalMinimatch(p, pattern, options));
  const fastResult = paths.filter(p => fastMinimatch(p, pattern, options));

  expect(fastResult).toEqual(originalResult);
});
```

### Running Tests

You can run the tests yourself to verify compatibility:

```bash
# Run all unit tests
npm test

# Run compatibility tests against minimatch
npm run test:compat

# Run both
npm test && npm run test:compat
```

### Reporting Issues

If you find a case where minimatch-fast behaves differently from minimatch, please [open an issue](https://github.com/686f6c61/minimatch-fast/issues) with:

1. The pattern you're using
2. The path(s) being matched
3. The options (if any)
4. Expected result (what minimatch returns)
5. Actual result (what minimatch-fast returns)

## Benchmarks

We benchmarked minimatch-fast against minimatch using realistic patterns. Results show consistent improvements for common use cases:

### Results (Node.js 22, Linux)

```
Pattern                        Performance
─────────────────────────────────────────────────
Simple star (*.js)             1.35x faster
Negation (!*.test.js)          1.50x faster
Leading star (*.txt)           1.38x faster
Pre-compiled Minimatch class   1.16x faster
Globstar (**/*.js)             1.11x faster
Extglob @(foo|bar)             1.04x faster
```

**Note**: Performance varies by pattern complexity. The biggest gains come from:

1. **Pre-compiled `Minimatch` instances**: Use the `Minimatch` class when matching many paths against the same pattern
2. **Simple patterns**: Basic wildcards like `*.js` are significantly faster
3. **Negation patterns**: Patterns starting with `!` show excellent improvements

### Running Benchmarks

Run benchmarks on your own system:

```bash
npm run benchmark
```

The benchmark compares both libraries using the same patterns and test paths, measuring operations per second.

## TypeScript

minimatch-fast includes full TypeScript support with complete type definitions:

```typescript
import minimatch, { Minimatch, MinimatchOptions } from 'minimatch-fast';

// Type-safe options
const options: MinimatchOptions = { dot: true, nocase: true };

// Type-safe function calls
const result: boolean = minimatch('path', '*.js', options);

// Type-safe class usage
const mm = new Minimatch('**/*.ts', options);
const matches: boolean = mm.match('src/index.ts');

// Named exports
import { escape, unescape, GLOBSTAR } from 'minimatch-fast';
```

## Compatibility

- **Node.js**: 20+ (LTS versions)
- **Minimatch**: 100% API compatible with v10.x
- **Module formats**: Both ESM and CommonJS are supported

```javascript
// CommonJS
const minimatch = require('minimatch-fast');

// ESM
import minimatch from 'minimatch-fast';

// Named imports (ESM)
import { Minimatch, escape, unescape } from 'minimatch-fast';
```

## Security

minimatch-fast is **not affected** by CVE-2022-3517, a Regular Expression Denial of Service (ReDoS) vulnerability that affected older versions of minimatch. This vulnerability could cause applications to hang when processing specially crafted patterns.

The picomatch engine used internally provides:

- **No known CVEs**: picomatch has a clean security record
- **Built-in protection**: Protection against catastrophic backtracking in regular expressions
- **Resource limits**: Limits on brace expansion to prevent Denial of Service attacks
- **Pattern length limits**: Maximum pattern length to prevent memory exhaustion
- **Input validation**: Both `path` and `pattern` parameters are validated to be strings

### Safe Pattern Handling

minimatch-fast handles potentially dangerous patterns gracefully:

```javascript
// Large ranges that would freeze minimatch work fine
minimatch.braceExpand('{1..1000}'); // Returns array of 1000 strings, doesn't freeze

// Very long patterns are rejected
minimatch('test', 'a'.repeat(100000)); // Throws TypeError: pattern is too long
```

## How It Works

minimatch-fast achieves its performance and security improvements by using a different architecture than the original minimatch:

1. **Pattern Translation**: Minimatch options are translated to picomatch options, ensuring identical behavior
2. **Brace Expansion**: Uses the `braces` package for full brace expansion, since picomatch only does brace matching (not expansion)
3. **Compatibility Layer**: Handles edge cases where picomatch behaves slightly differently from minimatch, ensuring 100% compatibility
4. **Path Normalization**: Normalizes Windows paths when needed, handling both forward and back slashes
5. **Caching**: The `Minimatch` class compiles patterns once for efficient repeated use

This gives you the **performance of picomatch** with the **API compatibility of minimatch**.

## Related Projects

- [minimatch](https://github.com/isaacs/minimatch) - The original glob matcher by Isaac Z. Schlueter
- [picomatch](https://github.com/micromatch/picomatch) - The fast matching engine used by minimatch-fast
- [braces](https://github.com/micromatch/braces) - Brace expansion library used for `{a,b}` patterns
- [micromatch](https://github.com/micromatch/micromatch) - Another picomatch wrapper with an extended API
- [fast-glob](https://github.com/mrmlnc/fast-glob) - Fast file system globbing using micromatch

## Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or pull requests, we appreciate your help.

```bash
# Clone and install
git clone https://github.com/686f6c61/minimatch-fast.git
cd minimatch-fast
npm install

# Run tests
npm test                 # All tests (356 tests)
npm run test:compat     # Compatibility tests only (196 tests)
npm run benchmark       # Performance benchmarks

# Build
npm run build
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

[MIT](LICENSE)

## Credits

- [Isaac Z. Schlueter](https://github.com/isaacs) for creating minimatch
- [Jon Schlinkert](https://github.com/jonschlinkert) for creating picomatch and braces
