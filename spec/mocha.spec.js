// run-scripts-util
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import assert from 'assert';
import fs     from 'fs';

// Setup
import { runScripts } from '../dist/run-scripts.js';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

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

////////////////////////////////////////////////////////////////////////////////
describe('Correct error is thrown', () => {

   it('when a nonexistent command group is supplied', () => {
      const makeBogusCall = () => runScripts.exec('bogus');
      const exception =     { message: '[run-scripts-util] Cannot find commands: bogus' };
      assert.throws(makeBogusCall, exception);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {
   const run = (posix) => cliArgvUtil.run(pkg, posix);

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
   const run = (posix) => cliArgvUtil.run(pkg, posix);

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
