// run-scripts-util
// Function exec() Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import fs from 'node:fs';

// Setup
import { runScripts } from '../dist/run-scripts.js';

////////////////////////////////////////////////////////////////////////////////
describe('Calling runScripts.exec()', () => {

   it('correctly executes a group of commands', () => {
      const options = { quiet: false, verbose: false };
      runScripts.exec('spec-a', options);
      const actual = fs.readdirSync('spec/target/a');
      const expected = [
         'cli.js',
         'cli2.js',
         'release-on-vtag.yaml',
         'run-spec-on-push.yaml',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
