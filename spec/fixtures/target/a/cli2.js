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
import { runScripts } from '../dist/run-scripts.js';

// Parameters
const validFlags =  ['compact', 'quiet'];
const args =        process.argv.slice(2);
const flags =       args.filter(arg => /^--/.test(arg));
const flagMap =     Object.fromEntries(flags.map(flag => flag.replace(/^--/, '').split('=')));
const flagOn =      Object.fromEntries(validFlags.map(flag => [flag, flag in flagMap]));
const invalidFlag = Object.keys(flagMap).find(key => !validFlags.includes(key));
const params =      args.filter(arg => !/^--/.test(arg));

// Data
const groups = params;  //list of script set names

// Run scripts
const error =
   invalidFlag ?    'Invalid flag: ' + invalidFlag :
   !params.length ? 'Must provide at lease one script group to run.' :
   null;
if (error)
   throw Error('[run-scripts-util] ' + error);
const options = {
   compact: flagOn.compact,
   quiet:   flagOn.quiet,
   };
groups.forEach(group => runScripts.exec(group, options));
