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

        // Initialize OpenAI
        await OpenAIFeature.init({ apiKey: Environment.OpenAiKey });

        const module = feature.std.module(moduleName);
        // Find the endpoint function file
        const endpointFilePath = module.subpath("http", `${endpoint}.http-endpoint.ts`);
        
        let endpointContent: string;
        try {
            endpointContent = await readFile(endpointFilePath, "utf-8");
        } catch (error) {
            return CLIResult.error({
                FileNotFound: `Endpoint file not found: ${endpointFilePath}`
            });
        }

        // Use HTTPEndpointTypeInferrerMindset to generate types and metadata
        const result = await OpenAIFeature.prompt<{ typeOutput: string, paramsOutput: string, typeName: string }>(
            HTTPEndpointTypeInferrerMindset,
            endpointContent
        );

        const typeDefinition = result.typeOutput;
        const zodDefinition = await feature.zod.parseTSDefinition(typeDefinition, { anonymous: true });

        // Create output directory structure
        await FsUtils.createTree({
            [feature.workdirFeatureSubpath("endpoints")]: [moduleName]
        });

        // Write the generated file
        const outputFile = feature.workdirFeatureSubpath("endpoints", `${moduleName}/${endpoint}.http-meta.ts`);
        await writeFile(outputFile,
            `import ${endpoint} from '@/src/modules/${moduleName}/http/${endpoint}.http-endpoint';\n` +
            "import { HTTPEndpoint } from '../../classes/http-endpoint.class';\n" +
            "import * as z from 'zod/v4';\n\n" +
            result.typeOutput + "\n\n" +
            result.paramsOutput + "\n\n" +
            `const Validator = ${zodDefinition};\n\n` + 
            `export default new HTTPEndpoint<${result.typeName}>({\n` +
            "    inputValidator: Validator,\n" +
            "    params: Params,\n" +
            `    exec: ${endpoint}\n` +
            "});"
        );

        // Open the generated file in VS Code
        await vscodeOpen(outputFile);

        return CLIResult.success(
            `✨ Successfully compiled HTTP endpoint metadata for ${moduleName}:${endpoint}`,
            {
                module,
                endpoint,
                outputFile
            }
        );
    } catch (error) {
        return CLIResult.fromError(error);
    }
}