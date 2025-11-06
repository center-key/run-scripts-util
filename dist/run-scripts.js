//! run-scripts-util v1.3.4 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

import { cliArgvUtil } from 'cli-argv-util';
import { spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs from 'fs';
import log from 'fancy-log';
const arrow = chalk.gray.bold('→');
const createLogger = (settings) => (...args) => !settings.quiet && log(chalk.gray('run-scripts'), ...args);
const runScripts = {
    assert(ok, message) {
        if (!ok)
            throw new Error(`[run-scripts-util] ${message}`);
    },
    cli() {
        const validFlags = ['continue-on-error', 'note', 'only', 'parallel', 'quiet', 'verbose'];
        const cli = cliArgvUtil.parse(validFlags);
        const groups = cli.params;
        const invalidOnlyUse = cli.flagOn.only && cli.paramCount !== 1;
        const error = cli.invalidFlag ? cli.invalidFlagMsg :
            !cli.paramCount ? 'Must provide at lease one group of commands to run.' :
                invalidOnlyUse ? 'The --only flag does not support multiple groups of commands.' :
                    null;
        runScripts.assert(!error, error);
        const options = {
            continueOnError: cli.flagOn.continueOnError,
            only: cli.flagOn.only ? Number(cli.flagMap.only) : null,
            quiet: cli.flagOn.quiet,
            verbose: cli.flagOn.verbose,
        };
        const runGroup = (prevPromise, nextGroup) => prevPromise.then(() => runScripts.execParallel(nextGroup, options));
        if (cli.flagOn.parallel)
            groups.reduce(runGroup, Promise.resolve([]));
        else
            groups.forEach(group => runScripts.exec(group, options));
    },
    exec(group, options) {
        const defaults = {
            continueOnError: false,
            only: null,
            quiet: false,
            verbose: false,
        };
        const settings = { ...defaults, ...options };
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
        const logger = createLogger(settings);
        const badGroup = !Array.isArray(commands) || commands.some(command => typeof command !== 'string');
        runScripts.assert(!badGroup, 'Cannot find commands: ' + group);
        const execCommand = (step, command) => {
            const startTime = Date.now();
            if (!settings.quiet)
                console.info();
            const logItems = [chalk.white(group)];
            if (settings.verbose)
                logItems.push(chalk.yellow(step), arrow);
            logger(...logItems, chalk.cyanBright(command.replace(/\s+/g, ' ')));
            const task = spawnSync(command, { shell: true, stdio: 'inherit' });
            const errorMessage = () => `Task: ${group} (step ${step}), Status: ${task.status}`;
            if (task.status !== 0 && settings.continueOnError)
                logger(chalk.red('ERROR'), chalk.white('-->'), errorMessage());
            const stop = task.status !== 0 && !settings.continueOnError;
            runScripts.assert(!stop, `${errorMessage()}, Command: ${command}`);
            logger(...logItems, chalk.green('done'), chalk.white(`(${Date.now() - startTime}ms)`));
        };
        const skip = (step, command) => {
            const active = settings.only === null || step === settings.only;
            const commentedOut = command.startsWith('//');
            if (commentedOut)
                logger(chalk.yellow('skipping:'), command);
            return !active || commentedOut;
        };
        const processCommand = (command, index) => !skip(index + 1, command) && execCommand(index + 1, command);
        commands.forEach(processCommand);
    },
    execParallel(group, options) {
        const defaults = {
            continueOnError: false,
            only: null,
            quiet: false,
            verbose: false,
        };
        const settings = { ...defaults, ...options };
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
        const badGroup = !Array.isArray(commands) || commands.some(command => typeof command !== 'string');
        runScripts.assert(!badGroup, 'Cannot find commands: ' + group);
        const logger = createLogger(settings);
        const active = (step) => settings.only === null || step === settings.only;
        const process = (step, command) => new Promise((resolve) => {
            const start = Date.now();
            const task = spawn(command, { shell: true, stdio: 'inherit' });
            const pid = task.pid ?? null;
            const logItems = [chalk.white(group), chalk.yellow(step)];
            if (settings.verbose)
                logItems.push(chalk.magenta('pid: ' + String(pid)), arrow);
            logger(...logItems, chalk.cyanBright(command));
            const processInfo = (code, ms) => ({ group, step, pid, start, code, ms });
            task.on('close', (code) => resolve(processInfo(code, Date.now() - start)));
            task.on('close', (code) => logger(...logItems, chalk.green('done'), chalk.white(`(code: ${code}, ${Date.now() - start}ms)`)));
        });
        const createProcess = (command, index) => active(index + 1) ? process(index + 1, command) : Promise.resolve(null);
        logger(chalk.white(group), chalk.blue('--parallel'));
        return Promise.all(commands.map(createProcess));
    },
};
export { runScripts };
