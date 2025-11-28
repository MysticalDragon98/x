import TypescriptProject from "@/projects/typescript";
import { CLIResult } from "@/src/modules/cli/cli-result";
import AIFeature from "../ai.feature";

export default async function toolCommand ([ lib, name ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: AIFeature }) {
    await feature.addTool(lib, name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully added tool ${name} to project ${project.name}!`,
        data: {
            feature: name
        }
    });
}