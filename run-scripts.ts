// run-scripts-util ~~ MIT License

import { spawnSync } from 'node:child_process';
import fs from 'fs';

export type Settings = {
   compact: boolean,  //do not display the command group name
   quiet:   boolean,  //suppress informational messages
   };
export type Options = Partial<Settings>;

const runScripts = {
   exec(group: string, options?: Options) {
      const defaults = {
         compact: false,
         quiet:   false,
         };
      const settings = { ...defaults, ...options };
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? pkg.scripts?.[group];
      if (!commands)
         throw Error('[run-scripts-util] Cannot find commands: ' + group);
      [commands].flat().forEach((command: string, index: number) => {
         const startTime = Date.now();
         if (settings.compact)
            console.log(command);
         else if (!settings.quiet)
            console.log(group, index + 1, '->', command);
         const task = spawnSync(command, { shell: true, stdio: 'inherit' });
         if (task.status !== 0)
            throw Error(`[run-scripts-util] ${group} #${index + 1}, error status: ${task.status}`);
         if (!settings.quiet)
            console.log(`done (${Date.now() - startTime}ms)\n`);
         });
      },
   };

export { runScripts };
