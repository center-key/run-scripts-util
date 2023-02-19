//! run-scripts-util v1.0.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

import { spawnSync } from 'node:child_process';
import fs from 'fs';
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
        if (!Array.isArray(commands) || commands.some(command => typeof command !== 'string'))
            throw Error('[run-scripts-util] Cannot find commands: ' + group);
        const execCommand = (command, step) => {
            const startTime = Date.now();
            if (settings.verbose)
                console.log(group, step, '→', command);
            else if (!settings.quiet)
                console.log(command);
            const task = spawnSync(command, { shell: true, stdio: 'inherit' });
            if (task.status !== 0)
                throw Error(`[run-scripts-util] ${group} #${step}, error status: ${task.status}`);
            if (!settings.quiet)
                console.log(`done (${Date.now() - startTime}ms)\n`);
        };
        const active = (step) => settings.only === null || step === settings.only;
        commands.forEach((command, index) => active(index + 1) ? execCommand(command, index + 1) : true);
    },
};
export { runScripts };
