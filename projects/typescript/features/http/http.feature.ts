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
import { readdir } from "fs/promises";
import { readFile } from "fs/promises";
import { createContext, runInContext } from "vm";
import { JSONFile } from "@/src/modules/files/json-file";
import { HttpRoute } from "./types/HttpRoute.type";

const Errors = CustomErrors({
    HttpEndpointNotFound: "The HTTP endpoint {endpoint} was not found in module {module}."
})

export default class HttpFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);
    readonly zod = this.inject<ZodFeature>(ZodFeature);

    name () { return "http"; }
    version () { return "0.0.1"; }

    async init () {
        this.project.install([
            "express", "cors"
        ])
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
        const targetJsonPath = join(targetDir, `${endpoint}.http-meta.json`);
        const zodDefinition = await this.zod.parseTSDefinition(result.typeOutput, { anonymous: true });
        const comments = this.extractComments(endpointContent);

        await FsUtils.createTree({ [targetDir]: [] });

        await new TextFile(targetPath).write(
            `import ${endpoint} from '@/src/modules/${moduleName}/http/${endpoint}.http-endpoint';\n` +
            "import { HTTPEndpoint } from '../../classes/http-endpoint.class';\n" +
            "import * as z from 'zod/v4';\n\n" +
            result.typeOutput + "\n\n" +
            "const Params = " + result.paramsOutput + ";\n\n" +
            `const Validator = ${zodDefinition};\n\n` + 
            `export default new HTTPEndpoint<${result.typeName}>({\n` +
            "    inputValidator: Validator,\n" +
            "    params: Params,\n" +
            `    exec: ${endpoint}\n` +
            "});"
        )

        
        await new JSONFile(targetJsonPath).write({
            module: moduleName,
            endpoint: endpoint,
            path: `${moduleName}/${endpoint}`,
            params: JSON.parse(result.paramsOutput.substring(result.paramsOutput.indexOf("["), result.paramsOutput.lastIndexOf("]") + 1)),
            comments: comments
        });

        this.log(`HTTP endpoint ${moduleName}:${endpoint} compiled successfully`);
    }

    extractComments (source: string) {
        if (!source) return "";

        const exportDefaultFunctionRegex = /export\s+default\s+(?:async\s+)?function\b/;
        const exportDefaultRegex = /export\s+default\b/;
        const functionRegex = /\bfunction\b/;

        let boundaryIndex = source.length;
        let match: RegExpExecArray | null;

        if ((match = exportDefaultFunctionRegex.exec(source))) {
            boundaryIndex = match.index;
        } else if ((match = exportDefaultRegex.exec(source))) {
            boundaryIndex = match.index;
        } else if ((match = functionRegex.exec(source))) {
            boundaryIndex = match.index;
        }

        const header = source.slice(0, boundaryIndex);
        const commentRegex = /\/\/[^\n\r]*|\/\*[\s\S]*?\*\//g;
        const comments: string[] = [];

        while ((match = commentRegex.exec(header))) {
            const comment = match[0];

            if (comment.startsWith("//")) {
                const line = comment.slice(2).trim();
                if (line) comments.push(line);
                continue;
            }

            const body = comment.slice(2, -2);
            const lines = body.split(/\r?\n/).map(line => line.replace(/^\s*\*?\s?/, "").trim());
            const cleaned = lines.join("\n").trim();

            if (cleaned) {
                comments.push(cleaned);
            }
        }

        return comments.join("\n").trim();
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

    async endpoints () {
        const routes: Record<string, HttpRoute> = {};

        const routesFolder = this.workdirFeatureSubpath("endpoints");
        const moduleNames = await FsUtils.listSubdirectories(routesFolder);

        for (const moduleName of moduleNames) {
            const moduleFolder = join(routesFolder, moduleName);
            const endpointFiles = await readdir(moduleFolder);

            for (const file of endpointFiles) {
                if (!file.endsWith(".http-meta.json")) continue;

                const content = JSON.parse(await readFile(join(moduleFolder, file), "utf-8"));

                if (!routes[moduleName]) {
                    routes[moduleName] = {
                        name: moduleName,
                        endpoints: []
                    };
                }

                routes[moduleName].endpoints.push({
                    route: moduleName,
                    endpoint: content.endpoint,
                    path: content.path,
                    comments: content.comments,
                    params: content.params
                });
            }
        }
        
        return Object.values(routes);
    }

    
}
