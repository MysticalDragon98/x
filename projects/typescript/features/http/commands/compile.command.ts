import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import { readFile, writeFile } from "fs/promises";
import HttpFeature from "../http.feature";
import TypescriptProject from "@/projects/typescript";
import { Environment } from "@/features/env";
import OpenAIFeature from "@/features/openai";
import { HTTPEndpointTypeInferrerMindset } from "../openai/mindsets/http-endpoint-type-inferrer.mindset";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import vscodeOpen from "@/src/modules/vscode/vscodeOpen";

export default async function compileCommand(
    [moduleName, endpoint]: string[],
    named: any,
    { project, feature }: { project: TypescriptProject; feature: HttpFeature }
): Promise<CLIResult> {
    try {
        if (!moduleName || !endpoint) {
            return CLIResult.error({
                MissingArguments: "Both module and endpoint arguments are required"
            });
        }

        await OpenAIFeature.init({ apiKey: Environment.OpenAiKey });
        await feature.compile(moduleName, endpoint);
        // Open the generated file in VS Code
        // await vscodeOpen(outputFile);

        return CLIResult.success(
            `✨ Successfully compiled HTTP endpoint metadata for ${moduleName}:${endpoint}`,
            {
                module,
                endpoint
            }
        );
    } catch (error) {
        return CLIResult.fromError(error);
    }
}