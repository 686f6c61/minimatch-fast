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

