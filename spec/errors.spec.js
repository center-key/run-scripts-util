// run-scripts-util
// Error Handling Specification Suite

// Imports
import assert from 'node:assert';

// Setup
import { runScripts } from '../dist/run-scripts.js';

////////////////////////////////////////////////////////////////////////////////
describe('Correct error is thrown', () => {

   it('when a nonexistent command group is supplied', () => {
      const makeBogusCall = () => runScripts.exec('bogus');
      const exception =     { message: '[run-scripts-util] Cannot find commands: bogus' };
      assert.throws(makeBogusCall, exception);
      });

   });
