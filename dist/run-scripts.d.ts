//! run-scripts-util v1.0.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

export type Settings = {
    only: number | null;
    quiet: boolean;
    verbose: boolean;
};
export type Options = Partial<Settings>;
declare const runScripts: {
    exec(group: string, options?: Options): void;
};
export { runScripts };
