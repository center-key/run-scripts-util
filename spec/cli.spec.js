// run-scripts-util
// CLI Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import assert from 'node:assert';
import fs     from 'node:fs';

// Setup and Utilities
import { runScripts } from '../dist/run-scripts.js';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const run = (posix) => cliArgvUtil.run(pkg, posix);

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {

   it('correctly runs parallel commands', () => {
      // Handy script:
      //    "devp": "tsc && add-dist-header build dist && rimraf spec/target/b && mocha spec/*.spec.js --grep parallel --timeout 7000",
      run('run-scripts spec-b1 spec-b2 --parallel --verbose');
      const actual = cliArgvUtil.readFolder('spec/target/b');
      const expected = [
         '1',
         '1/w.json',
         '1/x.json',
         '1/y.json',
         '1/z.json',
         '2',
         '2/w.json',
         '2/x.json',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('with two command groups correctly runs them in serial', () => {
      run('run-scripts spec-c1 spec-c2 --note=hello --quiet');
      const actual = cliArgvUtil.readFolder('spec/target/c');
      const expected = [
         '2',
         '2/last.txt',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('correctly passes commands with quotes to the shell', () => {
      run('run-scripts spec-d --note=quotes --verbose');
      const actual = cliArgvUtil.readFolder('spec/target/d');
      const expected = [
         'folder name with spaces',
         'folder name with spaces/LICENSE.txt',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('A task that fails due to an invalid option', () => {

   it('does not throw an exception when the CLI flag --continue-on-error is set', () => {
      run('run-scripts spec-e --continue-on-error');
      const actual =   cliArgvUtil.readFolder('spec/target/e');
      const expected = ['screenshot.png'];
      assertDeepStrictEqual(actual, expected);
      });

   it('throws the correct exception', () => {
      const runBadTask = () => runScripts.exec('spec-e');
      const exception = { message:
         '[run-scripts-util] Task: spec-e (step 2), Status: 1, Command: jshint . --bogus-option',
         };
      assert.throws(runBadTask, exception);
      });

   });
