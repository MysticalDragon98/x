import { join } from "path";
import { CLI } from "./cli";
import { stat } from "fs/promises";
import { CLIResult } from "./cli-result";
import { FileCLI } from "./file-cli";
import debug from "debug";


const log = debug("@cli/file-cli");
const debugLog = debug("#cli/file-cli");

const Errors = {
    CommandNotFound: { CommandNotFound: "The command {command} was not found."}
}

export class FolderCLI extends CLI {
    readonly folder: string;

    constructor (folder: string) {
        super();
        this.folder = folder;

        debugLog(`Initialized folder CLI for folder ${folder}`);
    }

    #path (path: string) {
        return join(this.folder, path);
    }

    async exec ([file, ...args]: string[], context: any): Promise<CLIResult> {
        debugLog(`Executing command ${file}`);
        let path = this.#path(file);
        let tsPath = this.#path(file + ".command.ts");

        try {
            var pathStats = await stat(path);
        } catch (exc: any) {
            debugLog(`File ${path} does not exist, trying ${tsPath}`);
            
            try {
                var pathStats = await stat(tsPath);
                path = tsPath;
            } catch (exc: any) {
                debugLog(`File ${tsPath} does not exist`);
                return CLIResult.error(Errors.CommandNotFound, { command: file });
            }
        }

        if (pathStats.isDirectory()) {
            debugLog(`Path ${path} is a directory`);
            const cli = new FolderCLI(path);
            return await cli.exec(args, context);
        }
        
        if (pathStats.isFile()) {
            debugLog(`Path ${path} is a file`);
            const cli = new FileCLI(path);

            try {
                return await cli.exec(args, context);
            } catch (exc: any) {
                return CLIResult.fromError(exc);
            }
        }

        return CLIResult.error(Errors.CommandNotFound, { command: file });
    }
}