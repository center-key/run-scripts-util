# run-scripts-util
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Organize npm package.json scripts into groups of easy to manage commands (CLI tool designed for use in npm package.json scripts)_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/run-scripts-util/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/run-scripts-util.svg)](https://www.npmjs.com/package/run-scripts-util)
[![Build](https://github.com/center-key/run-scripts-util/actions/workflows/run-spec-on-push.yaml/badge.svg)](https://github.com/center-key/run-scripts-util/actions/workflows/run-spec-on-push.yaml)

**run-scripts-util** reads the `runScriptsConfig` settings in your **package.son** to get
groups (arrays) of commands to execute.

**Turn the traditional hard-to-follow commands:**
```json
"scripts": {
   "clean": "rimraf build dist",
   "compile-ts": "tsc",
   "compile-less": "lessc src/web-app/style.less build/web-app/style.css",
   "compile-html": "replacer src/web-app --ext=.html build/web-app",
   "graphics": "copy-folder src/graphics build/web-app/graphics",
   "pretest": "npm run clean && npm run compile-ts && npm run compile-less && npm run compile-html && npm run graphics",
   "test": "mocha spec"
},
```
**into easy-to-read named groups (arrays) of commands:**
```json
"runScriptsConfig": {
   "clean": [
      "rimraf build dist"
   ],
   "compile": [
      "tsc",
      "lessc       src/web-app/style.less  build/web-app/style.css",
      "replacer    src/web-app --ext=.html build/web-app",
      "copy-folder src/graphics            build/web-app/graphics"
   ]
},
"scripts": {
   "pretest": "run-scripts clean compile",
   "test": "mocha spec"
},
```
Each group of commands is executed in order, and the commands within each group are by default
executed in serial (synchronously) but can optionally be executed in parallel (asynchronously).

![screenshot](screenshot.png)

## A) Setup
Install package for node:
```shell
$ npm install --save-dev run-scripts-util
```

## B) Usage
### 1. npm package.json scripts
Use `run-scripts` in the `"scripts"` section of your **package.json** file and add a
parameter naming the key in `runScriptsConfig` holding the group (array) of commands to
execute.

Example **package.json** scripts:
```json
   "scripts": {
      "build": "run-scripts clean compile",
   },
```

### 2. CLI flags
Command-line flags:
| Flag                  | Description                                                     | Value      |
| --------------------- | ----------------------------------------------------------------| ---------- |
| `--continue-on-error` | Do not throw an exception if a task exits with an error status. | N/A        |
| `--note`              | Place to add a comment only for humans.                         | **string** |
| `--only`              | Execute just one command in the group (starts with 1).          | **number** |
| `--parallel`          | Execute all commands within each group asynchronously.          | N/A        |
| `--quiet`             | Suppress informational messages.                                | N/A        |
| `--verbose`           | Add script group name to informational messages.                | N/A        |

### 3. Example CLI usage
Examples:
   - `run-scripts clean compile`<br>
   Executes the `clean` group of commands and then execute the `compile` group fo commands.

   - `run-scripts clean compile --quiet`<br>
   Does not display information messages.

   - `run-scripts clean compile --quiet '--note=Listen to silence'`<br>
   Notes are handy for adding a short comment.

   - `run-scripts compile --verbose --only=2`<br>
   Executes just the second command in the `compile` group.

   - `run-scripts lint watch --parallel`<br>
   Executes all the `lint` commands in parallel and then after all the commands are finished executes
   the `watch` commands in parallel.

_**Note:** Single quotes in commands are normalized so they work cross-platform and avoid the errors often encountered on Microsoft Windows._

### 4. Skip a command
To _comment out_ a command prepend two slashes (`//`) to the command.

In the example below, the first `tsc` command will be skipped while the `tsc --verbose` command will be executed:
 ```json
"runScriptsConfig": {
   "compile": [
      "//tsc",
      "tsc --verbose",
      "lessc src/web-app/style.less build/web-app/style.css"
   ]
}
```

### 5. Debug a command
To manually run a single command, use `npx` from the terminal plus the `--only` flag.

For example, to run the third command in the `compile` group by itself:
```shell
$ npx run-scripts compile --only=3
```

## C) Application Code
Even though **run-scripts-util** is primarily intended for build scripts, the package can be used programmatically in ESM and TypeScript projects.

Example:
``` typescript
import { runScripts } from 'run-scripts-util';

const options = { quiet: false };
runScripts.exec('compile', options);
runScripts.execParallel('watch', options);
```

See the **TypeScript Declarations** at the top of [run-scripts.ts](src/run-scripts.ts) for documentation.

<br>

---
**CLI Build Tools for package.json**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🪺 [recursive-exec](https://github.com/center-key/recursive-exec):&nbsp; _Run a command on each file in a folder and its subfolders_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm package.json scripts into groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/run-scripts-util/issues](https://github.com/center-key/run-scripts-util/issues)

[MIT License](LICENSE.txt)
