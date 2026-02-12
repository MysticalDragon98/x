import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import HttpFeature from "../http.feature";
import TypescriptProject from "@/projects/typescript";
import { Environment } from "@/features/env";
import OpenAIFeature from "@/features/openai";

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
                moduleName,
                endpoint
            }
        );
    } catch (error) {
        return CLIResult.fromError(error);
    }
}