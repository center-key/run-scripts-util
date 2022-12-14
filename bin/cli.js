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
//          "replacer src/web-app --ext=.html --pkg build/my-app"
//       ]
//    },
//    "scripts": {
//       "pretest": "run-scripts clean compile",
//       "test": "mocha spec",
//    },
//
// Usage from command line:
//    $ npm install --global run-scripts-util
//    $ run-scripts compile --quiet

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { runScripts } from '../dist/run-scripts.js';

// Parameters and flags
const validFlags = ['note', 'only', 'quiet', 'verbose'];
const cli =        cliArgvUtil.parse(validFlags);
const groups =     cli.params;  //list of script set names

// Run scripts
const error =
   cli.invalidFlag ? cli.invalidFlagMsg :
   !cli.paramCount ? 'Must provide at lease one script group to run.' :
   null;
if (error)
   throw Error('[run-scripts-util] ' + error);
const options = {
   only:    cli.flagOn.only ? Number(cli.flagMap.only) : null,
   quiet:   cli.flagOn.quiet,
   verbose: cli.flagOn.verbose,
   };
groups.forEach(group => runScripts.exec(group, options));
