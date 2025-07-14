import { Feature } from "../../../../src/modules/projects/feature";
import Queues from "../../../../features/queue/index";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import ZodFeature from "../zod/zod.feature";
import { HTTPEndpointTypeInferrerMindset } from "./openai/mindsets/http-endpoint-type-inferrer.mindset";
import OpenAIFeature from "@/features/openai";
import { TextFile } from "@/src/modules/files/text-file";
import { $throw, CustomErrors } from "@/features/errors";
import { FsUtils } from "@/src/modules/utils/fs-utils";
import { join } from "path";
import { HTTPNorton } from "./classes/http-norton.class";

const Errors = CustomErrors({
    HttpEndpointNotFound: "The HTTP endpoint {endpoint} was not found in module {module}."
})

export default class HttpFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly zod = this.inject<ZodFeature>(ZodFeature);

    name () { return "http"; }
    version () { return "0.0.1"; }

    async init () {
        
    }

    async compile (moduleName: string, endpoint: string) {
        this.log(`Compiling HTTP endpoint ${moduleName}:${endpoint}`);
        const endpointPath = this.getEndpointPath(moduleName, endpoint);
        const endpointContent = await new TextFile(endpointPath)
            .read()
            .catch(() => $throw(Errors.HttpEndpointNotFound, { module: moduleName, endpoint }));
        
        const result = await this.parseTSDefinition(endpointContent)
        const targetDir = this.workdirFeatureSubpath("endpoints", `${moduleName}`);
        const targetPath = join(targetDir, `${endpoint}.http-meta.ts`); 
        const zodDefinition = await this.zod.parseTSDefinition(result.typeOutput, { anonymous: true });

        await FsUtils.createTree({ [targetDir]: [] });

        await new TextFile(targetPath).write(
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
        )

        this.log(`HTTP endpoint ${moduleName}:${endpoint} compiled successfully`);
    }

    async compileAll () {
        const changedEndpoints = await HTTPNorton.getChangedEndpointFiles();
        if (changedEndpoints.length === 0) return;
        this.log(`Compiling ${changedEndpoints.length} changed HTTP endpoints`);

        await Queues.batch(changedEndpoints, async (endpoint) => {
            const parts = endpoint.path.split("/");
            const moduleName = parts[parts.length - 3];
            const endpointName = parts[parts.length - 1].split(".")[0];

            await this.compile(moduleName, endpointName);
            await HTTPNorton.syncFileHash(endpoint.path);
        }, { batchSize: 5 });

        this.log(`✨ Successfully compiled all HTTP endpoints.`);
    }

    getEndpointPath (moduleName: string, endpoint: string) {
        const module = this.std.module(moduleName);
        const endpointFilePath = module.subpath("http", `${endpoint}.http-endpoint.ts`);

        return endpointFilePath;
    }

    async parseTSDefinition (definition: string, { anonymous = false }: { anonymous?: boolean } = {}) {
        const result = await OpenAIFeature.prompt<{ typeOutput: string, paramsOutput: string, typeName: string }>(
            HTTPEndpointTypeInferrerMindset,
            definition
        );

        return result as {
            typeName: string,
            typeOutput: string,
            paramsOutput: string
        };
    }

    
}