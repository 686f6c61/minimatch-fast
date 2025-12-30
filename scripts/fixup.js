#!/usr/bin/env node

/**
 * @fileoverview Post-build fixup script for dual ESM/CommonJS support
 *
 * This script runs after TypeScript compilation to add package.json files
 * to the dist/cjs and dist/esm directories. These package.json files tell
 * Node.js how to resolve the module format:
 *
 * - dist/cjs/package.json: { "type": "commonjs" }
 * - dist/esm/package.json: { "type": "module" }
 *
 * Without these files, Node.js would not know which module system to use
 * for the compiled JavaScript files.
 *
 * This script is run automatically as part of: npm run build
 *
 * @author 686f6c61
 * @see https://github.com/686f6c61/minimatch-fast
 * @license MIT
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

// Create package.json for CommonJS
const cjsPackageJson = {
  type: 'commonjs'
};

// Create package.json for ESM
const esmPackageJson = {
  type: 'module'
};

// Write CJS package.json
const cjsDir = path.join(distDir, 'cjs');
if (fs.existsSync(cjsDir)) {
  fs.writeFileSync(
    path.join(cjsDir, 'package.json'),
    JSON.stringify(cjsPackageJson, null, 2) + '\n'
  );
  console.log('Created dist/cjs/package.json');
}

// Write ESM package.json
const esmDir = path.join(distDir, 'esm');
if (fs.existsSync(esmDir)) {
  fs.writeFileSync(
    path.join(esmDir, 'package.json'),
    JSON.stringify(esmPackageJson, null, 2) + '\n'
  );
  console.log('Created dist/esm/package.json');
}

console.log('Fixup complete!');
