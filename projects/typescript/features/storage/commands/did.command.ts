import { CLIResult } from "@/src/modules/cli/cli-result";
import { writeFile } from "fs/promises";
import TypescriptProject from "../..";
import StorageFeature from "../storage.feature";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import { StringUtils } from "@/src/modules/utils/string-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

export default async function didCommand(
    [moduleName, idName]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: StorageFeature }
): Promise<CLIResult> {
    if (!moduleName || !idName) {
        return CLIResult.error({
            MissingArguments: "Both moduleName and idName arguments are required"
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

    const className = `${StringUtils.pascalCase(idName)}Id`;
    const dataTypeFilePath = module.subpath("data-type", `${className}.data-type.ts`);
    const file = Bun.file(dataTypeFilePath);

    if (await file.exists()) {
        return CLIResult.error({
            DataTypeExists: `Data type ${className} already exists in module ${moduleName}`
        });
    }

    const dataTypeContent = [
        "import { Token } from \"@/features/storage/decorators/token.decorator\";",
        "import { DID } from \"@/features/storage/classes/DID\";",
        "",
        "",
        "@Token<String>()",
        `export class ${className} {`,
        "    ",
        `    static didType = '${idName}';`,
        "",
        "    constructor (public readonly did: string) {",
        `        DID.validate({ type: ${className}.didType, did });`,
        "    }",
        "",
        `    static serialize (id: ${className}) { return id.did; }`,
        "    static deserialize (id: string) { return new " + className + "(id); }",
        "    static random () { return new " + className + "(DID.create(" + className + ".didType)); }",
        "    ",
        "    toString () {",
        "        return this.did;",
        "    }",
        "",
        "}"
    ].join("\n");

    await writeFile(dataTypeFilePath, dataTypeContent);
    await vscodeOpen(dataTypeFilePath);

    return CLIResult.success(
        `✨ Successfully created did data type ${className} in module ${moduleName} in project ${project.name}!`,
        {
            moduleName,
            idName,
            filePath: dataTypeFilePath
        }
    );
}
