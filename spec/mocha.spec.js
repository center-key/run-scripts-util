// run-scripts-util
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { execSync } from 'node:child_process';
import { revWebAssets } from 'rev-web-assets';
import assert from 'assert';

// Setup
import { runScripts } from '../dist/run-scripts.js';

////////////////////////////////////////////////////////////////////////////////
describe('The "dist" folder', () => {

   it('contains the correct files', () => {
      const actual = revWebAssets.readFolderRecursive('dist');
      const expected = [
         'dist/run-scripts.d.ts',
         'dist/run-scripts.js',
         'dist/run-scripts.umd.cjs',
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
      const options = { quiet: false, verbose: false };
      runScripts.exec('spec-a', options);
      const actual = revWebAssets.readFolderRecursive('spec/fixtures/target/a');
      const expected = [
         'spec/fixtures/target/a/cli.js',
         'spec/fixtures/target/a/cli2.js',
         'spec/fixtures/target/a/release-on-vtag.yaml',
         'spec/fixtures/target/a/run-spec-on-push.yaml',
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

   it('correctly runs parallel commands', () => {
      const cmd = 'node bin/cli.js spec-b1 spec-b2 --verbose --parallel';
      execSync(cmd, { stdio: 'inherit' });
      const actual = revWebAssets.readFolderRecursive('spec/fixtures/target/b');
      const expected = [
         'spec/fixtures/target/b/1/w.json',
         'spec/fixtures/target/b/1/x.json',
         'spec/fixtures/target/b/1/y.json',
         'spec/fixtures/target/b/1/z.json',
         'spec/fixtures/target/b/2/w.json',
         'spec/fixtures/target/b/2/x.json',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   it('with two command groups correctly runs them in serial', () => {
      const cmd = 'node bin/cli.js spec-c1 spec-c2 --note=hello --quiet';
      execSync(cmd, { stdio: 'inherit' });
      const actual = revWebAssets.readFolderRecursive('spec/fixtures/target/c');
      const expected = [
         'spec/fixtures/target/c/2/last.txt',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
