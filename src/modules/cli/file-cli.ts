import debug from "debug";
import { NamedError } from "../errors/named-error";
import { CLI } from "./cli";
import { CLIResult } from "./cli-result";
import Minimist from "minimist";

const log = debug("@cli/file-cli");
const debugLog = debug("#cli/file-cli");

export class FileCLI extends CLI {

    readonly file: string;

    constructor (file: string) {
        super();
        this.file = file;
        debugLog(`Initializing file CLI for file ${file}`);
    }

    async exec (args: string[], context: any) {
        const minimistArgs = Minimist(args, {
            boolean: ['json']
        });
        
        try {
            var file = await import(this.file);
        } catch (exc: any) {
            return new CLIResult({
                success: false,
                message: exc.message,
                error: new NamedError(exc.code, exc.message)
            });
        }

        if (typeof file.default !== "function") {
            return new CLIResult({
                success: false,
                message: `File ${this.file} does not export a function`,
                error: new NamedError("FileNotExported", `File ${this.file} does not export a function`)
            });
        }

        const result = await file.default(minimistArgs._, minimistArgs, context);

        if (result instanceof CLIResult) {
            return result;
        }

        throw new Error("File did not return a CLIResult");
    }
}