// run-scripts-util ~~ MIT License

import { spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs    from 'fs';
import log   from 'fancy-log';

export type Settings = {
   only:    number | null,  //execute just one command in the group (starts with 1)
   quiet:   boolean,        //suppress informational messages
   verbose: boolean,        //add script group name to informational messages
   };
export type Options = Partial<Settings>;
export type ProcessInfo = {
   group: string,
   step:  number,
   start: number,
   pid:   number | null,
   code:  number,
   ms:    number,
   };

// Reporting
const arrow = chalk.gray.bold('→');
const createLogger = (settings: Settings) =>
   (...args: string[]) => !settings.quiet && log(chalk.gray('run-scripts'), ...args);

const runScripts = {

   exec(group: string, options?: Options) {
      // Example that runs spawnSync() for each of the 4 "compile" commands:
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
         only:    null,
         quiet:   false,
         verbose: false,
         };
      const settings = { ...defaults, ...options };
      const pkg =      JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
      const logger =   createLogger(settings);
      if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
         throw Error('[run-scripts-util] Cannot find commands: ' + group);
      const execCommand = (command: string, step: number) => {
         const startTime = Date.now();
         if (!settings.quiet)
            console.log();
         const logItems = settings.verbose ? [chalk.white(group), chalk.yellow(step), arrow] : [];
         logger(...logItems, chalk.cyanBright(command));
         const task = spawnSync(command, { shell: true, stdio: 'inherit' });
         if (task.status !== 0)
            throw Error(`[run-scripts-util] ${group} #${step}, error status: ${task.status}`);
         logger(...logItems, chalk.green('done'), chalk.white(`(${Date.now() - startTime}ms)`));
         };
      const active = (step: number) => settings.only === null || step === settings.only;
      commands.forEach((command: string, index: number) =>
         active(index + 1) && execCommand(command, index + 1));
      },

   execParallel(group: string, options?: Options) {
      const defaults = {
         only:    null,
         quiet:   false,
         verbose: false,
         };
      const settings = { ...defaults, ...options };
      const pkg =      JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
      if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
         throw Error('[run-scripts-util] Cannot find commands: ' + group);
      const active = (step: number) => settings.only === null || step === settings.only;
      const createProcess = (command: string, index: number): Promise<ProcessInfo> =>
         new Promise((resolve) => {
            const start = Date.now();
            const step = index + 1;
            const task = spawn(command, { shell: true, stdio: 'inherit' });
            const pid =  task.pid ?? null;
            if (settings.verbose)
               console.log(group, step, 'PID:', pid, '→', command, active(step));
            else if (!settings.quiet)
               console.log(command);
            const processInfo = (code: number, ms: number): ProcessInfo =>
               ({ group, step, pid, start, code, ms });
            task.on('close', (code: number) => resolve(processInfo(code, Date.now() - start)));
            if (!settings.quiet)
               task.on('close', (code: number) =>
                  console.log('Done:', group, step, { pid, code }, 'ms:', Date.now() - start));
            });
      return Promise.all(commands.map(createProcess));
      },

   };

export { runScripts };
