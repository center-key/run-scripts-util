//! run-scripts-util v1.3.3 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

export type Settings = {
    continueOnError: boolean;
    only: number | null;
    quiet: boolean;
    verbose: boolean;
};
export type ProcessInfo = {
    group: string;
    step: number;
    start: number;
    pid: number | null;
    code: number;
    ms: number;
};
declare const runScripts: {
    exec(group: string, options?: Partial<Settings>): void;
    execParallel(group: string, options?: Partial<Settings>): Promise<(ProcessInfo | null)[]>;
};
export { runScripts };
