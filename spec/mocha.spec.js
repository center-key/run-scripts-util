// run-scripts-util
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { execSync } from 'node:child_process';
import assert from 'assert';
import fs from     'fs';

// Setup
import { runScripts } from '../dist/run-scripts.js';

////////////////////////////////////////////////////////////////////////////////
describe('The "dist" folder', () => {

   it('contains the correct files', () => {
      const actual = fs.readdirSync('dist').sort();
      const expected = [
         'run-scripts.d.ts',
         'run-scripts.js',
         'run-scripts.umd.cjs',
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

   it('has an exec() function', () => {
      const actual =   { validate: typeof runScripts.exec };
      const expected = { validate: 'function' };
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Calling runScripts.exec()', () => {

   it('correctly executes a group of commands', () => {
      const options = { quiet: false, verbose: true };
      runScripts.exec('spec-a', options);
      const actual = fs.readdirSync('spec/fixtures/target/a').sort();
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

   it('with two command groups correctly runs them in serial', () => {
      const cmd = 'node bin/cli.js spec-b1 spec-b2';
      execSync(cmd);
      const actual =   fs.readdirSync('spec/fixtures/target/b2').sort();
      const expected = ['last.txt'];
      assertDeepStrictEqual(actual, expected);
      });

   });
