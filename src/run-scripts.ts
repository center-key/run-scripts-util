// run-scripts-util ~~ MIT License
//
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
import { spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs    from 'fs';
import log   from 'fancy-log';

// Types
export type Settings = {
   continueOnError: boolean,        //do not throw an exception if a task exits with an error status
   only:            number | null,  //execute just one command in the group (starts with 1)
   quiet:           boolean,        //suppress informational messages
   verbose:         boolean,        //add script group name to informational messages
   };
export type ProcessInfo = {
   group: string,
   step:  number,
   start: number,
   pid:   number | null,
   code:  number,
   ms:    number,
   };
type Pkg = {
   runScriptsConfig?: { [group: string]: string | { [command: string]: string[] } },
   scripts?:          { [script: string]: string },
   };

// Reporting
const arrow = chalk.gray.bold('→');
const createLogger = (settings: Settings) =>
   (...args: string[]) => !settings.quiet && log(chalk.gray('run-scripts'), ...args);

const runScripts = {

   assert(ok: unknown, message: string | null) {
      if (!ok)
         throw new Error(`[run-scripts-util] ${message}`);
      },

   cli() {
      const validFlags =     ['continue-on-error', 'note', 'only', 'parallel', 'quiet', 'verbose'];
      const cli =            cliArgvUtil.parse(validFlags);
      const groups =         cli.params;  //list of script set names
      const invalidOnlyUse = cli.flagOn.only && cli.paramCount !== 1;
      const error =
         cli.invalidFlag ? cli.invalidFlagMsg :
         !cli.paramCount ? 'Must provide at lease one group of commands to run.' :
         invalidOnlyUse ?  'The --only flag does not support multiple groups of commands.' :
         null;
      runScripts.assert(!error, error);
      const options: Settings = {
         continueOnError: cli.flagOn.continueOnError!,
         only:            cli.flagOn.only ? Number(cli.flagMap.only) : null,
         quiet:           cli.flagOn.quiet!,
         verbose:         cli.flagOn.verbose!,
         };
      const runGroup = (prevPromise: Promise<(ProcessInfo | null)[]>, nextGroup: string) =>
         prevPromise.then(() => runScripts.execParallel(nextGroup, options));
      if (cli.flagOn.parallel)
         groups.reduce(runGroup, Promise.resolve([]));
      else
         groups.forEach(group => runScripts.exec(group, options));
      },

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
      const defaults: Settings = {
         continueOnError: false,
         only:            null,
         quiet:           false,
         verbose:         false,
         };
      const settings = { ...defaults, ...options };
      const pkg =      <Pkg>JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
      const logger =   createLogger(settings);
      const badGroup = !Array.isArray(commands) || commands.some(command => typeof command !== 'string');
      runScripts.assert(!badGroup, 'Cannot find commands: ' + group);
      const execCommand = (step: number, command: string) => {
         const startTime = Date.now();
         if (!settings.quiet)
            console.info();
         const logItems = [chalk.white(group)];
         if (settings.verbose)
            logItems.push(chalk.yellow(step), arrow);
         logger(...logItems, chalk.cyanBright(command.replace(/\s+/g, ' ')));
         const task =         spawnSync(command, { shell: true, stdio: 'inherit' });
         const errorMessage = () => `Task: ${group} (step ${step}), Status: ${task.status}`;
         if (task.status !== 0 && settings.continueOnError)
            logger(chalk.red('ERROR'), chalk.white('-->'), errorMessage());
         const stop = task.status !== 0 && !settings.continueOnError;
         runScripts.assert(!stop, `${errorMessage()}, Command: ${command}`);
         logger(...logItems, chalk.green('done'), chalk.white(`(${Date.now() - startTime}ms)`));
         };
      const skip = (step: number, command: string) => {
         const active =       settings.only === null || step === settings.only;
         const commentedOut = command.startsWith('//');
         if (commentedOut)
            logger(chalk.yellow('skipping:'), command);
         return !active || commentedOut;
         };
      const processCommand = (command: string, index: number) =>
         !skip(index + 1, command) && execCommand(index + 1, command);
      (<string[]>commands).forEach(processCommand);
      },

   execParallel(group: string, options?: Partial<Settings>) {
      const defaults: Settings = {
         continueOnError: false,
         only:            null,
         quiet:           false,
         verbose:         false,
         };
      const settings = { ...defaults, ...options };
      const pkg =      <Pkg>JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
      const badGroup = !Array.isArray(commands) || commands.some(command => typeof command !== 'string');
      runScripts.assert(!badGroup, 'Cannot find commands: ' + group);
      const logger = createLogger(settings);
      const active = (step: number) => settings.only === null || step === settings.only;
      const process = (step: number, command: string): Promise<ProcessInfo> => new Promise((resolve) => {
         const start =    Date.now();
         const task =     spawn(command, { shell: true, stdio: 'inherit' });
         const pid =      task.pid ?? null;
         const logItems = [chalk.white(group), chalk.yellow(step)];
         if (settings.verbose)
            logItems.push(chalk.magenta('pid: ' + String(pid)), arrow);
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
      return Promise.all((<string[]>commands).map(createProcess));
      },

   };

export { runScripts };
