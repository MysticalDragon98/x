import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import HttpFeature from "../http.feature";
import TypescriptProject from "@/projects/typescript";
import { Environment } from "@/features/env";
import OpenAIFeature from "@/features/openai";

export default async function compileCommand([]: string[], named: any, { project, feature }: { project: TypescriptProject; feature: HttpFeature }): Promise<CLIResult> {
    try {
        await OpenAIFeature.init({ apiKey: Environment.OpenAiKey });
        await feature.compileAll();
        // Open the generated file in VS Code
        // await vscodeOpen(outputFile);

        return CLIResult.success(
            `✨ Successfully compiled all HTTP endpoints.`,
            {}
        );
    } catch (error) {
        return CLIResult.fromError(error);
    }
}