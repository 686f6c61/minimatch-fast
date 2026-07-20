<!--
  CHANGELOG for minimatch-fast

  Author: 686f6c61
  Repository: https://github.com/686f6c61/minimatch-fast
  License: MIT
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Performance

- **Brace patterns**: compiled natively into a single regex (picomatch accepts braces directly) instead of one matcher per expansion. Complex braces went from 0.43x (3x slower than minimatch) to **3.4x faster**; warm brace matching from 17x to **29x**
- **Multiple expansions**: combined into a single picomatch matcher (array compilation) instead of N separate matchers looped with `.some()`
- **match() hot path**: eliminated double matcher invocation on misses (trailing-slash variant was always tried, even when identical), replaced `.some()` closures with a plain loop, and basename is now only computed when actually needed
- Engine-vs-engine (precompiled, no cache): now 2-6x faster than minimatch on most pattern shapes
- Benchmark rewritten with unbiased methodology: A/B/B/A interleaving, warmup discarded, medians over 15 rounds, deterministic 1000-path corpus, four scenarios (compile / precompiled / cold / warm)

### Changed

- **Honest metrics**: replaced unverifiable "6-25x faster" claims with measured "up to 29x faster" (warm real-world workload); README benchmark section documents the full methodology and the one remaining slower case (simple 2-way braces, 0.65x)

## [0.4.0] - 2026-07-20

### Fixed

- **Cache key**: The pattern cache now includes every option that affects compilation or matching (`contains`, `bash`, `flags`, `ignore`, `maxLength`, `strictBrackets`, `literalBrackets`, `keepQuotes`, `unescape`, `magicalBraces`, and more). Previously, calls with the same pattern but different options could incorrectly reuse a cached matcher. Function-valued options (`format`, `expandRange`, callbacks) are keyed by identity
- **`hasMagic()`**: Now returns `false` for literal patterns (e.g., `'foo.js'`), matching minimatch. Previously it always returned `true` because every pattern part was compiled to a regex
- **`makeRe()`**: Negated patterns (e.g., `'!*.js'`) now produce a regex that matches everything *except* the pattern (`^(?!...).+$`), matching minimatch. Previously the negation was silently dropped
- **`nonull` option**: `minimatch.match()` now reads `nonull` from the caller's options instead of the cached instance, so cache hits no longer leak behavior between calls with different options
- **`.`/`..` handling**: Replaced fragile substring heuristic with an explicit check against the expanded pattern set. Behavior is unchanged for valid inputs
- **Tests**: Fixed `magicalBraces` test that encoded the incorrect `hasMagic()` behavior

### Changed

- **`escape()`/`unescape()`**: Now 1:1 aligned with minimatch. Braces (`{` and `}`) are only escaped when `magicalBraces: true` is set (previously they were always escaped). `unescape()` removes brace escapes by default unless `magicalBraces: false`
- **Fast paths**: Disabled when options they cannot honor are present (`flags`, `ignore`, `format`, `contains`, `bash`, `keepQuotes`, `unescape`, `strictBrackets`, `literalBrackets`, `expandRange`, callbacks, `partial`), falling back to the full matching engine

### Security

- **`maxLength` enforcement**: Pattern length is now also validated before fast-path matching (fast paths previously skipped the `Minimatch` constructor, where validation happened)

### Internal

- Added 24 regression tests covering all fixed bugs (402 total tests)
- Consistent `.js` extension in type-only imports

## [0.3.2] - 2026-04-06

### Changed

- Migrated landing page URL from Render to self-hosted infrastructure (minimatch-fast.686f6c61.dev)

## [0.3.1] - 2026-02-01

### Added

- **Documentation**: Complete examples for all 15 extended options in README
- **Landing page**: Interactive examples grid for extended options

### Changed

- Improved documentation with practical use cases for each option

## [0.3.0] - 2026-02-01

### Added

- **Extended picomatch options**: 15 new options from picomatch now available
  - `ignore`: Patterns to exclude from matching (string or array)
  - `failglob`: Throw error if no matches found (takes precedence over `nonull`)
  - `maxLength`: Configurable maximum pattern length (default: 65536)
  - `expandRange`: Custom function for range expansion in braces
  - `bash`: Follow bash matching rules more strictly
  - `contains`: Match pattern anywhere in string
  - `format`: Custom function for formatting strings before matching
  - `flags`: Regex flags to use in generated regex
  - `strictBrackets`: Throw on imbalanced brackets/braces/parens
  - `literalBrackets`: Escape brackets to match literal characters
  - `keepQuotes`: Retain quotes in generated regex
  - `unescape`: Remove backslashes preceding escaped characters
- **Callback options**: `onMatch`, `onIgnore`, `onResult` for pattern matching events
- **Tests**: 22 new tests for extended options (378 total tests)

### Changed

- **Better error messages**: `maxLength` errors now show pattern length and limit details
- **Improved failglob**: Error message now includes number of paths searched
- **Validation**: `maxLength` now validates for positive finite numbers

### Security

- `maxLength` option now rejects invalid values (negative, NaN, Infinity)

## [0.2.3] - 2026-01-31

### Added

- **Test coverage**: Added test for non-string `path` parameter validation in `security.test.ts`

### Changed

- Total tests: 355 -> 356

## [0.2.2] - 2026-01-31

### Changed

- **Improved error messages**: Replaced unclear error message in `matchOne()` with descriptive text
- **Refactored cache logic**: Extracted duplicated LRU eviction code into `addToBraceCache()` helper function
- **Better documentation**: Added detailed comments explaining cache size choices and `optimizationLevel` option
- **Input validation**: Added type validation for `path` parameter in `minimatch()` function
- **Simplified logic**: Cleaned up `.` and `..` directory handling in `match()` method
- **Consistent operators**: Unified `windowsPathsNoEscape` handling to use `??` operator consistently

### Fixed

- **Security**: Updated transitive dependency `lodash` to resolve CVE prototype pollution vulnerability (GHSA-xxjr-mmjv-4gpg)

### Removed

- Removed `console.warn` from brace expansion (libraries should not write to console)
- Removed unused functions: `hasBraces()`, `hasMagicChars()`, `escapeRegex()`, `mergeOptions()`
- Removed unused `TranslatedOptions` type and `special` object from options translator
- Removed obsolete comments that described already-implemented optimizations

### Internal

- Cleaner codebase following clean code principles
- All 355 tests passing

## [0.2.0] - 2025-12-29

### Added

- **Pattern cache**: LRU cache for compiled Minimatch instances (500 entries max)
- **Fast paths**: Optimized string-based matching for simple patterns (`*`, `*.js`, `???`)
- **Brace expansion cache**: Cache for expanded brace patterns (200 entries max)
- Cache utility functions: `minimatch.clearCache()` and `minimatch.getCacheSize()`

### Changed

- Improved performance across all pattern types
- Pre-computed regex flags in Minimatch class (avoids regex on every match)
- Optimized path basename extraction (avoids split on every match)
- Smarter Windows path normalization (only when needed)

### Performance

Benchmark results vs minimatch:

| Pattern | Speedup |
|---------|---------|
| Simple star (`*.js`) | **6.5x faster** |
| Globstar (`**/*.js`) | **5.9x faster** |
| Brace patterns (`{a,b}`) | **15.1x faster** |
| Complex braces | **26.6x faster** |
| Character class (`[0-9]`) | **7.3x faster** |
| Negation patterns | **6.5x faster** |
| Pre-compiled class | **1.5x faster** |
| **Average** | **9.4x faster** |

## [0.1.0] - 2025-11-10

### Added

- Initial release of minimatch-fast
- 100% API compatibility with minimatch v10.x
- Uses picomatch engine for 7-29x better performance
- Full TypeScript support with included type definitions
- Dual ESM and CommonJS module exports
- Comprehensive test suite:
  - Compatibility tests against original minimatch
  - Edge case tests for Windows paths, dotfiles, negation
  - Regression tests for CVE-2022-3517 and performance issues
- Performance benchmarks comparing against minimatch
- GitHub Actions CI/CD pipeline

### Security

- Not affected by CVE-2022-3517 (ReDoS vulnerability)
- Built-in protection against catastrophic backtracking
- Limits on brace expansion to prevent DoS attacks

### Performance

- 7x faster for simple star patterns (`*.js`)
- 29x faster for range patterns (`{a..z}*.txt`)
- 4x faster for brace patterns (`{a,b,c}`)
- 2x faster for globstar patterns (`**/*.js`)

