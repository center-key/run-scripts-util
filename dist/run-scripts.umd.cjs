//! run-scripts-util v1.1.1 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "node:child_process", "chalk", "fs", "fancy-log"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runScripts = void 0;
    const node_child_process_1 = require("node:child_process");
    const chalk_1 = __importDefault(require("chalk"));
    const fs_1 = __importDefault(require("fs"));
    const fancy_log_1 = __importDefault(require("fancy-log"));
    const arrow = chalk_1.default.gray.bold('→');
    const createLogger = (settings) => (...args) => !settings.quiet && (0, fancy_log_1.default)(chalk_1.default.gray('run-scripts'), ...args);
    const runScripts = {
        exec(group, options) {
            const defaults = {
                only: null,
                quiet: false,
                verbose: false,
            };
            const settings = { ...defaults, ...options };
            const pkg = JSON.parse(fs_1.default.readFileSync('package.json', 'utf-8'));
            const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
            const logger = createLogger(settings);
            if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
                throw Error('[run-scripts-util] Cannot find commands: ' + group);
            const execCommand = (command, step) => {
                const startTime = Date.now();
                if (!settings.quiet)
                    console.log();
                const logItems = settings.verbose ? [chalk_1.default.white(group), chalk_1.default.yellow(step), arrow] : [];
                logger(...logItems, chalk_1.default.cyanBright(command));
                const task = (0, node_child_process_1.spawnSync)(command, { shell: true, stdio: 'inherit' });
                const errorMessage = () => `[run-scripts-util] Task: ${group} (step ${step}), Status: ${task.status}`;
                if (task.status !== 0)
                    throw Error(errorMessage() + '\nCommand: ' + command);
                logger(...logItems, chalk_1.default.green('done'), chalk_1.default.white(`(${Date.now() - startTime}ms)`));
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
            const pkg = JSON.parse(fs_1.default.readFileSync('package.json', 'utf-8'));
            const commands = pkg.runScriptsConfig?.[group] ?? [pkg.scripts?.[group]];
            if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
                throw Error('[run-scripts-util] Cannot find commands: ' + group);
            const logger = createLogger(settings);
            const active = (step) => settings.only === null || step === settings.only;
            const process = (step, command) => new Promise((resolve) => {
                const start = Date.now();
                const task = (0, node_child_process_1.spawn)(command, { shell: true, stdio: 'inherit' });
                const pid = task.pid ?? null;
                const stepText = chalk_1.default.yellow(step);
                const logItems = settings.verbose ?
                    [chalk_1.default.white(group), stepText, chalk_1.default.magenta('pid: ' + pid), arrow] : [stepText];
                logger(...logItems, chalk_1.default.cyanBright(command));
                const processInfo = (code, ms) => ({ group, step, pid, start, code, ms });
                task.on('close', (code) => resolve(processInfo(code, Date.now() - start)));
                task.on('close', (code) => logger(...logItems, chalk_1.default.green('done'), chalk_1.default.white(`(code: ${code}, ${Date.now() - start}ms)`)));
            });
            const createProcess = (command, index) => active(index + 1) ? process(index + 1, command) : Promise.resolve(null);
            logger(chalk_1.default.white(group), chalk_1.default.blue('--parallel'));
            return Promise.all(commands.map(createProcess));
        },
    };
    exports.runScripts = runScripts;
});
