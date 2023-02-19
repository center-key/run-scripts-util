//! run-scripts-util v1.0.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "node:child_process", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runScripts = void 0;
    const node_child_process_1 = require("node:child_process");
    const fs_1 = __importDefault(require("fs"));
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
            if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
                throw Error('[run-scripts-util] Cannot find commands: ' + group);
            const execCommand = (command, step) => {
                const startTime = Date.now();
                if (settings.verbose)
                    console.log(group, step, '→', command);
                else if (!settings.quiet)
                    console.log(command);
                const task = (0, node_child_process_1.spawnSync)(command, { shell: true, stdio: 'inherit' });
                if (task.status !== 0)
                    throw Error(`[run-scripts-util] ${group} #${step}, error status: ${task.status}`);
                if (!settings.quiet)
                    console.log(`done (${Date.now() - startTime}ms)\n`);
            };
            const active = (step) => settings.only === null || step === settings.only;
            commands.forEach((command, index) => active(index + 1) ? execCommand(command, index + 1) : true);
        },
    };
    exports.runScripts = runScripts;
});
