import TypescriptProject from "@/projects/typescript";
import TelegramFeature from "../telegram.feature";
import { CLIResult } from "@/src/modules/cli/cli-result";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

export default async function commandCommand([commandName]: [ string ], named: any, { project, feature }: { project: TypescriptProject, feature: TelegramFeature }): Promise<CLIResult> {
    if (!commandName) return CLIResult.error({
        MissingArguments: "The commandName argument is required"
    });

    const path = project.workdirSubpath("src/telegram/commands", `${commandName}.telegram-command.ts`);
    const file = Bun.file(path);

    if (await file.exists()) {
        return CLIResult.error({
            CommandExists: "A command with the name {commandName} already exists."
        });
    }

    const content = [
        "import { TelegramCommandMessage } from '@/features/telegram/classes/TelegramCommandMessage';';",
        "",
        "export default async function (msg: TelegramCommandMessage) {",
        "",
        "}"
    ].join("\n");

    await file.write(content);
    await vscodeOpen(path);

    return CLIResult.success(`Successfully created command ${commandName}`, {
        commandName
    });
}