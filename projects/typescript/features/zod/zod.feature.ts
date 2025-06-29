import { Feature } from "../../../../src/modules/projects/feature";
import TypescriptProject from "../..";
import StdFeature from "../std/std.feature";
import OpenAIFeature from "@/features/openai";
import { ZodSchemaGeneratorMindset } from "./openai/mindsets/zod-schema-generator.mindset";
import { Environment } from "@/features/env";
import { ZodAnonymousSchemaGeneratorMindset } from "./openai/mindsets/zod-anonymous-schema-generator.mindset";

export default class ZodFeature extends Feature<TypescriptProject> {
    
    readonly std = this.inject<StdFeature>(StdFeature);

    name () { return "zod"; }
    version () { return "0.0.1"; }

    async init () {
        await this.project.install(["zod"])
    }

    async parseTSDefinition (definition: string, { anonymous = false }: { anonymous?: boolean } = {}) {
        await OpenAIFeature.init({ apiKey: Environment.OpenAiKey })
        const { output } = await OpenAIFeature.prompt<{ output: string }>(
            anonymous ? ZodAnonymousSchemaGeneratorMindset : ZodSchemaGeneratorMindset,
            definition
        );

        return output;
    }
    
}