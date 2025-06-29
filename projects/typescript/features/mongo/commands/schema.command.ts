import { CLIResult } from "../../../../../src/modules/cli/cli-result";
import TypescriptProject from "../../..";
import MongoFeature from "../mongo.feature";
import OpenAIFeature from "../../../../../features/openai";
import { Environment } from "../../../../../features/env";
import { MongoSchemaGeneratorMindset } from "../openai/mindsets/mongo-schema-generator.mindset";
import { readFile, writeFile } from "fs/promises";
import vscodeOpen from "../../../../../src/modules/vscode/vscodeOpen";
import { FsUtils } from "@/src/modules/utils/fs-utils";

export default async function schemaCommand ([moduleName, typeName]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: MongoFeature }) {
    if (!moduleName || !typeName) {
        return CLIResult.error({
            MissingArguments: "Both module and typeName arguments are required"
        });
    }

    const module = feature.std.module(moduleName);
    
    if (!module) return CLIResult.error({
        TypeNotFound: `Type ${typeName} not found in module ${moduleName}`
    });

    await FsUtils.createTree({
        [module.subpath('mongo')]: ['schemas']
    });
    
    await OpenAIFeature.init({ apiKey: Environment.OpenAiKey })

    const content = await readFile(module.subpath("types", typeName + ".type.ts"), "utf-8");
    const result = await OpenAIFeature.prompt<{ output: string }>(MongoSchemaGeneratorMindset, content);
    const outputFile = feature.std.module(moduleName).subpath(`mongo/schemas/${typeName}.mongo-schema.ts`);

    await writeFile(outputFile, result.output);
    await vscodeOpen(outputFile);

    return CLIResult.success("✨ Successfully generated Mongo schema for type " + typeName);
}