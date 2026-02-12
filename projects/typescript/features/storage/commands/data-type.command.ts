import { CLIResult } from "@/src/modules/cli/cli-result";
import { writeFile } from "fs/promises";
import StorageFeature from "../storage.feature";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import { StringUtils } from "@/src/modules/utils/string-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";
import TypescriptProject from "@/projects/typescript";

export default async function dataTypeCommand(
    [moduleName, dataTypeName]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: StorageFeature }
): Promise<CLIResult> {
    if (!moduleName || !dataTypeName) {
        return CLIResult.error({
            MissingArguments: "Both moduleName and dataTypeName arguments are required"
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
        [module.subpath()]: ["data-type"]
    });

    const dataTypeFilePath = module.subpath("data-type", `${dataTypeName}.data-type.ts`);
    const file = Bun.file(dataTypeFilePath);

    if (await file.exists()) {
        return CLIResult.error({
            DataTypeExists: `Data type ${dataTypeName} already exists in module ${moduleName}`
        });
    }

    const className = StringUtils.pascalCase(dataTypeName);
    const dataTypeContent = [
        "import { Token } from \"@/features/storage/decorators/token.decorator\";",
        "import { $assert, CustomErrors } from \"@/features/errors\";",
        "",
        "const Errors = CustomErrors({",
        "",
        "});",
        "",
        "@Token()",
        `export class ${className} {`,
        "   ",
        "}"
    ].join("\n");

    await writeFile(dataTypeFilePath, dataTypeContent);
    await vscodeOpen(dataTypeFilePath);

    return CLIResult.success(
        `✨ Successfully created data type ${dataTypeName} in module ${moduleName} in project ${project.name}!`,
        {
            moduleName,
            dataTypeName,
            filePath: dataTypeFilePath
        }
    );
}
