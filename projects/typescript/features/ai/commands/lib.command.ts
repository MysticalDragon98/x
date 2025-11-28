import TypescriptProject from "@/projects/typescript";
import { CLIResult } from "@/src/modules/cli/cli-result";
import AIFeature from "../ai.feature";

export default async function libCommand ([ name ]: string[], named: any, { project, feature }: { project: TypescriptProject, feature: AIFeature }) {
    await feature.addLibrary(name);

    return new CLIResult({
        success: true,
        message: `✨ Successfully added library ${name} to project ${project.name}!`,
        data: {
            feature: name
        }
    });
}