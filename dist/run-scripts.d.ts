//! run-scripts-util v0.1.1 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

export declare type Settings = {
    quiet: boolean;
    verbose: boolean;
};
export declare type Options = Partial<Settings>;
declare const runScripts: {
    exec(group: string, options?: Options): void;
};
export { runScripts };
