// run-scripts-util ~~ MIT License

// Imports
import { spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs    from 'fs';
import log   from 'fancy-log';

// Types
export type Settings = {
   only:    number | null,  //execute just one command in the group (starts with 1)
   quiet:   boolean,        //suppress informational messages
   verbose: boolean,        //add script group name to informational messages
   };
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

   exec(group: string, options?: Partial<Settings>) {
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
      //             "replacer src/web-app --ext=.html build/my-app"
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
      const execCommand = (step: number, command: string) => {
         const startTime = Date.now();
         if (!settings.quiet)
            console.log();
         const logItems = [chalk.white(group)];
         if (settings.verbose)
            logItems.push(chalk.yellow(step), arrow);
         logger(...logItems, chalk.cyanBright(command));
         const task = spawnSync(command, { shell: true, stdio: 'inherit' });
         const errorMessage = () =>
            `[run-scripts-util] Task: ${group} (step ${step}), Status: ${task.status}`;
         if (task.status !== 0)
            throw Error(errorMessage() + '\nCommand: ' + command);
         logger(...logItems, chalk.green('done'), chalk.white(`(${Date.now() - startTime}ms)`));
         };
      const skip = (step: number, command: string) => {
         const active =       settings.only === null || step === settings.only;
         const commentedOut = command.startsWith('-');
         if (commentedOut)
            logger(chalk.yellow('skipping:'), command);
         return !active || commentedOut;
         };
      commands.forEach((command: string, index: number) =>
         !skip(index + 1, command) && execCommand(index + 1, command));
      },

   execParallel(group: string, options?: Partial<Settings>) {
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
      const logger = createLogger(settings);
      const active = (step: number) => settings.only === null || step === settings.only;
      const process = (step: number, command: string): Promise<ProcessInfo> => new Promise((resolve) => {
         const start =    Date.now();
         const task =     spawn(command, { shell: true, stdio: 'inherit' });
         const pid =      task.pid ?? null;
         const logItems = [chalk.white(group), chalk.yellow(step)];
         if (settings.verbose)
            logItems.push(chalk.magenta('pid: ' + pid), arrow);
         logger(...logItems, chalk.cyanBright(command));
         const processInfo = (code: number, ms: number): ProcessInfo =>
            ({ group, step, pid, start, code, ms });
         task.on('close', (code: number) => resolve(processInfo(code, Date.now() - start)));
         task.on('close', (code: number) => logger(...logItems, chalk.green('done'),
            chalk.white(`(code: ${code}, ${Date.now() - start}ms)`)));
         });
      const createProcess = (command: string, index: number): Promise<ProcessInfo | null> =>
         active(index + 1) ? process(index + 1, command) : Promise.resolve(null);
      logger(chalk.white(group), chalk.blue('--parallel'));
      return Promise.all(commands.map(createProcess));
      },

   };

export { runScripts };
