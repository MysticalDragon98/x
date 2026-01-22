import { CLIResult } from "@/src/modules/cli/cli-result";
import { writeFile } from "fs/promises";
import StorageFeature from "../storage.feature";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import { StringUtils } from "@/src/modules/utils/string-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";
import TypescriptProject from "@/projects/typescript";

export default async function entityCommand(
    [moduleName, entityName]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: StorageFeature }
): Promise<CLIResult> {
    if (!moduleName || !entityName) {
        return CLIResult.error({
            MissingArguments: "Both moduleName and entityName arguments are required"
        });
    }

    const moduleExists = await feature.std.config.existsModule(moduleName);
    if (!moduleExists) {
        return CLIResult.error({
            ModuleNotFound: `Module ${moduleName} not found`
        });
    }

    const module = feature.std.module(moduleName);
    await FsUtils.createTree({
        [module.subpath()]: ["entities"]
    });

    const entityFilePath = module.subpath("entities", `${entityName}.entity.ts`);
    const file = Bun.file(entityFilePath);

    if (await file.exists()) {
        return CLIResult.error({
            EntityExists: `Entity ${entityName} already exists in module ${moduleName}`
        });
    }

    const className = StringUtils.pascalCase(entityName);
    const entityContent = [
        "import { Token } from \"@/features/storage/decorators/token.decorator\";",
        "import { $assert, CustomErrors } from \"@/features/errors\";",
        "",
        "const Errors = CustomErrors({",
        "",
        "});",
        "",
        "@Token()",
        `class ${className} {`,
        "   ",
        "}"
    ].join("\n");

    await writeFile(entityFilePath, entityContent);
    await vscodeOpen(entityFilePath);

    return CLIResult.success(
        `✨ Successfully created entity ${entityName} in module ${moduleName} in project ${project.name}!`,
        {
            moduleName,
            entityName,
            filePath: entityFilePath
        }
    );
}
