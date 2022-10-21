//! run-scripts-util v0.0.0 ~~ https://github.com/center-key/run-scripts-util ~~ MIT License

export declare type Settings = {
    quiet: boolean;
};
export declare type Options = Partial<Settings>;
declare const runScripts: {
    exec(group: string, options?: Options): void;
};
export { runScripts };
