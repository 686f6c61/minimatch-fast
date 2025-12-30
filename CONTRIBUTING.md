<!--
  Contributing guidelines for minimatch-fast

  Author: 686f6c61
  Repository: https://github.com/686f6c61/minimatch-fast
  License: MIT
-->

# Contributing to minimatch-fast

Thank you for your interest in contributing to minimatch-fast! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/minimatch-fast.git
   cd minimatch-fast
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building

```bash
npm run build
```

This compiles TypeScript to both CommonJS and ESM formats in the `dist/` directory.

### Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run compatibility tests against original minimatch
npm run test:compat

# Run tests with coverage
npm run test:coverage
```

### Benchmarking

```bash
npm run benchmark
```

### Type Checking

```bash
npx tsc --noEmit
```

## Compatibility Requirements

**This is critical:** minimatch-fast must maintain 100% API compatibility with minimatch v10.x.

Before submitting changes:

1. All compatibility tests must pass (`npm run test:compat`)
2. New features should not break existing minimatch behavior
3. If you're fixing a bug, add a test case that covers it

## Pull Request Process

1. **Create an issue first** for significant changes to discuss the approach
2. **Write tests** for any new functionality or bug fixes
3. **Update documentation** if you're changing the public API
4. **Run all tests** before submitting:

   ```bash
   npm run build && npm test && npm run test:compat
   ```

5. **Submit a pull request** with a clear description of:
   - What the change does
   - Why it's needed
   - How to test it

### PR Title Format

Use conventional commits format:

- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update README`
- `test: add test for edge case`
- `perf: improve matching speed`
- `refactor: restructure internal code`

## Project Structure

```
minimatch-fast/
├── src/                    # TypeScript source files
│   ├── index.ts           # Main entry point
│   ├── minimatch-class.ts # Minimatch class implementation
│   ├── types.ts           # TypeScript type definitions
│   ├── options.ts         # Options translation
│   ├── utils.ts           # Utility functions
│   ├── brace-expand.ts    # Brace expansion
│   ├── escape.ts          # Escape function
│   └── unescape.ts        # Unescape function
├── test/
│   ├── compatibility/     # Tests against original minimatch
│   ├── edge-cases/        # Edge case tests
│   └── regression/        # Regression tests
├── benchmarks/            # Performance benchmarks
├── dist/                  # Compiled output (generated)
│   ├── cjs/              # CommonJS build
│   └── esm/              # ESM build
└── scripts/              # Build scripts
```

## Adding Tests

### Compatibility Tests

When adding compatibility tests, always compare against the original minimatch:

```typescript
import originalMinimatch from 'minimatch';
import { minimatch as fastMinimatch } from '../../src';

it('should match identically', () => {
  const path = 'test/path.js';
  const pattern = '**/*.js';

  const original = originalMinimatch(path, pattern);
  const fast = fastMinimatch(path, pattern);

  expect(fast).toBe(original);
});
```

### Edge Case Tests

For edge cases, focus on unusual inputs and boundary conditions:

```typescript
it('should handle empty pattern', () => {
  expect(minimatch('', '')).toBe(true);
  expect(minimatch('foo', '')).toBe(false);
});
```

### Regression Tests

For security or performance regressions:

```typescript
it('should not freeze on pathological patterns', () => {
  const start = Date.now();

  minimatch('test', '*'.repeat(100) + 'a');

  expect(Date.now() - start).toBeLessThan(1000);
});
```

## Performance Considerations

When making changes:

1. Run benchmarks before and after
2. Avoid adding unnecessary dependencies
3. Be mindful of hot paths (matching is called frequently)
4. Consider memory allocation patterns

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion for broader topics
- Tag maintainers in PRs for review

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
