import TypescriptProject from "@/projects/typescript";
import PostmanFeature from "../postman.feature";
import { CLIResult } from "@/src/modules/cli/cli-result";
import OpenAIFeature from "@/features/openai";
import { PostmanBuilder } from "../classes/PostmanBuilder.class";

export default async function buildCommand(args: string[], named: any, { project, feature }: { project: TypescriptProject; feature: PostmanFeature }) {
    await OpenAIFeature.init();

    const builder = await PostmanBuilder.create(feature);
    await builder.build();

    return CLIResult.success(`✨ Postman collection built successfully`);
}