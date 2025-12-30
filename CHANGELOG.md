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

