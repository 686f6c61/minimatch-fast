/**
 * @fileoverview Performance benchmark: minimatch-fast vs original minimatch
 *
 * Compares performance across pattern types and optimizations:
 * - Pattern matching (simple, globstar, braces, extglob)
 * - Pre-compiled Minimatch class
 * - LRU cache effectiveness
 * - Fast-path optimizations
 *
 * Run with: npm run benchmark
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import Benchmark from 'benchmark';
import {
  minimatch as originalMinimatch,
  Minimatch as OriginalMinimatch,
} from 'minimatch';
import { minimatch as fastMinimatch, Minimatch } from '../src';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const patterns = [
  { name: 'Simple star', pattern: '*.js' },
  { name: 'Globstar', pattern: '**/*.js' },
  { name: 'Braces simple', pattern: '{src,lib}/*.js' },
  { name: 'Braces complex', pattern: '{src,lib}/**/*.{js,ts,tsx}' },
  { name: 'Character class', pattern: 'file[0-9].js' },
  { name: 'Negation', pattern: '!*.test.js' },
  { name: 'Leading star', pattern: '*.txt' },
  { name: 'Multiple globstar', pattern: '**/**/**/*.js' },
  { name: 'Extglob @()', pattern: '@(foo|bar|baz).js' },
  { name: 'Question mark', pattern: '???.js' },
];

const testPaths = [
  'index.js',
  'src/components/Button.js',
  'src/utils/helpers.ts',
  'test/unit/button.test.js',
  'node_modules/lodash/index.js',
  'lib/core/engine.tsx',
  'dist/bundle.min.js',
  'file1.js',
  'foo.js',
  'abc.js',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BenchmarkResult {
  name: string;
  pattern: string;
  originalOps: number;
  fastOps: number;
  speedup: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printHeader(title: string): void {
  console.log(`\n[*] ${title}`);
  console.log('-'.repeat(60));
}

function printWinner(speedup: number, fastestName?: string): void {
  if (speedup > 1) {
    console.log(`  [+] Winner: minimatch-fast (${speedup.toFixed(2)}x faster)`);
  } else {
    console.log(
      `  [-] Winner: ${fastestName} (${(1 / speedup).toFixed(2)}x faster)`
    );
  }
}

function runComparisonSuite(
  name: string,
  originalFn: () => void,
  fastFn: () => void
): { originalOps: number; fastOps: number } {
  const suite = new Benchmark.Suite(name);
  let originalOps = 0;
  let fastOps = 0;

  suite
    .add('minimatch      ', originalFn)
    .add('minimatch-fast ', fastFn)
    .on('cycle', (event: Benchmark.Event) => {
      const target = event.target as Benchmark.Target;
      console.log('  ' + String(target));

      if (target.name?.includes('minimatch-fast')) {
        fastOps = target.hz ?? 0;
      } else {
        originalOps = target.hz ?? 0;
      }
    })
    .run({ async: false });

  return { originalOps, fastOps };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const results: BenchmarkResult[] = [];

console.log('');
console.log('================================================================');
console.log('           minimatch-fast Benchmark Results                     ');
console.log('================================================================');

// Pattern comparison benchmarks
patterns.forEach(({ name, pattern }) => {
  printHeader(`${name}: "${pattern}"`);

  const { originalOps, fastOps } = runComparisonSuite(
    name,
    () => testPaths.forEach((p) => originalMinimatch(p, pattern)),
    () => testPaths.forEach((p) => fastMinimatch(p, pattern))
  );

  const speedup = fastOps / originalOps;
  results.push({ name, pattern, originalOps, fastOps, speedup });
  printWinner(speedup);
});

// Pre-compiled Minimatch class benchmark
printHeader('Pre-compiled Minimatch class (repeated matching)');

const compilePattern = '**/*.{js,ts,tsx}';
const origMM = new OriginalMinimatch(compilePattern);
const fastMM = new Minimatch(compilePattern);

const { originalOps: origCompiledOps, fastOps: fastCompiledOps } =
  runComparisonSuite(
    'Pre-compiled',
    () => testPaths.forEach((p) => origMM.match(p)),
    () => testPaths.forEach((p) => fastMM.match(p))
  );

const compiledSpeedup = fastCompiledOps / origCompiledOps;
results.push({
  name: 'Pre-compiled class',
  pattern: compilePattern,
  originalOps: origCompiledOps,
  fastOps: fastCompiledOps,
  speedup: compiledSpeedup,
});
console.log(`  [+] Pre-compiled speedup: ${compiledSpeedup.toFixed(2)}x`);

// Cache effectiveness benchmark (minimatch-fast only)
printHeader('Cache effectiveness (repeated patterns)');

const cacheTestPattern = '**/*.{js,ts}';
const cacheIterations = 1000;

// Clear cache before test
fastMinimatch.clearCache();

const cacheSuite = new Benchmark.Suite('Cache');
let coldOps = 0;
let warmOps = 0;

cacheSuite
  .add('Cold cache (first call per pattern)', () => {
    fastMinimatch.clearCache();
    for (let i = 0; i < 10; i++) {
      fastMinimatch(`file${i}.js`, `pattern${i}/*.js`);
    }
  })
  .add('Warm cache (repeated patterns)    ', () => {
    for (let i = 0; i < 10; i++) {
      fastMinimatch(`file${i}.js`, cacheTestPattern);
    }
  })
  .on('cycle', (event: Benchmark.Event) => {
    const target = event.target as Benchmark.Target;
    console.log('  ' + String(target));

    if (target.name?.includes('Warm')) {
      warmOps = target.hz ?? 0;
    } else {
      coldOps = target.hz ?? 0;
    }
  })
  .on('complete', () => {
    const cacheSpeedup = warmOps / coldOps;
    console.log(`  [+] Cache speedup: ${cacheSpeedup.toFixed(2)}x`);
  })
  .run({ async: false });

// Fast-path benchmark (simple patterns that bypass full parsing)
printHeader('Fast-path optimization (simple patterns)');

const fastPathPatterns = ['*.js', '*', '???', '*.txt'];
const fastPathSuite = new Benchmark.Suite('Fast-path');

fastPathSuite
  .add('minimatch (no fast-path)      ', () => {
    fastPathPatterns.forEach((p) => {
      testPaths.forEach((path) => originalMinimatch(path, p));
    });
  })
  .add('minimatch-fast (with fast-path)', () => {
    fastPathPatterns.forEach((p) => {
      testPaths.forEach((path) => fastMinimatch(path, p));
    });
  })
  .on('cycle', (event: Benchmark.Event) => {
    const target = event.target as Benchmark.Target;
    console.log('  ' + String(target));
  })
  .on('complete', function (this: Benchmark.Suite) {
    const fastest = this.filter('fastest').map(
      'name' as keyof Benchmark.Target
    );
    console.log(`  [+] Fastest: ${fastest}`);
  })
  .run({ async: false });

// Summary
console.log('\n');
console.log('================================================================');
console.log('                        Summary                                 ');
console.log('================================================================');
console.log('');
console.log('  Pattern                    Speedup');
console.log('  ---------------------------------------');

results.forEach(({ name, speedup }) => {
  const bar = '#'.repeat(Math.min(Math.round(speedup * 2), 40));
  const speedupStr =
    speedup >= 1
      ? `${speedup.toFixed(1)}x faster`
      : `${(1 / speedup).toFixed(1)}x slower`;
  console.log(`  ${name.padEnd(24)} ${speedupStr.padEnd(12)} ${bar}`);
});

const avgSpeedup =
  results.reduce((sum, r) => sum + r.speedup, 0) / results.length;
const minSpeedup = Math.min(...results.map((r) => r.speedup));
const maxSpeedup = Math.max(...results.map((r) => r.speedup));

console.log('');
console.log('  ---------------------------------------');
console.log(`  Average speedup: ${avgSpeedup.toFixed(1)}x faster`);
console.log(`  Range: ${minSpeedup.toFixed(1)}x - ${maxSpeedup.toFixed(1)}x`);
console.log('');
console.log('================================================================');
console.log('');
