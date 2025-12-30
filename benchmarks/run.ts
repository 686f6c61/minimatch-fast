/**
 * @fileoverview Performance benchmark: minimatch-fast vs original minimatch
 *
 * This benchmark compares the performance of minimatch-fast against the
 * original minimatch library across various pattern types and use cases.
 *
 * Benchmark categories:
 * - Simple star patterns (*.js)
 * - Globstar patterns (**\/*.js)
 * - Brace patterns ({src,lib}/*.js)
 * - Character classes (file[0-9].js)
 * - Negation patterns (!*.test.js)
 * - Extglob patterns (@(foo|bar).js)
 * - Pre-compiled Minimatch class (repeated matching)
 *
 * Results show operations per second and speedup ratio.
 *
 * Run with: npm run benchmark
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import Benchmark from 'benchmark';
import { minimatch as originalMinimatch, Minimatch as OriginalMinimatch } from 'minimatch';
import { minimatch as fastMinimatch, Minimatch } from '../src';

// Test patterns of varying complexity
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

// Sample paths to match against
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

interface BenchmarkResult {
  name: string;
  pattern: string;
  originalOps: number;
  fastOps: number;
  speedup: number;
}

const results: BenchmarkResult[] = [];

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           minimatch-fast Benchmark Results                   ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('');

// Run benchmarks for each pattern
patterns.forEach(({ name, pattern }) => {
  console.log(`\n▶ ${name}: "${pattern}"`);
  console.log('─'.repeat(60));

  const suite = new Benchmark.Suite(name);

  let originalOps = 0;
  let fastOps = 0;

  suite
    .add('minimatch      ', () => {
      testPaths.forEach((p) => originalMinimatch(p, pattern));
    })
    .add('minimatch-fast ', () => {
      testPaths.forEach((p) => fastMinimatch(p, pattern));
    })
    .on('cycle', (event: Benchmark.Event) => {
      const target = event.target as Benchmark.Target;
      console.log('  ' + String(target));

      if (target.name?.includes('minimatch-fast')) {
        fastOps = target.hz || 0;
      } else {
        originalOps = target.hz || 0;
      }
    })
    .on('complete', function (this: Benchmark.Suite) {
      const fastest = this.filter('fastest').map('name' as keyof Benchmark.Target);
      const speedup = fastOps / originalOps;

      results.push({
        name,
        pattern,
        originalOps,
        fastOps,
        speedup,
      });

      if (speedup > 1) {
        console.log(`  ✓ Winner: minimatch-fast (${speedup.toFixed(2)}x faster)`);
      } else {
        console.log(`  ✗ Winner: ${fastest} (${(1 / speedup).toFixed(2)}x faster)`);
      }
    })
    .run({ async: false });
});

// Benchmark with pre-compiled Minimatch class
console.log('\n\n▶ Pre-compiled Minimatch class (repeated matching)');
console.log('─'.repeat(60));

const compilePattern = '**/*.{js,ts,tsx}';
const origMM = new OriginalMinimatch(compilePattern);
const fastMM = new Minimatch(compilePattern);

const compiledSuite = new Benchmark.Suite('Pre-compiled');
let origCompiledOps = 0;
let fastCompiledOps = 0;

compiledSuite
  .add('minimatch.Minimatch      ', () => {
    testPaths.forEach((p) => origMM.match(p));
  })
  .add('minimatch-fast.Minimatch ', () => {
    testPaths.forEach((p) => fastMM.match(p));
  })
  .on('cycle', (event: Benchmark.Event) => {
    const target = event.target as Benchmark.Target;
    console.log('  ' + String(target));

    if (target.name?.includes('minimatch-fast')) {
      fastCompiledOps = target.hz || 0;
    } else {
      origCompiledOps = target.hz || 0;
    }
  })
  .on('complete', function (this: Benchmark.Suite) {
    const speedup = fastCompiledOps / origCompiledOps;
    results.push({
      name: 'Pre-compiled class',
      pattern: compilePattern,
      originalOps: origCompiledOps,
      fastOps: fastCompiledOps,
      speedup,
    });

    console.log(
      `  ✓ Pre-compiled speedup: ${speedup.toFixed(2)}x`
    );
  })
  .run({ async: false });

// Print summary
console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                        Summary                               ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('');

console.log('  Pattern                    Speedup');
console.log('  ─────────────────────────────────────');

results.forEach(({ name, speedup }) => {
  const bar = '█'.repeat(Math.min(Math.round(speedup * 2), 40));
  const speedupStr = speedup >= 1 ? `${speedup.toFixed(1)}x faster` : `${(1 / speedup).toFixed(1)}x slower`;
  console.log(`  ${name.padEnd(24)} ${speedupStr.padEnd(12)} ${bar}`);
});

const avgSpeedup =
  results.reduce((sum, r) => sum + r.speedup, 0) / results.length;
const minSpeedup = Math.min(...results.map((r) => r.speedup));
const maxSpeedup = Math.max(...results.map((r) => r.speedup));

console.log('');
console.log('  ─────────────────────────────────────');
console.log(`  Average speedup: ${avgSpeedup.toFixed(1)}x faster`);
console.log(`  Range: ${minSpeedup.toFixed(1)}x - ${maxSpeedup.toFixed(1)}x`);
console.log('');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
