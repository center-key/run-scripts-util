#!/usr/bin/env node
//////////////////////
// run-scripts-util //
// MIT License      //
//////////////////////

// Usage in package.json:
//    "runScriptsConfig": {
//       "clean": [
//          "rimraf build dist"
//       ],
//       "compile": [
//          "tsc",
//          "lessc src/web-app/style.less build/web-app/style.css",
//          "copy-folder src/graphics build/my-app/graphics",
//          "replacer src/web-app --ext=.html build/my-app"
//       ]
//    },
//    "scripts": {
//       "pretest": "run-scripts clean compile",
//       "test": "mocha spec",
//    },
//
// Usage from command line:
//    $ npm install --save-dev run-scripts-util
//    $ npx run-scripts compile --quiet
//
// For contributors working on this project:
//    $ npm run dev

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { runScripts } from '../dist/run-scripts.js';

// Parameters and Flags
const validFlags = ['continue-on-error', 'note', 'only', 'parallel', 'quiet', 'verbose'];
const cli =        cliArgvUtil.parse(validFlags);
const groups =     cli.params;  //list of script set names

// Run scripts
const invalidOnlyUse = cli.flagOn.only && cli.paramCount !== 1;
const error =
   cli.invalidFlag ? cli.invalidFlagMsg :
   !cli.paramCount ? 'Must provide at lease one group of commands to run.' :
   invalidOnlyUse ?  'The --only flag does not support multiple groups of commands.' :
   null;
if (error)
   throw new Error('[run-scripts-util] ' + error);
const options = {
   continueOnError: cli.flagOn.continueOnError,
   only:            cli.flagOn.only ? Number(cli.flagMap.only) : null,
   quiet:           cli.flagOn.quiet,
   verbose:         cli.flagOn.verbose,
   };
const runGroup = (prevPromise, nextGroup) =>
   prevPromise.then(() => runScripts.execParallel(nextGroup, options));
if (cli.flagOn.parallel)
   groups.reduce(runGroup, Promise.resolve());
else
   groups.forEach(group => runScripts.exec(group, options));
