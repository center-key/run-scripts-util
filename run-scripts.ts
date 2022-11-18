// run-scripts-util ~~ MIT License

import { spawnSync } from 'node:child_process';
import fs from 'fs';

export type Settings = {
   quiet:   boolean,  //suppress informational messages
   verbose: boolean,  //add script group name to informational messages
   };
export type Options = Partial<Settings>;

const runScripts = {
   exec(group: string, options?: Options) {
      // Example (runs spawnSync() for each of the 4 "compile" commands):
      //    runScripts.exec('compile', { verbose: true });
      //    [package.json]
      //       "runScriptsConfig": {
      //          "clean": [
      //             "rimraf build dist"
      //          ],
      //          "compile": [
      //             "tsc",
      //             "lessc src/web-app/style.less build/web-app/style.css",
      //             "copy-folder src/graphics build/my-app/graphics",
      //             "replacer src/web-app --ext=.html --pkg build/my-app"
      //          ]
      //       },
      //       "scripts": {
      //          "pretest": "run-scripts clean compile",
      //          "test": "mocha spec"
      //       },
      const defaults = {
         quiet:   false,
         verbose: false,
         };
      const settings = { ...defaults, ...options };
      const pkg =      JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
      if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
         throw Error('[run-scripts-util] Cannot find commands: ' + group);
      commands.flat().forEach((command: string, index: number) => {
         const startTime = Date.now();
         if (settings.verbose)
            console.log(group, index + 1, '→', command);
         else if (!settings.quiet)
            console.log(command);
         const task = spawnSync(command, { shell: true, stdio: 'inherit' });
         if (task.status !== 0)
            throw Error(`[run-scripts-util] ${group} #${index + 1}, error status: ${task.status}`);
         if (!settings.quiet)
            console.log(`done (${Date.now() - startTime}ms)\n`);
         });
      },
   };

export { runScripts };
