//! run-scripts-util v0.0.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

import { spawnSync } from 'node:child_process';
import fs from 'fs';
const runScripts = {
    exec(group, options) {
        const defaults = {
            quiet: false,
        };
        const settings = { ...defaults, ...options };
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const commands = pkg.runScriptsConfig?.[group] ?? pkg.scripts?.[group];
        if (!commands)
            throw Error('[run-scripts-util] Cannot find commands: ' + group);
        [commands].flat().forEach((command, index) => {
            const startTime = Date.now();
            if (!settings.quiet)
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
