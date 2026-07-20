/**
 * @fileoverview Fair performance comparison: minimatch-fast vs minimatch
 *
 * Methodology (designed to avoid the biases of the previous benchmark):
 *
 * - A/B/B/A interleaving: both libraries alternate execution order across
 *   rounds to cancel JIT warmup and machine drift.
 * - Warmup rounds are discarded; medians are reported, not single runs.
 * - Four scenarios are measured separately, because "which is faster"
 *   depends on HOW the library is used:
 *     1. compile       - pattern compilation only (new Minimatch instances)
 *     2. precompiled   - matching with pre-compiled instances (pure engine,
 *                        no cache involvement on either side)
 *     3. end-to-end    - minimatch(path, pattern) calls, cache CLEARED each
 *                        round (worst case for minimatch-fast: pays
 *                        compilation on every round, like minimatch always
 *                        does)
 *     4. warm function - minimatch(path, pattern) repeated with the cache
 *                        intact. This is the real-world usage pattern
 *                        (same .gitignore/eslintignore patterns matched
 *                        against thousands of files) and it is where the
 *                        LRU cache helps. minimatch has no pattern cache;
 *                        this asymmetry is a product feature and is
 *                        disclosed as such, not hidden.
 * - Deterministic corpus: 1000 pseudo-random repo-like paths generated
 *   from a fixed seed, so results are reproducible.
 * - Environment (Node version, platform, CPU) is printed for context.
 *
 * Run with: npm run benchmark
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import { performance } from 'node:perf_hooks';
import os from 'node:os';
import {
  minimatch as originalMinimatch,
  Minimatch as OriginalMinimatch,
} from 'minimatch';
import { minimatch as fastMinimatch, Minimatch } from '../src';

// ---------------------------------------------------------------------------
// Deterministic corpus: 1000 repo-like paths from a fixed seed
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCorpus(size: number): string[] {
  const rand = mulberry32(42);
  const dirs = [
    'src', 'src/components', 'src/utils', 'src/lib/core', 'test',
    'test/unit', 'test/integration', 'lib', 'dist', 'docs',
    'node_modules/lodash', 'node_modules/react', 'scripts',
    '.github/workflows', 'packages/core', 'packages/cli',
  ];
  const names = [
    'index', 'main', 'utils', 'helpers', 'engine', 'parser', 'config',
    'button', 'modal', 'api', 'server', 'client', 'store', 'router',
  ];
  const exts = ['js', 'ts', 'tsx', 'jsx', 'json', 'css', 'md', 'test.js', 'spec.ts', 'min.js'];

  const paths: string[] = [];
  for (let i = 0; i < size; i++) {
    const dir = dirs[Math.floor(rand() * dirs.length)];
    const name = names[Math.floor(rand() * names.length)];
    const ext = exts[Math.floor(rand() * exts.length)];
    const suffix = rand() < 0.3 ? Math.floor(rand() * 100) : '';
    paths.push(`${dir}/${name}${suffix}.${ext}`);
  }
  return paths;
}

const corpus = buildCorpus(1000);

// ---------------------------------------------------------------------------
// Patterns under test
// ---------------------------------------------------------------------------

const patterns = [
  { name: 'Simple star', pattern: '*.js' },
  { name: 'Globstar', pattern: '**/*.js' },
  { name: 'Braces simple', pattern: '{src,lib}/*.js' },
  { name: 'Braces complex', pattern: '{src,lib}/**/*.{js,ts,tsx}' },
  { name: 'Character class', pattern: 'file[0-9].js' },
  { name: 'Negation', pattern: '!*.test.js' },
  { name: 'Multiple globstar', pattern: '**/**/**/*.js' },
  { name: 'Extglob @()', pattern: '@(foo|bar|baz).js' },
  { name: 'Question mark', pattern: '???.js' },
];

// ---------------------------------------------------------------------------
// Measurement harness
// ---------------------------------------------------------------------------

const WARMUP_ROUNDS = 5;
const MEASURED_ROUNDS = 21;

/**
 * Inner repetitions of the corpus per measured round.
 * Single-corpus rounds take 0.05-0.2ms for fast patterns, where CPU turbo,
 * scheduling and GC jitter produce 2-3x swings between identical runs.
 * Longer samples (5x corpus) average out that machine noise; this makes the
 * harness strictly more robust, not more lenient.
 */
const INNER_REPEAT = 5;

interface Scenario {
  title: string;
  note?: string;
  original: () => void;
  fast: () => void;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Run one scenario with A/B/B/A interleaving.
 * Returns median milliseconds per round for each library.
 */
function measure(scenario: Scenario): { originalMs: number; fastMs: number } {
  const originalTimes: number[] = [];
  const fastTimes: number[] = [];

  const runOriginal = () => {
    const t0 = performance.now();
    scenario.original();
    originalTimes.push(performance.now() - t0);
  };
  const runFast = () => {
    const t0 = performance.now();
    scenario.fast();
    fastTimes.push(performance.now() - t0);
  };

  // Warmup (discarded): both libs get equal JIT exposure
  for (let i = 0; i < WARMUP_ROUNDS; i++) {
    runOriginal();
    runFast();
    originalTimes.length = 0;
    fastTimes.length = 0;
  }

  // Measured rounds, alternating order A/B/B/A to cancel drift
  for (let i = 0; i < MEASURED_ROUNDS; i++) {
    if (i % 4 < 2) {
      runOriginal();
      runFast();
    } else {
      runFast();
      runOriginal();
    }
  }

  return { originalMs: median(originalTimes), fastMs: median(fastTimes) };
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

function compileScenario(pattern: string): Scenario {
  return {
    title: `compile "${pattern}"`,
    original: () => {
      for (let i = 0; i < 100; i++) new OriginalMinimatch(pattern);
    },
    fast: () => {
      for (let i = 0; i < 100; i++) new Minimatch(pattern);
    },
  };
}

function precompiledScenario(pattern: string): Scenario {
  const origMM = new OriginalMinimatch(pattern);
  const fastMM = new Minimatch(pattern);
  return {
    title: `precompiled match "${pattern}"`,
    note: 'pure engine, no cache on either side',
    original: () => {
      for (let r = 0; r < INNER_REPEAT; r++)
        for (const p of corpus) origMM.match(p);
    },
    fast: () => {
      for (let r = 0; r < INNER_REPEAT; r++)
        for (const p of corpus) fastMM.match(p);
    },
  };
}

function endToEndColdScenario(pattern: string): Scenario {
  return {
    title: `end-to-end cold "${pattern}"`,
    note: 'function API, every call compiles (cache cleared per call)',
    original: () => {
      for (const p of corpus) originalMinimatch(p, pattern);
    },
    fast: () => {
      // Clear before EVERY call so minimatch-fast pays compilation per call,
      // exactly like minimatch (which has no cache) does. Apples to apples.
      for (const p of corpus) {
        fastMinimatch.clearCache();
        fastMinimatch(p, pattern);
      }
    },
  };
}

function warmFunctionScenario(pattern: string): Scenario {
  return {
    title: `warm function "${pattern}"`,
    note: 'function API with LRU cache (real-world globbing)',
    original: () => {
      for (let r = 0; r < INNER_REPEAT; r++)
        for (const p of corpus) originalMinimatch(p, pattern);
    },
    fast: () => {
      for (let r = 0; r < INNER_REPEAT; r++)
        for (const p of corpus) fastMinimatch(p, pattern);
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

interface Row {
  scenario: string;
  originalMs: number;
  fastMs: number;
  speedup: number;
}

const rows: Row[] = [];

console.log('');
console.log('================================================================');
console.log('       minimatch-fast vs minimatch - Fair Benchmark            ');
console.log('================================================================');
console.log('');
console.log(`  Node: ${process.version}  |  ${os.platform()} ${os.arch()}  |  ${os.cpus()[0]?.model ?? 'unknown CPU'}`);
console.log(`  Corpus: ${corpus.length} paths  |  warmup: ${WARMUP_ROUNDS} rounds  |  measured: ${MEASURED_ROUNDS} rounds (median, A/B/B/A)`);
console.log('');
console.log('  scenario                                              minimatch   minimatch-fast  speedup');
console.log('  '.padEnd(92, '-'));

function report(scenario: Scenario): void {
  const { originalMs, fastMs } = measure(scenario);
  const speedup = originalMs / fastMs;
  rows.push({ scenario: scenario.title, originalMs, fastMs, speedup });
  const note = scenario.note ? `  (${scenario.note})` : '';
  console.log(
    `  ${scenario.title.padEnd(46)} ${originalMs.toFixed(2).padStart(9)}ms ${fastMs.toFixed(2).padStart(13)}ms ${speedup.toFixed(2).padStart(9)}x${note}`
  );
}

// 1. Compilation (representative subset)
for (const { pattern } of [patterns[0]!, patterns[1]!, patterns[3]!, patterns[7]!]) {
  report(compileScenario(pattern));
}

// 2. Precompiled matching: the purest engine comparison
for (const { pattern } of patterns) {
  report(precompiledScenario(pattern));
}

// 3. End-to-end cold: function API paying compilation every round
for (const { pattern } of [patterns[0]!, patterns[1]!, patterns[3]!, patterns[7]!]) {
  report(endToEndColdScenario(pattern));
}

// 4. Warm function API: real-world repeated usage
for (const { pattern } of [patterns[0]!, patterns[1]!, patterns[3]!, patterns[7]!]) {
  report(warmFunctionScenario(pattern));
}

// Summary
console.log('');
console.log('  '.padEnd(92, '-'));

const geometricMean = (values: number[]): number =>
  Math.exp(values.reduce((s, v) => s + Math.log(v), 0) / values.length);

const speedups = rows.map((r) => r.speedup);
console.log(`  Geometric mean speedup (all ${rows.length} scenarios): ${geometricMean(speedups).toFixed(2)}x`);
console.log(`  Range: ${Math.min(...speedups).toFixed(2)}x - ${Math.max(...speedups).toFixed(2)}x`);
console.log('');
console.log('  Notes:');
console.log('  - "precompiled" is the honest engine-vs-engine comparison.');
console.log('  - "warm function" includes minimatch-fast\'s LRU cache; minimatch');
console.log('    has no pattern cache. This asymmetry is a feature of the library,');
console.log('    disclosed here explicitly.');
console.log('');
console.log('================================================================');
console.log('');
