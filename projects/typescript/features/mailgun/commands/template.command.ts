import { CLIResult } from "@/src/modules/cli/cli-result";
import { writeFile } from "fs/promises";
import TypescriptProject from "@/projects/typescript";
import MailgunFeature from "../mailgun.feature";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

export default async function templateCommand(
    [moduleName, name]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: MailgunFeature }
): Promise<CLIResult> {
    if (!moduleName || !name) {
        return CLIResult.error({
            MissingArguments: "Both moduleName and name arguments are required"
        });
    }

    const module = feature.std.module(moduleName);

    await FsUtils.createTree({
        [module.subpath("mailgun")]: ["templates"]
    });

    const filePath = module.subpath("mailgun", "templates", `${name}.mailgun-template.hbs`);
    const file = Bun.file(filePath);

    if (await file.exists()) {
        return CLIResult.error({
            TemplateExists: `Mailgun template ${name} already exists in module ${moduleName}`
        });
    }

    const templateContent = [
        "<!DOCTYPE html>",
        "<html>",
        "<head></head>",
        "<body>",
        "",
        "</body>",
        "</html>"
    ].join("\n");

    await writeFile(filePath, templateContent);
    await vscodeOpen(filePath);

    return CLIResult.success(
        `Successfully created mailgun template: ${name} in module ${moduleName}`,
        {
            moduleName,
            name,
            filePath
        }
    );
}
