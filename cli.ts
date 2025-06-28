#!/usr/bin/env node
import { join } from "path";
import { FolderCLI } from "./src/modules/cli/folder-cli";
import { CLIResult } from "./src/modules/cli/cli-result";
import Minimist from "minimist";
import debug from "debug";
import { Project } from "./src/modules/projects/project";
import { $assert } from "./src/modules/errors";

debug.enable("@*")

type Context = {
    json: boolean;
};

const Errors = {
    NoProjectInitialized: { NoProjectInitialized: "You must initialize a project before using this command." }
}

class XCli {

    readonly folder: string;
    readonly cli: FolderCLI;

    constructor (folder: string) {
        this.folder = folder;
        this.cli = new FolderCLI(folder);
    }

    getContext (args: string[]): Context {
        const minimistArgs = Minimist(args, {
            boolean: ['json']
        });

        return {
            json: minimistArgs.json
        };
    }
    
    async exec (args: string[]) {
        if (args[0].indexOf(":") !== -1) {
            return this.#executeFeatureCommand(args);
        }

        const project = await Project.fromFolder(process.cwd());
        const result = await this.cli.exec(args, { project });

        if (result.success) return this.#parseSuccess(result, this.getContext(args));

        return this.#parseError(result, this.getContext(args));
    }

    async #executeFeatureCommand (args: string[]) {
        const [ command, ...featureArgs ] = args;
        const [ featureName, commandName ] = command.split(":");
        const project = await Project.fromFolder(process.cwd());

        if (!project) {
            return this.#parseError(CLIResult.error(Errors.NoProjectInitialized), this.getContext(args));
        }

        const feature = await project.feature(featureName);
        const cli = new FolderCLI(project.projectSubpath("features", featureName, "commands"));
        const result = await cli.exec([ commandName, ...featureArgs ], { project, feature });

        if (result.success) return this.#parseSuccess(result, this.getContext(args));

        return this.#parseError(result, this.getContext(args));
    }

    #parseSuccess (result: CLIResult, context: Context) {
        if (context.json) {
            console.log(JSON.stringify(result.data))
        } else {
            console.log(result.message);
        }
    }

    #parseError (result: CLIResult, context: Context) {
        if (context.json) {
            console.log(JSON.stringify({
                success: false,
                message: result.message,
                error: result.error
            }));
        } else {
            console.log(result.message);
        }
    }

}

async function main () {
    const args = process.argv.slice(2);
    const folder = join(__dirname, "src", "commands");
    const cli = new XCli(folder);

    await cli.exec(args);
}

main();

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception:", err);
});