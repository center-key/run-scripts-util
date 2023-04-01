//! run-scripts-util v1.1.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

import { spawn, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import fs from 'fs';
import log from 'fancy-log';
const arrow = chalk.gray.bold('→');
const createLogger = (settings) => (...args) => !settings.quiet && log(chalk.gray('run-scripts'), ...args);
const runScripts = {
    exec(group, options) {
        const defaults = {
            only: null,
            quiet: false,
            verbose: false,
        };
        const settings = { ...defaults, ...options };
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
        const logger = createLogger(settings);
        if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
            throw Error('[run-scripts-util] Cannot find commands: ' + group);
        const execCommand = (command, step) => {
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
        const active = (step) => settings.only === null || step === settings.only;
        commands.forEach((command, index) => active(index + 1) && execCommand(command, index + 1));
    },
    execParallel(group, options) {
        const defaults = {
            only: null,
            quiet: false,
            verbose: false,
        };
        const settings = { ...defaults, ...options };
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
        if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
            throw Error('[run-scripts-util] Cannot find commands: ' + group);
        const logger = createLogger(settings);
        const active = (step) => settings.only === null || step === settings.only;
        const process = (step, command) => new Promise((resolve) => {
            const start = Date.now();
            const task = spawn(command, { shell: true, stdio: 'inherit' });
            const pid = task.pid ?? null;
            const stepText = chalk.yellow(step);
            const logItems = settings.verbose ?
                [chalk.white(group), stepText, chalk.magenta('pid: ' + pid), arrow] : [stepText];
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
