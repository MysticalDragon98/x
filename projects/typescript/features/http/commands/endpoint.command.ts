import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import { writeFile } from "fs/promises";
import HttpFeature from "../http.feature";
import TypescriptProject from "@/projects/typescript";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

export default async function endpointCommand(
    [moduleName, endpointName]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: HttpFeature }
): Promise<CLIResult> {
    try {
        if (!moduleName || !endpointName) {
            return CLIResult.error({
                MissingArguments: "Both moduleName and endpointName arguments are required"
            });
        }

        const module = await feature.std.module(moduleName);

        if (!module) {
            return CLIResult.error({
                ModuleNotFound: `Module ${moduleName} not found`
            });
        }

        // Create the file path: src/modules/http/{endpointName}.http-endpoint.ts
        const endpointFilePath = module.subpath('http', `${endpointName}.http-endpoint.ts`);
        // Create the directory structure if it doesn't exist
        await FsUtils.createTree({
            [module.subpath()]: ['http']
        });

        // Generate the endpoint function content
        const endpointContent = [
            `export default async function ${endpointName}HTTPEndpoint() {`,
            "",
            "}"
        ].join("\n");

        // Write the endpoint file
        await writeFile(endpointFilePath, endpointContent);
        await vscodeOpen(endpointFilePath);

        return CLIResult.success(
            `✨ Successfully created HTTP endpoint: ${endpointName}`,
            {
                moduleName,
                endpointName,
                filePath: endpointFilePath
            }
        );
    } catch (error) {
        return CLIResult.fromError(error);
    }
}