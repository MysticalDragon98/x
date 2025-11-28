import TypescriptProject from "@/projects/typescript";
import { CLIResult } from "@/src/modules/cli/cli-result";
import AIFeature from "../ai.feature";
import OpenAIFeature from "@/features/openai";

export default async function compileCommand ([ lib, name ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: AIFeature }) {
    await OpenAIFeature.init();
    await feature.compile(lib, name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully compiled tool ${name} to project ${project.name}!`,
        data: {
            feature: name
        }
    });
}