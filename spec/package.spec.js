// run-scripts-util
// Package Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import fs from 'node:fs';

// Setup
import { runScripts } from '../dist/run-scripts.js';

////////////////////////////////////////////////////////////////////////////////
describe('The "dist" folder', () => {

   it('contains the correct files', () => {
      const actual = fs.readdirSync('dist');
      const expected = [
         'run-scripts.d.ts',
         'run-scripts.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Library module', () => {

   it('is an object', () => {
      const actual =   { constructor: runScripts.constructor.name };
      const expected = { constructor: 'Object' };
      assertDeepStrictEqual(actual, expected);
      });

   it('has functions named assert(), cli(), exec(), and execParallel()', () => {
      const module = runScripts;
      const actual = Object.keys(module).sort().map(key => [key, typeof module[key]]);
      const expected = [
         ['assert',       'function'],
         ['cli',          'function'],
         ['exec',         'function'],
         ['execParallel', 'function'],
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
