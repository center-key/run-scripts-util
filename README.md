# run-scripts-util
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Organize npm scripts into named groups of easy to manage commands (CLI tool designed for use in npm scripts)_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/run-scripts-util/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/run-scripts-util.svg)](https://www.npmjs.com/package/run-scripts-util)
[![Vulnerabilities](https://snyk.io/test/github/center-key/run-scripts-util/badge.svg)](https://snyk.io/test/github/center-key/run-scripts-util)
[![Build](https://github.com/center-key/run-scripts-util/workflows/build/badge.svg)](https://github.com/center-key/run-scripts-util/actions/workflows/run-spec-on-push.yaml)

**run-scripts-util** reads the `runScriptsConfig` settings in your **package.son** to get a list (array) of commands to execute.

**Turn the traditional hard-to-follow commands:**
```json
"scripts": {
   "clean": "rimraf build dist",
   "compile-ts": "tsc",
   "compile-less": "lessc src/web-app/style.less build/web-app/style.css",
   "graphics": "copy-folder src/graphics build/my-app/graphics",
   "compile-html": "replacer src/web-app --ext=.html --pkg build/my-app",
   "pretest": "npm run clean && npm run compile-ts && npm run compile-less && npm run graphics && npm run compile-html",
   "test": "mocha spec"
},
```
**into easy-to-read named groups:**
```json
"runScriptsConfig": {
   "clean": [
      "rimraf build dist"
   ],
   "compile": [
      "tsc",
      "lessc src/web-app/style.less build/web-app/style.css",
      "copy-folder src/graphics build/my-app/graphics",
      "replacer src/web-app --ext=.html --pkg build/my-app"
   ]
},
"scripts": {
   "pretest": "run-scripts clean compile",
   "test": "mocha spec"
},
```

## A) Setup
Install package for node:
```shell
$ npm install --save-dev run-scripts-util
```

## B) Usage
### 1. npm scripts
Use `run-scripts` in the `"scripts"` section of your **package.json** file and add a
parameter naming the key in `runScriptConfig` holding the array of commands to execute.

Example **package.json** scripts:
```json
   "scripts": {
      "build": "run-scripts clean compile",
   },
```

### 2. Global
You can install **run-scripts-util** globally and then run it anywhere directly from the terminal.

Example terminal commands:
```shell
$ npm install --global run-scripts-util
$ run-scripts clean compile
```

### 3. CLI Flags
Command-line flags:
| Flag      | Description                      |
| --------- | -------------------------------- |
| `--quiet` | Suppress informational messages. |

### 4. Example CLI Usage
Examples:
   - `run-scripts clean compile`<br>
   Execute the `clean` group of commands and then execute the `compile` group fo commands.
   - `run-scripts clean compile --quiet`<br>
   Do not display information messages.

## C) Application Code
Even though **run-scripts-util** is primarily intended for build scripts, the package can easily be used programmatically in ESM and TypeScript projects.

Example:
``` typescript
import { runScripts } from 'run-scripts-util';
const options = { quiet: false };
runScripts.exec('compile', options);
```

See the **TypeScript Declarations** at the top of [run-scripts.ts](run-scripts.ts) for documentation.

<br>

---
**CLI Build Tools**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm scripts into named groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/run-scripts-util/issues](https://github.com/center-key/run-scripts-util/issues)

[MIT License](LICENSE.txt)
