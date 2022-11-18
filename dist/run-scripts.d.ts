//! run-scripts-util v0.1.2 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

export type Settings = {
    quiet: boolean;
    verbose: boolean;
};
export type Options = Partial<Settings>;
declare const runScripts: {
    exec(group: string, options?: Options): void;
};
export { runScripts };
