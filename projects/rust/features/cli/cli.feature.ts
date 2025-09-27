import { Feature } from "@/src/modules/projects/feature";
import RustProject from "../..";
import { join } from "path";
import { StringUtils } from "@/src/modules/utils/string-utils";
import { $assert, $throw, CustomErrors } from "@/features/errors";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

const Errors = CustomErrors({
    CommandExists: "A command with the name {commandName} already exists."
});

export default class CliFeature extends Feature<RustProject> {

    name () { return "cli" }
    version () { return "0.0.1" }

    async init () {
        
    }

    async createCommand (commandName: string) {
        const commandsFolder = this.project.workdirSubpath("src/cli/commands");
        const cliFile = Bun.file(this.project.workdirSubpath("src/cli/cli.rs"));

        const filename = StringUtils.snakeCase(commandName);
        const commandPath = join(commandsFolder, `${filename}.cli-command.rs`);
        const commandFile = Bun.file(commandPath);
        const moduleFile = Bun.file(join(commandsFolder, `mod.rs`));
        const argsStructName = StringUtils.pascalCase(commandName) + "Args";
        const commandNameSnakeCase = filename + "_command";
        const enumName = StringUtils.pascalCase(commandName);

        $assert(!await commandFile.exists(), Errors.CommandExists, { commandName });

        const content = [
            "use clap::Parser;",
            "",
            `#[derive(Parser, Debug)]`,
            `pub struct ${argsStructName} {`,
            "",
            `}`,
            "",
            `pub async fn ${commandNameSnakeCase} (_args: &${argsStructName}) {`,
            "",
            "}"
        ].join("\n");

        this.log(`Creating command ${commandName}`);
        await commandFile.write(content);

        this.log(`Adding command to module file`);
        await moduleFile.write(await moduleFile.text() + [
            `\n#[path="${filename}.cli-command.rs"]`,
            `pub mod ${filename};`
        ].join("\n"));

        this.log(`Registering command in cli init file...`);

        cliFile.write((await cliFile.text())
            .replace(/\/\/ Imports/, `// Imports\nuse crate::cli::commands::${filename}::{${argsStructName}, ${commandNameSnakeCase}};`)
            .replace(/\/\/ Definitions/, `${enumName}(${argsStructName}),\n    // Definitions`)
            .replace(/\/\/ Execution/, `Commands::${enumName}(args) => {\n            ${commandNameSnakeCase}(args);\n        }\n        // Execution\n`)
        );

        await vscodeOpen(commandPath);
    }

}